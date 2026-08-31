# AUDIT TRAIL — VIDYA EdTech Platform planning mission

Append-only log of what actually happened, so any future session can reconstruct the reasoning without
re-deriving it. Newest section at the bottom. Paired with `RESUME.md` (state) — this file is history.

---
## 2026-08-31 — Session 1

### Setup
- Coordinator loaded `fable-5` skill (standing cognition) + executor `reasoning-protocol.md`.
- Created `Projects/EdTech Platform/` in the iCloud vault per workspace CLAUDE.md save-location rule.
- Wrote `00_MISSION_BRIEF.md` as the single shared context file all agents read by path.

### Reconnaissance (observed, not assumed)
- `~/CarbonAnswer/frontend` — React 18 + Vite + Tailwind v4 + Zustand + `@xyflow/react` +
  `react-force-graph-2d` + recharts. 23 page groups incl. `ask` (RAG chat), `brain` (graph),
  `flows`/`workflow` (canvas), `command-palette`.
- Firecrawl CLI v1.16.2 authenticated, 1,145 credits, **concurrency 2, rate limit 35 req/min**.
- No Chrome extension connected → the operator's logged-in RemNote workspace was unreachable.

### Harvest (4 passes, learned the hard way)
- **Pass 1 (parallel, 2 at a time): 10 OK / 25 FAIL.** Diagnosed from the log: not site blocking —
  HTTP 429 rate limit. The CLI's own status polling consumes the 35 req/min budget, so even
  2-way parallelism overruns it.
- **Pass 2 (sequential, 10s gaps, 3 retries): 23+ OK.** Pacing was the fix.
- **Pass 3** queued behind pass 2 for RemNote docs + editor references.
- **Coordinator error, caught by Lane F, not by me:** I *guessed* ten `help.remnote.com` article slugs
  instead of discovering them. All ten returned "Uh oh. That page doesn't exist." and were saved as
  `.md` files — which look exactly like content in a directory listing. Lane F had already written its
  flashcard-syntax section from general knowledge as a result, and disclosed that rather than passing it
  off as sourced. Remediation: quarantined 13 dead files to `corpus/_dead/` with a README; ran
  `firecrawl map help.remnote.com` to get REAL URLs; **pass 4 added a 404-shape grep before accepting any
  scrape**, and landed 18 genuine RemNote doc pages incl. concept-descriptor (`::`) syntax, the exam
  scheduler, image occlusion, LaTeX, portals, references and shortcuts.
- Final corpus: ~67 live files, 13 quarantined.

### Dispatch — 8 parallel Sonnet lanes, strict single-file ownership, zero overlap
A UI teardown/tokens/motion · B editor + RemNote translation · C adaptive engine · D AI grading + tutor ·
E India ops/compliance/pricing · F content pipeline + PDF · G reuse audit · H voice dictation.
Coordinator retained: architecture, positioning, data-model reconciliation, review, synthesis.
Firecrawl was withheld from all agents (rate limit) — coordinator owned scraping and handed over the
corpus by path.

### Mid-mission scope changes
- Operator supplied **six screenshots of their real signed-in RemNote 1.28 workspace**. Transcribed to
  `corpus/remnote-ui-screenshots.md` (primary evidence, outranks the marketing scrape) and pushed to the
  two UI lanes still running via SendMessage. Key finds: `Exam` is a first-class object inside a folder;
  flashcard type is picked from the editor's bottom toolbar at block level; `Open in Another Pane`;
  counted filter chips; inline Pro/quota badges; due-count badge on the Flashcards nav item.
- Operator asked for **Wispr Flow-style voice dictation** → new lane H dispatched, with the three
  distinct features (dictation / lecture recording / voice-to-tutor) explicitly separated to prevent
  conflation.

### Usage-limit event and salvage
- Session limit terminated lanes A, B and H mid-flight. Each notification's last line read like the agent
  was only just starting to write.
- **Went to disk before believing the failure reports.** All three files existed at 76KB / 53KB / 68KB
  and each ended with its required "Open questions" and "Could not verify" sections. **All three were
  complete** — they were killed while composing their final chat report, after the deliverable landed.
  Nothing was redone. (This is why the packets instructed agents to write to their owned file as they go.)
- Durability work done before the limit hit: `RESUME.md` rewritten as a full cold-start contract with a
  compressed decision digest; `packets/` written so any lane could be re-fired verbatim; project memory
  entry + MEMORY.md pointer added.

### Lane outcomes
| Lane | Status | Headline |
|---|---|---|
| A | DONE | Positioning, full token set incl. mastery scale, motion catalogue, surface inventory |
| B | DONE | Two-layer note model, editor tech decision, RemNote translation table |
| C | DONE, accepted | FSRS + BKT/Elo + prerequisite-graph selection; RL rejected at launch |
| D | DONE | Grading ladder verified live with SymPy; ≈₹10.6/student/month AI cost |
| E | DONE | ₹599/₹1,999 pricing (first attempt gave 7.1% margin, corrected in-file); DPDP mapping |
| F | DONE_WITH_CONCERNS | TipTap JSON canonical, Paged.js PDF, hard human-approval gate |
| G | DONE | Command palette LIFT; chat UI reference-only (no streaming); light-theme gap |
| H | DONE | Indic ASR selection, maths dictation design, `useDictation` spec |

Notable: lanes D, E and H each **ran scripts rather than doing mental arithmetic** — `cas_equiv_test.py`,
`cost_model.py`, `margin_calc.py`, `infra_calc.py`, `asr_cost_model.py`, `contrast_check.py` (lane A) —
all in the session scratchpad.

---
## 2026-08-31 — Session 2 (after usage-limit reset)

