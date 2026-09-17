// Core domain types for SiteBrief AI.
// Keeping these in one place makes it easy to extend (e.g. Decision Timeline,
// Source Evidence linking) without touching unrelated files.

export type DecisionStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "changed"
  | "unclear";

export type ActionPriority = "high" | "medium" | "low" | "unclear";

export type ActionStatus = "pending" | "completed" | "unclear";

export type IssueStatus = "open" | "resolved" | "unclear";

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: DecisionStatus;
  people: string[];
  sourceReference: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string | null;
  deadline: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  sourceReference: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  sourceReference: string;
}

export interface Change {
  id: string;
  item: string;
  previousValue: string;
  newValue: string;
  reason: string;
  sourceReference: string;
}

export interface Person {
  name: string;
  role: string | null;
  sourceReference: string;
}

export interface DeadlineEntry {
  description: string;
  date: string;
  relatedTo: string;
  sourceReference: string;
}

// The full structured result returned by /api/analyze (validated with Zod)
// or produced ahead of time for Demo Mode.
export interface AnalysisResult {
  summary: string;
  decisions: Decision[];
  actionItems: ActionItem[];
  issues: Issue[];
  changes: Change[];
  people: Person[];
  deadlines: DeadlineEntry[];
}

export type CommunicationSource = "paste" | "file" | "demo";

export interface Communication {
  id: string;
  projectId: string;
  source: CommunicationSource;
  fileName: string | null;
  rawText: string;
  createdAt: string; // ISO timestamp
  analysis: AnalysisResult;
  isDemo: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO timestamp
  isDemo: boolean;
}

// A flattened, searchable record used by Project Memory search.
export type MemoryItemType =
  | "decision"
  | "actionItem"
  | "issue"
  | "change"
  | "communication";

export interface MemoryItem {
  type: MemoryItemType;
  id: string;
  communicationId: string;
  createdAt: string;
  title: string;
  detail: string;
  sourceReference: string;
}
