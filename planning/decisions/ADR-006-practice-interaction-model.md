# ADR-006 — The practice interaction model: attempts, hints, and always-shown solutions

Status: ACCEPTED. Date: 2026-08-31. Decider: operator (model), coordinator (mechanism).
Governs `research/P1_practice_player_spec.md` (UI) and `research/P2_hints_and_solutions.md` (content).
Amends `decisions/ADR-002-canonical-data-model.md` (`AttemptEvent`).

## Context

The operator specified the core loop: **a student gets several attempts at a question, with a hint offered
after each failure, and the full worked solution is shown at the end — regardless of whether they got it
right — so they can see what the ideal method looks like.**

This is good pedagogy and matches the strongest reference in our corpus: Dr Frost Maths does exactly this
(`corpus/drfrost-practice-ui-screenshots.md`), showing a numbered, reasoned, visually-annotated solution
even on a correct answer.

But it creates one serious architectural problem that is not obvious from the UI, and this ADR exists
mainly to solve it.

## The problem: attempts and hints corrupt the mastery estimate

Lane C's engine (`research/C_adaptive_engine.md`) updates Bayesian Knowledge Tracing and Elo from a
**binary correct/incorrect** signal. But under this interaction model, "correct" is no longer one thing:

- correct on attempt 1 with no hints → strong evidence the student knows the skill
- correct on attempt 3 after two hints → **weak or negative** evidence; the scaffolding did the work

If both are written as `isCorrect: true`, BKT's `pMastery` climbs for students who cannot actually do the
skill unaided, Elo inflates their ability rating, and the frontier-selection policy promotes them past
prerequisites they have not learned. The adaptive engine would then confidently serve harder material to
exactly the students who most need easier material — a silent, compounding failure that would look like
the engine working right up until retention data contradicted it.

This is not a hypothetical modelling nicety. It is the single way this interaction model can break the
product's core promise.

## Decision

### 1. Attempts are per question type, not global

| Question type | Attempts | Why |
|---|---|---|
| `numeric_entry`, `algebraic_expression` | **3** | Open response; guessing is not viable, so retries are genuine second thoughts. |
| `multi_step_working` | **3** | Same, and partial progress is common. |
| `mcq` | **2** | With four options, three attempts makes success by elimination near-certain and the signal worthless. Two is the maximum that preserves any information. |
| `matching`, `ordering`, `graph_interaction` | **2** | Combinatorially guessable; same reasoning as MCQ. |

Configurable per question via an optional `attemptPolicy` override, defaulting to the table above.

### 2. The hint ladder is offered, never forced

Three levels, defined in detail by lane P2 (`research/P2_hints_and_solutions.md`):
1. **Orienting** — what to notice, what kind of problem this is.
2. **Strategic** — which method, or the first move.
3. **Procedural** — the concrete next step, deliberately stopping short of the answer.

Sequencing: a failed attempt *offers* the next hint; it does not auto-open it. A student may also request
a hint before attempting at all. When attempts are exhausted, the solution is revealed.
With 2-attempt question types, only levels 1 and 2 are reachable before reveal.

### 3. The worked solution is always shown — in Practice mode

Shown on correct and on exhausted-incorrect alike. Per the Dr Frost evidence, a step carries a
plain-English **reason** plus an **annotated transformation**, not just restated algebra. Content model
owned by lane P2; rendering by lane P1.

### 4. **Mastery is scored on the first attempt only.** This is the load-bearing rule.

```
firstAttemptCorrect AND noHintBeforeFirstAttempt   -> masteryEvidence = "positive"
firstAttemptIncorrect OR hintTakenBeforeFirstAttempt -> masteryEvidence = "negative"
every subsequent attempt on the same question       -> masteryEvidence = "excluded"
```

Only `positive`/`negative` events update `StudentSkillState.pMastery` (BKT) and `abilityRating` /
`Question.eloDifficulty` (Elo). `excluded` events are still logged in full — they are valuable for
learning analytics, for FSRS ("did they get there eventually"), for session completion, and for future
off-policy analysis — they simply do not move the mastery estimate.

This follows established intelligent-tutoring practice (Cognitive Tutor / ASSISTments-style knowledge
tracing scores the first response and treats a hint request as an incorrect response), and it is the only
rule under which the student can practise, retry, and take help *freely* without lying to the engine
about what they know. The student is never penalised for learning; the model is simply told the truth.

**Consequence worth stating plainly:** taking a hint before attempting costs the student mastery credit
for that question. The UI must make this legible without being punitive or shaming — a child asking for
help is doing the right thing. Lane P1 owns that presentation; the required outcome is *informed*, not
*discouraged*. A skill is re-assessed constantly, so one hinted question is never a permanent mark.

### 5. Mode changes the model — Practice is not Assessment

