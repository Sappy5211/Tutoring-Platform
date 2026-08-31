# ADR-005 — Launch curriculum: CBSE Class 6–8 Maths (overrides ADR lane E's recommendation)

Status: ACCEPTED. Date: 2026-08-31. Decider: operator.

## Context

`research/E_india_ops_and_market.md` and `MASTER_PLAN.md` §2/§11 recommended launching on **CBSE Class
9–10 Mathematics**, reasoning that those grades sit closest to JEE/NEET-adjacent, fee-paying families.
The operator has overridden this: **launch on CBSE Class 6–8 Maths instead, Class 9–10 deferred for now.**

This is the operator's call to make and is not being second-guessed here — but three real consequences
follow from it, and a build should be aware of them rather than silently inherit assumptions written for
a different grade band.

## Consequences

1. **The Exam object doesn't have a centralized date to attach to for this cohort.** CBSE board exams
   are Class 10 and 12 only. Classes 6–8 have periodic exams (unit tests, half-yearly, annual) **set by
   the individual school**, not a national board — so there is no single "CBSE Class 7 exam on 14 March"
   the platform can author and publish the way `Exam` (ADR-002 Amendment 1) currently assumes. **Fix:**
   for grades 6–8, `Exam` rows are **student/parent-created**, not platform-published — the same
   interface, a different origin. Add a "set your own exam date" flow (school test, half-yearly, annual)
   to the student/parent onboarding. No schema change is needed; `Exam` doesn't care who created it.
2. **ADR-004's motivating scenario (a CBSE student concurrently preparing for JEE) is not live at launch.**
   JEE-track "foundation" coaching realistically starts around Class 9–11; it is a stretch for Class 6–8.
   ADR-004 remains architecturally correct and stays adopted — the cost of having `curriculumScope` and
   `CurriculumContext` now is near zero and the cost of retrofitting them later is not — but its urgency
   moves to whenever Class 9–10 is added, not this launch.
3. **This is arguably a better positioning move, not a compromise** — worth stating plainly rather than
   treating the override as a downgrade. Class 9–10/JEE-prep is the most crowded segment in the corpus
   (Physics Wallah, Vedantu, Allen, Unacademy all live there). Class 6–8 is comparatively open, fits
   Math Academy's own proof point ("went from 6th-grade math to calculus," `corpus/mathacademy.md`) of
   building genuine foundational mastery before exam-pressure years, and — usefully for the platform's
   hardest technical problem — younger-grade maths (fractions, ratios, early algebra) has *more* format
   variance in correct answers (`3/4` vs `0.75` vs `6/8`, mixed numbers vs improper fractions) than
   quadratics does, making it a good, not a lesser, testbed for the answer-equivalence grading ladder.

## Changes made across the plan as a result
- `MASTER_PLAN.md` §2, §11, §14 — launch curriculum updated to CBSE Class 6–8 Maths.
- `decisions/ADR-002-canonical-data-model.md` — `CurriculumPlacement.gradeLevel` comment corrected from
  a hard `8–12` range (which excluded 6 and 7 — a real bug this override surfaced) to `6–12`.
- Skill-graph seeding packet (see `MASTER_PLAN.md` §14 Phase 0) retargeted to CBSE Class 6–8.

## Open question
Does "Class 6–8" mean seed and launch all three grades simultaneously, or start with one (e.g. Class 7)
and expand? Recommendation: seed the full 6–8 taxonomy in one pass (it's a data-loading task, cheap to do
once — see ADR raised by the red-team on sequencing), but the operator may choose to author and publish
notes for one grade first. Confirm before `P0.6`.
