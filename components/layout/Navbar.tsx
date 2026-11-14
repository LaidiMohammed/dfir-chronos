"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeXml, Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";

const GITHUB_REPO = "https://github.com/LaidiMohammed/dfir-timeline-lab";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container>
        <nav
          aria-label="Main navigation"
          className="flex h-16 items-center justify-between"
        >
          <Link
            href="/"
            className="font-mono text-lg font-semibold tracking-tight text-accent transition-colors hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            DFIR.LAB
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/#modules"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Modules
            </Link>
            <Link
              href="/#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              About
            </Link>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the source code on GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CodeXml aria-hidden="true" className="h-5 w-5" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {open ? (
          <div
            id="mobile-nav"
            className="border-t border-border py-4 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/#modules"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Modules
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CodeXml aria-hidden="true" className="h-5 w-5" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
