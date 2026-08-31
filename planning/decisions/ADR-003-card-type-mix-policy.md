# ADR-003 — Card-type mix policy and the AI generation quality gate

Status: ACCEPTED (2026-08-31).
Closes the gap flagged in `MASTER_PLAN.md` §8 and `research/B2_remnote_verified.md` §2.

## Context

RemNote's own documentation — the product the operator asked us to learn from — argues **against** three
of its own card types [observed, `corpus/rn-creating-flashcards.md`, `corpus/rn-multiline-list-set.md`]:

- **Cloze:** the surrounding sentence makes recall "artificially easy"; it also degrades searchability
  and cross-referencing. Recommended as "a small part of an overall learning strategy."
- **Multi-line / list:** "among the most difficult types of things to remember," because memory works
  through connections, not sequences. The docs cite Michael Nielsen arguing that mathematical proofs
  specifically are learned badly as linear lists — they are "interconnected networks of simple
  observations." **This is a direct warning aimed at exactly our subject.**
- **Multiple choice:** "We don't recommend using multiple-choice cards for general-purpose learning."
  Legitimate for exam rehearsal against a question bank; harmful as the exclusive diet.

The problem: **those three are precisely the card types an LLM generates most readily.** Cloze is
mechanical (delete a span). MCQ is a template (one right answer, three distractors). Lists fall straight
out of any bulleted source text. Concept/Descriptor cards require actually understanding what the atomic
idea is and what property is being asserted about it.

Left unconstrained, our note-to-flashcard generator will therefore produce the deck that is cheapest to
build and worst to learn from — and it will look productive while doing it, because the card count goes
up. Lane F's publish gate checks *correctness* (is the answer right, does the MCQ have exactly one
correct option). It does not check *pedagogical shape*. A deck can pass every existing gate and still be
bad teaching.

## Decision

Three enforcement points, at generation, at publish, and at review.

### 1. Generation-time: the prompt carries an explicit type budget

The note-to-flashcard prompt (lane F §3.4) must state the target mix and the reason, and must emit the
chosen `CardType` per card with a one-line justification. Target mix per topic deck:

| Card type | Target share | Hard cap | Rationale |
|---|---|---|---|
| `concept` / `descriptor` | **≥ 55%** | — | The default. Atomic, searchable, composable with the outline, and the type RemNote's own pedagogy recommends. |
| `basic` | ~25% | — | Fine for procedural prompts ("state the quadratic formula"). |
| `cloze` | ≤ 15% | **20%** | Permitted for definitions and statements where exact wording matters (theorem statements, formal definitions). Never the default. |
| `multiple_choice` | ≤ 5% | **10%** | **Tagged as exam-rehearsal, held in a separate deck from the mastery deck** (see §3 below). |
| `image_occlusion` | opportunistic | — | Geometry now, Science later. Not counted in the mix. |
| `multi_line` (list/set) | ≤ 5% | **10%** | Only where the list genuinely *is* the thing to be learned (e.g. the trigonometric identities to memorise). Never for a proof or a procedure. |

The prompt must include the Nielsen point explicitly: a multi-step derivation is decomposed into
Concept/Descriptor cards for each observation and the connections between them — **not** a list card
reciting the steps.

### 2. Publish-time: a mechanical gate that fails the deck, not the card

Add to lane F §11's checklist, checked per topic deck at publish:

- `G7` — deck composition is inside the caps above. Fails publish with the actual distribution reported.
- `G8` — no `cloze` card whose occluded span is the **only** content-bearing text in the bullet
  (that is a Basic card written badly).
- `G9` — no `multi_line` card on a block tagged as a proof, derivation, or worked example.
- `G10` — every `multiple_choice` card carries `deck: "exam_rehearsal"`, never `deck: "mastery"`.
- `G11` — distractors on an MCQ must each carry a `misconceptionId` (lane D's Eedi-seeded taxonomy) or
  a `sourceTransform` naming the error that generated them. A distractor nobody would plausibly pick
  teaches nothing and inflates the score.

These are cheap deterministic checks. None needs an LLM.

### 3. Two decks, not one

`Flashcard` gains `deck: "mastery" | "exam_rehearsal"`.
- **Mastery deck** drives FSRS scheduling and feeds `StudentSkillState`. Concept/Descriptor-dominant.
- **Exam-rehearsal deck** is MCQ-heavy, surfaced only inside exam-mode practice and mock tests, and is
  **excluded from mastery estimation** — answering an MCQ correctly by elimination is weak evidence of
  mastery and must not move `pMastery`.

This is the cleanest resolution of the tension: MCQ is genuinely useful for Indian board and JEE
rehearsal, where the exam itself is multiple-choice. It just must not be mistaken for evidence of
understanding.

### 4. Human review shows the shape, not just the cards

The author's review queue displays the deck's type distribution against the targets **before** the author
approves, so a skewed deck is visible at a glance rather than discovered later. The reviewer can override
a cap with a recorded reason — the gate is a default, not a straitjacket.

## Consequences

- The generator will produce **fewer** cards per note than an unconstrained one. That is the intended
  trade: card count is a vanity metric, and a smaller Concept/Descriptor deck outperforms a larger cloze
  deck. Do not let a later optimisation pass "improve" throughput by relaxing this.
- Concept/Descriptor generation is the harder LLM task, so this raises per-note generation cost somewhat.
  At lane D's measured ≈₹10.6/student/month total AI spend there is ample headroom.
- `deck` must be added to `Flashcard` in ADR-002.
- The adaptive engine (lane C) must filter to `deck: "mastery"` when updating mastery state.

## Open questions
- Should the caps vary by subject? Biology plausibly justifies more image-occlusion and more list cards
  (taxonomies, organ systems) than Maths does. Revisit when Science is scoped; Maths caps stand.
- Should a student be able to author their own cloze cards freely in the personal layer? Coordinator's
  view: yes, unconstrained — this policy governs *published platform content*, not a student's own notes.
