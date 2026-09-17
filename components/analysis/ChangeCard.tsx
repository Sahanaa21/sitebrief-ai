import type { Change } from "@/types";
import { SourceEvidence } from "./SourceEvidence";

export function ChangeCard({ change }: { change: Change }) {
  return (
    <div className="rounded-md border border-ink-200 p-4">
      <h4 className="text-sm font-semibold text-ink-900">{change.item}</h4>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700 line-through">
          {change.previousValue}
        </span>
        <span className="text-ink-400">→</span>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800">{change.newValue}</span>
      </div>
      <p className="mt-2 text-xs text-ink-500">
        Reason: <span className="text-ink-700">{change.reason}</span>
      </p>
      <SourceEvidence excerpt={change.sourceReference} />
    </div>
  );
}
