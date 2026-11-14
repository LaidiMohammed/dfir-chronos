export interface TimelineEvent {
  /** Epoch milliseconds (UTC) */
  tsMs: number;
  /** ISO 8601 UTC string */
  iso: string;
  /** Artifact source (FILE, LOG, USN, REGISTRY…) */
  source: string;
  /** Free-text event description */
  message: string;
}

export type EventSeverity = "high" | "medium";

export interface FlaggedEvent extends TimelineEvent {
  /** Rule ids that matched this event */
  matched: string[];
  score: number;
  severity: EventSeverity;
  /** True when the event occurred outside 06:00–21:00 UTC */
  offHours: boolean;
}

export interface HourBucket {
  /** ISO timestamp floored to the bucket start */
  startIso: string;
  /** Short display label, e.g. "03:00" or "03/14 03:00" */
  label: string;
  total: number;
  flagged: number;
}

export type FindingKind =
  | "execution-window"
  | "deletion-burst"
  | "off-hours"
  | "high-signal";

export type FindingSeverity = "high" | "medium" | "info";

export interface Finding {
  id: FindingKind;
  severity: FindingSeverity;
  title: string;
  detail: string;
}

export type Verdict = "compromise" | "suspicious" | "clean";

export interface AnalysisResult {
  totalRows: number;
  parsedEvents: number;
  skippedRows: number;
  timeRange: { startIso: string; endIso: string } | null;
  flagged: FlaggedEvent[];
  buckets: HourBucket[];
  findings: Finding[];
  executionWindow: {
    startIso: string;
    endIso: string;
    score: number;
    eventCount: number;
  } | null;
  verdict: Verdict;
  verdictLabel: string;
  timestampColumn: string;
  messageColumn: string;
  sourceColumn: string | null;
}

export type ParseOutcome =
  | {
      ok: true;
      events: TimelineEvent[];
      totalRows: number;
      skippedRows: number;
      timestampColumn: string;
      messageColumn: string;
      sourceColumn: string | null;
    }
  | { ok: false; error: string };
