"use client";

import type { Communication, Project } from "@/types";

// Simple local persistence for Phase 1, as scoped in the brief: no database
// is wired up yet, so everything lives in the browser's localStorage. The
// shape here (getProjects/saveProject/getCommunications/...) is intentionally
// the same surface a future lib/db.ts (Supabase/Postgres) would expose, so
// swapping the backend later doesn't require rewriting the UI.

const PROJECTS_KEY = "sitebrief:projects";
const COMMUNICATIONS_KEY = "sitebrief:communications";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private browsing) — fail silently;
    // the app remains usable for the current session.
  }
}

export function getProjects(): Project[] {
  return readJson<Project[]>(PROJECTS_KEY, []);
}

export function getProject(id: string): Project | null {
  return getProjects().find((p) => p.id === id) ?? null;
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.unshift(project);
  }
  writeJson(PROJECTS_KEY, projects);
}

export function deleteProject(id: string): void {
  writeJson(
    PROJECTS_KEY,
    getProjects().filter((p) => p.id !== id)
  );
  const allComms = readJson<Communication[]>(COMMUNICATIONS_KEY, []);
  writeJson(
    COMMUNICATIONS_KEY,
    allComms.filter((c) => c.projectId !== id)
  );
}

export function getAllCommunications(): Communication[] {
  return readJson<Communication[]>(COMMUNICATIONS_KEY, []);
}

export function getCommunications(projectId: string): Communication[] {
  return getAllCommunications()
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCommunication(id: string): Communication | null {
  return getAllCommunications().find((c) => c.id === id) ?? null;
}

export function saveCommunication(communication: Communication): void {
  const all = getAllCommunications();
  const existingIndex = all.findIndex((c) => c.id === communication.id);
  if (existingIndex >= 0) {
    all[existingIndex] = communication;
  } else {
    all.unshift(communication);
  }
  writeJson(COMMUNICATIONS_KEY, all);
}

export function updateActionItemStatus(
  communicationId: string,
  actionItemId: string,
  status: "pending" | "completed"
): void {
  const comm = getCommunication(communicationId);
  if (!comm) return;
  comm.analysis.actionItems = comm.analysis.actionItems.map((item) =>
    item.id === actionItemId ? { ...item, status } : item
  );
  saveCommunication(comm);
}

export function clearAllData(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PROJECTS_KEY);
  window.localStorage.removeItem(COMMUNICATIONS_KEY);
}
