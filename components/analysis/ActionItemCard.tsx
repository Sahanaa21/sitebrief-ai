"use client";

import type { ActionItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { SourceEvidence } from "./SourceEvidence";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/utils";

export function ActionItemCard({
  item,
  onToggleComplete,
}: {
  item: ActionItem;
  onToggleComplete?: (nextStatus: "pending" | "completed") => void;
}) {
  const isCompleted = item.status === "completed";
  return (
    <div className="rounded-md border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className={cx("text-sm font-semibold", isCompleted ? "text-ink-400 line-through" : "text-ink-900")}>
          {item.task}
        </h4>
        <Badge tone={item.priority}>{item.priority} priority</Badge>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-500 sm:grid-cols-3">
        <div>
          <dt className="font-medium text-ink-400">Assigned to</dt>
          <dd className="text-ink-700">{item.assignee ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-400">Deadline</dt>
          <dd className="text-ink-700">{item.deadline ?? "Not specified"}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-400">Status</dt>
          <dd>
            <Badge tone={item.status}>{item.status}</Badge>
          </dd>
        </div>
      </dl>
      <SourceEvidence excerpt={item.sourceReference} />
      {onToggleComplete && item.status !== "unclear" && (
        <div className="mt-3">
          <Button
            variant={isCompleted ? "secondary" : "primary"}
            className="!px-3 !py-1.5 text-xs"
            onClick={() => onToggleComplete(isCompleted ? "pending" : "completed")}
          >
            {isCompleted ? "Mark as pending" : "Mark Complete"}
          </Button>
        </div>
      )}
    </div>
  );
}
