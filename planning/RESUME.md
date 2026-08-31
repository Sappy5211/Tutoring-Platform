# RESUME — EdTech Platform (codename VIDYA) — PLANNING MISSION

**READ THIS FIRST after any restart. Trust disk over any report, including this one.**
Started 2026-08-31. Current mode: **Milestone 1 UI implemented and pushed; architecture review next.**
The original planning mission is complete. The repository now contains a high-fidelity implementation on
schema-shaped mocks; production backends remain deferred.

Vault path: `~/Library/Mobile Documents/com~apple~CloudDocs/1 Claude Code/Projects/EdTech Platform/`

---
## 1. What the operator asked for (verbatim intent, normalised)

India-built online learning platform. Maths first, then Physics/Chemistry/Biology. Five pillars:
1. Notion/RemNote-style **notes** (operator supplies material) with **PDF export**
2. **Interactive adaptive testing**
3. **AI answer-checking** that accepts mathematically equivalent answers in a different format
4. **AI tutor chat** grounded in the platform's own notes — DeepSeek API (decided, not yet wired)
5. **30-minute Zoom booking with a real teacher**
Plus: flashcards + spaced repetition, formulas/LaTeX, AI-assisted note generation, a knowledge/brain
graph, and (added mid-mission) **Wispr Flow-style voice dictation**.
Reuse-with-scepticism: the old CarbonAnswer chat UI is explicitly "outdated — reference, not the goal."
Reference products named by the operator: RemNote, Notion, Novel (steven-tey), Dr Frost Maths.

---
## 2. Where everything is

| Path | What |
|---|---|
| `00_MISSION_BRIEF.md` | Shared context every agent reads. **Do not edit.** |
| `corpus/` | 38+ firecrawl scrapes of competitors/references. Check `_harvest*.log`. |
| `corpus/remnote-ui-screenshots.md` | **PRIMARY evidence** — operator's real signed-in RemNote 1.28 UI |
| `corpus/_dead/` | **Quarantined 404s / error pages. NOT evidence.** See `_DEAD_FILES_README.md` |
| `research/` | One file per lane, each owned by exactly one agent |
| `packets/` | Re-dispatch packets — re-fire any lane whose output is missing/truncated |
| `decisions/` | ADRs 001-007, all **ACCEPTED**. |
| `AUDIT_TRAIL.md` | Append-only history of what happened and why. Paired with this file. |
| `MASTER_PLAN.md` | **THE DELIVERABLE — WRITTEN.** Read this + ADR-002 to build. |

---
## 3. Lane status  ← UPDATE THIS AT EVERY BOUNDARY

| Lane | Output file | Status |
|---|---|---|
| A | `research/A_ui_teardown_and_design_language.md` | **DONE** (survived limit-kill; verified complete on disk) |
| B | `research/B_editor_and_knowledge_system.md` | **DONE** (survived limit-kill; verified complete on disk) |
| C | `research/C_adaptive_engine.md` | **DONE, reviewed, accepted** |
| D | `research/D_ai_grading_and_tutor.md` | **DONE** (ran SymPy + cost scripts in-session) |
| E | `research/E_india_ops_and_market.md` | **DONE** (ran margin + infra scripts in-session) |
| F | `research/F_content_pipeline.md` | **DONE_WITH_CONCERNS** — read its concerns first |
| G | `research/G_reusable_assets.md` | **DONE** |
| H | `research/H_voice_and_dictation.md` | **DONE** (survived limit-kill; verified complete on disk) |

A lane is finished only if its file ends with "open questions" and "could not verify" sections.
If missing or truncated → re-dispatch from `packets/<lane>.md`, Agent tool, general-purpose, sonnet,
background. Lanes are independent; re-fire only what is missing.

---
## 4. Decision digest — what the finished lanes concluded
Compressed so a cold session need not re-read ~3,000 lines. Verify against the lane file before relying
on any of it for a build decision.

**C — adaptive engine.** FSRS via `ts-fsrs` (MIT) for spaced repetition. Mastery = Bayesian Knowledge
Tracing seeded with literature priors + Elo-style ability/difficulty rating. Deep knowledge tracing
(DKT/SAKT) REJECTED at launch on data-volume grounds. Question selection = prerequisite-graph frontier
walk + difficulty targeting at the ~85% success zone (Math Academy's FIRe approach; Wilson et al. 2019,
with a stated caveat that the 85% result was not demonstrated on K-12 item selection). **RL/bandits: not
at launch** — but log `selectionPropensity` and `policyVersion` on every serve from day one so a bandit
can be evaluated off-policy later without a rewrite. Two edge types in the skill graph: `prerequisite`
and `encompasses`.

