import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { modules } from "@/lib/data/modules";
import { Container } from "@/components/layout/Container";
import { ModuleIcon } from "@/components/modules/ModuleIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <Container className="py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Digital Forensics · Incident Response
          </p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl md:text-8xl">
            DFIR<span className="text-accent">_</span>Lab
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-muted-fg">
            Four forensic investigation labs, from collection to report.
          </p>
          <div className="mt-10">
            <Link
              href="/modules/timeline"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-background transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explore the modules
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Modules grid */}
      <section id="modules" aria-labelledby="modules-heading">
        <Container className="py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
                Curriculum
              </p>
              <h2
                id="modules-heading"
                className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                Modules
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-fg">
              {String(modules.length).padStart(2, "0")} / 04 available
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {modules.map((module) => (
              <Card
                key={module.slug}
                className="flex flex-col transition-shadow hover:ring-2 hover:ring-accent/40"
              >
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent-muted">
                    <ModuleIcon
                      icon={module.icon}
                      className="h-6 w-6 text-accent"
                    />
                  </div>
                  <CardTitle className="text-xl font-semibold leading-snug tracking-tight">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.2em] text-muted-fg">
                    {module.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-[0.95rem] leading-7 text-muted-fg">
                    {module.description}
                  </p>
                  <Link
                    href={`/modules/${module.slug}`}
                    className="mt-6 inline-flex w-fit items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    Read module
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* About */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="border-t border-border"
      >
        <Container className="py-16 md:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            About
          </p>
          <h2
            id="about-heading"
            className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Forensics as discipline, not guesswork
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-fg">
            DFIR Lab is an interactive portfolio of end-to-end digital forensics
            investigation labs: each module walks through collection, analysis and
            conclusions with real tooling, real artifacts and a defensible
            methodology — the same standard expected in an incident report or an
            expert witness statement.
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-muted-fg">
            Next.js · TypeScript · Tailwind CSS
          </p>
        </Container>
      </section>
    </div>
  );
}
