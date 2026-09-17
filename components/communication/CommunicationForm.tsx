"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AnalysisResultInput } from "@/lib/validation";

interface Props {
  onAnalyzed: (result: { analysis: AnalysisResultInput; rawText: string; fileName: string | null }) => void;
  onGeminiUnavailable: () => void;
}

const MIN_LENGTH = 20;
const MAX_LENGTH = 20000;

export function CommunicationForm({ onAnalyzed, onGeminiUnavailable }: Props) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Only .txt files are supported in this build. Please upload a plain text file.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large (max 2MB for this prototype).");
      e.target.value = "";
      return;
    }

    try {
      const content = await file.text();
      if (!content.trim()) {
        setError("The uploaded file appears to be empty.");
        return;
      }
      setText(content);
      setFileName(file.name);
    } catch {
      setError("Could not read this file. Please make sure it's a valid plain text (.txt) file.");
    }
  }

  function clearFile() {
    setFileName(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyze() {
    setError(null);
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      setError("Please paste some project communication or upload a file before analyzing.");
      return;
    }
    if (trimmed.length < MIN_LENGTH) {
      setError(`This looks too short to analyze meaningfully. Add a bit more detail (at least ${MIN_LENGTH} characters).`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`This is too long for a single analysis (max ${MAX_LENGTH.toLocaleString()} characters). Try splitting it into smaller chunks.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, fileName }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 503 && body?.code === "GEMINI_NOT_CONFIGURED") {
        onGeminiUnavailable();
        return;
      }

      if (!res.ok) {
        setError(body?.error ?? "Something went wrong while analyzing this communication. Please try again.");
        return;
      }

      onAnalyzed({ analysis: body.analysis, rawText: trimmed, fileName });
    } catch {
      setError("Could not reach the analysis service. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="communication-text" className="label">
          Paste project communication here…
        </label>
        <textarea
          id="communication-text"
          className="input min-h-[220px] font-mono text-[13px] leading-relaxed"
          placeholder={`e.g. an email thread, WhatsApp export, or meeting notes about drawings, materials, approvals, or deadlines…`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (fileName) setFileName(null);
          }}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-ink-400">{text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters</p>
      </div>

      <div className="flex items-center gap-3 text-sm text-ink-500">
        <div className="h-px flex-1 bg-ink-200" />
        or
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      <div>
        <label htmlFor="communication-file" className="label">
          Upload a text file (.txt)
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            id="communication-file"
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-900"
          />
          {fileName && (
            <Button variant="ghost" type="button" onClick={clearFile} className="!px-2 !py-1 text-xs">
              Clear
            </Button>
          )}
        </div>
        {fileName && <p className="mt-1 text-xs text-ink-500">Loaded: {fileName}</p>}
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      <Button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? "Analyzing…" : "Analyze Communication"}
      </Button>
    </div>
  );
}