**D — grading + tutor.** Grading ladder, cheapest first: exact/normalised match → numeric tolerance →
**SymPy symbolic equivalence with a hard timeout guard** → LLM rubric grading. Verified in-session with
SymPy 1.14.0 that `2(x+3)==2x+6`, `1/2==0.5`, `sin²x+cos²x==1` resolve correctly, a wrong case is
rejected, and a known SymPy hang case is caught by the 2.0s timeout. DeepSeek cost ≈ **$0.11 (~₹10.6)
per student per month** across tutor + grading + note generation. Non-obvious finding: DeepSeek's peak
pricing window maps to 06:30–09:30 and 11:30–15:30 IST, so Indian after-school study hours are already
off-peak. Mathpix for maths OCR. Eedi/NeurIPS Diagnostic Questions dataset as the misconception taxonomy
seed. DeepSeek pricing changed 2026-08-16 — re-verify if building more than a few weeks out.

**E — India.** Recommends **₹599 single / ₹1,999 bundle** — the first attempt (₹499/₹1,599) yielded only
7.1% bundle margin, shown explicitly in §2.3; the revised numbers give 28–37%. Full curriculum taxonomy
Board→Grade→Subject→Chapter→Topic→Skill with real CBSE Class 10 Maths values. Booking lifecycle state
machine + double-booking concurrency approach. DPDP obligations mapped to concrete product requirements.
**The DeepSeek/China-hosting question is deliberately left as options + recommendation for the operator,
not decided.** Infinity Learn pricing could not be found. Several points flagged for an Indian lawyer/CA.

**F — content pipeline** (DONE_WITH_CONCERNS — read those first). Canonical format = **TipTap/ProseMirror
JSON** (not Markdown/MDX, not a custom dialect) because it is the only zero-serialisation-risk option
against the editor. Maths = **KaTeX + the free MIT `@tiptap/extension-mathematics`** (not the paid Pro
package) + `mhchem` for chemistry. PDF = **headless Chromium + Paged.js**; React-PDF rejected (no native
LaTeX/KaTeX). OCR = **`marker`** (Apache-2.0 since a July 2026 relicense, free under $5M revenue) as
default, **Mathpix** ($0.002/image+) reserved for handwriting and low-confidence escalation; Nougat
rejected. **A hard human-approval gate that no AI-drafted block bypasses.** Its concerns: Chromium PDF/UA
tagging unverified; the `::`/cloze inline syntax was written from general knowledge because the RemNote
doc scrapes 404'd (now partly remedied — see `corpus/rn-*.md`); forensic watermarking left as an open
question, visible per-user stamping via `pdf-lib` is the v1 recommendation.

**G — reusable assets.** The CarbonAnswer chat UI is **REFERENCE-ONLY**: its backend is explicitly
extractive/non-generative and there is **no streaming anywhere in the feature**. The **command palette
is the standout — LIFT near-verbatim** (full ARIA combobox, hand-rolled fuzzy matcher, zero deps), and
the `notion-style-productivity-app` skill already generalises it. The **brain graph LIFT** the mechanism,
preferring the `obsidian-graph-view` skill's generalised copy; its mid-tier-Android performance at a few
hundred nodes is **unverified — needs a spike, do not assume**. Design tokens are **dark-mode-only by
explicit written decision — a real light-theme gap** for a daylight study app. `npx tsc --noEmit` and
`npx oxlint` both observed clean. Zero prior art in-house for: quiz/exam player, math-equivalence
checking UI, spaced repetition, KaTeX, teacher booking/scheduling/payment, adaptive-mastery UI, light
mode, PDF export, India payment/consent/curriculum.

**Coordinator, ADR-001.** Position = *the curriculum-bound practice system that escalates to a real
teacher*. "AI tutor + adaptive practice + flashcards" is table stakes in 2026 (Brilliant leads with an AI
tutor persona; Math Academy sells adaptive diagnostics at $49/mo; RemNote sells the whole bundle). The two
gaps nobody fills are **curriculum binding** and **a human on demand**. So the teacher call is the moat
and is currently listed fifth. The AI tutor's job is triage that protects teacher-call margin, and
answer-checking correctness is existential, not a feature.

---
## 5. Next steps, in order
1. ~~All 8 lanes complete, verified on disk.~~ DONE
2. ~~Read research files.~~ DONE
3. ~~Reconcile the data model.~~ DONE -> `decisions/ADR-002-canonical-data-model.md`. Seven collisions
   found, five were outright contradictions (worst: Board and ExamTrack were conflated, so a CBSE student
   preparing for JEE could not be represented at all).
