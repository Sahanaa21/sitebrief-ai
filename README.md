# SiteBrief AI

**Turn project conversations into project memory.**

A hackathon prototype built for the **ArchScale Guild Intern Technology Hackathon**, Problem Statement **AS-02**: *"Make project communication intelligent, not overwhelming."*

---

## 1. Problem

Architecture and construction (AEC) project teams communicate across many channels — email, WhatsApp, site notes, calls. Important decisions, approvals, tasks, and deadlines get buried inside that communication overload, and there's no reliable, traceable record of *what was decided, by whom, and why it changed*.

## 2. Solution

SiteBrief AI takes unstructured project communication (pasted text or an uploaded `.txt` file) and converts it into structured, actionable, searchable **project memory** using Google Gemini:

- **Summary** of the conversation
- **Decisions** (approved / pending / rejected / changed / unclear)
- **Action items** with assignee, deadline, priority, and status
- **Responsibilities** (people mentioned)
- **Deadlines**
- **Issues** (open / resolved)
- **Changes** (what changed, from what, to what, and why)

It is **not** a chatbot and **not** a generic meeting summarizer — it's a project memory layer with two differentiators:

- **Decision Timeline** — see how a decision evolved over time (e.g. *Tile 312 selected → supplier unavailable → Tile 315 proposed → client approves → contractor confirmation pending*).
- **Source Evidence** — every extracted decision, task, or issue links back to the exact original sentence that caused it. Nothing is presented without a traceable source.

## 3. Key features

| AS-02 requirement | Where it lives |
|---|---|
| Conversation capture | `Communication` page — paste text or upload `.txt` |
| Intelligent summarization | `summary` field, shown on the results view |
| Action extraction | `actionItems[]` |
| Responsibility detection | `people[]` + `assignee` on each action item |
| Deadline detection | `deadlines[]` + `deadline` on each action item |
| Decision & approval extraction | `decisions[]` with status classification |
| Conversation-to-task conversion | Tasks page, with a **Mark Complete** interaction |
| Searchable project memory | Project Memory page — keyword search across all extracted items |
| End-to-end demo | **Try Demo** on the landing page (works with zero API key) |

## 4. Architecture

```
Browser (paste text / upload .txt)
        │
        ▼
POST /api/analyze  (Next.js Route Handler, server-only)
        │
        ▼
Gemini API (gemini-3.8-flash, structured JSON output via responseFormat schema)
        │
        ▼
Zod validation (lib/validation.ts) — rejects anything that doesn't match the schema
        │
        ▼
Client-side id generation + localStorage persistence (lib/storage.ts)
        │
        ▼
Dashboard / Decisions / Tasks / Issues / Project Memory pages render the structured result
```

The Gemini API key **never** reaches the browser — it's read from `process.env.GEMINI_API_KEY` only inside the server-side route handler (`app/api/analyze/route.ts` → `lib/gemini.ts`), and sent to Gemini via the `x-goog-api-key` request header (never as a URL query parameter).

Persistence is intentionally simple for this phase: structured results are stored in the browser's `localStorage` via `lib/storage.ts`. That module exposes the same function surface a future database-backed version would (`getProjects`, `saveCommunication`, etc.), so swapping in Supabase/Postgres later doesn't require rewriting the UI.

### Project structure

```
app/
  page.tsx                        Landing page
  project/new/page.tsx            Create project
  project/[id]/
    layout.tsx                    Project shell (top bar + tab nav)
    page.tsx                      Dashboard / overview
    communication/page.tsx        Paste/upload + inline results
    decisions/page.tsx            Decisions + Decision Timeline
    tasks/page.tsx                Action items + Mark Complete
    issues/page.tsx               Issues
    memory/page.tsx               Project Memory search
  api/analyze/route.ts            Secure server-side Gemini endpoint

components/
  ui/                             Button, Card, Badge, EmptyState
  dashboard/                      StatCard
  communication/                  CommunicationForm, AnalyzingIndicator
  analysis/                       DecisionCard, ActionItemCard, IssueCard,
                                   ChangeCard, SourceEvidence, AnalysisResultView

lib/
  gemini.ts                       Server-only Gemini integration
  validation.ts                   Zod schemas (request + AI output)
  demo-data.ts                    Predefined Demo Mode data (Riverside Residence)
  storage.ts                      localStorage persistence layer
  utils.ts                        ids, dates, stats, memory search

types/index.ts                    Shared domain types
```

## 5. Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Google Gemini API** (`gemini-3.8-flash`, called directly via `fetch` with structured JSON output — no extra SDK dependency)
- **Zod** for validating structured AI output
- No database in this phase (browser `localStorage`); no authentication (out of scope for AS-02)

Deliberately **not** used: microservices, a separate Express server, vector databases / RAG, WhatsApp/Gmail/Slack integrations, paid services of any kind.

## 6. Cost

**₹0.** Everything runs on free tiers:

