import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { TimelineLab } from "@/components/lab/TimelineLab";

export const metadata: Metadata = {
  title: "Timeline Detection Lab — DFIR Lab",
  description:
    "Upload a super-timeline CSV (Plaso l2t_csv or UsnJrnl2Csv) and detect the attacker's execution window, off-hours activity and anti-forensics bursts — entirely in your browser.",
};

export default function TimelineDetectionLabPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="space-y-10">
        <Link
          href="/modules/timeline"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-fg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to module
        </Link>

        <header className="space-y-4">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent">
            <FlaskConical aria-hidden="true" className="h-4 w-4" />
            Module 01 · Detection lab
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Super-timeline detection,
            <br />
            in your browser
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-fg">
            Upload the timeline you built with{" "}
            <code className="font-mono text-sm text-foreground">log2timeline</code>{" "}
            and let heuristics flag what a tired analyst misses at 3 AM: the
            attacker&apos;s execution window, off-hours high-signal events and
            anti-forensics bursts. Built on the same methodology as Module 01 —
            correlation over guesswork.
          </p>
        </header>

        <TimelineLab />
      </div>
    </Container>
  );
}
