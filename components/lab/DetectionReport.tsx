"use client";

import { useState } from "react";
import {
  CircleCheck,
  ShieldAlert,
  ShieldX,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { severityStyle } from "@/lib/timeline/analyze";
import type { AnalysisResult, Verdict } from "@/lib/timeline/types";

const VERDICT_STYLE: Record<Verdict, { icon: LucideIcon; classes: string }> = {
  compromise: {
    icon: ShieldX,
    classes: "border-red-400/50 bg-red-500/10 text-red-300",
  },
  suspicious: {
    icon: ShieldAlert,
    classes: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  },
  clean: {
    icon: CircleCheck,
    classes: "border-accent/40 bg-accent-muted text-accent",
  },
};

function formatIso(iso: string): string {
  return iso.replace("T", " — ").replace(".000Z", " UTC");
}

export function DetectionReport({
  result,
  fileName,
  onReset,
}: {
  result: AnalysisResult;
  fileName: string;
  onReset: () => void;
}) {
  const [query, setQuery] = useState("");
  const verdict = VERDICT_STYLE[result.verdict];
  const VerdictIcon = verdict.icon;

  const maxBucketTotal = Math.max(1, ...result.buckets.map((b) => b.total));
  const flaggedShown = result.flagged.filter((event) =>
    query.trim().length === 0
      ? true
      : event.message.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const flaggedCap = flaggedShown.slice(0, 30);

  return (
    <div className="space-y-8">
      {/* Verdict banner */}
      <div
        role="status"
        className={`flex flex-col gap-4 rounded-2xl border px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${verdict.classes}`}
      >
        <div className="flex items-start gap-4">
          <VerdictIcon
            aria-hidden="true"
            className="mt-1 h-8 w-8 shrink-0"
            strokeWidth={1.75}
          />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] opacity-80">
              Verdict · {fileName}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {result.verdictLabel}
            </p>
            {result.timeRange ? (
              <p className="mt-2 font-mono text-xs opacity-90">
                {formatIso(result.timeRange.startIso)} → {formatIso(result.timeRange.endIso)}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-lg border border-current/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          Analyze another file
        </button>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Parsed events", String(result.parsedEvents)],
          ["Flagged events", String(result.flagged.length)],
          ["Findings", String(result.findings.length)],
          [
            "Skipped rows",
            String(result.skippedRows),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-muted/30 px-4 py-4"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Execution window */}
      {result.executionWindow ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/5 px-5 py-4">
          <Timer aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-300">
              Execution window
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {formatIso(result.executionWindow.startIso)} → {formatIso(result.executionWindow.endIso)}
            </p>
            <p className="mt-1 text-xs text-muted-fg">
              Peak density: {result.executionWindow.eventCount} scored events,
              weight {result.executionWindow.score}.
            </p>
          </div>
        </div>
      ) : null}

      {/* Findings */}
      {result.findings.length > 0 ? (
        <section aria-labelledby="findings-heading">
          <h3
            id="findings-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Findings
          </h3>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {result.findings.map((finding) => (
              <li
                key={`${finding.id}-${finding.title}`}
                className={`rounded-xl border px-5 py-4 ${severityStyle(finding.severity)}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
                  {finding.severity}
                </span>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                  {finding.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                  {finding.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Histogram */}
      {result.buckets.length > 1 ? (
        <section aria-labelledby="histogram-heading">
          <h3
            id="histogram-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Activity over time ({result.buckets[0].label} – {result.buckets[result.buckets.length - 1].label})
          </h3>
          <div
            className="mt-4 flex h-40 items-end gap-[3px] rounded-xl border border-border bg-muted/20 p-4"
            role="img"
            aria-label="Histogram of events per time bucket. Bars in red contain flagged events."
          >
            {result.buckets.map((bucket) => {
              const height = Math.max(4, (bucket.total / maxBucketTotal) * 100);
              return (
                <div
                  key={bucket.startIso}
                  className={`min-w-[6px] flex-1 rounded-sm ${
                    bucket.flagged > 0 ? "bg-red-400/80" : "bg-accent/50"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${bucket.startIso.slice(0, 16).replace("T", " ")} — ${bucket.total} events${
                    bucket.flagged > 0 ? ` (${bucket.flagged} flagged)` : ""
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent/50" aria-hidden="true" />
              Normal
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400/80" aria-hidden="true" />
              Contains flagged events
            </span>
          </div>
        </section>
      ) : null}

      {/* Flagged events table */}
      <section aria-labelledby="flagged-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3
            id="flagged-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Flagged events ({flaggedShown.length})
          </h3>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <span className="sr-only">Filter flagged events</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by keyword…"
              className="w-48 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-fg focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-mono uppercase tracking-[0.2em] text-muted-fg">
              <tr>
                <th scope="col" className="px-4 py-3">Time (UTC)</th>
                <th scope="col" className="px-4 py-3">Source</th>
                <th scope="col" className="px-4 py-3">Score</th>
                <th scope="col" className="px-4 py-3">Event</th>
              </tr>
            </thead>
            <tbody>
              {flaggedCap.map((event) => (
                <tr
                  key={`${event.iso}-${event.message.slice(0, 32)}`}
                  className="border-b border-border/60 align-top last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-foreground/90">
                    {event.iso.replace("T", " ").replace(".000Z", "")}
                    {event.offHours ? (
                      <span className="ml-2 rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[9px] uppercase text-amber-300">
                        off-hours
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-muted-fg">
                    {event.source}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-foreground/90">
                    {event.score}
                  </td>
                  <td className="max-w-md break-words px-4 py-2.5 font-mono text-[11px] leading-5 text-foreground/80">
                    {event.message}
                    <span className="mt-1 block text-[9px] uppercase tracking-wider text-muted-fg">
                      {event.matched.join(" · ")}
                    </span>
                  </td>
                </tr>
              ))}
              {flaggedCap.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-fg">
                    No flagged events match “{query}”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg">
          Showing {flaggedCap.length} of {flaggedShown.length} flagged events · columns: {result.timestampColumn} / {result.messageColumn}
          {result.sourceColumn ? ` / ${result.sourceColumn}` : ""}
        </p>
      </section>

      {/* Methodology / rules */}
      <details className="rounded-xl border border-border bg-muted/20 px-5 py-4">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.25em] text-muted-fg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Detection rules &amp; limits
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-fg">
          <p>
            Heuristic scoring for triage — not a verdict from a courtroom. Each
            event is scored by keyword rules (encoded PowerShell, credential
            access, log wiping, shadow-copy deletion, run-key / scheduled-task
            persistence, suspicious paths, WAL artifact access). Events scoring
            ≥ 2 are flagged; a 60-minute sliding window locates the
            densest cluster as the suspected execution window; a 10-minute
            span of ≥ 3 anti-forensics events is reported as a log-tampering
            burst. Off-hours = outside 06:00–21:00 UTC.
          </p>
          <p>
            Limitations: regex heuristics miss obfuscation and can misfire on
            legitimate admin tooling. Confirm any hit against raw artifacts
            (hashes, Shimcache ordering, $UsnJrnl reason codes) and document
            your findings. Built-in sample: fictional host, user alice,
            2026-03-13 → 2026-03-16 UTC.
          </p>
        </div>
      </details>
    </div>
  );
}
