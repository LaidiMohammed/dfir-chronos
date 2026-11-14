"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CircleAlert, FileUp, FlaskConical, Loader2, ShieldCheck } from "lucide-react";
import { parseTimelineCsv } from "@/lib/timeline/parse";
import { analyzeTimeline } from "@/lib/timeline/analyze";
import type { AnalysisResult } from "@/lib/timeline/types";
import { DetectionReport } from "@/components/lab/DetectionReport";

type Status = "idle" | "parsing" | "done" | "error";

export function TimelineLab() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function analyze(csvText: string, name: string) {
    setStatus("parsing");
    // Let the spinner paint before the heavy parse runs on the main thread
    window.setTimeout(() => {
      const parsed = parseTimelineCsv(csvText);
      if (!parsed.ok) {
        setError(parsed.error);
        setStatus("error");
        return;
      }
      const analysis = analyzeTimeline(
        parsed.events,
        parsed.totalRows,
        parsed.skippedRows,
        parsed.timestampColumn,
        parsed.messageColumn,
        parsed.sourceColumn,
      );
      setFileName(name);
      setResult(analysis);
      setStatus("done");
    }, 60);
  }

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (file.size > 64 * 1024 * 1024) {
      setError("File exceeds 64 MB. Export a shorter time range and try again.");
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => analyze(String(reader.result ?? ""), file.name);
    reader.onerror = () => {
      setError("Could not read the file from disk.");
      setStatus("error");
    };
    reader.readAsText(file);
  }

  async function loadSample() {
    setStatus("parsing");
    try {
      const response = await fetch("/samples/sample-timeline.csv");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      analyze(text, "sample-timeline.csv (fictional host)");
    } catch (err) {
      setError(
        `Could not load the built-in sample (${err instanceof Error ? err.message : "unknown error"}).`,
      );
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError("");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (status === "done" && result) {
    return <DetectionReport result={result} fileName={fileName} onReset={reset} />;
  }

  const busy = status === "parsing";

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a timeline CSV file"
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragOver
            ? "border-accent bg-accent-muted"
            : "border-border bg-muted/20 hover:border-accent/50"
        }`}
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-accent" />
        ) : (
          <FileUp aria-hidden="true" className="h-10 w-10 text-accent" strokeWidth={1.5} />
        )}
        <div>
          <p className="text-lg font-semibold text-foreground">
            {busy ? "Analyzing…" : "Drop your super-timeline CSV here"}
          </p>
          <p className="mt-1 text-sm text-muted-fg">
            or{" "}
            <span className="text-accent underline underline-offset-2">
              browse your computer
            </span>{" "}
            — Plaso <code className="font-mono text-xs">l2t_csv</code>,
            UsnJrnl2Csv, any CSV with a datetime column. Max 64 MB.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleFile(event.target.files?.[0])
          }
        />
      </div>

      {/* Error */}
      {status === "error" ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-4"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
          <div>
            <p className="text-sm font-semibold text-red-200">Analysis failed</p>
            <p className="mt-1 text-sm text-red-200/90">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 rounded-lg border border-red-400/40 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-red-200 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {/* Sample + privacy note */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadSample}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-muted px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <FlaskConical aria-hidden="true" className="h-4 w-4" />
            Load built-in sample
          </button>
          <a
            href="/samples/sample-timeline.csv"
            download="sample-timeline.csv"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-fg underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Download sample CSV
          </a>
        </div>
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-fg">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-accent" />
          Parsed in your browser — nothing is uploaded
        </p>
      </div>
    </div>
  );
}
