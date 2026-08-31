# Tutoring-Platform (codename VIDYA)

India-first online learning platform — Mathematics first, then Physics/Chemistry/Biology. Notion/RemNote-style
notes with PDF export, adaptive practice, AI answer-checking that accepts mathematically equivalent answers,
an AI tutor grounded in the platform's own notes, and 30-minute booked calls with a real teacher.

## Start here

**Building? → [`planning/CODEX_BUILD_BRIEF.md`](planning/CODEX_BUILD_BRIEF.md)** — Milestone 1 scope,
packets with acceptance criteria, stack decisions already made, and what not to build yet. Start there.

**[`planning/MASTER_PLAN.md`](planning/MASTER_PLAN.md)** — the build plan: positioning, architecture, every
subsystem, the surface inventory, and a Phase 0–6 task decomposition. Read this first.

Then, in order:
1. **[`planning/decisions/ADR-002-canonical-data-model.md`](planning/decisions/ADR-002-canonical-data-model.md)**
   — the schema contract. Implement from this, not from the individual research files — they contain
   superseded fragments that this ADR reconciles.
2. **[`planning/decisions/ADR-003-card-type-mix-policy.md`](planning/decisions/ADR-003-card-type-mix-policy.md)**
   — flashcard generation quality gate.
3. **[`planning/decisions/ADR-004-curriculum-scoped-selection.md`](planning/decisions/ADR-004-curriculum-scoped-selection.md)**
   — amends ADR-002; how prerequisite order varies by board/exam track.
4. **[`planning/decisions/ADR-005-launch-curriculum-override.md`](planning/decisions/ADR-005-launch-curriculum-override.md)**
   — launch curriculum is **CBSE Class 6–8 Maths**, and what follows from that.
5. **[`planning/decisions/ADR-006-practice-interaction-model.md`](planning/decisions/ADR-006-practice-interaction-model.md)**
   — attempts, hint ladder, always-shown worked solutions, and the first-attempt-only mastery rule.
6. **[`planning/decisions/ADR-001-product-thesis.md`](planning/decisions/ADR-001-product-thesis.md)** —
   why the product is positioned the way it is (context for the priority calls in the plan).

**[`planning/research/RED_TEAM_REVIEW.md`](planning/research/RED_TEAM_REVIEW.md)** — an adversarial review
of the plan before it was finalized. 15 findings; the 5 structural ones are already fixed in the ADRs
above (see each ADR's amendment history). Findings #10–15 are named but not yet fully actioned — read
before touching the teacher marketplace (Phase 5).

## Planning directory layout

```
planning/
  00_MISSION_BRIEF.md   shared context the research was scoped against
  MASTER_PLAN.md         the deliverable — read this first
  RESUME.md              status ledger: what's decided, what's open, what to do next
  AUDIT_TRAIL.md         append-only history of the planning mission, including mistakes made and fixed
  decisions/             ADRs — the actual contracts to implement from
  research/              eight parallel research lanes (UI, editor/knowledge, adaptive engine,
                          AI grading/tutor, India ops/compliance, content pipeline, asset reuse,
                          voice/dictation) + two correction passes (B2, RED_TEAM_REVIEW)
  corpus/                raw scraped reference material the research cites (competitors, RemNote docs,
                          library docs). `corpus/_dead/` is quarantined 404s — not evidence.
  packets/               re-dispatch briefs used to produce the research; useful if a lane needs redoing
```

## Open decisions (operator, not yet made)

See `planning/MASTER_PLAN.md` §16: product name, launch curriculum track, whether student data may go to
DeepSeek's China-hosted API under India's DPDP Act, whether a school/tuition-centre B2B channel is in
scope for v1, teacher supply/payout economics, and final pricing confirmation.

## Two unvalidated assumptions the architecture rests on

Flagged explicitly rather than assumed safe — both need a spike before Phase 1 commits to them:
- The 200KB gzipped bundle budget has not been measured against the mandatory stack (TipTap + KaTeX +
  MathLive + `motion`). `MASTER_PLAN.md` Phase 0, packet `P0.1b`.
- The knowledge-graph node ceiling (~800, `react-force-graph-2d`) on a mid-tier Android device is an
  inference from generic benchmarks, not a measurement against this product's actual per-node rendering.