### Salvage
Lanes A, B and H had been killed mid-flight by the session limit. **Checked disk before believing the
failure reports** — all three files existed (76KB / 53KB / 68KB) and each ended with its required
"open questions" and "could not verify" sections. All three were COMPLETE; they were killed while
composing their final chat message, after the deliverable had landed. Nothing was redone.
This is why the packets instructed agents to write to their owned file as they go.

### Defect found in my own coordination
Lane A's §0 reported that the mid-mission SendMessage it received was addressed to Lane B.
**I had swapped the two recipients** — Lane A got B's message and vice versa. Lane A handled it
correctly (noted the mismatch, took only what was in its own scope, did not touch B's file, and
independently reached the same syllabus-order conclusion I had). But Lane B never received its four
specific action items.
Verified the consequence rather than assuming it: `grep` showed Lane B cited
`remnote-ui-screenshots.md` **zero times** and the 18 real `rn-*.md` docs **zero times** — those landed
after B had moved on. Its RemNote translation rested on a marketing scrape plus web search, which its
own "could not verify" section admitted.

### Correction pass
Dispatched lane B2 to re-ground RemNote mechanics in primary evidence. **It stalled after 600s with
nothing on disk.** Rather than re-dispatch, pulled the work in-house: the task was bounded, the corpus
was small, and the evidence was needed in the coordinator's own context for synthesis anyway.
Result: `research/B2_remnote_verified.md`. Confirmed the exact card syntax (`::`, `;;`, `{{}}`, `>>`
with direction modifiers) — **F's earlier guess turned out to be correct**, and is now promoted from
assumed to observed. Also found two mechanics nobody anticipated (ancestor context, partial list/set
cards) and one genuinely important finding: RemNote's own docs argue *against* cloze, list and MCQ cards,
which are exactly the three an LLM generates most readily. That is now an open gap in the plan.

### Synthesis
- `decisions/ADR-002-canonical-data-model.md` — reconciled seven collisions across lanes C/E/F/B.
  Five were outright contradictions. The worst: `Board` and `ExamTrack` were conflated in lane C, so a
  CBSE student preparing for JEE was unrepresentable. Also found the same skill↔content relation stored
  twice in opposite directions (guaranteed drift), three incompatible grading enums, and an `irtParams`
  field that contradicted lane C's own decision to reject IRT at launch.
- `MASTER_PLAN.md` — the deliverable, including a Phase 0–6 build decomposition (§14).
- Red-team review dispatched to attack the plan before the operator sees it.

### Cost of the mission so far
9 sub-agent lanes (8 research + 1 red-team), 1 stalled, 3 killed by the limit but complete on disk.
~67 corpus files harvested across 4 firecrawl passes, 13 quarantined as 404s.
6 analysis scripts run by agents rather than mental arithmetic.

### Red-team pass and revision
Dispatched a critic agent to attack `MASTER_PLAN.md` and the ADRs before the operator relied on them.
It returned **15 findings, DONE_WITH_CONCERNS**, and its verdict was "not safe to hand to a cheap coding
agent as-is." That verdict was correct. Five findings were structural:

1. **No lane owned authentication or identity.** Every per-student table in ADR-002 keyed off a
   `studentId` that no document defined. Lanes D and E each explicitly deferred it to "whichever lane owns
   account/auth" — a lane that was never assigned. The build sequence had signup in Phase 6 while Phase 2
   already needed a student to attach rows to. **This was my decomposition error: eight lanes and none of
   them owned identity.**
2. **The Plus subscription — lane E's own stated profit centre — had zero build packets** and no schema.
   The plan would have shipped five phases with no way to charge for anything.
3. **ADR-002 contradicted itself** on `Exam.syllabusSkillIds`: the interface shipped an authored array
   while the same document's open questions said "leaning derived."
4. **The headline fix never reached the code.** Splitting `Board` from `ExamTrack` was correct in the
   schema, but lane C's `selectNextItem` still walked one global curriculum-blind prerequisite graph, with
   curriculum entering only as a soft tie-break. I had conflated skill *identity* (genuinely board-agnostic)
   with teaching *order* (not). The CBSE+JEE case ADR-002 was written to solve was still unresolvable.
5. **The 28–37% teacher-call margin was presented as settled** when lane E called it a ceiling excluding
   CAC/support/no-shows and flagged that it goes **negative** at a ₹350–400 payout. Lane E also said
   plainly that calls are the *differentiator*, not the profit centre — the subscription is. I had
   flattened that.
Plus: the personal-annotation layer was never schematized, `Misconception` was referenced but never
defined, skill-graph seeding was two phases after the content that needed it, content moderation vanished
from the synthesis, and disintermediation and account-sharing had zero coverage across all eight lanes.

**All fixed in this session:**
- `decisions/ADR-004-curriculum-scoped-selection.md` — `SkillEdge.curriculumScope` (null = global default),
  `selectNextItem(studentId, subject, CurriculumContext)`, and a concurrent-exam policy (one primary exam
  owns the daily goal; secondary exams contribute scope, not pacing; automatic hand-over when a date passes).
- ADR-002 **Amendment 1** — added `User`, `Student`, `ParentGuardian`, `ConsentRecord`, `Subscription`,
  `Entitlement`, `PersonalAnnotation`, `Misconception`; resolved the `Exam` contradiction (scope is
  derived from `CurriculumPlacement`, with `includeSkillIds`/`excludeSkillIds` as overrides);
  added `Flashcard.deck` per ADR-003 and `StudentExam.isPrimary` per ADR-004.
