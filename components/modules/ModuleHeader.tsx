import { Crosshair, FileSearch } from "lucide-react";
import type { Module } from "@/lib/types";
import { modules } from "@/lib/data/modules";
import { ModuleIcon } from "@/components/modules/ModuleIcon";

export function ModuleHeader({ module }: { module: Module }) {
  const index = modules.findIndex((m) => m.slug === module.slug);
  const moduleNumber = index >= 0 ? String(index + 1).padStart(2, "0") : null;

  return (
    <header className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent-muted">
          <ModuleIcon icon={module.icon} className="h-6 w-6 text-accent" />
        </span>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-fg">
          {moduleNumber && (
            <span className="mr-2 text-accent">Module {moduleNumber}</span>
          )}
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] text-foreground/80">
            Hands-on lab
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {module.title}
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm">
          {module.subtitle}
        </p>
      </div>

      <p className="max-w-3xl text-lg leading-relaxed text-muted-fg">
        {module.description}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/90">
              Objective
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">
            {module.objective}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/90">
              Context
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">
            {module.context}
          </p>
        </div>
      </div>
    </header>
  );
}