| Mode | Attempts | Hints | Solution |
|---|---|---|---|
| **Practice** | per §1 | yes | immediately after resolution |
| **Assessment / mock test** | **1** | **none** | **withheld until the whole test is submitted** |
| **Diagnostic placement** | **1** | **none** | withheld during; available after placement completes |
| **Flashcard review** | n/a — self-rated recall, FSRS | n/a | the card back is the answer |

Rationale: a timed mock test with hints and instant answers is not an assessment, and diagnostic placement
must stay uncontaminated or it mis-calibrates the student's starting point — the one measurement the whole
adaptive path is built on. `ItemType` (ADR-002) already distinguishes these; this table binds behaviour
to it.

### 6. Anti-gaming: measure, don't police

Because the solution is shown regardless, there is no locked reward to game — which removes most of the
incentive. The residual risk is a student submitting rubbish quickly to reach the answer, which corrupts
their own mastery data.

Mitigation is deliberately light: flag an attempt with `timeToAnswerMs` below a floor (~2500ms for entry
types, which is faster than a Class 6–8 student can read the prompt and enter a considered answer) as
`masteryEvidence: "excluded"` rather than `negative`. **Do not block, warn, or punish.** We distrust the
signal; we do not accuse the child. Anything heavier is disproportionate for a young audience and would
cost more in trust than it saves in data quality.

### 7. Per-question teacher escalation

Dr Frost attaches an optional "leave a comment for your teacher about this question" box to a resolved
question (`corpus/drfrost-practice-ui-screenshots.md` §2). Adopt it — and wire it to ADR-001's moat: a
question a student flagged is precisely the context a teacher should receive before a 30-minute call.
`QuestionComment { commentId, studentId, questionId, attemptEventId, body, createdAt, status }` feeds the
pre-call context handoff (`MASTER_PLAN.md` §10). Free-text from a minor: subject to the moderation layer
in §7 of the plan.

## Schema amendment to `AttemptEvent` (ADR-002)

```ts
export type MasteryEvidence = "positive" | "negative" | "excluded";

export interface AttemptEvent {
  // … all existing fields unchanged …
  attemptNumber: number;              // 1-based, already present
  hintsUsed: number;                  // already present — count at time of THIS attempt
  maxHintLevelReached: 0 | 1 | 2 | 3; // NEW
  hintBeforeFirstAttempt: boolean;    // NEW — the flag that flips first-attempt evidence negative
  solutionViewed: boolean;            // NEW
  masteryEvidence: MasteryEvidence;   // NEW — computed at WRITE time, never derived at read time
  exclusionReason?: "subsequent_attempt" | "too_fast" | "assessment_review" | "manual";
}
```

`masteryEvidence` is written, not inferred later, so that the rule is applied in exactly one place and any
future change to it is visible in the data rather than silently retroactive.

## Consequences

