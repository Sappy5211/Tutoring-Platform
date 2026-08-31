# ADR-001 — Product thesis and competitive position

Status: ACCEPTED (2026-08-31). Date: 2026-08-31. Decider: operator.
Evidence: firecrawl corpus of 33 competitor pages, `corpus/` (see `_harvest*.log`).

## Context

The operator described five pillars (notes+PDF, adaptive testing, AI answer-checking, AI tutor,
30-minute teacher calls) but not a competitive position. Without one, the build has no tie-breaker
when two features compete for the same week, and a cheap coding agent will optimise the wrong thing.

## What the corpus actually shows

**The global leaders have converged.** Brilliant now leads its homepage with an AI tutor persona
("Meet Koji, your personal tutor... adapts to exactly where you are") [corpus/brilliant.md].
Math Academy sells an adaptive diagnostic that "creates a custom course... including any missing
foundational knowledge," fully automated, at $49/mo [corpus/mathacademy.md]. RemNote sells notes +
auto-generated flashcards + practice quizzes + mastery tracking + an AI tutor chat, and explicitly
positions as replacing Quizlet, Anki, Notion, GoodNotes, Obsidian at once [corpus/remnote.md].

So "AI tutor + adaptive practice + flashcards" is **table stakes by 2026, not a differentiator.**
Building only that produces a worse-funded clone of Brilliant.

**Two gaps none of them fill:**
1. **Curriculum binding.** Brilliant, Math Academy and RemNote are all curriculum-agnostic. An Indian
   student is not trying to "learn maths" — they are trying to pass CBSE Class 10 boards, or crack
   JEE. Dr Frost Maths shows what curriculum binding looks like done well ("Real Exam Questions...
   from all major UK exam boards", "Curriculum Aligned... map skills to your scheme of work")
   [corpus/drfrostmaths.md] — but it is UK-only.
2. **A human on demand.** No global tool in the corpus puts a real teacher on a call. Indian study
   culture is built on tuition — the human is not a nice-to-have, it is the thing parents already pay
   for. The operator's 30-minute Zoom booking is therefore the strongest pillar competitively, and it
   is currently listed fifth.

## Decision

Position the platform as: **the curriculum-bound practice system that escalates to a real teacher.**

Ordering of the five pillars by competitive value (not by build order):
1. Teacher call — the moat. Nothing global has it; Indian demand is proven.
2. Adaptive practice bound to a named syllabus — the daily habit and the retention engine.
3. AI answer-checking — the credibility gate (see consequence 2 below).
4. AI tutor — table stakes, and the cheap first line of defence that keeps teacher-call margin viable.
5. Notes + PDF — the substrate everything else hangs off, and the parent-visible artefact.

The one-line pitch to test: *"Every question marked instantly, every gap found automatically, and a
real teacher 30 minutes away when the AI isn't enough — for your exact board and syllabus."*

## Consequences

1. **The AI tutor's job is triage, not replacement.** It answers cheaply, and when it fails it must
   hand off to a booking with full context. Tutor and booking are one funnel, not two features.
   This is also the unit-economics mechanism: the AI absorbs the volume that would otherwise
   destroy the margin on human calls.
2. **Answer-checking correctness is existential, not a feature.** An Indian student marked wrong on a
   correct answer will not file a bug — they will leave and tell their WhatsApp group. This makes
   lane D's evaluation harness a launch gate, not a nice-to-have.
3. **Curriculum taxonomy is the first schema written.** Everything (notes, questions, cards, mastery,
   teacher expertise, search) hangs off Board→Grade→Subject→Chapter→Topic→Skill. Getting it wrong is
   the one mistake that forces a rewrite. See lane E.
4. **Deprioritised for v1:** social feeds, live cohort classes, video lecture library, and a global
   leaderboard. These are what Indian incumbents compete on and where a bootstrapped team loses.
5. **Reject the incumbent playbook** of scarcity countdowns, rank-flexing, and aggressive upsell
   interstitials, even though they demonstrably convert in this market. They are incompatible with a
   product whose promise is trustworthy marking, and DPDP's child-protection provisions constrain
   several of them anyway (see lane E).

## Open question for the operator
Is the school / tuition-centre B2B channel (a Dr Frost-style teacher console, sold to institutions)
in scope for v1? It changes the surface inventory materially and is the highest-leverage
unanswered question in this plan. Coordinator's recommendation is to design the data model so it is
possible, but not to build the console until the B2C loop retains.