4. ~~Write MASTER_PLAN.md~~ DONE — includes the Phase 0-6 build packet decomposition (§14).
5. ~~Red-team pass~~ **DONE** -> `research/RED_TEAM_REVIEW.md`, 15 findings, verdict "not safe as-is".
   Verdict was correct. **All 5 structural findings fixed** — see `AUDIT_TRAIL.md` for the full record.
6. ~~Build the Milestone 1 UI~~ **DONE** -> commit `16a2053`; see Session 6 in `AUDIT_TRAIL.md`.
7. **CURRENT STATE: Claude architecture/design review, then backend sequencing.** Immediate work:
   - Review the UI commit against ADRs 001–007 and decide which generic `SurfacePage` routes require
     bespoke interaction depth before declaring Milestone 1 product-complete.
   - Complete the Drizzle/PostgreSQL schema and repository adapters before replacing fixtures.
   - Audit real `AttemptEvent` construction before connecting grading, BKT/Elo or FSRS.
   - Revisit the knowledge-graph mid-tier-Android spike; the 200 KB initial bundle assumption is now
     verified for this draft at 126.2 KB gzip, but graph performance remains unverified.
   - Resolve operator decisions still needed for production: name, DeepSeek/DPDP posture, teacher supply,
     B2B depth and validated pricing.

### Gap log (all closed unless marked OPEN)
- ~~Card-type mix policy~~ **CLOSED** -> `decisions/ADR-003-card-type-mix-policy.md`. Adds
  `Flashcard.deck: "mastery" | "exam_rehearsal"` to ADR-002 — the adaptive engine must filter to
  `mastery` when updating `pMastery`.
- ~~ADR-002 omits auth/user, consent, subscription, personal-annotation layer, Misconception~~ **CLOSED**
  -> ADR-002 Amendment 1. Teacher/Booking remain in lane E §5.3 by design (E is authoritative there).
- ~~Board/ExamTrack split never reached the selection algorithm~~ **CLOSED** -> ADR-004.
- **OPEN:** 8 unread `rn-*.md` corpus files (`research/B2_remnote_verified.md` §8).
- ~~200 KB initial bundle feasibility~~ **CLOSED FOR THIS DRAFT** — measured at 126.2 KB gzip with
  MathLive removed per ADR-007 and editor-heavy code split. Keep the CI gate.
- **OPEN:** the ~800-node knowledge-graph ceiling on a mid-tier Android still needs a device spike.

---
## 5b. Collaboration model (set 2026-08-31) — READ BEFORE TOUCHING APP CODE
**Codex is the primary build collaborator and default owner of every file in the application tree.**
Claude's role from this point is design review, flaw-finding, and architecture partnership — not primary
app-code authorship. Claude commits code only on an explicit, scoped hand-over, and always states which
files it touched. See `MASTER_PLAN.md` §15b. Do not silently rewrite Codex's code to match a docs change.

## 5c. Operator decision + Codex's two catches (2026-08-31; curriculum line later superseded)
- **At this point launch curriculum changed to CBSE Class 6–8 Maths**, overriding lane E's Class 9–10
  recommendation. The operator subsequently added Class 5; current scope is Classes 5–8 (see §5e).
  See `decisions/ADR-005-launch-curriculum-override.md` for the consequences (Exam object has no
  centralized date for this cohort — student/parent-created goals instead; ADR-004's concurrent-JEE
  scenario deferred not dropped) and why this may be a *better* launch choice, not just a different one.