- `MASTER_PLAN.md` — new `P0.5` auth/consent skeleton (Phase 0 blocker), `P0.1b` bundle-budget spike,
  `P1.0` skill-graph seeding moved forward from Phase 3, `P1.3b` personal annotation layer, `P3.7`
  subscription and entitlement; margin caveat and the negative-margin sensitivity restored; content
  moderation restored as a Phase 4 requirement; disintermediation, account-sharing, free-tier abuse and
  prompt-injection added to the risk table; the CBSE-vs-state-boards tension actually argued rather than
  merely disclosed; performance budget marked unvalidated against the mandatory dependency stack.

**Lesson for the flywheel:** when decomposing a mission into lanes, explicitly check for the entities that
*every* lane assumes and *no* lane owns — identity, billing, notifications. Parallel lanes each defer the
shared foundation to "someone else's lane," and the gap is invisible until synthesis. A "who owns the
User table?" question at dispatch time would have cost one sentence.

---
## 2026-08-31 — Session 3: handed off to Codex as build collaborator

Operator introduced Codex as the collaborator doing the main implementation; my role going forward is
design review, flaw-finding, and architecture partnership — not primary app-code authorship.

Cloned `https://github.com/Sappy5211/Tutoring-Platform` (pre-existing `main` branch, one empty initial
commit), copied the full planning output (`00_MISSION_BRIEF.md`, `MASTER_PLAN.md`, `RESUME.md`,
`AUDIT_TRAIL.md`, `decisions/`, `research/`, `packets/`, `corpus/`) into `planning/` there, wrote a
top-level `README.md` pointing at `MASTER_PLAN.md` first and the ADRs in dependency order, and pushed to
`main` (commit `bd86ba3`, 108 files). No secrets or unrelated files were in the diff — checked before
pushing.

**Two copies now exist and must be kept in sync**: the iCloud vault (source of truth for the planning
mission itself) and `planning/` in the GitHub repo (what Codex reads). If the plan changes, update the
vault and re-push.

---
## 2026-08-31 — Session 4: Codex catches two real contract bugs; curriculum re-scoped

Operator relayed Codex's catch-up summary and two questions of substance, plus a product decision:
**launch curriculum changes from CBSE Class 9–10 to Class 6–8.**

### Verified, not assumed, before responding
Grepped the actual files rather than trusting memory of what I'd written:
- Confirmed `MASTER_PLAN.md` §5 literally said "`AttemptEvent` ships with the frontend in Phase 1" while
  §14's build sequence scheduled emission as `P2.5` — a real self-contradiction I introduced, not a
  misreading by Codex. Root cause: Phase 1 (content spine) has no practice/flashcard surface at all, so
  there was nothing to attach telemetry to that early — the correct fix is not "move it to Phase 1" but
  "stop treating it as a separate, deferrable packet" — folded into `P2.4` and `P3.5`'s own acceptance
  criteria instead.
