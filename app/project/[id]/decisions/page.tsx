"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunications } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import type { Communication } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DecisionCard } from "@/components/analysis/DecisionCard";
import { Badge } from "@/components/ui/Badge";

export default function DecisionsPage() {
  const params = useParams<{ id: string }>();
  const [communications, setCommunications] = useState<Communication[]>([]);

  useEffect(() => {
    setCommunications(getCommunications(params.id));
  }, [params.id]);

  // Chronological (oldest first) timeline combining decisions and changes —
  // a lightweight version of the Decision Timeline differentiator. It groups
  // items whose title shares words with a "changes" entry's "item" field so
  // a tile-selection story reads as one thread, e.g.
  // "Tile 312 selected" -> "Tile 315 proposed" -> "Client approves 315".
  const timelineEvents = useMemo(() => {
    const events: {
      id: string;
      createdAt: string;
      kind: "decision" | "change";
      title: string;
      detail: string;
      status?: string;
    }[] = [];

    const sorted = [...communications].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (const comm of sorted) {
      for (const d of comm.analysis.decisions) {
        events.push({
          id: d.id,
          createdAt: comm.createdAt,
          kind: "decision",
          title: d.title,
          detail: d.description,
          status: d.status,
        });
      }
      for (const c of comm.analysis.changes) {
        events.push({
          id: c.id,
          createdAt: comm.createdAt,
          kind: "change",
          title: c.item,
          detail: `${c.previousValue} → ${c.newValue} (${c.reason})`,
        });
      }
    }
    return events;
  }, [communications]);

  const allDecisions = communications.flatMap((c) => c.analysis.decisions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-950">Decisions</h1>
        <p className="mt-1 text-sm text-ink-500">
          Every decision extracted across this project&apos;s communication, plus how they evolved
          over time.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Decision Timeline"
          description="Decisions and changes in chronological order — see how a decision evolved and what caused the change."
        />
        <CardBody>
          {timelineEvents.length === 0 ? (
            <EmptyState title="No timeline yet" description="Analyze some communication to start building the decision timeline." />
          ) : (
            <ol className="relative space-y-5 border-l border-ink-200 pl-5">
              {timelineEvents.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                      event.kind === "change" ? "bg-brand-500" : "bg-ink-400"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink-900">{event.title}</p>
                    {event.status && <Badge tone={event.status}>{event.status}</Badge>}
                    {event.kind === "change" && <Badge tone="changed">changed</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-600">{event.detail}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{formatDate(event.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="All decisions" />
        <CardBody className="space-y-3">
          {allDecisions.length === 0 ? (
            <EmptyState title="No decisions yet" description="Analyze a communication to extract decisions." />
          ) : (
            allDecisions.map((d) => <DecisionCard key={d.id} decision={d} />)
          )}
        </CardBody>
      </Card>
    </div>
  );
}
