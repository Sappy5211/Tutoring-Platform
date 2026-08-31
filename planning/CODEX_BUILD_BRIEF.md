# BUILD BRIEF — for Codex. Milestone 1.

**Read this, then start. Everything you need to decide has been decided; where it hasn't, this file says
so explicitly and tells you to ask rather than guess.**

Repo: `https://github.com/Sappy5211/Tutoring-Platform` · plan lives in `planning/`.
Launch curriculum: **CBSE Class 6–8 Mathematics** (ADR-005). Not 9–10. Not calculus.

---
## 0. How we work

- **You own every file in the application tree.** Claude does not commit app code unless a specific task
  is handed over for a session, and will name the files it touched when that happens. One owner per file.
- **Claude owns `planning/`.** If a contract is wrong, say so and Claude fixes the ADR — don't fix it by
  writing divergent code. A code/doc mismatch discovered later is expensive; a five-line message now is not.
- **The contracts, in precedence order:** `MASTER_PLAN.md` → `decisions/ADR-002` (schema) → the other ADRs
  → lane research in `research/`. **Research files contain superseded fragments — never implement from
  them directly.** Where a lane file and an ADR disagree, the ADR wins.
- **Escalate rather than improvise.** If a packet requires a decision this brief doesn't cover, stop and
  ask. Improvised architecture is the one thing that costs more than a delay.

## 1. Milestone 1 — what "done" looks like

**A high-fidelity, navigable frontend running on mock data shaped by the real schema types, on a
foundation that is not throwaway.**

The reasoning: the operator's original instruction was UI-first, and there is real value in seeing and
reacting to the product early. But building a UI against invented data shapes guarantees a rewrite when
the backend lands. So the split is:

| Build for real now | Mock for now | Defer entirely |
|---|---|---|
| Repo scaffold, CI, budgets | Data access layer (in-memory, typed) | Live Postgres instance |
| Design tokens + component kit | Auth session (a fake logged-in student) | Real phone-OTP / DPDP consent flow |
| **TypeScript types generated from the ADR-002 schema** | Seeded skill graph as a static fixture | Adaptive engine, grading ladder, AI |
| Routing + app shell + navigation | | Payments, teacher booking |

Every mock must be typed against the **real** interfaces from ADR-002, behind a repository interface
(`SkillRepository`, `NoteRepository`, …) so swapping in Postgres later is an implementation change, not a
refactor of every component.

**Milestone 1 is complete when:** a person can open the app on a phone-sized viewport, move through the
student shell (home → syllabus library → topic → notes reader) and the author shell, everything renders
with real tokens and real component primitives, the CI budget gate passes, and every piece of data on
screen came from a typed repository backed by fixtures.

## 2. Stack — already decided, do not re-derive

React 18 · TypeScript · **Vite** · **Tailwind v4** (`@theme` tokens, not a config file) · React Router ·
**Zustand** for client state · `motion` imported via the **`LazyMotion` + `m`** pattern (~4.6KB, not the
~50KB full import) · `lucide-react` icons · **KaTeX** for maths rendering, **MathLive** for maths input ·
TipTap v2 for both author editor and reader (reader = same instance, `editable:false`) ·
`@xyflow/react` and `react-force-graph-2d` for canvases · Dexie for offline (later phases).

**Schema/DB:** Postgres. **Drizzle ORM is the recommendation** — TypeScript-native, generates the types
ADR-002 needs, migrations are plain SQL you can read. If you prefer Prisma, that's your call as
implementation owner; say which you chose so the docs match.

