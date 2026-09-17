"use client";

import { useState } from "react";

export function SourceEvidence({ excerpt }: { excerpt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide source" : "View source"}
      </button>
      {open && (
        <blockquote className="mt-1.5 rounded-md border-l-2 border-brand-300 bg-brand-50 px-3 py-2 text-xs italic text-ink-700">
          &ldquo;{excerpt}&rdquo;
        </blockquote>
      )}
    </div>
  );
}
