import { AnalysisResultSchema, type AnalysisResultInput } from "./validation";

// Server-only module. Never import this from a Client Component — the
// GEMINI_API_KEY must never reach the browser bundle.

const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_GEMINI_RETRIES = 2;
const TRANSIENT_GEMINI_STATUSES = new Set([429, 500, 502, 503, 504]);

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}
export class GeminiParseError extends Error {}

const SYSTEM_INSTRUCTIONS = `You are SiteBrief AI's extraction engine for architecture and construction (AEC) project communication.

Your job is to read a raw piece of project communication (an email thread, chat log, WhatsApp export, or meeting note) and convert it into structured project memory.

STRICT RULES:
1. Only extract information that is explicitly present in the text. NEVER invent names, dates, tasks, or decisions.
2. If an assignee is not clearly stated, set "assignee" to an empty string (""). Do not guess based on role.
3. If a deadline is not clearly stated, set "deadline" to an empty string (""). Do not infer a date that isn't in the text.
4. Classify each decision's status carefully:
   - "approved": the text shows clear, confirmed approval.
   - "pending": someone proposed something but no confirmation yet.
   - "rejected": something was explicitly declined or ruled out.
   - "changed": a prior decision was revised (also add an entry to "changes").
   - "unclear": you cannot confidently tell.
   Do NOT mark something "approved" just because it sounds likely — require explicit confirmation language (e.g. "confirmed", "approved", "go ahead", "that's fine", "yes, proceed"). Never convert a mere suggestion or proposal into an "approved" decision.
   When a decision changes (e.g. a material or plan originally chosen is later swapped for another), record it with status "changed" AND add a matching entry to "changes" describing the previous value, the new value, and the reason. For example: "Tile 312 selected" -> supplier reports it unavailable -> "Tile 315 proposed" -> client approves Tile 315. This whole arc should be represented as a decision (status "changed") plus a corresponding "changes" entry — not as two unrelated, disconnected decisions.
5. Every decision, action item, issue, change, person, and deadline MUST include a "sourceReference": a short verbatim excerpt (under ~30 words) copied directly from the input text that justifies the extraction. Never fabricate or paraphrase-as-if-verbatim a source reference — if you cannot point to real text supporting an item, do not include that item at all. Preserve the original meaning of the communication; do not editorialize.
6. Keep "summary" concise (3-6 sentences) and neutral — describe what was discussed, not your opinion.
7. Extract "people" as the distinct individuals mentioned (name + role if stated). Only assign a role if the text states or clearly implies it; otherwise set "role" to an empty string ("").
8. Extract "deadlines" as a flat list of every date/deadline mentioned, even ones already referenced inside an action item.
9. Output ONLY valid JSON matching the schema below. No markdown fences, no commentary, no trailing text.

Return JSON with exactly this shape:
{
  "summary": "string",
  "decisions": [{ "title": "string", "description": "string", "status": "approved|pending|rejected|changed|unclear", "people": ["string"], "sourceReference": "string" }],
  "actionItems": [{ "task": "string", "assignee": "string", "deadline": "string", "priority": "high|medium|low|unclear", "status": "pending|completed|unclear", "sourceReference": "string" }],
  "issues": [{ "title": "string", "description": "string", "status": "open|resolved|unclear", "sourceReference": "string" }],
  "changes": [{ "item": "string", "previousValue": "string", "newValue": "string", "reason": "string", "sourceReference": "string" }],
  "people": [{ "name": "string", "role": "string", "sourceReference": "string" }],
  "deadlines": [{ "description": "string", "date": "string", "relatedTo": "string", "sourceReference": "string" }]
}

If a category has nothing to extract, return an empty array for it. Never omit a key.`;

