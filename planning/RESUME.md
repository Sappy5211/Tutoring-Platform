# RESUME — EdTech Platform (codename VIDYA) — PLANNING MISSION

**READ THIS FIRST after any restart. Trust disk over any report, including this one.**
Started 2026-08-31. Mode: PLANNING ONLY — no production code. The build happens later with a cheaper
coding agent, so the plan must be implementation-grade (named libraries, versions, schemas, exact
acceptance criteria).

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
| `decisions/` | ADRs. `ADR-001-product-thesis.md` written. |
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
6. **CURRENT STATE: plan is revised and coherent.** Remaining before build:
   - Operator must answer the 6 decisions in `MASTER_PLAN.md` §16 (name, launch track, DeepSeek/DPDP,
     B2B channel, teacher supply, pricing confirmation).
   - Run `P0.1b` bundle-budget spike and the knowledge-graph mid-tier-Android spike — both are
     **unverified assumptions** the architecture rests on.
   - Mine the 8 unread `corpus/rn-*.md` files (see `research/B2_remnote_verified.md` §8) — cheapest
     remaining source of product detail.
   - Red-team findings #10-#15 are containable but unactioned in detail; re-read them before Phase 5.

### Gap log (all closed unless marked OPEN)
- ~~Card-type mix policy~~ **CLOSED** -> `decisions/ADR-003-card-type-mix-policy.md`. Adds
  `Flashcard.deck: "mastery" | "exam_rehearsal"` to ADR-002 — the adaptive engine must filter to
  `mastery` when updating `pMastery`.
- ~~ADR-002 omits auth/user, consent, subscription, personal-annotation layer, Misconception~~ **CLOSED**
  -> ADR-002 Amendment 1. Teacher/Booking remain in lane E §5.3 by design (E is authoritative there).
- ~~Board/ExamTrack split never reached the selection algorithm~~ **CLOSED** -> ADR-004.
- **OPEN:** 8 unread `rn-*.md` corpus files (`research/B2_remnote_verified.md` §8).
- **OPEN:** two unverified assumptions the architecture rests on — the 200KB bundle budget against the
  mandatory dependency stack (TipTap+KaTeX+MathLive+motion), and the ~800-node knowledge-graph ceiling on
  a mid-tier Android. Both need a spike, neither has one yet.

---
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
