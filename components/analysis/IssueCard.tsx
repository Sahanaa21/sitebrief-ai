import type { Issue } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { SourceEvidence } from "./SourceEvidence";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-md border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink-900">{issue.title}</h4>
        <Badge tone={issue.status}>{issue.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-600">{issue.description}</p>
      <SourceEvidence excerpt={issue.sourceReference} />
    </div>
  );
}
