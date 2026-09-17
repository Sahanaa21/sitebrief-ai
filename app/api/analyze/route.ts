import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/validation";
import {
  analyzeWithGemini,
  isGeminiConfigured,
  GeminiConfigError,
  GeminiRequestError,
  GeminiParseError,
} from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Live analysis is unavailable because GEMINI_API_KEY is not configured on the server. Try Demo Mode instead, or add a free Gemini API key to run live analysis.",
        code: "GEMINI_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    const analysis = await analyzeWithGemini(parsed.data.text);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json(
        { error: "Live analysis is unavailable right now. Try Demo Mode instead.", code: "GEMINI_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    if (err instanceof GeminiRequestError) {
      const status = err.status === 429 ? 429 : 502;
      return NextResponse.json({ error: err.message, code: "GEMINI_REQUEST_FAILED" }, { status });
    }
    if (err instanceof GeminiParseError) {
      return NextResponse.json(
        { error: `Gemini returned an unexpected response and it could not be processed. ${err.message}`, code: "GEMINI_PARSE_FAILED" },
        { status: 502 }
      );
    }
    // Never leak internal stack traces to the client.
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing the communication.", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}
