import type { AnalysisResult } from "@/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DecisionCard } from "./DecisionCard";
import { ActionItemCard } from "./ActionItemCard";
import { IssueCard } from "./IssueCard";
import { ChangeCard } from "./ChangeCard";

export function AnalysisResultView({
  analysis,
  onToggleActionComplete,
}: {
  analysis: AnalysisResult;
  onToggleActionComplete?: (actionItemId: string, nextStatus: "pending" | "completed") => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="AI Summary" description="A neutral, 3-6 sentence recap of what was discussed." />
        <CardBody>
          <p className="text-sm leading-relaxed text-ink-700">{analysis.summary}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Decisions"
          description="Confirmed, pending, rejected, and changed decisions, each traceable to its source."
        />
        <CardBody className="space-y-3">
          {analysis.decisions.length === 0 ? (
            <EmptyState title="No decisions detected" description="Nothing in this text was confidently identified as a decision." />
          ) : (
            analysis.decisions.map((d) => <DecisionCard key={d.id} decision={d} />)
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Action Items" description="Tasks, responsibilities, and deadlines extracted from the text." />
        <CardBody className="space-y-3">
          {analysis.actionItems.length === 0 ? (
            <EmptyState title="No action items detected" />
          ) : (
            analysis.actionItems.map((a) => (
              <ActionItemCard
                key={a.id}
                item={a}
                onToggleComplete={onToggleActionComplete ? (status) => onToggleActionComplete(a.id, status) : undefined}
              />
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Responsibilities" description="People mentioned in this communication." />
        <CardBody>
          {analysis.people.length === 0 ? (
            <EmptyState title="No people identified" />
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {analysis.people.map((p, i) => (
                <li key={`${p.name}-${i}`} className="rounded-md border border-ink-200 px-3 py-2 text-sm">
                  <span className="font-medium text-ink-900">{p.name}</span>
                  {p.role && <span className="text-ink-500"> · {p.role}</span>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Deadlines" description="Every date or deadline mentioned in this communication." />
        <CardBody className="space-y-2">
          {analysis.deadlines.length === 0 ? (
            <EmptyState title="No deadlines identified" />
          ) : (
            analysis.deadlines.map((d, i) => (
              <div key={i} className="rounded-md border border-ink-200 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900">{d.description}</span>
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                    {d.date}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-500">Related to: {d.relatedTo}</p>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Issues" description="Open or resolved problems flagged in the communication." />
        <CardBody className="space-y-3">
          {analysis.issues.length === 0 ? (
            <EmptyState title="No issues detected" />
          ) : (
            analysis.issues.map((i) => <IssueCard key={i.id} issue={i} />)
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Changes" description="Prior decisions that were revised, and why." />
        <CardBody className="space-y-3">
          {analysis.changes.length === 0 ? (
            <EmptyState title="No changes detected" />
          ) : (
            analysis.changes.map((c) => <ChangeCard key={c.id} change={c} />)
          )}
        </CardBody>
      </Card>
    </div>
  );
}
