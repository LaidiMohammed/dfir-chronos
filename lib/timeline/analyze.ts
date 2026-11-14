import type {
  AnalysisResult,
  Finding,
  FlaggedEvent,
  FindingSeverity,
  HourBucket,
  TimelineEvent,
  Verdict,
} from "./types";

interface WeightedRule {
  id: string;
  re: RegExp;
  weight: number;
  /** True for anti-forensics / log-tampering signals */
  antiForensics?: boolean;
}

/** High-confidence attacker / anti-forensics signals */
const HIGH_RULES: WeightedRule[] = [
  { id: "encoded-powershell", re: /powershell[^\n]*(\s-enc(ommanded)?\b|\s-e\s|-encodedcommand)/i, weight: 5 },
  { id: "encoded-cmdline", re: /-(enc|encodedcommand)\s+[A-Za-z0-9+/=]{24,}/i, weight: 5 },
  { id: "credential-access", re: /(mimikatz|sekurlsa|lsass|comsvcs\.dll|sam\.sav|reg\s+save\s+hklm)/i, weight: 5 },
  { id: "log-wipe", re: /(wevtutil\s+(cl|clear-log)|clear-eventlog|Remove-EventLog|sdelete|timestomp)/i, weight: 5 },
  { id: "vss-delete", re: /vssadmin[^\n]*delete\s+shadows/i, weight: 5 },
  { id: "persist-runkey", re: /(currentversion[\\/]run\b|schtasks[^\n]*\/create|reg\s+add\s+hkcu[^\n]*run)/i, weight: 3 },
  { id: "lateral-movement", re: /(net\s+use\s+\\\\|psexec|wmic[^\n]*\/node:)/i, weight: 3 },
];

/** Medium-confidence supporting signals */
const MEDIUM_RULES: WeightedRule[] = [
  { id: "reason-file-delete", re: /(reason_file_delete|usn_reason[^,]*delete|\.deleted\b|sdelete)/i, weight: 2, antiForensics: true },
  { id: "evtx-deleted", re: /(security|system|application)\.evtx[^\n]*(delet|remove)/i, weight: 3, antiForensics: true },
  { id: "exe-in-suspicious-path", re: /(programdata|\\temp\\|\\tmp\\|appdata[\\/]local[\\/]temp)[^\n]*\.(exe|dll|ps1|bat|vbs)/i, weight: 2 },
  { id: "binary-create-modify", re: /\.(exe|dll|ps1|bat|vbs|hta|scr)\b[^\n]*(creat|modif|writ|drop| USN_REASON)/i, weight: 1 },
  { id: "wal-artifact-access", re: /(sqlite|[-_]wal\b|\.db\b)[^\n]*(read|query|open|attach)/i, weight: 1 },
];

const ALL_RULES = [...HIGH_RULES, ...MEDIUM_RULES];
/** Score at/above which an event is considered flagged */
const FLAG_THRESHOLD = 2;

function isOffHoursUtc(tsMs: number): boolean {
  const hour = new Date(tsMs).getUTCHours();
  return hour < 6 || hour >= 21;
}

function scoreEvent(event: TimelineEvent): FlaggedEvent | null {
  const matched: string[] = [];
  let score = 0;
  let highHits = 0;

  for (const rule of ALL_RULES) {
    if (rule.re.test(event.message)) {
      matched.push(rule.id);
      score += rule.weight;
      if (HIGH_RULES.includes(rule)) highHits += 1;
    }
  }

  if (score < FLAG_THRESHOLD) return null;

  return {
    ...event,
    matched,
    score,
    severity: highHits > 0 ? "high" : "medium",
    offHours: isOffHoursUtc(event.tsMs),
  };
}

/**
 * Find the densest high-signal 60-minute window.
 * Returns null when the best window does not meet the evidence bar.
 */
function findExecutionWindow(
  events: TimelineEvent[],
): AnalysisResult["executionWindow"] {
  const scored = events
    .map((event) => ({ event, score: scoreEvent(event)?.score ?? 0 }))
    .filter(({ score }) => score > 0);

  if (scored.length === 0) return null;

  const WINDOW_MS = 60 * 60 * 1000;
  let best = { startMs: 0, endMs: 0, sum: 0, count: 0 };

  for (let i = 0; i < scored.length; i += 1) {
    let sum = 0;
    let count = 0;
    for (let j = i; j < scored.length; j += 1) {
      if (scored[j].event.tsMs - scored[i].event.tsMs > WINDOW_MS) break;
      sum += scored[j].score;
      count += 1;
    }
    if (sum > best.sum) {
      best = {
        startMs: scored[i].event.tsMs,
        endMs: scored[i].event.tsMs + WINDOW_MS,
        sum,
        count,
      };
    }
  }

  // Evidence bar: window must carry real weight, not two weak signals
  if (best.sum < 8 || best.count < 3) return null;

  return {
    startIso: new Date(best.startMs).toISOString(),
    endIso: new Date(best.endMs).toISOString(),
    score: best.sum,
    eventCount: best.count,
  };
}

