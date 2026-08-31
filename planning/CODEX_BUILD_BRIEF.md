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

**The COMPLETE product UI — every screen, student, teacher and author — high-fidelity, navigable, running
on mock data shaped by the real schema types, on a foundation that is not throwaway.**

Not a subset, not a shell. The operator wants to see and react to the whole product before backend work
starts. Build every surface in §3b.

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

**Milestone 1 is complete when:** every screen in §3b exists and is reachable by navigation on a
phone-sized viewport and on desktop; all three personas (student, teacher, author) can be walked
end-to-end; everything renders with real tokens and real component primitives; the CI budget gate passes;
and every piece of data on screen came from a typed repository backed by fixtures — no hard-coded JSX data,
no `any`.

## 2. Stack — already decided, do not re-derive

React 18 · TypeScript · **Vite** · **Tailwind v4** (`@theme` tokens, not a config file) · React Router ·
**Zustand** for client state · `motion` imported via the **`LazyMotion` + `m`** pattern (~4.6KB, not the
~50KB full import) · `lucide-react` icons · **KaTeX** for maths rendering · **a purpose-built constrained maths input, NOT MathLive** (ADR-007 — MathLive is 211KB gzip, more than the entire app budget) ·
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
**Also add a dependency-licence allowlist gate** (MIT / ISC / BSD / Apache-2.0; fail on anything else).
Rationale in ADR-009: agents install packages, and a single AGPL dependency would legally oblige us to
open-source the whole platform. Cheap now, very expensive after a release.

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

### `P0.7` — The constrained maths input  *(ADR-007; on the critical path for Tranche B)*
Do **not** use MathLive. It measures 211KB gzipped — more than the whole app's 200KB budget — and it was
chosen back when the launch curriculum was Class 9–10. Class 6–8 needs integers, decimals, fractions,
mixed numbers, ratios, percentages, simple linear expressions, small powers, roots of perfect squares,
units and a few geometry symbols. That is a small grammar.
**Write the LaTeX-subset grammar down first**, with a parser/validator — it is the contract between the
input, the grading ladder and the answer key. Then build the component: numeric pad, fraction template
with placeholder navigation, sign toggle, variable keys, layered like Dr Frost (Main/ABC/Funcs/Symbs).
Keyboard layouts are already specified in `research/P1_practice_player_spec.md` and are reusable as-is.
Live preview renders through KaTeX, which is loaded anyway.
*Accept:* grammar documented and versioned; every key labelled and keyboard-operable; component ≤25KB
gzip; round-trips its own output; OS keyboard suppressed on mobile without trapping focus.
*Escape hatch:* if this proves worse than MathLive in real use, MathLive loads lazily behind the same
interface — but revisit ADR-007 rather than expanding the grammar to rescue it.

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

## 3b. The full UI build — every surface

Source of truth for the inventory: `research/A_ui_teardown_and_design_language.md` §6 (screen table with
job, primary action, key components, priority). Build in tranches; tranches are ordered by dependency,
screens inside a tranche are parallel.

**Nav model (applies throughout):** mobile = **bottom tab bar, 5 items, Practice emphasised as the centre
item**; desktop = **persistent left icon+label sidebar**. Cmd+K palette available on every authenticated
screen.

### Tranche A — shell and the study spine  *(depends on P0.3, P0.4, P0.6)*
- **App shell + navigation** (both nav models, route skeleton, Cmd+K wired)
- **Home / Daily Study Loop** — one clear "what do I do today". Streak, mastery-ring summary, due-cards
  badge, exam-countdown chip, and a *secondary* continue-where-you-left-off strip.
- **Syllabus Library** — chapter → topic with mastery state and counted filter chips.
  **NOT a reverse-chronological document list.** That is RemNote's model, correct for a personal knowledge
  tool and wrong for a student with a syllabus to get through. Recency is demoted to the Home strip.
