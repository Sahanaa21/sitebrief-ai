"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunications } from "@/lib/storage";
import type { Communication } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IssueCard } from "@/components/analysis/IssueCard";

export default function IssuesPage() {
  const params = useParams<{ id: string }>();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    setCommunications(getCommunications(params.id));
  }, [params.id]);

  const issues = communications.flatMap((c) => c.analysis.issues);
  const filtered = issues.filter((i) => filter === "all" || i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-950">Issues</h1>
          <p className="mt-1 text-sm text-ink-500">Open and resolved problems flagged in project communication.</p>
        </div>
        <div className="flex gap-1 rounded-md border border-ink-200 bg-white p-1 text-sm">
          {(["all", "open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 capitalize transition-colors ${
                filter === f ? "bg-brand-800 text-white" : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title={`${filtered.length} issue${filtered.length === 1 ? "" : "s"}`} />
        <CardBody className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState title="No issues here" description="Analyze a communication to detect open issues." />
          ) : (
            filtered.map((i) => <IssueCard key={i.id} issue={i} />)
          )}
        </CardBody>
      </Card>
    </div>
  );
}