- Codex caught two real contract inconsistencies in `MASTER_PLAN.md`, both fixed:
  1. §5 said `AttemptEvent` "ships with the frontend in Phase 1" while §14 scheduled emission at `P2.5`.
     Fixed by correcting the §5 prose (Phase 1 has nothing to attempt yet) and folding emission into
     `P2.4`'s and `P3.5`'s own acceptance criteria, so it can no longer be a separate, skippable packet.
  2. The red-team review (finding #8) explicitly said skill-graph seeding belongs in **Phase 0** (pure
     data-loading against `P0.2`'s tables, no engine code needed first); the master plan had instead
     placed it at `P1.0`, one phase later than recommended, for no real reason. Fixed: now `P0.6`.
- All four prior ADRs (001–004) flipped from PROPOSED to **ACCEPTED**. ADR-005 (the curriculum override)
  written and accepted the same session.

## 5d. Build kickoff (2026-08-31) — Codex is building Milestone 1
- **`CODEX_BUILD_BRIEF.md`** written — Milestone 1 = high-fidelity frontend on mock data shaped by REAL
  ADR-002 types, over a non-throwaway foundation (tokens, component kit, generated types, CI budget gate).
  Packets `P0.1`, `P0.1b` (bundle spike), `P0.2`, `P0.3`, `P0.4`, `P0.5`, `P0.6`, then **§3b: the FULL
  UI** — every student, teacher and author surface in five tranches (A shell+study spine, B learning loop,
  C tutor/graph/progress, D account/commerce/booking, E teacher+author consoles). Scope widened on
  operator instruction: build the UI for everything, the logic for nothing (grading, selection, tutor,
  payments all behind mocked service interfaces whose SHAPES match the real contracts).
- **`decisions/ADR-006-practice-interaction-model.md`** — the operator's Q&A model (multiple attempts,
  progressive hints, worked solution always shown). **The load-bearing part is that mastery is scored on
  the FIRST attempt only** (`masteryEvidence: positive|negative|excluded`, written not derived) — otherwise
  "correct after two hints" inflates `pMastery` and the frontier selector promotes students past
  prerequisites they never learned. Also: Assessment/diagnostic modes get 1 attempt, no hints, solutions
  withheld; MCQ gets 2 attempts not 3 (elimination); anti-gaming excludes rather than punishes.
- `corpus/drfrost-practice-ui-screenshots.md` — PRIMARY evidence, operator-supplied screenshots of a live
  Dr Frost practice session (question navigator, skill code exposed, MathLive-style keyboard with
  Main/ABC/Funcs/Symbs layers, annotated worked steps, per-question teacher-comment box).
- In flight: `research/P1_practice_player_spec.md` (UI) and `research/P2_hints_and_solutions.md` (content
  model + authoring + cost). **Phase 2 must not start until both land.**
- Answers given to Codex: Codex owns the app tree (see `MASTER_PLAN.md` §15b); repo is canonical, clone
  anywhere; Class 6–8 confirmed; blended milestone; all ADRs ACCEPTED.

## 5e. Implementation handoff (2026-08-31) — read `AUDIT_TRAIL.md` Session 6

- **Launch scope is CBSE Mathematics Classes 5–8.** Class 5 was added after the earlier Class 6–8
  override; the implemented contracts and deterministic fixtures use `5 | 6 | 7 | 8`.
- Codex built and pushed the UI-first monorepo in commit **`16a2053`** on `main`: student, essential
  parent, hybrid teacher and author navigation; interactive study/practice/AI/calendar/booking cores;
  typed mock repositories/services; reusable UI and constrained maths-input packages; CI and tests.
- Verification at handoff: `pnpm check` green, initial JS **126.2 KB gzip / 200 KB**, full Playwright
  suite **21/21**, focused teacher-booking suite **3/3**, no accessibility or horizontal-overflow failures
  at 360/768/1280.
- Fully interactive cores and generic prototype surfaces are distinguished in Session 6. Production
  auth, PostgreSQL repositories, real grading/adaptivity/AI, payments, video, PDF and voice are not wired.
- **Claude's immediate job:** review commit `16a2053` against ADRs 001–007, paying special attention to
  `SurfacePage` breadth, schema/migration completeness, practice telemetry, and preservation of adapter
  boundaries. Do not re-derive the product plan or silently rewrite Codex-owned application files.

## 6. Gotchas already paid for — do not re-learn these
- **Firecrawl: rate limit 35 req/min**, concurrency 2. The CLI's status polling burns the quota, so
  parallel scraping fails en masse (first attempt lost 25 of 35 URLs to 429s). **Run sequentially with
  ~10s gaps and retry on failure** — see `scratchpad/harvest2.sh`.
- **Map a domain before scraping paths on it.** I guessed ten `help.remnote.com` article slugs; all ten
  404'd and were saved as .md files that look exactly like content in a directory listing. Use
  `firecrawl map <domain>` first, and **grep results for 404 shapes before trusting them**.
- **RemNote's workspace needs a login** and no Chrome extension is connected to this session, so the
  logged-in route is unavailable. Do not attempt credentials. The operator supplied screenshots instead.
- macOS zsh here has **no `timeout` command**.
- Agents must not run firecrawl (rate limit) and must not run git.

---
## 7. Open decisions for the operator (blocking nothing yet, but needed before build)
- Product name — VIDYA is a placeholder.
- Launch track: CBSE Class 10 Maths vs JEE foundation (lane E recommends — check its verdict).
- Sending student data to DeepSeek (China-hosted) under DPDP. Options in lanes D and E; operator decides.
- Is the school / tuition-centre B2B channel (Dr Frost-style teacher console) in scope for v1?
  Coordinator recommendation: design the data model to allow it, do not build it until B2C retains.
