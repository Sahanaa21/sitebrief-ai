"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getProject, saveProject, saveCommunication, getCommunications } from "@/lib/storage";
import { DEMO_PROJECT, DEMO_COMMUNICATION } from "@/lib/demo-data";

function seedDemoProjectIfNeeded() {
  if (!getProject(DEMO_PROJECT.id)) {
    saveProject(DEMO_PROJECT);
  }
  const existing = getCommunications(DEMO_PROJECT.id);
  if (existing.length === 0) {
    saveCommunication(DEMO_COMMUNICATION);
  }
}

export default function LandingPage() {
  const router = useRouter();

  function handleTryDemo() {
    seedDemoProjectIfNeeded();
    router.push(`/project/${DEMO_PROJECT.id}`);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-800 text-xs font-bold text-white">
              SB
            </span>
            SiteBrief AI
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleTryDemo}>
              Try Demo
            </Button>
            <Link href="/project/new">
              <Button variant="primary">Create Project</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <p className="mb-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
          Built for AEC project teams · ArchScale Guild AS-02
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
          Turn project conversations into project memory.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
          Project decisions, tasks, and updates are often buried across conversations. SiteBrief AI
          turns that communication into structured project information that teams can search,
          verify, and act on.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="primary" className="!px-6 !py-3 text-base" onClick={handleTryDemo}>
            Try Demo
          </Button>
          <Link href="/project/new">
            <Button variant="secondary" className="!px-6 !py-3 text-base">
              Create Project
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Try Demo loads a sample project (Riverside Residence) — no API key required.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-ink-900">Not just a summarizer</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                SiteBrief AI extracts decisions, action items, responsibilities, deadlines, and
                open issues from raw project communication — structured, not just condensed.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-ink-900">Decision Timeline</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                See how a decision evolved — e.g. Tile 312 selected → supplier unavailable → Tile
                315 proposed → client approves → contractor confirmation pending.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-ink-900">Source Evidence</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Every extracted decision, task, or issue links back to the exact sentence in the
                original communication that caused it — fully traceable, never fabricated.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
