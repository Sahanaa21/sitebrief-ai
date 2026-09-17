"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunications } from "@/lib/storage";
import { buildMemoryIndex, searchMemory, formatDate } from "@/lib/utils";
import type { Communication, MemoryItemType } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { SourceEvidence } from "@/components/analysis/SourceEvidence";

const TYPE_LABEL: Record<MemoryItemType, string> = {
  decision: "Decision",
  actionItem: "Action item",
  issue: "Issue",
  change: "Change",
  communication: "Communication",
};

export default function MemoryPage() {
  const params = useParams<{ id: string }>();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCommunications(getCommunications(params.id));
  }, [params.id]);

  const index = useMemo(() => buildMemoryIndex(communications), [communications]);
  const results = useMemo(() => searchMemory(index, query), [index, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-950">Project Memory</h1>
        <p className="mt-1 text-sm text-ink-500">
          Search every decision, task, issue, and change extracted from this project&apos;s
          communication history.
        </p>
      </div>

      <div>
        <input
          className="input max-w-lg"
          placeholder='Search project memory, e.g. "bathroom tile"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search project memory"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          {index.length} item{index.length === 1 ? "" : "s"} indexed across {communications.length}{" "}
          communication{communications.length === 1 ? "" : "s"} · keyword search
        </p>
      </div>

      {query.trim().length === 0 ? (
        <EmptyState
          title="Start typing to search"
          description="Search covers decisions, action items, issues, changes, and communication summaries."
        />
      ) : (
        <Card>
          <CardHeader title={`${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`} />
          <CardBody className="space-y-3">
            {results.length === 0 ? (
              <EmptyState title="No matches found" description="Try a different keyword." />
            ) : (
              results.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-md border border-ink-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-1.5">{TYPE_LABEL[item.type]}</Badge>
                      <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    </div>
                    <span className="text-xs text-ink-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{item.detail}</p>
                  <SourceEvidence excerpt={item.sourceReference} />
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
