import type { Decision } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { SourceEvidence } from "./SourceEvidence";

export function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <div className="rounded-md border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink-900">{decision.title}</h4>
        <Badge tone={decision.status}>{decision.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-600">{decision.description}</p>
      {decision.people.length > 0 && (
        <p className="mt-2 text-xs text-ink-500">
          People: <span className="text-ink-700">{decision.people.join(", ")}</span>
        </p>
      )}
      <SourceEvidence excerpt={decision.sourceReference} />
    </div>
  );
}
