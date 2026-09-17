import type { Communication, MemoryItem, AnalysisResult } from "@/types";
import type { AnalysisResultInput } from "@/lib/validation";

export function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return iso;
  }
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// Assigns fresh client-side ids to every extracted item in a freshly-parsed
// AnalysisResult, so React keys and "Mark Complete" toggles have something
// stable to reference. This never touches AI-authored content.
export function withGeneratedIds(analysis: AnalysisResultInput): AnalysisResult {
  return {
    summary: analysis.summary,
    decisions: analysis.decisions.map((d) => ({ ...d, id: generateId("dec") })),
    actionItems: analysis.actionItems.map((a) => ({ ...a, id: generateId("act") })),
    issues: analysis.issues.map((i) => ({ ...i, id: generateId("iss") })),
    changes: analysis.changes.map((c) => ({ ...c, id: generateId("chg") })),
    people: analysis.people,
    deadlines: analysis.deadlines,
  };
}

export interface ProjectStats {
  conversations: number;
  decisions: number;
  actionItems: number;
  pendingIssues: number;
}

export function computeProjectStats(communications: Communication[]): ProjectStats {
  let decisions = 0;
  let actionItems = 0;
  let pendingIssues = 0;

  for (const comm of communications) {
    decisions += comm.analysis.decisions.length;
    actionItems += comm.analysis.actionItems.length;
    pendingIssues += comm.analysis.issues.filter((i) => i.status === "open").length;
  }

  return {
    conversations: communications.length,
    decisions,
    actionItems,
    pendingIssues,
  };
}

// Flattens every communication's extracted items into a single searchable
// list. Deliberately simple keyword matching — no vector DB / RAG per scope.
export function buildMemoryIndex(communications: Communication[]): MemoryItem[] {
  const items: MemoryItem[] = [];

  for (const comm of communications) {
    items.push({
      type: "communication",
      id: comm.id,
      communicationId: comm.id,
      createdAt: comm.createdAt,
      title: comm.fileName ?? "Pasted communication",
      detail: comm.analysis.summary,
      sourceReference: comm.rawText.slice(0, 200),
    });

    for (const d of comm.analysis.decisions) {
      items.push({
        type: "decision",
        id: d.id,
        communicationId: comm.id,
        createdAt: comm.createdAt,
        title: d.title,
        detail: `${d.description} (${d.status})`,
        sourceReference: d.sourceReference,
      });
    }
    for (const a of comm.analysis.actionItems) {
      items.push({
        type: "actionItem",
        id: a.id,
        communicationId: comm.id,
        createdAt: comm.createdAt,
        title: a.task,
        detail: [
          a.assignee ? `Assigned to ${a.assignee}` : "Unassigned",
          a.deadline ? `Due ${a.deadline}` : "No deadline",
          `Priority: ${a.priority}`,
        ].join(" · "),
        sourceReference: a.sourceReference,
      });
    }
    for (const i of comm.analysis.issues) {
      items.push({
        type: "issue",
        id: i.id,
        communicationId: comm.id,
        createdAt: comm.createdAt,
        title: i.title,
        detail: `${i.description} (${i.status})`,
        sourceReference: i.sourceReference,
      });
    }
    for (const c of comm.analysis.changes) {
      items.push({
        type: "change",
        id: c.id,
        communicationId: comm.id,
        createdAt: comm.createdAt,
        title: c.item,
        detail: `${c.previousValue} → ${c.newValue} (${c.reason})`,
        sourceReference: c.sourceReference,
      });
    }
  }

  return items;
}

export function searchMemory(items: MemoryItem[], query: string): MemoryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter((item) =>
    [item.title, item.detail, item.sourceReference]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function projectDisplayInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