/** Detect >=3 anti-forensics events inside any 10-minute span */
function findDeletionBurst(events: TimelineEvent[]): Finding | null {
  const antiForensics = new Set(
    ALL_RULES.filter((rule) => rule.antiForensics).map((rule) => rule.id),
  );
  const hits = events.filter((event) =>
    ALL_RULES.some(
      (rule) => antiForensics.has(rule.id) && rule.re.test(event.message),
    ),
  );

  const SPAN_MS = 10 * 60 * 1000;
  for (let i = 0; i < hits.length; i += 1) {
    let count = 0;
    for (let j = i; j < hits.length; j += 1) {
      if (hits[j].tsMs - hits[i].tsMs > SPAN_MS) break;
      count += 1;
    }
    if (count >= 3) {
      return {
        id: "deletion-burst",
        severity: "high",
        title: "Anti-forensics burst detected",
        detail: `${count} deletion / log-tampering events within 10 minutes starting at ${new Date(hits[i].tsMs).toISOString()}. Consistent with an attacker covering tracks.`,
      };
    }
  }
  return null;
}

function buildBuckets(
  events: TimelineEvent[],
  flaggedMs: Set<number>,
): HourBucket[] {
  if (events.length === 0) return [];

  const start = events[0].tsMs;
  const end = events[events.length - 1].tsMs;
  const rangeHours = (end - start) / (60 * 60 * 1000);
  // Beyond ~2 weeks, widen buckets to whole days to keep the chart legible
  const bucketMs = rangeHours > 336 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  const fmt =
    bucketMs === 60 * 60 * 1000
      ? (d: Date) => d.toISOString().slice(11, 16)
      : (d: Date) => d.toISOString().slice(5, 10);

  const map = new Map<number, HourBucket>();
  for (const event of events) {
    const bucketStart = Math.floor(event.tsMs / bucketMs) * bucketMs;
    let bucket = map.get(bucketStart);
    if (!bucket) {
      const bucketDate = new Date(bucketStart);
      bucket = {
        startIso: bucketDate.toISOString(),
        label: fmt(bucketDate),
        total: 0,
        flagged: 0,
      };
      map.set(bucketStart, bucket);
    }
    bucket.total += 1;
    if (flaggedMs.has(event.tsMs)) bucket.flagged += 1;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, bucket]) => bucket);
}

export function analyzeTimeline(
  events: TimelineEvent[],
  totalRows: number,
  skippedRows: number,
  timestampColumn: string,
  messageColumn: string,
  sourceColumn: string | null,
): AnalysisResult {
  const flagged = events
    .map(scoreEvent)
    .filter((candidate): candidate is FlaggedEvent => candidate !== null)
    .sort((a, b) => b.score - a.score || a.tsMs - b.tsMs);

  const flaggedMs = new Set(flagged.map((event) => event.tsMs));
  const buckets = buildBuckets(events, flaggedMs);
  const findings: Finding[] = [];

  const executionWindow = findExecutionWindow(events);
  if (executionWindow) {
    findings.push({
      id: "execution-window",
      severity: "high",
      title: "Attacker execution window detected",
      detail: `Peak high-signal density between ${executionWindow.startIso} and ${executionWindow.endIso} (${executionWindow.eventCount} scored events, density weight ${executionWindow.score}).`,
    });
  }

  const deletionBurst = findDeletionBurst(events);
  if (deletionBurst) findings.push(deletionBurst);

  const offHoursHigh = flagged.filter(
    (event) => event.offHours && event.severity === "high",
  );
  if (offHoursHigh.length > 0) {
    findings.push({
      id: "off-hours",
      severity: "medium",
      title: `${offHoursHigh.length} high-severity event(s) outside business hours`,
      detail:
        "High-signal activity between 21:00 and 06:00 UTC. Corroborate against on-call / maintenance windows before concluding.",
    });
  }

  const highSignal = flagged.filter((event) => event.severity === "high");
  if (highSignal.length > 0) {
    const uniqueIds = new Set(highSignal.flatMap((event) => event.matched));
    findings.push({
      id: "high-signal",
      severity: "high",
      title: `${highSignal.length} high-severity event(s), ${uniqueIds.size} distinct rule(s) matched`,
      detail: [...uniqueIds].join(", "),
    });
  }
  if (findings.length === 0 && flagged.length > 0) {
    findings.push({
      id: "high-signal",
      severity: "info",
      title: `${flagged.length} medium-severity event(s) — no decisive signal`,
      detail: "Weak indicators only. Correlate with business context and re-triage manually.",
    });
  }

  const verdict: Verdict =
    executionWindow || highSignal.length >= 2 || deletionBurst
      ? "compromise"
      : flagged.length > 0
        ? "suspicious"
        : "clean";

  const verdictLabel =
    verdict === "compromise"
      ? "Compromise indicators detected"
      : verdict === "suspicious"
        ? "Suspicious activity — needs triage"
        : "No strong indicators in this export";

  const timeRange =
    events.length > 0
      ? {
          startIso: events[0].iso,
          endIso: events[events.length - 1].iso,
        }
      : null;

  return {
    totalRows,
    parsedEvents: events.length,
    skippedRows,
    timeRange,
    flagged,
    buckets,
    findings,
    executionWindow,
    verdict,
    verdictLabel,
    timestampColumn,
    messageColumn,
    sourceColumn,
  };
}

export function severityStyle(severity: FindingSeverity): string {
  switch (severity) {
    case "high":
      return "border-red-400/40 bg-red-400/10 text-red-300";
    case "medium":
      return "border-amber-400/40 bg-amber-400/10 text-amber-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