- **Topic Detail** — the mode tabs (Notes / Practice / Flashcards / Ask AI) + mastery donut.
- **Notes Reader** — rendered blocks, KaTeX maths, worked-example progressive disclosure, highlight
  affordance (the personal layer's UI shell), PDF-export button (stubbed action).

### Tranche B — the learning loop  *(the heart of the product)*
- **Practice Session** — governed by `decisions/ADR-006-practice-interaction-model.md`: multi-attempt,
  progressive hint ladder, worked solution always shown, per-question teacher-comment box.
  UI spec: `research/P1_practice_player_spec.md` — **read its ADR-007 banner first**; the spec stands
  except that `MathAnswerField` wraps our own input, not MathLive.
  Hint/solution content model: `research/P2_hints_and_solutions.md` — **but read ADR-006 Amendment 1
  first**; the hint ladder is **two rungs, not three** (orienting, strategic), and the third rung is
  step-by-step reveal of the worked solution itself.
  **Wait for `research/P1_practice_player_spec.md` before starting this one** (component tree, the full
  state machine incl. grading-in-flight, and the maths keyboard layout). It is in flight and will land
  before you finish Tranche A. If you reach it first, build everything else in this tranche and come back.
- **Assessment / Mock Test** — timed, question-number palette with answered/flagged states, submit
  confirmation. Per ADR-006: **one attempt, no hints, solutions withheld until submission.**
- **Assessment Result / Review** — score donut, mastery-band breakdown, per-question review with the
  solutions now revealed.
- **Flashcard Review** — card flip, Again/Hard/Good/Easy rating row, due-count badge, session summary.
- **Diagnostic Placement** — the first-run calibration. Per ADR-006: **one attempt, no hints, no solutions
  during.** Ends on a "here's where you're starting" result screen.

### Tranche C — help, insight, progress
- **AI Tutor Chat** — streaming message UI (build it; the previous project's chat has no streaming at all
  and is reference-only per lane G), citation chips linking back to note blocks, mode indicator, and the
  **"escalate to a teacher call" action** when the tutor is unconfident. Mock the stream with a timed
  token emitter so the UI is real even though the model isn't wired.
- **Knowledge / Brain Graph** — `react-force-graph-2d`, mastery-coloured nodes, node-focus transition.
  **Mobile fallback is a collapsible curriculum tree, not a shrunk force graph** (lane B). Respect the
  ~800-node ceiling with filtering above it.
- **Progress / Analytics** — mastery trend, streak calendar heatmap, exam countdown.

### Tranche D — account, commerce, booking
- **Sign-up / Login** — phone-OTP shaped, board/grade/exam capture, **and the parent/guardian branch**
  (DPDP requires verifiable parental consent as the first thing in signup — build the flow shape now even
  though verification is stubbed).
- **Book a Teacher Call** — teacher cards with credentials, slot picker, payment sheet (stubbed),
  confirmation with join link.
- **Settings / Profile** — theme toggle, language toggle (English only ships, but the toggle and the
  i18n string layer must exist now), board/grade change, notifications.
- **Plan / Upgrade** — feature-comparison table, INR pricing, free-tier limits made legible.

### Tranche E — teacher and author consoles
- **Teacher Dashboard** — per lane A, lift the Dr Frost pattern close to verbatim: identity card with
  points/rank, one shared mastery donut, quick-action list, activity feed with colour-coded % chips.
- **Class Roster** · **Assign Practice / Set Homework** · **Student Detail** · **Teacher Availability
  Calendar**.
- **Author Console** — TipTap editor shell with the slash menu, block types, MathLive input, the
  draft→review→published state UI, and the review queue showing **deck type-mix against ADR-003's targets
  before approval**.

### Cross-cutting acceptance criteria — every screen, no exceptions
1. Renders at **360px, 768px, 1280px**. No horizontal body scroll at any width.
2. **Both light and dark themes.** No hard-coded colour outside the token file.
3. Every animation degrades correctly under **`prefers-reduced-motion`**.
4. Keyboard navigable; interactive elements labelled; focus visible and managed on route change.
5. All data through typed repositories over fixtures. **No `any`. No hard-coded data in components.**
6. **Empty, loading, and error states for every surface** — not just the happy path. Honest empty states,
   never fake placeholder data that could be mistaken for real.
7. CI budget gate stays green (≤200KB initial JS gzipped). Route-level code splitting is expected —
   the graph, the editor, and the maths keyboard must not be in the main bundle.

## 4. Build the UI for everything; build the LOGIC for nothing

Every screen in §3b gets built. What stays mocked at this milestone:
- **Grading** — the practice player calls a `GradingService` interface that returns canned results.
  No SymPy, no LLM. But the interface shape must match `GradingMethod` (ADR-002) exactly.
- **Adaptive selection** — a `SelectionService` returns a fixed question order. No BKT, no Elo, no FSRS
  scheduling maths. `AttemptEvent` objects are still *constructed and logged to the mock repository* with
  correct `masteryEvidence` values (ADR-006) — get the shape right now, wire the engine later.
- **AI tutor** — mock the token stream. Real UI, fake model.
- **Payments, video, voice, real auth, DPDP verification, PDF generation** — stub the action, build the UI.

Do NOT build: backend services, the real database connection, any AI integration, Razorpay, 100ms, ASR.

**Never add Anki (`ankitects/anki`) as a dependency, in any form — it is AGPL-3.0** and would oblige us to
release VIDYA's source. Its *features* (spaced repetition, cloze, image occlusion, the review queue) are
all in scope and we build them ourselves; its scheduler is available separately as `ts-fsrs` (MIT). See
`decisions/ADR-009-anki-interoperability.md`.

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
