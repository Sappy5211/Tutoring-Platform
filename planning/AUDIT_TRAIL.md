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