**Not decided, and yours to choose:** test runner (Vitest suggested, it's the Vite-native default),
package manager, monorepo vs single app, backend framework for later phases.

## 3. Packets

Order matters where noted. Each packet lists its acceptance criteria — these are checks, not vibes.

### `P0.1` — Scaffold and the budget gate
Vite + React 18 + TS + Tailwind v4. Router with the route skeleton. Base layout shell.
**CI must fail the build** when initial JS exceeds **200KB gzipped** or Lighthouse LCP exceeds **2.5s** on
a mid-tier-Android / Fast-4G profile. Wire this on day one — a budget added later is a budget already blown.
*Accept:* `npm run build` succeeds; a deliberately oversized import makes CI go red; the gate's threshold
is read from one config constant, not scattered.

### `P0.1b` — Bundle-budget spike **(do this before P0.4, it can change the architecture)**
Build a throwaway route importing TipTap + KaTeX + MathLive + `motion` together and **measure the real
gzipped cost.** This budget has never been validated against the mandatory stack and MathLive in
particular is not small.
*Accept:* a written number for each library and the total, committed as `docs/bundle-spike.md`. **If the
total breaches 200KB, stop and report** — the reader may need a lighter render path than a full TipTap
instance, and that is an architecture decision Claude should make with you, not one to absorb silently.

### `P0.2` — Schema and generated types
Implement **ADR-002 including Amendment 1** as migrations + generated TS types: `Skill`,
`CurriculumPlacement`, `Chapter`, `SkillEdge` (with `curriculumScope`, ADR-004), `NoteDocument`, `Block`,
`NoteVersion`, `Question`, `Flashcard` (with `deck`, ADR-003), `StudentSkillState`, `CardState`, `Exam`,
`StudentExam`, `AttemptEvent` (**with the ADR-006 additions**: `maxHintLevelReached`,
`hintBeforeFirstAttempt`, `solutionViewed`, `masteryEvidence`, `exclusionReason`), `User`, `Student`,
`ParentGuardian`, `ConsentRecord`, `Subscription`, `Entitlement`, `PersonalAnnotation`, `Misconception`.
*Accept:* migrations run clean against a local Postgres; generated types compile; **`blockId` immutability
and no-reuse is enforced by a constraint or a documented trigger, not a convention** — the entire personal
annotation layer anchors to it.

### `P0.6` — Seed the Class 6–8 skill graph  *(depends on P0.2)*
`Skill`, `Chapter`, `CurriculumPlacement` and `SkillEdge` rows for **CBSE Class 6–8 Maths**, as a
versioned seed file. Pure data loading — no engine code needed.
Source the chapter/topic structure from the NCERT/CBSE syllabus **structure** (topic names, sequencing —
not copyrightable). **Do not copy NCERT prose, diagrams, or worked examples** (ADR-005 / lane E).
*Accept:* seed loads idempotently; every `Skill` has ≥1 `CurriculumPlacement`; the prerequisite graph has
no cycles (**write the cycle check as a test — a cycle here deadlocks the frontier selector later**);
spot-check ~10 skills against the real syllabus.
*Ask first:* whether to seed all three grades at once or start with one (ADR-005 open question).

### `P0.3` — Design tokens  *(parallel with P0.2)*
From `research/A_ui_teardown_and_design_language.md` §4, as Tailwind v4 `@theme`. Must include the shared
**4-band mastery scale** (used by every progress surface, so it cannot drift) and **a real light theme** —
the house tokens from the previous project are dark-only and this is a daylight study app for children.
*Accept:* contrast ratios **computed by a script** and committed, all ≥ WCAG 2.2 AA; both themes render;
no hard-coded hex outside the token file.

### `P0.4` — Component kit  *(depends on P0.3, P0.1b)*
Primitives: button, input, dialog, tabs, card, chip/filter-chip-with-count, progress ring/bar, toast,
skeleton. Plus **the Cmd+K command palette lifted near-verbatim** from `~/CarbonAnswer/frontend/src/features/command-palette`
— per lane G it's the standout reusable asset (full ARIA combobox, hand-rolled fuzzy matcher, zero deps).
*Accept:* every primitive keyboard-navigable and screen-reader labelled; palette works; both themes.

### `P0.5` — Auth and identity skeleton
Roles, session, a fake-but-typed logged-in student, and the `ConsentRecord` write path shape.
**Not the real OTP or DPDP verification flow** — that's Phase 6 and gates public launch. This exists so
Phase 1 has a real `studentId` to attach rows to.
*Accept:* a session exists, roles gate routes, `Student`/`ParentGuardian`/`ConsentRecord` rows can be
written and read through the repository interface.

### `M1.1` — The student shell on mock data  *(the visible milestone; depends on P0.3, P0.4, P0.6)*
Home / daily loop · **Syllabus Library (chapter → topic, with mastery state — NOT a reverse-chronological
document list; that's RemNote's model and it's wrong for a student with a syllabus)** · Topic detail with
its mode tabs · Notes reader (static rendered blocks for now).
Mobile: **bottom tab bar, 5 items, Practice emphasised centre.** Desktop: persistent left sidebar.
*Accept:* navigable at 360px, 768px, 1280px; all data via typed repositories over fixtures; no `any`;
`prefers-reduced-motion` honoured on every animation.

## 4. Do NOT build yet
Practice player and grading (Phase 2 — and **wait for `research/P1_practice_player_spec.md` and
`research/P2_hints_and_solutions.md`**, in flight now) · adaptive engine · FSRS · AI tutor · payments ·
teacher booking · voice dictation · knowledge graph · real auth.

## 5. Two rules that will not be relaxed later
1. **`AttemptEvent` emission is part of the acceptance criteria of every practice, flashcard, and
   assessment surface — never a separate later packet** (ADR-006, `MASTER_PLAN.md` §5). Not relevant to
   Milestone 1, but do not design a data layer that makes it awkward.
2. **No AI-generated teaching content reaches a student without human approval** (ADR-003). No confidence
   score bypasses this.

## 6. Questions to send back before or during Milestone 1
- Drizzle or Prisma (your call — just tell us).
- Class 6–8 all at once, or one grade first?
- Anything in ADR-002 that doesn't survive contact with a real migration — especially `Block` as JSONB
  versus normalised, and whether the derived `note_blocks` index should be a materialised view.
- **The P0.1b bundle number, as soon as you have it.** It's the one measurement that could change the plan.
