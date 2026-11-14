import Papa from "papaparse";
import type { ParseOutcome, TimelineEvent } from "./types";

const TIMESTAMP_ALIASES = [
  "datetime",
  "@timestamp",
  "timestamp",
  "time",
  "ts",
  "date",
  "eventtime",
  "event_time",
];

const MESSAGE_ALIASES = [
  "message",
  "msg",
  "description",
  "desc",
  "summary",
  "data",
  "content",
];

const SOURCE_ALIASES = [
  "source",
  "source_long",
  "parser",
  "provider",
  "layer",
  "artifact",
  "layer_name",
];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/^"|"$/g, "");
}

/** Return the ts in ms if the value parses as a plausible date, else NaN. */
function parseTimestampMs(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  // Epoch seconds / milliseconds
  if (/^\d{10}$/.test(trimmed)) return Number(trimmed) * 1000;
  if (/^\d{13}$/.test(trimmed)) return Number(trimmed);

  // Plaso l2t style: 2026-03-15T02:58:11+00:00 (Date.parse handles it)
  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct)) return direct;

  // Common forensic export: "2026-03-15 02:58:11" — treat as UTC
  const sqlish = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|UTC|[+-]\d{2}:?\d{2})?$/,
  );
  if (sqlish) {
    const [, y, mo, d, h, mi, s, frac, tz] = sqlish;
    const suffix = tz && tz !== "UTC" ? tz.replace("UTC", "+00:00") : "Z";
    return Date.parse(
      `${y}-${mo}-${d}T${h}:${mi}:${s}${frac ?? ""}${suffix}`,
    );
  }

  return Number.NaN;
}

function pickColumn(
  headers: string[],
  aliases: string[],
  contains: RegExp,
): string | null {
  const normalized = headers.map(normalizeHeader);

  // Exact alias match first (most reliable)
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return headers[idx];
  }
  // Then "contains" heuristic
  for (let i = 0; i < normalized.length; i += 1) {
    if (contains.test(normalized[i])) return headers[i];
  }
  return null;
}

export function parseTimelineCsv(csvText: string): ParseOutcome {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const headers = parsed.meta.fields ?? [];
  if (headers.length < 2) {
    return { ok: false, error: "CSV has fewer than two columns — not a timeline export." };
  }

  const timestampColumn = pickColumn(headers, TIMESTAMP_ALIASES, /time|date|ts/i);
  const messageColumn = pickColumn(headers, MESSAGE_ALIASES, /message|msg|desc|summary/i);
  const sourceColumn = pickColumn(headers, SOURCE_ALIASES, /source|parser|provider|artifact/i);

  if (!timestampColumn) {
    return {
      ok: false,
      error:
        "No timestamp-like column found. Expected one of: datetime, timestamp, time, date (e.g. Plaso l2t_csv output).",
    };
  }
  if (!messageColumn) {
    return {
      ok: false,
      error:
        "No message-like column found. Expected one of: message, msg, description, summary.",
    };
  }

  const events: TimelineEvent[] = [];
  let skippedRows = 0;

  for (const row of parsed.data) {
    const rawTs = row[timestampColumn] ?? "";
    const tsMs = parseTimestampMs(rawTs);
    const message = (row[messageColumn] ?? "").trim();
    if (Number.isNaN(tsMs) || message.length === 0) {
      skippedRows += 1;
      continue;
    }
    events.push({
      tsMs,
      iso: new Date(tsMs).toISOString(),
      source: (sourceColumn ? (row[sourceColumn] ?? "").trim() : "") || "UNKNOWN",
      message,
    });
  }

  if (events.length === 0) {
    return {
      ok: false,
      error: "Zero usable events — timestamps could not be parsed. Check the file encoding (UTF-8) and timestamp format.",
    };
  }

  events.sort((a, b) => a.tsMs - b.tsMs);

  return {
    ok: true,
    events,
    totalRows: parsed.data.length,
    skippedRows,
    timestampColumn,
    messageColumn,
    sourceColumn,
  };
}
