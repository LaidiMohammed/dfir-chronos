"use client";

import { motion } from "framer-motion";
import type { Step } from "@/lib/types";
import { ToolBadge } from "@/components/modules/ToolBadge";

export function StepList({ steps }: { steps: Step[] }) {
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <ol className="relative ml-5 border-l border-border sm:ml-6">
      {ordered.map((step, index) => (
        <motion.li
          key={step.order}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
          className="relative pb-8 pl-8 last:pb-0 sm:pl-12"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-accent/40 bg-background font-mono text-sm font-semibold text-accent sm:h-12 sm:w-12"
          >
            {String(step.order).padStart(2, "0")}
          </span>

          <div className="rounded-xl border border-border bg-muted/30 p-5 transition-colors hover:border-accent/30 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-fg sm:inline">
                Step {String(step.order).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted-fg">
              {step.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {step.tools.map((tool) => (
                <ToolBadge key={tool} name={tool} />
              ))}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
