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
