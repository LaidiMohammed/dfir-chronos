import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">
              DFIR<span className="text-accent">_Lab</span>
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-fg">
              Methodology over guesswork
            </p>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-muted-fg">
            <li>
              <Link href="/#modules" className="transition-colors hover:text-foreground">
                Modules
              </Link>
            </li>
            <li>
              <Link href="/#about" className="transition-colors hover:text-foreground">
                About
              </Link>
            </li>
          </ul>
        </nav>

        <p className="max-w-[240px] font-mono text-[11px] leading-relaxed text-muted-fg">
          For education only. Isolated lab images — authorized targets, never
          live systems. © 2026 DFIR Lab.
        </p>
      </Container>
    </footer>
  );
}
