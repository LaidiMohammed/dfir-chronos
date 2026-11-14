export function ToolBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs text-foreground/90">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-accent"
      />
      {name}
    </span>
  );
}
