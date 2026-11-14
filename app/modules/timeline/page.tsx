import type { Metadata } from "next";
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
