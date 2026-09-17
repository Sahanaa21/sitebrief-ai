"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunications, updateActionItemStatus } from "@/lib/storage";
import type { Communication } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionItemCard } from "@/components/analysis/ActionItemCard";

export default function TasksPage() {
  const params = useParams<{ id: string }>();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    setCommunications(getCommunications(params.id));
  }, [params.id]);

  function refresh() {
    setCommunications(getCommunications(params.id));
  }

  const tasks = communications.flatMap((c) =>
    c.analysis.actionItems.map((item) => ({ item, communicationId: c.id }))
  );

  const filtered = tasks.filter(({ item }) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-950">Tasks</h1>
          <p className="mt-1 text-sm text-ink-500">
            Every action item extracted from this project&apos;s communication.
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-ink-200 bg-white p-1 text-sm">
          {(["all", "pending", "completed"] as const).map((f) => (
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
        <CardHeader title={`${filtered.length} task${filtered.length === 1 ? "" : "s"}`} />
        <CardBody className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState title="No tasks here" description="Analyze a communication to extract action items." />
          ) : (
            filtered.map(({ item, communicationId }) => (
              <ActionItemCard
                key={item.id}
                item={item}
                onToggleComplete={(nextStatus) => {
                  updateActionItemStatus(communicationId, item.id, nextStatus);
                  refresh();
                }}
              />
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