// JSON Schema passed to Gemini's structured-output config (generationConfig.responseSchema).
// This mirrors lib/validation.ts's AnalysisResultSchema field-for-field. Zod remains the
// authoritative, final validation layer on the server — this schema only makes Gemini's raw
// output more likely to match it in the first place.
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["approved", "pending", "rejected", "changed", "unclear"] },
          people: { type: "array", items: { type: "string" } },
          sourceReference: { type: "string" },
        },
        required: ["title", "description", "status", "people", "sourceReference"],
      },
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          task: { type: "string" },
          assignee: { type: "string" },
          deadline: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low", "unclear"] },
          status: { type: "string", enum: ["pending", "completed", "unclear"] },
          sourceReference: { type: "string" },
        },
        required: ["task", "assignee", "deadline", "priority", "status", "sourceReference"],
      },
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["open", "resolved", "unclear"] },
          sourceReference: { type: "string" },
        },
        required: ["title", "description", "status", "sourceReference"],
      },
    },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          previousValue: { type: "string" },
          newValue: { type: "string" },
          reason: { type: "string" },
          sourceReference: { type: "string" },
        },
        required: ["item", "previousValue", "newValue", "reason", "sourceReference"],
      },
    },
    people: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          sourceReference: { type: "string" },
        },
        required: ["name", "role", "sourceReference"],
      },
    },
    deadlines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          date: { type: "string" },
          relatedTo: { type: "string" },
          sourceReference: { type: "string" },
        },
        required: ["description", "date", "relatedTo", "sourceReference"],
      },
    },
  },
  required: ["summary", "decisions", "actionItems", "issues", "changes", "people", "deadlines"],
};

function extractJsonText(rawText: string): string {
  // Gemini sometimes wraps JSON in ```json fences despite instructions not to.
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : rawText;
  return candidate.trim();
}

function retryDelayMs(retryNumber: number): number {
  const exponentialDelay = 250 * 2 ** (retryNumber - 1);
  return exponentialDelay + Math.floor(Math.random() * 100);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export async function analyzeWithGemini(text: string): Promise<AnalysisResultInput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError("GEMINI_API_KEY is not configured on the server.");
  }

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTIONS }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the following project communication and return the structured JSON described in your instructions.\n\n--- COMMUNICATION START ---\n${text}\n--- COMMUNICATION END ---`,
          },
        ],
      },
    ],
    generationConfig: {
      // Gemini 3.8 Flash uses thinkingConfig.thinkingLevel in place of the older
      // temperature/top_p/top_k/candidate_count knobs. "LOW" is enough reasoning for
      // this extraction task while keeping latency and cost minimal (₹0 budget).
      thinkingConfig: {
        thinkingLevel: "LOW",
      },
      // Structured-output shape for the REST generateContent API: top-level
      // responseMimeType + responseSchema (NOT responseFormat).
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  };

  let response: Response | undefined;
  for (let attempt = 0; attempt <= MAX_GEMINI_RETRIES; attempt += 1) {
    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Gemini 3.8 Flash authenticates via this header — the key must never be
          // put in the URL query string.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        // Hackathon-scale documents are short; a generous but bounded timeout
        // keeps the loading state honest without hanging forever.
        signal: AbortSignal.timeout(30000),
      });

      if (!TRANSIENT_GEMINI_STATUSES.has(response.status) || attempt === MAX_GEMINI_RETRIES) {
        break;
      }
    } catch {
      if (attempt === MAX_GEMINI_RETRIES) {
        throw new GeminiRequestError(
          "Could not reach the Gemini API after 3 attempts. Check your network connection or try again."
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs(attempt + 1)));
  }

  if (!response) {
    throw new GeminiRequestError("Could not reach the Gemini API. Check your network connection or try again.");
  }

  if (response.status === 429) {
    throw new GeminiRequestError(
      "Gemini API rate limit or quota exceeded. Please wait a moment and try again, or use Demo Mode.",
      429
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new GeminiRequestError(
      "Gemini API rejected the request (invalid or unauthorized API key).",
      response.status
    );
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new GeminiRequestError(
      `Gemini API returned an error (status ${response.status}). ${errText.slice(0, 200)}`,
      response.status
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new GeminiParseError("Gemini returned a response that was not valid JSON.");
  }

  const parts: any[] | undefined = json?.candidates?.[0]?.content?.parts;
  const candidateText: string | undefined = Array.isArray(parts)
    ? parts.map((p: any) => p?.text ?? "").join("")
    : undefined;

  if (!candidateText) {
    const finishReason = json?.candidates?.[0]?.finishReason;
    throw new GeminiParseError(
      finishReason
        ? `Gemini did not return usable content (finish reason: ${finishReason}).`
        : "Gemini did not return any content."
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonText(candidateText));
  } catch {
    throw new GeminiParseError("Gemini's response could not be parsed as JSON.");
  }

  const validated = AnalysisResultSchema.safeParse(parsedJson);
  if (!validated.success) {
    throw new GeminiParseError(
      `Gemini's response did not match the expected structure: ${validated.error.issues
        .slice(0, 3)
        .map((i) => i.message)
        .join("; ")}`
    );
  }

  return validated.data;
}
