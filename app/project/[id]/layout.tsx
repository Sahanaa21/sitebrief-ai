"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProject } from "@/lib/storage";
import type { Project } from "@/types";
import { cx, projectDisplayInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/communication", label: "Communication" },
  { href: "/decisions", label: "Decisions" },
  { href: "/tasks", label: "Tasks" },
  { href: "/issues", label: "Issues" },
  { href: "/memory", label: "Project Memory" },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    setProject(getProject(projectId));
  }, [projectId, pathname]);

  const basePath = `/project/${projectId}`;

  if (project === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">
        Loading project…
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold text-ink-900">Project not found</h1>
        <p className="max-w-sm text-sm text-ink-500">
          This project doesn&apos;t exist in this browser&apos;s local storage. It may have been
          created on a different device or cleared.
        </p>
        <Link href="/" className="btn-primary mt-2">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-800 text-xs font-bold text-white">
              SB
            </span>
            SiteBrief AI
          </Link>
          <div className="flex items-center gap-3">
            {project.isDemo && <Badge tone="pending">Demo project</Badge>}
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                {projectDisplayInitials(project.name) || "P"}
              </span>
              <div className="text-right">
                <p className="text-sm font-medium leading-tight text-ink-900">{project.name}</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
          {TABS.map((tab) => {
            const href = `${basePath}${tab.href}`;
            const isActive = pathname === href;
            return (
              <Link
                key={tab.label}
                href={href}
                className={cx(
                  "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand-800 text-brand-900"
                    : "border-transparent text-ink-500 hover:text-ink-800"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
