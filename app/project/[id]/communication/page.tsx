"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CommunicationForm } from "@/components/communication/CommunicationForm";
import { AnalyzingIndicator } from "@/components/communication/AnalyzingIndicator";
import { AnalysisResultView } from "@/components/analysis/AnalysisResultView";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getCommunications,
  saveCommunication,
  updateActionItemStatus,
} from "@/lib/storage";
import { generateId, withGeneratedIds, formatDate } from "@/lib/utils";
import type { AnalysisResultInput } from "@/lib/validation";
import type { Communication } from "@/types";

type ViewState =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "gemini-unavailable" }
  | { kind: "result"; communication: Communication };

export default function CommunicationPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [state, setState] = useState<ViewState>({ kind: "form" });
  const [history, setHistory] = useState<Communication[]>([]);

  useEffect(() => {
    setHistory(getCommunications(projectId));
  }, [projectId]);

  function handleAnalyzed({
    analysis,
    rawText,
    fileName,
  }: {
    analysis: AnalysisResultInput;
    rawText: string;
    fileName: string | null;
  }) {
    const communication: Communication = {
      id: generateId("comm"),
      projectId,
      source: fileName ? "file" : "paste",
      fileName,
      rawText,
      createdAt: new Date().toISOString(),
      analysis: withGeneratedIds(analysis),
      isDemo: false,
    };
    saveCommunication(communication);
    setHistory(getCommunications(projectId));
    setState({ kind: "result", communication });
  }

  function handleToggleComplete(commId: string, actionItemId: string, nextStatus: "pending" | "completed") {
    updateActionItemStatus(commId, actionItemId, nextStatus);
    setHistory(getCommunications(projectId));
    setState((prev) => {
      if (prev.kind === "result" && prev.communication.id === commId) {
        return {
          kind: "result",
          communication: {
            ...prev.communication,
            analysis: {
              ...prev.communication.analysis,
              actionItems: prev.communication.analysis.actionItems.map((a) =>
                a.id === actionItemId ? { ...a, status: nextStatus } : a
              ),
            },
          },
        };
      }
      return prev;
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-950">Communication</h1>
        <p className="mt-1 text-sm text-ink-500">
          Paste or upload project communication and let SiteBrief AI extract structured project
          memory from it.
        </p>
      </div>

      {state.kind === "form" && (
        <Card>
          <CardBody>
            <CommunicationForm
              onAnalyzed={(payload) => {
                setState({ kind: "loading" });
                // Give the loading indicator a moment to render before swapping in
                // the (already-fetched) result — the network wait already happened
                // inside CommunicationForm.
                setTimeout(() => handleAnalyzed(payload), 150);
              }}
              onGeminiUnavailable={() => setState({ kind: "gemini-unavailable" })}
            />
          </CardBody>
        </Card>
      )}

      {state.kind === "loading" && <AnalyzingIndicator />}

      {state.kind === "gemini-unavailable" && (
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-900">Live analysis is unavailable</h2>
            <p className="text-sm text-ink-600">
              The server doesn&apos;t have a Gemini API key configured, so live analysis can&apos;t run
              right now. Add a free key to your <code className="rounded bg-ink-100 px-1 py-0.5 text-xs">.env.local</code> as{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs">GEMINI_API_KEY</code>, or explore the
              full workflow using the Demo Mode project from the homepage.
            </p>
            <Button variant="secondary" onClick={() => setState({ kind: "form" })}>
              Back to input
            </Button>
          </CardBody>
        </Card>
      )}

      {state.kind === "result" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>Analysis complete — saved to this project&apos;s memory.</span>
            <Button variant="secondary" className="!bg-white" onClick={() => setState({ kind: "form" })}>
              Analyze another
            </Button>
          </div>
          <AnalysisResultView
            analysis={state.communication.analysis}
            onToggleActionComplete={(actionItemId, nextStatus) =>
              handleToggleComplete(state.communication.id, actionItemId, nextStatus)
            }
          />
        </div>
      )}

      {state.kind === "form" && history.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-800">Previously analyzed</h2>
          <div className="space-y-2">
            {history.map((c) => (
              <button
                key={c.id}
                onClick={() => setState({ kind: "result", communication: c })}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-ink-200 bg-white px-4 py-3 text-left text-sm hover:border-ink-300 hover:bg-ink-50"
              >
                <div>
                  <p className="font-medium text-ink-900">
                    {c.fileName ?? (c.isDemo ? "Sample communication (Demo)" : "Pasted communication")}
                  </p>
                  <p className="text-xs text-ink-500">{formatDate(c.createdAt)}</p>
                </div>
                <span className="text-xs text-ink-400">
                  {c.analysis.decisions.length} decisions · {c.analysis.actionItems.length} tasks
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