- Gemini API has a free tier (get a key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
- Hosting target: Vercel free tier
- No database, no paid auth, no premium UI libraries

The app is fully demonstrable with **no API key at all** via Demo Mode.

## 7. Environment variables

Copy `.env.example` to `.env.local` and fill in your key:

```
GEMINI_API_KEY=your-key-here
```

If this is left empty, live analysis (`/api/analyze`) returns a clear "live analysis unavailable" message and points the user to Demo Mode — it does not crash and never exposes the missing key as a stack trace.

## 8. Local setup

```bash
npm install
cp .env.example .env.local     # optional — add your GEMINI_API_KEY, or skip and use Demo Mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note on this build environment:** this project was generated in a sandbox without npm registry access, so `npm install` / `npm run build` could not be executed here to produce a verified lockfile. Dependency versions in `package.json` are pinned to known-compatible releases (Next 14.2.5 / React 18.3.1 / Zod 3.23.8 / Tailwind 3.4.6). Please run `npm install` locally as the first step — if any peer dependency warning appears, it can safely be resolved with `npm install --legacy-peer-deps`.

## 9. How to run the main workflow

1. Go to `/` and either click **Try Demo** (loads the "Riverside Residence" sample project instantly) or **Create Project**.
2. If you created a project, go to its **Communication** tab, paste some project communication (or upload a `.txt` file), and click **Analyze Communication**.
3. Review the results — Summary, Decisions, Action Items, Responsibilities, Deadlines, Issues, Changes — each with a **View source** link to the original excerpt.
4. Visit **Decisions** to see the Decision Timeline, **Tasks** to mark items complete, **Issues** for open/resolved problems, and **Project Memory** to keyword-search everything extracted so far.

## 10. Demo Mode

Demo Mode is available with **zero configuration** — no Gemini key required:

- Clicking **Try Demo** seeds a project called **Riverside Residence** with one pre-analyzed sample communication covering: a client approval, an architect instruction, a contractor task, a supplier issue, a deadline, a decision change (tile 312 → 315), and an unresolved structural issue.
- This data is clearly marked as a **Demo project** badge in the UI — it is never presented as a live Gemini result.
- If you paste your own text into a project without a configured `GEMINI_API_KEY`, the app tells you plainly that live analysis is unavailable and points you to Demo Mode, rather than silently failing or faking a result.

## 11. Manual test checklist

| # | Scenario | Expected result |
|---|---|---|
| 1 | Empty input, click Analyze | Inline error: "Please paste some project communication…" |
| 2 | Very short input (<20 chars) | Inline error asking for more detail |
| 3 | Simple, single decision | One decision extracted with correct status + source |
| 4 | Multiple decisions in one text | All decisions extracted separately |
| 5 | Task with a named assignee | `assignee` populated correctly |
| 6 | Task with no named assignee | `assignee` is `null`, shown as "Unassigned" |
| 7 | Task with a stated deadline | `deadline` populated; also appears in Deadlines section |
| 8 | Pending (not-yet-approved) decision | Status = `pending`, not `approved` |
| 9 | A decision that was later revised | Appears in both Decisions (`changed`) and Changes, and on the Decision Timeline |
| 10 | An unresolved problem mentioned | Appears in Issues with status `open` |
| 11 | Search Project Memory, e.g. "tile" | Matching decisions/tasks/issues/changes returned |
| 12 | `GEMINI_API_KEY` missing/invalid | `/api/analyze` returns a clear, friendly "unavailable" message — never a stack trace |
| 13 | Gemini quota/rate-limit hit | Friendly rate-limit message, suggests Demo Mode |
| 14 | Malformed/unparseable Gemini response | Friendly "unexpected response" message, no crash |
| 15 | Try Demo with no API key configured | Full workflow (dashboard, decisions, tasks, issues, memory) works end-to-end |
| 16 | Mark a task complete, revisit page | Status persists (localStorage) |

## 12. What is implemented (Phase 1)

- Landing page, project creation, project dashboard with live stats
- Paste-text and `.txt` file upload communication input
- Secure server-side `/api/analyze` route calling Gemini, with Zod-validated structured output
- Full results view: Summary, Decisions, Action Items, Responsibilities, Deadlines, Issues, Changes
- Source Evidence on every extracted decision/task/issue/change
- A lightweight Decision Timeline (chronological decisions + changes)
- Task completion toggling
- Keyword-based Project Memory search
- Demo Mode with realistic AEC sample data, working without any API key
- Error handling for empty/short/long input, missing key, API failures, rate limits, malformed responses, and file upload issues
- Responsive layout (desktop-first, usable on tablet)

## 13. Intentionally left for later phases

- Persistent database (Supabase/Postgres) instead of `localStorage`
- Authentication / multi-user projects
- WhatsApp / Gmail / Slack ingestion
- Semantic search / RAG / vector database
- Richer Decision Timeline (automatic thread-detection across unrelated phrasing, not just same-communication grouping)
- OCR / voice transcription
- Notifications, calendar integration, advanced analytics

## 14. Known limitations

- Because persistence is `localStorage`-based, project memory is scoped to one browser and is lost if site data is cleared.
- File upload only supports plain `.txt` files in this phase.
- The Decision Timeline groups decisions/changes chronologically per project rather than using true semantic thread-matching — sufficient for a single-project hackathon demo, but a real deployment would want smarter linking.
- Keyword search is exact-substring matching, not semantic.
- This build could not be `npm install`ed/`npm run build`ed inside the sandbox that generated it (no registry access) — please verify locally per §8 before the demo.

## 15. Deployment (Vercel free tier)

1. Push this project to a GitHub repository.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add an environment variable `GEMINI_API_KEY` in the Vercel project settings (optional — Demo Mode works without it).
4. Deploy. No build configuration changes are needed; Vercel auto-detects Next.js.
