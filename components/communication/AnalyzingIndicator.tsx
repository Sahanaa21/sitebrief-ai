"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading communication",
  "Identifying decisions",
  "Extracting action items",
  "Checking responsibilities and deadlines",
];

// Purely cosmetic progression through the steps while the real request is
// in flight — it never fakes overall duration, it just gives the person a
// sense of what's happening while they wait for the actual API response.
export function AnalyzingIndicator() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1 < STEPS.length ? i + 1 : i));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-ink-200 bg-white px-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      <div className="space-y-1.5">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className={
              i === stepIndex
                ? "text-sm font-medium text-ink-900"
                : i < stepIndex
                ? "text-sm text-ink-400 line-through"
                : "text-sm text-ink-300"
            }
          >
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}
