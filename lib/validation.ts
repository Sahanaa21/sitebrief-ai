import { z } from "zod";

// These schemas define and enforce the exact contract the AI must return.
// If Gemini returns anything that doesn't match this shape, parsing fails
// loudly here rather than letting malformed data reach the UI.

export const DecisionStatusEnum = z.enum([
  "approved",
  "pending",
  "rejected",
  "changed",
  "unclear",
]);

export const ActionPriorityEnum = z.enum(["high", "medium", "low", "unclear"]);
export const ActionStatusEnum = z.enum(["pending", "completed", "unclear"]);
export const IssueStatusEnum = z.enum(["open", "resolved", "unclear"]);

// A short excerpt of the original text. We cap the length defensively so a
// misbehaving model can't smuggle back huge blocks of text as "evidence".
const sourceReference = z
  .string()
  .trim()
  .min(1, "sourceReference cannot be empty")
  .max(400, "sourceReference is too long")
  .transform((s) => s);

export const DecisionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(600),
  status: DecisionStatusEnum,
  people: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  sourceReference,
});

export const ActionItemSchema = z.object({
  task: z.string().trim().min(1).max(200),
  assignee: z.string().trim().min(1).max(80).nullable().default(null),
  deadline: z.string().trim().min(1).max(60).nullable().default(null),
  priority: ActionPriorityEnum,
  status: ActionStatusEnum,
  sourceReference,
});

export const IssueSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(600),
  status: IssueStatusEnum,
  sourceReference,
});

export const ChangeSchema = z.object({
  item: z.string().trim().min(1).max(160),
  previousValue: z.string().trim().min(1).max(200),
  newValue: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(300),
  sourceReference,
});

export const PersonSchema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(80).nullable().default(null),
  sourceReference,
});

export const DeadlineEntrySchema = z.object({
  description: z.string().trim().min(1).max(200),
  date: z.string().trim().min(1).max(60),
  relatedTo: z.string().trim().min(1).max(160),
  sourceReference,
});

export const AnalysisResultSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  decisions: z.array(DecisionSchema).max(30).default([]),
  actionItems: z.array(ActionItemSchema).max(50).default([]),
  issues: z.array(IssueSchema).max(30).default([]),
  changes: z.array(ChangeSchema).max(30).default([]),
  people: z.array(PersonSchema).max(30).default([]),
  deadlines: z.array(DeadlineEntrySchema).max(30).default([]),
});

export type AnalysisResultInput = z.infer<typeof AnalysisResultSchema>;

// Request body accepted by POST /api/analyze
export const AnalyzeRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(20, "Communication text is too short to analyze (minimum 20 characters).")
    .max(20000, "Communication text is too long (maximum 20,000 characters)."),
  fileName: z.string().trim().max(200).nullable().optional(),
});

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
