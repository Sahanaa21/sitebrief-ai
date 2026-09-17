"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { saveProject } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import type { Project } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    const project: Project = {
      id: generateId("proj"),
      name: trimmedName,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    saveProject(project);
    router.push(`/project/${project.id}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-800">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-800 text-xs font-bold text-white">
            SB
          </span>
          SiteBrief AI
        </Link>
        <Card>
          <CardBody>
            <h1 className="text-lg font-semibold text-ink-900">Create a project</h1>
            <p className="mt-1 text-sm text-ink-500">
              Set up a project to start capturing its communication and decisions.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="project-name" className="label">
                  Project name
                </label>
                <input
                  id="project-name"
                  className="input"
                  placeholder="Riverside Residence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="project-description" className="label">
                  Description <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <textarea
                  id="project-description"
                  className="input min-h-[90px]"
                  placeholder="A short note about this project…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-rose-700">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                Create Project
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
