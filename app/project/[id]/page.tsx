"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCommunications, getProject } from "@/lib/storage";
import { computeProjectStats, formatDate } from "@/lib/utils";
import type { Communication, Project } from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);

  useEffect(() => {
    setProject(getProject(projectId));
    setCommunications(getCommunications(projectId));
  }, [projectId]);

  if (!project) return null;

  const stats = computeProjectStats(communications);
  const recentDecisions = communications.flatMap((c) => c.analysis.decisions).slice(0, 5);
  const recentActionItems = communications.flatMap((c) => c.analysis.actionItems).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-950">{project.name}</h1>
          {project.description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{project.description}</p>}
          <p className="mt-1 text-xs text-ink-400">Created {formatDate(project.createdAt)}</p>
        </div>
        <Link href={`/project/${projectId}/communication`}>
          <Button>Add Communication</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Conversations" value={stats.conversations} />
        <StatCard label="Decisions" value={stats.decisions} />
        <StatCard label="Action Items" value={stats.actionItems} />
        <StatCard label="Pending Issues" value={stats.pendingIssues} />
      </div>

      {communications.length === 0 ? (
        <EmptyState
          title="No communication analyzed yet"
          description="Paste an email thread, chat log, or meeting note to see SiteBrief AI extract decisions, tasks, and issues."
          action={
            <Link href={`/project/${projectId}/communication`}>
              <Button>Analyze your first communication</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Recent decisions" action={<Link href={`/project/${projectId}/decisions`} className="text-xs font-medium text-brand-700 hover:underline">View all</Link>} />
            <CardBody className="space-y-3">
              {recentDecisions.length === 0 ? (
                <p className="text-sm text-ink-500">No decisions extracted yet.</p>
              ) : (
                recentDecisions.map((d) => (
                  <div key={d.id} className="flex items-start justify-between gap-3 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{d.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500 line-clamp-1">{d.description}</p>
                    </div>
                    <Badge tone={d.status}>{d.status}</Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent action items" action={<Link href={`/project/${projectId}/tasks`} className="text-xs font-medium text-brand-700 hover:underline">View all</Link>} />
            <CardBody className="space-y-3">
              {recentActionItems.length === 0 ? (
                <p className="text-sm text-ink-500">No action items extracted yet.</p>
              ) : (
                recentActionItems.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{a.task}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {a.assignee ?? "Unassigned"} · {a.deadline ?? "No deadline"}
                      </p>
                    </div>
                    <Badge tone={a.status}>{a.status}</Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Recent activity" description="Communications analyzed for this project, most recent first." />
            <CardBody className="space-y-3">
              {communications.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/project/${projectId}/communication`}
                  className="flex items-center justify-between gap-3 rounded-md border border-ink-100 px-3 py-2.5 text-sm hover:border-ink-300 hover:bg-ink-50"
                >
                  <div>
                    <p className="font-medium text-ink-900">
                      {c.fileName ?? (c.isDemo ? "Sample communication (Demo)" : "Pasted communication")}
                    </p>
                    <p className="text-xs text-ink-500">{formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex gap-1.5 text-xs text-ink-400">
                    <span>{c.analysis.decisions.length} decisions</span>
                    <span>·</span>
                    <span>{c.analysis.actionItems.length} tasks</span>
                    <span>·</span>
                    <span>{c.analysis.issues.length} issues</span>
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
