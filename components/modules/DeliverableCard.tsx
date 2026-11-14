import { CheckCircle2, ClipboardCheck } from "lucide-react";

export function DeliverableCard({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-muted via-muted/40 to-muted/20">
      <div className="flex items-center justify-between gap-4 border-b border-accent/15 px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Deliverables
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {String(items.length).padStart(2, "0")} items
        </span>
      </div>
      <ul className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-foreground/90">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