1. **Every question needs authored hints and a step-structured solution before it can be published.**
   That is a substantial content burden — lane P2 owns making it tractable (skill-level reuse, AI drafting
   behind ADR-003's human gate, tiering). Add to lane F's §11 publish checklist: a question cannot leave
   `in_review` without a worked solution *and* its hint set.
2. **The adaptive engine must filter on `masteryEvidence`**, not on `isCorrect`. `MASTER_PLAN.md` §14
   packet `P3.2` is amended accordingly — this is now two filters, `deck: "mastery"` (ADR-003) and
   `masteryEvidence != "excluded"` (here).
3. Parameterised questions mean hints and every solution step must be templated too — a solution reading
   "add 5 to both sides" is wrong when the parameter made it 7. Lane P2 owns this; it is the sharpest
   technical problem in that lane.
4. The practice player's state machine is materially more complex than a submit-and-mark loop. Lane P1
   specifies it as an explicit state machine rather than ad-hoc booleans.

## Open questions
1. Should a *second* encounter with the same skill (a different question) after a hinted failure count
   normally? Coordinator's view: yes — the exclusion is per question attempt, not a penalty box on the
   skill. Confirm when `P3.2` is built.
2. Should students be able to retry a whole completed practice session later for fresh mastery evidence?
   Leaning yes, with the question re-parameterised so it is not a memory test. Defer to `P3.5`.
3. Is a ~2500ms floor right for Class 6–8? It is a guess and should be **replaced with a measured
   percentile** from real attempt data once any exists. Flagged as an assumption, not a finding.

---
# Amendment 1 (2026-08-31) — the hint ladder is two rungs, not three; the solution is the third

**Trigger.** Lane P2 (`research/P2_hints_and_solutions.md`) was dispatched *before* this ADR existed and
correctly reported, via `grep`, that the document its packet referenced was not on disk. Its hint counts
were therefore proposed blind. Reading its analysis against §1–§2 above exposed a real inconsistency in
**my** original text, and then a better answer than either document had alone.

## The inconsistency in the original ADR

§1 sets 3 attempts for open-response types and 2 for MCQ. §2 defines a 3-level hint ladder offered after
each failure. Those don't fit: with 3 attempts the sequence is fail→hint 1, fail→hint 2, fail→reveal, so
**level 3 is never reached** on the ordinary path. With 2 attempts, only level 1 is. The ladder was
specified with a rung nothing could stand on.

Lane P2's fix was to raise attempts to 4 so all three hints fire. That resolves the arithmetic, but it
buys the third rung at a high price, which P2's own analysis makes visible.

## What P2's analysis actually shows

Two findings from that lane, both well-sourced, point the same way:

1. **Level 3 is the expensive tier.** Levels 1–2 are *generic to the skill* — authored once per `Skill`
   (~600 items) and reused by every question tagged with it. Level 3 must be *specific to the question*
   (~1,800 items), because "the concrete next step" isn't concrete unless it references this question's
   own structure. So level 3 alone roughly triples the authoring surface.
2. **Human review bandwidth is the real constraint, not AI spend.** P2 computed total generation cost at
   ≈₹170–211 one-time — a rounding error. What actually costs is a person looking at ~1,800 additional
   rendered hints before publish.

And level 3 carries the hardest mechanical gate in the lane (P2's `H2`): proving a procedural hint doesn't
leak the answer, checked numerically across 100 parameter seeds because a string comparison misses an
equal-but-differently-formatted answer. That gate exists *only* because of level 3.

## Decision

**Drop the level-3 procedural hint. Replace it with step-by-step reveal of the worked solution.**

The revised ladder:

| Failure | Open-response (3 attempts) | MCQ / selection (2 attempts) |
|---|---|---|
| after attempt 1 | offer **hint 1 — orienting** (per-skill) | offer **hint 1 — orienting** (per-skill) |
| after attempt 2 | offer **hint 2 — strategic** (per-skill) | → worked solution |
| after attempt 3 | → worked solution | — |

**The worked solution reveals one step at a time**, student-paced, with a "show next step" control — not
as a wall of text. On a *correct* answer it opens fully expanded, per the operator's requirement that the
ideal method is always visible.

## Why this is better, not just cheaper

- **The solution's first step already *is* the procedural hint.** Per the Dr Frost evidence, a step carries
  a plain-English reason plus an annotated transformation ("① Add 5 to both sides to isolate x"). Authoring
  a separate level-3 hint duplicates content we are already required to produce, validate, and review.
- **It removes ~1,800 items of authoring and human review** — the exact bottleneck P2 identified — while
  removing nothing a student sees. The scaffolding is identical; only its source changes.
- **Gate `H2` disappears.** The hardest check in the lane existed to stop a hint becoming the answer.
  Solution steps are *supposed* to contain the method, so there is nothing to police.
- **It closes the bottom-out failure mode more cleanly than a rule could.** Baker, Corbett & Koedinger
  found students who click through to a bottom-out hint learn about two-thirds as much. Under this model
  there is no almost-the-answer rung to mine: a student gets two genuine category-level nudges, or the
  worked method with its reasoning attached. The degenerate path now teaches.
- **Attempt counts from §1 stand unchanged** — including the MCQ reasoning (three attempts against four
  options makes success by elimination near-certain and the signal worthless).

## Consequences

1. `SkillHintSet` (P2 §4.2) keeps levels 1–2 and **loses level 3**.
   `Question.hints.proceduralTemplate` (P2 §4.3) is **not built**. The `orientingOverride` /
   `strategicOverride` escape hatches for unusual questions are retained.
2. Gate `H2` is **withdrawn**. P2's other gates (`H1`, `H3`–`H9`) stand.
3. `WorkedSolution` gains a reveal contract: steps are individually addressable and revealed in order.
   Lane P1 owns the UI; the content schema is P2 §3.2, adopted.
4. `maxHintLevelReached` (§ schema amendment above) is now `0 | 1 | 2`, not `0 | 1 | 2 | 3`.
5. **`solutionStepsRevealed: number`** is added to `AttemptEvent` — how far a student walked the solution
   is a genuine learning signal and costs nothing to capture.
6. **Mastery scoring is untouched.** First attempt only, per §4. Solution reveal happens after the first
   attempt is already scored, so it cannot contaminate the estimate.
7. **Adopt P2's proposed Amendment 2 to ADR-002** (`SolutionStep` / `WorkedSolution` extending
   `Question.workedSolution` additively). It does not rename or remove existing fields.

## Note for whoever reads P2 next
`research/P2_hints_and_solutions.md` is otherwise adopted in full — its taxonomy, schemas, prompts, gates,
parameterisation design and cost model are all sound and better-sourced than anything here. Read it with
this amendment applied: **its 4-attempt/3-hint mapping in §2.5 and its level-3 machinery are superseded.**
Its own §12 flagged that mapping as an unconfirmed proposal, which was the right call.