- Confirmed the red-team review's finding #8 literally recommended Phase 0 for skill-graph seeding
  ("pull the CBSE Class 9–10 skill-graph... into Phase 0... it doesn't need BKT/Elo/FSRS code to exist
  first, only the ADR-002 tables from P0.2"). My master plan had instead placed it at `P1.0` — one phase
  later than my own red-team review told me to. No good reason for the discrepancy; fixed to `P0.6`.
- Also found, while fixing the curriculum swap, that `ADR-002`'s `CurriculumPlacement.gradeLevel` comment
  hard-coded a `6–12`-excluding `8–12` range — a latent bug the Class 6–8 decision surfaced before it
  could bite a coding agent.

### Changes made
- `decisions/ADR-005-launch-curriculum-override.md` — new. Records the Class 6–8 decision, its two real
  consequences (Exam object needs a student/parent-created path for this cohort since CBSE board exams
  don't exist below Class 10; ADR-004's concurrent-JEE scenario is deferred not dropped), and the honest
  case that this may be a *better* launch choice — a less crowded segment, better fit with Math Academy's
  own "foundational mastery before exam-pressure years" proof point, and a genuinely harder/better testbed
  for the answer-equivalence grading ladder (younger-grade maths has more correct-answer format variance).
- `decisions/ADR-002-canonical-data-model.md` — fixed the grade-range bug, updated the `Exam` example
  comment, status flipped to ACCEPTED.
- `decisions/ADR-001,003,004` — status flipped to ACCEPTED (operator is actively directing implementation
  and has not disputed the architecture; Codex explicitly asked before anchoring further work to them).
- `MASTER_PLAN.md` — curriculum references updated throughout; the `AttemptEvent` and skill-graph-seeding
  fixes described above; new §15b recording the implementation-ownership protocol (Codex owns all app
  files by default; Claude codes only on explicit scoped hand-over, and names the files it touched).

### Answered for Codex (see chat reply)
Implementation ownership (Codex default owner, Claude reviews unless explicitly handed a file) · clone
location (GitHub repo is canonical, clone wherever fits Codex's environment, no need to nest under the
vault) · launch curriculum (Class 6–8, confirmed) · first milestone (blended: real tokens/component-kit/
schema-types now, high-fidelity frontend on schema-shaped mock data next, defer live DB/full auth) · ADR
acceptance (all five now ACCEPTED).

Synced: vault copy updated first, then re-copied into `planning/` in the GitHub repo and pushed, so the
two copies do not drift.

---
## 2026-08-31 — Session 5: practice interaction model + Codex build kickoff

Operator supplied two screenshots of a live **Dr Frost practice session** and specified the Q&A model:
several attempts, a hint after each, and the full worked solution shown at the end regardless of whether
the student got it right. Also instructed: get Codex started building.

### Evidence captured
`corpus/drfrost-practice-ui-screenshots.md` — PRIMARY. The most directly relevant artefact in the whole
corpus for the practice surface. Notable finds: the skill code and a precise micro-skill title are exposed
to the student ("201a Change the subject of a linear formula requiring a single step"); per-skill
remediation ("Watch video") sits on the question itself; the maths keyboard is custom, docked, and layered
(Main/ABC/Funcs/Symbs) with template insertion (`☐/☐`, `√☐`, `a^☐`); the static `x =` sits OUTSIDE the
input so the student supplies only the RHS (removing a whole class of false-negative grading); worked
steps carry a plain-English reason AND a visual annotation of the transformation acting on the equation;
and there is a **per-question "leave a comment for your teacher" box** — a direct, low-friction feed into
the teacher-escalation funnel that is ADR-001's stated moat.

### The non-obvious problem this model creates, and the decision made
`decisions/ADR-006-practice-interaction-model.md`. The UI is the easy half. The real issue is that lane C's
engine updates BKT and Elo from a **binary** correct/incorrect, but under multi-attempt-plus-hints
"correct" stops being one thing: first-attempt-unaided and third-attempt-after-two-hints are opposite
evidence. Written naively, both land as `isCorrect: true`, `pMastery` climbs for students who cannot do the
skill unaided, and the frontier selector confidently serves them harder material — a silent compounding
failure that would look like the engine working until retention data contradicted it.

Resolution: **mastery is scored on the first attempt only.** `masteryEvidence: "positive" | "negative" |
"excluded"`, computed at WRITE time so the rule lives in exactly one place. A hint taken before the first
attempt flips it negative; subsequent attempts are excluded (still logged in full — valuable for analytics
and FSRS, just not for mastery). This follows Cognitive Tutor / ASSISTments knowledge-tracing practice and
means the student can retry and take help freely without lying to the engine.

Also decided: attempts vary by question type (MCQ gets 2, not 3 — with four options, three attempts makes
success by elimination near-certain and the signal worthless); Assessment and diagnostic-placement modes
get one attempt, no hints, solutions withheld (a mock test with instant answers is not a test, and a
contaminated diagnostic mis-calibrates the one measurement the whole adaptive path is built on);
anti-gaming **excludes the signal rather than punishing the child**.

### Dispatched
`P1_practice_player_spec.md` (UI: component tree, state machine incl. grading-in-flight, MathLive keyboard
scoped to Class 6–8 maths not calculus, hint panel UX ethics, motion + reduced-motion) and
`P2_hints_and_solutions.md` (hint taxonomy, solution step schema, AI drafting behind ADR-003's gate,
**templated hints/solutions for parameterised questions** — a solution saying "add 5 to both sides" is
wrong when the parameter made it 7 — and the authoring cost computed by script).

### Codex kickoff
`CODEX_BUILD_BRIEF.md`. Milestone 1 = high-fidelity frontend on mock data **shaped by the real ADR-002
types behind repository interfaces**, over a foundation that is not throwaway. Rationale for the blend:
UI-first was the operator's instruction and has real value, but building against invented data shapes
guarantees a rewrite when the backend lands. `P0.1b` (the bundle spike) is called out as potentially
plan-changing and told to stop-and-report rather than absorb a breach silently.

### Scope widened same session: full UI, not a shell
Operator instructed Codex to build the **complete product UI**, not Milestone 1's four-screen subset.
`CODEX_BUILD_BRIEF.md` §1 and §3b rewritten: every surface from lane A's §6 inventory across all three
personas, in five dependency-ordered tranches, plus cross-cutting acceptance criteria applied to every
screen (three breakpoints, both themes, reduced-motion, keyboard/a11y, typed repositories, empty+loading+
error states, route-level code splitting to protect the 200KB gate).

The §4 "do not build" list was rewritten rather than merely trimmed — it had become actively wrong under
the new scope. New framing: **build the UI for everything, the logic for nothing.** Grading, selection,
the tutor stream, payments, video and ASR are all mocked behind service interfaces **whose shapes match
the real contracts** (`GradingMethod`, `AttemptEvent` with correct `masteryEvidence` per ADR-006), so
wiring the engines later is an implementation swap rather than a component rewrite. `AttemptEvent` objects
are constructed and logged to the mock repository from day one for exactly that reason.

Practice Session is explicitly gated on `research/P1_practice_player_spec.md` landing (still in flight);
Codex is told to build the rest of its tranche and return to it.

### Lane P2 landed; ADR-006 Amendment 1 — a better answer than either document had alone
P2 was dispatched before ADR-006 was written and **correctly grepped for it, found nothing, and said so**
rather than inventing a count. Good executor behaviour; the timing error was mine (same class of mistake
as the swapped SendMessage and the late-landing corpus — dispatching against artefacts that don't exist yet).

Reading P2 against ADR-006 exposed a real inconsistency in MY original text: §1 set 3 attempts
(2 for MCQ) while §2 defined a 3-level ladder offered after each failure — so **level 3 was unreachable
on the ordinary path.** The ladder had a rung nothing could stand on. P2's fix was to raise attempts to 4.

Better answer, from P2's own evidence: **drop level 3 and let the worked solution be the third rung.**
P2 showed that levels 1–2 are generic-to-skill (~600 items, authored once) while level 3 must be
question-specific (~1,800 items) — roughly tripling the authoring surface — and that **human review
bandwidth, not AI spend, is the real constraint** (generation cost is ≈₹170 total, a rounding error).
Level 3 also carried the lane's hardest mechanical gate (H2: proving a hint doesn't leak the answer,
checked numerically across 100 parameter seeds).

Since the worked solution is required per question anyway, is already parameter-templated and
seed-validated, and its first step already IS the concrete next step ("① Add 5 to both sides to isolate
x"), a separate level-3 hint duplicates content we must produce regardless. Dropping it removes ~1,800
authoring+review items, retires gate H2, and closes the bottom-out failure mode (Baker/Corbett/Koedinger:
students who mine hints to bottom-out learn ~2/3 as much) more cleanly than a rule could — there is no
almost-the-answer rung left to mine. Attempt counts unchanged.

P2 marked with a supersession banner rather than edited, so its reasoning stays legible.
Still in flight: `research/P1_practice_player_spec.md`.

### Lane P1 landed and broke a stack decision — ADR-007
P1 measured rather than cited: it fetched MathLive and gzipped it locally, cross-checking against
Bundlephobia. **≈221KB gzip.** The coordinator verified independently from a separate fetch: **211KB**
(different version, same conclusion), with KaTeX at 73KB and MathQuill at 21KB + jQuery.

`MASTER_PLAN.md` §4 sets a hard **200KB gzipped initial-JS** CI gate. **MathLive alone exceeds the entire
application budget**; with KaTeX it is 284KB before React, TipTap, router, or any product code.

**Why it was missed is the more useful finding.** Lane B chose MathLive when the launch curriculum was
Class 9–10, where surds and rearranged algebra make a full WYSIWYG maths editor defensible. **ADR-005 then
moved the launch to Class 6–8 and nobody revisited the input decision.** The requirement shrank by an order
of magnitude; the library did not. General lesson, recorded: **when a scope decision changes, decisions
downstream of the old scope need an explicit re-check — they do not fail loudly, they quietly stay wrong.**

`decisions/ADR-007-maths-input-strategy.md`: build a constrained structured input for Class 6–8 emitting a
small versioned LaTeX subset, rendered by KaTeX (needed anyway). ≈15–25KB of our own code.
Rejected MathQuill (needs jQuery, unmaintained, weaker a11y for a children's product claiming WCAG 2.2 AA).
Rejected "just lazy-load MathLive" — it passes the initial-bundle gate while landing 211KB on the
most-used screen in the product, which is gaming our own metric rather than meeting it; at lane E's own
~1s-per-170KB parse cost on a low-end CPU that is a multi-second penalty on the core loop.
MathLive is deferred, not deleted: it loads lazily behind the same interface when Class 9–10 arrives.

Honest risk recorded in the ADR: input components are deceptively hard, and we are now building one. The
mitigation is the deliberately tiny grammar plus the escape hatch — and the instruction to revisit the ADR
if `P0.7` overruns rather than expanding the grammar to rescue it.

New packet `P0.7`, on the critical path for Tranche B. P1's keyboard layout work is reusable as-is (it was
already scoped to Class 6–8 and the Dr Frost layer pattern). P1 also predates ADR-006, so it is bannered
for the two-rung hint ladder as well.

---
## 2026-08-31 — Session 6: reviewed Codex's Milestone 1; built sign-in + subject switcher

Codex shipped the Milestone 1 prototype (commits `16a2053`, `7afe17f`): pnpm workspace, `@vidya/contracts`
with migrations and generated types, `@vidya/fixtures`, `@vidya/ui`, `@vidya/math-input` (the ADR-007
constrained grammar, 15 passing tests), and an `apps/web` covering student/parent/teacher/author routes.
Styling is Tailwind v4 `@theme` tokens plus hand-written semantic CSS rather than shadcn — a deviation
from the brief, but a defensible one for bundle size and Codex owns implementation. Not challenged.

Operator asked for two things, with reference screenshots: a sign-in page, and a subject dropdown beside
the VIDYA wordmark with plan-based locks. This was an explicit hand-over, so Claude wrote app code —
files named in `decisions/ADR-008-subject-entitlement.md` per `MASTER_PLAN.md` §15b.

### Two problems found before building
1. **Codex had narrowed `Subject` to the literal `"maths"`** on `Skill` and `Chapter`, not ADR-002's
   union. Sensible while only Maths existed; it makes a subject switcher impossible. Widened back.
2. **CBSE Class 6–8 has no Physics, Chemistry or Biology.** At our launch band it is Mathematics and
   Science; Science splits at Class 11. Listing five peers would misrepresent the curriculum and would
   try to sell a Class 7 parent three subjects that do not exist at their child's grade — corrosive for a
   product whose entire promise is being properly curriculum-bound.

### The design that resolves it
Two lock states that look and behave differently: `locked_plan` (lock + "Upgrade", **stays clickable** —
that click is the offer, and disabling it would hide it) and `locked_grade` (lock + "Class 11+", dimmed
and `disabled`, **no upsell** — it is not for sale at this grade). Gating is enforced in the store's
`setSubject`, not only in the dropdown, and the contract marks `Entitlement` server-evaluated so nobody
gates paid content on the client copy.

### Pricing consequence, flagged not decided
Lane E priced one ₹299/month "Plus" tier; per-subject locks imply a different shape. `PlanTier` is a
placeholder. Coordinator leans tiered-bundle over per-subject — at Class 6–8 there are only two real
subjects, so splitting them mostly buys a worse checkout. Operator decides before `P3.7`.

### Verified, not asserted
`pnpm typecheck` clean (one real error found and fixed — the repo runs `noUncheckedIndexedAccess`, so an
array-index fallback needed a non-empty tuple type), `pnpm test` 17/17, `pnpm build` succeeds at
**132 kB gzip** main bundle against the 200 kB gate. Both surfaces rendered in a browser and the dropdown
interacted with: light and dark, the lock states display correctly.

---
## 2026-08-31 — Session 7: Anki — interoperate, don't integrate (ADR-009)

Operator asked to integrate `ankitects/anki`. **Checked the licence before anything else**, which was the
right call: it is **AGPL-3.0** (read `LICENSE` on `main` directly; GitHub reports `NOASSERTION` only
because a few vendored files carry more permissive licences). AGPL §13 means a network-served application
containing that code must offer its complete source to users — which for a commercial platform is
disqualifying, not a trade-off.

Operator followed up that we would only take features and restyle it. That instinct points exactly where
this landed, but one part of the intuition needed correcting: **restyling does not launder code.** The
licence attaches to source, not appearance — a recoloured copy of AGPL code is still AGPL code. What IS
free is the other half: **features and ideas are not copyrightable.** Spaced repetition, cloze, image
occlusion, deck options, the review queue — all in scope, all ours to build.

So: build the features ourselves, take zero code. That is also the better build independently of the
licence, because our cards must carry `skillTags`, feed the prerequisite graph, respect ADR-003's mix
policy and render maths through KaTeX — none of which Anki's desktop-first Rust/Qt internals assume.

The substance survives intact: **FSRS is Anki's own scheduler and is separately available as `ts-fsrs`
under MIT** (v5.4.1, verified on npm). Lane C already chose it; nothing in the plan changes.

Added `.apkg` import/export as genuine interoperability (file format, not program derivation; permissive
tooling exists — `anki-apkg-export` MIT, `anki-apkg-parser` ISC). Real acquisition hook in India where
Anki is widespread in NEET prep, and export matters for trust and DPDP portability.

**The design point that would have been got wrong by default:** imported decks pass neither the human
approval gate nor the card-type mix policy, and carry no `skillTags` — so they must never update
`pMastery`. Mechanically this is the deck split we already have: `Flashcard.deck` gains
`"personal_import"`, scheduled by FSRS like anything else but excluded from mastery estimation, exactly
as `exam_rehearsal` is.

**New standing risk + mitigation:** agents install packages, so a copyleft dependency can arrive without
anyone reading a LICENSE. Added a CI dependency-licence allowlist (MIT/ISC/BSD/Apache-2.0) to `P0.1` and
to the risk table. Cheap now, very expensive to retrofit after a release.

---
## 2026-08-31 — Session 8: Anki mechanics extracted and the flashcard system built

Operator: take Anki's mechanics and add them. Harvested Anki's **behaviour documentation**
(`docs.ankiweb.net` → `corpus/anki-*.md`, 12 pages). **No source code was read, copied or ported** — the
whole basis of ADR-009 is that features are not copyrightable while AGPL source is.

`research/P3_anki_mechanics.md` records the extraction with ADOPT / SIMPLIFY / REJECT per mechanic. The
judgement running through it: **Anki exposes ~40 deck options because its users are adults optimising
20,000-card decks. Our students are 11–14.** Every one of those knobs is a way for a child to make their
own scheduling worse, so almost all are rejected — daily limits are *derived* from the exam-date goal
rather than typed in, retention is fixed at the documented 0.90 default, and the single student-facing
control kept is "how much time do you have today?", which is the only one a child can actually answer.

Three mechanics adopted with a deliberate change:
- **Interval preview on every rating button.** Adopted verbatim and called out as non-optional: it is what
  makes rating honest, because the cost of pressing "Easy" is visible before you press it.
- **Sibling burying** — matters *more* for us than for Anki, because our cards are auto-generated from
  note blocks (ADR-003), so one block easily yields four near-identical questions about one fact.
- **Leeches — action changed.** Anki suspends a leech. On a *required* syllabus that silently deletes the
  content the student is struggling with most. Ours stops normal review, marks the skill, and raises a
  teacher-call prompt with the lapse history attached — a leech is the best-qualified signal we get that a
  human is needed, and ADR-001 says that human is the moat.

Built: `Flashcard`/`CardState`/`ReviewLogEntry`/`QueueCounts` in contracts, a `ts-fsrs` (MIT) scheduler
adapter, and the review surface at `/app/flashcards` with queue counts, reveal, four ratings with live
interval previews, bury, ask-about-this, leech prompt, and KaTeX-rendered answers.

### Two real bugs found by testing, not by reading
1. **Buried new cards stayed in the queue.** The filter short-circuited on `phase === "new"` before
   checking buried state, so sibling burying silently did nothing for new cards — which is *every* card in
   a first session. Caught because the count went 5→4 when the mechanic required 5→3.
2. **An index over a shrinking queue skipped cards.** Rated and buried cards leave the queue, so
   incrementing an index skips whichever card slid into the vacated slot. Removed the index entirely and
   render `queue[0]`. Caught because the count was right and the *next card* was wrong — the kind of
   thing that reads as correct until you check both.

Verified: typecheck clean, 17/17 tests, build **137 kB gzip** (budget 200 kB), and a scripted four-card
session driven in the browser confirming correct queue transitions, sibling burying, and completion.

---
## 2026-08-31 — Session 9: notebook — filing system + RemNote-style outliner + embedded graph

Operator was right that the filing system did not exist: `grep` for folder/subfolder across the app and
contracts returned **zero matches**, `TiptapEditor.tsx` was an 11-line stub and `GraphPage.tsx` a 13-line
one. Verified before building rather than taking the claim or the repo at face value.

Built the notebook at `/app/notebook`:
- **Filing system** — `Folder` (arbitrary nesting, `parentId`) + `NotebookDoc` in contracts, with a
  sidebar tree. Folders carry `owner: "platform" | "student"`, which is lane B's two-layer model made
  concrete: course folders are published and read-only, "My notes" is the student's own and is badged.
- **Outliner with the RemNote card mechanic.** Ending a bullet with `==` (or `->`, `<-`, `<->`) strips the
  trigger, converts the bullet to a card, renders an arrow, and moves the cursor to the answer.
- **AI-drafted answers**: a ghost suggestion appears with a `Tab` hint; accepting marks the card
  `aiDrafted` and surfaces it as "N AI drafts to review" in the header. ADR-003's gate — nothing
  AI-written is silently treated as reviewed — expressed as an interaction rather than a policy document.
- **Three answer layouts**, per the operator's description: `inline` (→ answer on the line),
  `children` (↓ answer is the indented bullets below — a list card), and `block` (a diagram, graph or
  derivation that will not fit on a line).
- **Tabs**: Course notes · My notes · My flashcards · Knowledge map. The map is an embedded compact
  graph rather than only a separate page, because a knowledge map is most useful beside the note it
  describes.

### Engineering note worth recording
The outliner uses **one controlled input per bullet, not `contenteditable`**. Contenteditable is where
rich-text editors go to die — IME composition, caret restoration, selection across nodes, undo. For an
outliner where each row is a single line of text, per-row inputs give correct mobile keyboards, real
`aria-label`s, and free undo, at the cost of not supporting inline rich formatting inside a bullet. That
is the right trade for this shape of content and should be revisited only if inline styling is needed.

### Bug found by the compiler
A local `Math` component shadowed the global `Math` object, breaking `Math.random()` in the same module.
Renamed to `InlineMath`. Trivial, but exactly the class of thing that would have shipped silently if the
typecheck had not been run.

Verified: typecheck clean, 17/17 tests, build **141 kB gzip** (budget 200 kB), and the `==` → arrow →
Tab-accept path driven end-to-end in the browser — card count 4→5, trigger stripped from the question,
answer populated, and the AI-draft flag raised in the header.

---
## 2026-08-31 — Session 10: Notebook index (item 1 of the operator's list)

Operator gave a prioritised list and said to do it one at a time. First item: the Notebook landing body
should follow the RemNote "Documents & Folders" screen — same controls, titled **Notebook**, sidebar
explicitly out of scope.

Built `/app/notebook` as an index; the document editor moved to `/app/notebook/:docId`.
Header with `Upload & learn PDF` + `Create`, a search field, counted facet chips, a sort control, and a
date-grouped list whose rows carry a breadcrumb path and a hover overflow menu.

One deliberate departure: RemNote's sixth chip is "Daily Notes". We have no daily-note concept, so that
slot is **Flashcards** — the thing a student actually wants to filter by. Copying a chip for a feature we
do not have would have been cargo-culting the layout.

`NotebookDoc` gained `kind`, `path`, `tags` and `cardCount` to support the row rendering, and the seed
data now uses dates relative to today so the date grouping never goes stale.

**Bug found by testing:** under the "All" facet, the search filtered documents but not folders, so
searching "angles" narrowed the document list while leaving all six folders on screen — which reads as
broken. Fixed; verified "angles" now returns only the matching document and "geo" returns the Geometry
folder plus its documents.

Verified: typecheck clean, 17/17 tests, build green, facet filtering and search driven in the browser.

### Still queued from the operator's list (not started, deliberately one at a time)
1. Brain graph should move — motion, and "the graph should have a point".
2. Notebook tree collapsibility.
3. Remove the layout `<select>` on card rows; use `--` as the card trigger instead of `==`, to stop
   mirroring RemNote's syntax.
4. Margins / spacing pass against the RemNote reference.

---
## 2026-08-31 — Session 11: folder page, book→chapter→page model, handwritten notes

Operator's model: **folder = book, subfolder = chapter, notes = pages**, created via "Create notes",
which offers either bullet notes or handwritten (stylus) — and the arrow/card feature works in both.

Built `/app/notebook/folder/:folderId`: breadcrumb, folder icon, inline-editable title, and the action
row `Create notes` · `Upload PDF` · `Record` · `+`, where `+` offers a child folder and an **Exam**.
`Folder.kind` is stored (`"book" | "chapter"`) rather than derived from depth, so a book keeps its
identity if it is ever moved — and the `+` menu labels itself from it ("Chapter" inside a book,
"Subfolder" deeper), which expresses the shelf metaphor instead of making the reader infer it.
Illustrated empty state as inline SVG so it themes with the palette and costs no request.

`Create notes` opens a two-way choice — **Bullet notes** or **Handwritten** — and `HandwritingCanvas` is
a real implementation, not a placeholder: pointer events with `pressure` driving stroke width,
`pointerType` distinguishing pen from finger, coalesced-event sampling, DPR-aware sizing, pen/eraser
(`destination-out`), four inks, and undo/redo/clear. `touch-action: none` so a touch drag draws instead
of scrolling the page. The handwritten page carries an **Add card** action, so a card can be attached to
a page whose question is in the student's own handwriting.

### Three bugs, all found by exercising the thing rather than reading it
1. **`getCoalescedEvents()` returns an empty array** for untrusted/dispatched events (and in some
   browsers generally). The move handler looped over that empty array, so **no points were ever recorded
   and nothing drew at all**. Now falls back to the event itself when the coalesced list is empty.
2. **`pointFrom` read `event.currentTarget`**, which is `null` on coalesced events — every intermediate
   sample would have been positioned against a null rect. Now reads the rect from the canvas ref.
3. **Two CSS specificity bugs on the ink swatches.** `.hw__tools button` (0,1,1) out-ranked
   `.hw__swatch` (0,1,0), forcing the backgrounds transparent and the padding to 11px — the four
   swatches rendered as a single blank pill. Fixing that exposed a second one: `.hw__tools
   button.is-active` then repainted the *selected* swatch with `--primary-faint`, so the active ink lost
   its colour. Scoped both, with the reason recorded in the stylesheet.

Verified: typecheck clean, 17/17 tests, build green, and in the browser — folder menus (`+` → Subfolder /
Exam, `Create notes` → Bullet / Handwritten), a drawn stroke measured at 6,166 painted pixels, undo to 0,
redo back, and all four swatches confirmed distinct with only the ring changing on selection.

---
## 2026-08-31 — Session 12: the "crash" was data loss; editor toolbars; example material

Operator reported clicking something and it "crashed and reverted back to original without changes."
**Reproduced it, and it was worse than a crash — it was silent data destruction.**

Switching to the "My notes" tab, typing one character, and switching back took the document from
**9 rows / 4 cards to 1 row / 0 cards.** Root cause: that tab rendered a filtered slice
(`nodes.filter(n => n.parentId === null).slice(0, 1)`) and passed it to `Outliner`, whose every edit maps
over the array it was given and hands the whole thing back via `onChange`. So one keystroke wrote a
one-node subset back as the entire document.

This is the general trap of writing derived state back to its source. Fixed two ways:
1. **"My notes" is now its own document** with its own node array — which is what the two-layer model
   actually says it is, so the bug was a symptom of modelling it wrongly in the first place.
2. **A prominent contract comment on `Outliner`** stating that `nodes` must be the complete list and that
   a different document means a different array, never a filter over this one. The rule needs to be
   written where the next person will hit it.

Also added, per the operator's reference screenshots:
- **Editor toolbar** with real dropdowns — Flashcard (Single line / Multi line / Concept / Descriptor /
  Multiple choice / Cloze), Heading, Todo, Image, Table, More, Undo. Concept and Descriptor are ours
  rather than copied: they are the card types the mix policy actively wants authors reaching for.
  Multiple choice is present but labelled as exam rehearsal, since it does not score for mastery.
- **Document `⋯` menu** — flashcards in page, change icon, learn with the AI tutor, share, undo,
  find, status, open in another pane, move, print, export, stats, delete.
- **Working undo** with a 24-step history, wired to both the toolbar and the menu.
- **Richer example material**: the course document now has four sections (equivalent fractions, adding,
  simplifying, comparing) across 18 rows and 9 cards, exercising all three answer layouts — inline with
  KaTeX, a down-arrow list answer, and two block answers (diagram and graph).

Verified: typecheck clean, 17/17 tests, build green. In the browser: course notes hold at 18 rows /
9 cards across a My-notes edit and back, the personal edit persists in its own document, and every
dropdown was opened and its contents read.

---
## 2026-08-31 — Session 13: sidebar peek/lock, notebook collapse, brain graph rebuilt

**Sidebar.** The collapse control was `position: absolute; right: -17px` — literally hanging off the
sidebar's edge, which is what the operator meant by "sticking out". Moved into the top bar at the far
left, and implemented the behaviour from their screenshot: collapsed hides the sidebar, hovering the
toggle or the left edge **peeks it out as an overlay**, leaving hides it again, clicking **locks it
open**, with a tooltip and an ⌥S shortcut. Verified: collapsed → `margin-left: -260px`; peeking → 0
**while the main content's padding stays put**, so hovering never reflows the page.

Two cascade collisions on the way there: `transform` is used by the mobile `.sidebar` rules and `left`
is written by the base rule's `inset` shorthand, so both were overridden. Settled on `margin-left`,
which nothing else touches, with the reason recorded in the stylesheet.

**Notebook file panel** is now collapsible to a rail, with its toggle as the first item in its own
header rather than floating outside the panel.

**Brain graph — and an approach reversal worth recording.** The operator asked for CarbonAnswer's graph
"exactly". Read that implementation (`react-force-graph-2d`: hover 1-hop highlight + dim, click select,
double-click zoom, zoom-threshold labels, force sliders, reduced-motion freeze) and installed the same
package. It **crashed the whole route into the error boundary**: under pnpm's strict layout
`react-force-graph-2d` resolves its own copy of React, giving "Invalid hook call ... more than one copy
of React". Tried `resolve.dedupe`, then an explicit alias (which broke `react/jsx-dev-runtime` because
it aliased the entry file rather than the package directory), then the directory form — still failing.

**Three failed attempts is the signal the approach is wrong, not that a fourth will land.** Removed the
dependency and rebuilt the same *interaction model* on our own SVG simulation: hover lights a node and
its one-hop neighbourhood and dims the rest, click selects for the inspector, double-click zooms, labels
appear past a zoom threshold, five force sliders, freeze, search, band legend, and reduced-motion
settles-then-stops. Same behaviour, no duplicate-React landmine, and a few KB instead of ~130KB against
a 200KB budget.

**The bug behind the "weird blobs".** Throughout the above the graph card showed four giant rounded
shapes. They were never the graph: `elementFromPoint` identified them as `svg.lucide-focus` — the
toolbar's *icon*, rendered 518px tall by a leftover `.graph-canvas svg { width: 100%; height: 500px }`
rule from the previous stub, which was sizing every SVG in the card. Scoped it. **Chasing the graph
library for three attempts while the actual symptom was a CSS selector is the lesson here: identify what
is on screen before attributing it to the thing you just changed.**

Verified: typecheck clean, 17/17 tests, build 151 kB gzip (budget 200 kB); graph shows 9 nodes with
6 dimmed and 2 edges lit on selection, 5 sliders, 4-band legend, and freeze halting the simulation.
