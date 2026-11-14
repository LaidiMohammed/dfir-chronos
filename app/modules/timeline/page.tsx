import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { modules } from "@/lib/data/modules";
import { Container } from "@/components/layout/Container";
import { ModuleHeader } from "@/components/modules/ModuleHeader";
import { StepList } from "@/components/modules/StepList";
import { DeliverableCard } from "@/components/modules/DeliverableCard";
import { ToolBadge } from "@/components/modules/ToolBadge";

export function generateMetadata(): Metadata {
  return {
    title: {
      absolute:
        "Timeline Reconstruction via Artifact Correlation — DFIR Lab",
    },
    description:
      "Reconstruct an attacker's execution window on Windows by correlating " +
      "$UsnJrnl, Shimcache, and SQLite WAL files — even after event logs were " +
      "deleted. Full step-by-step methodology with tools and deliverables.",
  };
}

export default function TimelineModulePage() {
  const timelineModule = modules.find((m) => m.slug === "timeline");

  if (!timelineModule) {
    throw new Error("Timeline module data missing");
  }

  return (
    <Container className="py-16 md:py-24">
      <div className="space-y-16">
        <ModuleHeader module={timelineModule} />

        <section aria-label="Interactive detection lab">
          <div className="flex flex-col gap-5 rounded-2xl border border-accent/30 bg-accent-muted p-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                Hands-on — runs in your browser
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Detection lab: upload a timeline, get the verdict
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-fg">
                Drop a Plaso / UsnJrnl2Csv export — or load the built-in fictional
                host — and the analyzer surfaces the execution window, off-hours
                high-signal events and anti-forensics bursts.
              </p>
            </div>
            <Link
              href="/modules/timeline/lab"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-accent px-5 py-3 font-semibold text-background transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:self-auto"
            >
              <FlaskConical aria-hidden="true" className="h-5 w-5" />
              Open the lab
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section aria-labelledby="methodology-heading" className="space-y-8">
          <h2
            id="methodology-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Methodology
          </h2>
          <StepList steps={timelineModule.steps} />
        </section>

        <section aria-label="Expected deliverables">
          <DeliverableCard items={timelineModule.deliverables} />
        </section>

        <section aria-labelledby="toolset-heading" className="space-y-6">
          <h2
            id="toolset-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Toolset
          </h2>
          <div className="flex flex-wrap gap-2">
            {timelineModule.tools.map((tool) => (
              <ToolBadge key={tool} name={tool} />
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
