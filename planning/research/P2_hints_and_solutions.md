# P2 — Progressive Hints and Worked Solutions: Content Model and Authoring Workflow

> **⚠ PARTIALLY SUPERSEDED — read `decisions/ADR-006-practice-interaction-model.md` Amendment 1 first.**
> This lane was dispatched before ADR-006 existed and correctly reported that fact. Its analysis is
> adopted in full — taxonomy, schemas, prompts, gates, parameterisation, cost model — **except**:
> the level-3 procedural hint is **dropped** (replaced by step-by-step reveal of the worked solution,
> which already contains the concrete next step), gate `H2` is **withdrawn** with it, and the
> 4-attempt/3-hint mapping in §2.5 is **superseded** by ADR-006 §1 (3 attempts open-response, 2 MCQ).
> This lane's own §12 flagged that mapping as an unconfirmed proposal — that was the right call, and it
> is what surfaced the fix.

Status: **DONE_WITH_CONCERNS** (see §12 — the biggest open item is that `ADR-006`, which the coordinator's
own packet says "sets the count" of the hint ladder, does not exist on disk as of this session; this
document proceeds on a well-grounded 3-level assumption and flags it prominently rather than blocking).
Evidence grading used throughout, matching the mission's convention: **[O]** observed (read directly from
a fetched/on-disk source this session), **[I]** inferred, **[A]** assumed (flagged, never silently
load-bearing). External literature was checked via live web search this session (dated below); on-disk
citations reference the exact project file.

---

## 1. Verdict Summary

| # | Question | Verdict | Confidence |
|---|---|---|---|
| Hint ladder | **3 levels — orienting, strategic, procedural** — matching the mission brief's own minimum and VanLehn's canonical Pointing/Teaching/Bottom-Out intelligent-tutoring-system taxonomy, deliberately stopping one rung short of VanLehn's "bottom-out" (which states the answer). | High on the taxonomy; Medium on the count pending ADR-006 |
| Generic vs. question-specific hints | **Hybrid.** Levels 1–2 (orienting, strategic) are authored **once per Skill** and reused by every Question tagged with it. Level 3 (procedural) is authored **per Question template**, because "the concrete next step" is only concrete if it references that question's own structure. | High |
| Worked-solution model | A `WorkedSolution` with ordered, **templated** `SolutionStep`s, each carrying a plain-English reason, LaTeX for display, a parallel plain evaluable expression for validation, and a structured annotation of the operation — extending (additively) `Question.workedSolution` from ADR-002. | High |
| Authoring workflow | AI drafts both hints and solutions; a human approves every one before publish, exactly ADR-003's precedent. Nine mechanical gates (`H1`–`H9`) run before a human ever opens the item, so review time goes to the genuinely hard judgment calls, not to catching malformed LaTeX by eye. | High |
| Parameterisation | Hints and every solution step are templated with the same `{{param}}` convention as `Question.templateText`, and validated at publish across **N=100 random parameter seeds**, extending lane F §9.3's `validateAtPublish` rather than inventing a second validation engine. | High |
| AI cost for the full launch bank | **≈₹170–₹211 total, one-time**, computed with a script (§7) — a rounding error, consistent with lane D's own finding that DeepSeek spend is never the constraint on this platform. | High on the arithmetic; Medium-Low on the bank-size assumption it's computed against (flagged, §7) |
| **The real constraint** | **Human review bandwidth, not AI spend.** ~1,800 questions each need a human to look at a rendered hint ladder and solution before publish. That is the actual bottleneck a bootstrapped team has to manage — a tiered review strategy (§11), not a tiered *generation* strategy. | High |
| v1 scope | **Tiered by review depth**: full hand-review for launch-critical "core" skills, AI-draft + sampled review for the rest, generic skill-level fallback only where a skill has no question-specific content yet. | High |

**The one non-negotiable this whole lane hangs off:** a level-3 hint is checked against the answer key
**numerically, across multiple parameter seeds, using the same sandboxed evaluator the grader uses** —
never by a human eyeballing one rendered example, and never by a string-equality check (which a
differently-formatted-but-equal answer would sail past). This is gate `H2`, and it is the actual design
problem this lane exists to solve.

---

## 2. The Hint Ladder Taxonomy

### 2.1 Grounding in the literature

This is not a house invention. Intelligent tutoring system research converged decades ago on a
graduated hint structure, and the mission brief's own three levels map almost exactly onto it:

- **VanLehn's canonical ITS hint sequence** [I, corroborated via live search this session, 2026-08-31,
  synthesising VanLehn's tutoring-systems literature as summarised at
  https://www.researchgate.net/publication/262293480_The_Behavior_of_Tutoring_Systems and
  https://arxiv.org/pdf/2102.05741] defines three escalating hint types: a **Pointing Hint** (directs
  attention to a location/error without revealing the solution), a **Teaching Hint** (states the domain
  principle or rule needed for this step), and a **Bottom-Out Hint** (states the answer outright, so the
  student "does not flounder"). This is the direct ancestor of the brief's orienting/strategic/procedural
  triad, and it comes with an explicit, well-documented warning attached: **VanLehn's own bottom-out
  design is exactly the rung this lane must never build**, because —
- **Baker, Corbett & Koedinger's "gaming the system" research** [I, corroborated via live search this
  session, 2026-08-31, e.g. https://link.springer.com/chapter/10.1007/978-3-540-30139-4_50 and
  http://pact.cs.cmu.edu/pubs/Baker,%20Corbett,%20Koedinger%20ITS04.pdf] found that students who
  systematically click through hints to reach the bottom-out rung rather than engaging with the problem
  **learn only about two-thirds as much** as peers who don't. A hint ladder that quietly degrades into an
  answer-reveal button is not a lesser version of this feature — it is evidence-backed to actively harm
  the students who use it most.
- **Pólya's four-stage problem-solving model** (*How to Solve It*, Princeton University Press, 1945; stages
  confirmed via live search this session, 2026-08-31, e.g.
  https://math.libretexts.org/Courses/Coalinga_College/Math_for_Educators...) — **Understand the problem,
  Devise a plan, Carry out the plan, Look back** — is the maths-education-specific version of the same
  idea, and gives the three levels their *names* in this design: orienting = "understand the problem,"
  strategic = "devise a plan," procedural = "carry out the plan" (the fourth Pólya stage, "look back," is
  not a hint at all — it is what the worked solution's final restated answer and the student's own
  attempt-review are for, so it is not modelled as a ladder rung here).

### 2.2 The three levels, precisely

| Level | Name | What it does | What it must NOT do | Pólya / VanLehn analogue |
|---|---|---|---|---|
| **1** | **Orienting** | Names what *kind* of problem this is and what the student should notice about its structure (e.g. "This is an equation where the variable is being multiplied by a fraction on one side"). | Name the specific method or operation. Reference the question's own numbers. | Understand the problem / Pointing Hint |
| **2** | **Strategic** | Names the method or the first move, in general terms (e.g. "Isolate the variable by doing the same operation to both sides — start with whichever term is furthest from the variable"). | State which operand to use, or perform any part of the operation. | Devise a plan / Teaching Hint |
| **3** | **Procedural** | Names the *exact* next operation and *what it acts on*, using this question's own structure (e.g. "Add {{a}} to both sides to remove it from the left-hand side") — this is deliberately as close to the answer as the ladder goes. | State or imply the *resulting* value or expression after that operation. Never state the final answer in any form. | Carry out the plan / **stops short of** Bottom-Out Hint |

### 2.3 The level-3 boundary rule — the whole design problem

A level-3 hint is exactly VanLehn's "Teaching Hint," deliberately engineered to never become his
"Bottom-Out Hint." The operational rule, stated so a coding agent can implement it without judgment calls:

> **A level-3 hint may name an operation and what it applies to. It may never state or imply a resulting
> value.** Concretely: the hint may say *"subtract {{a}} from both sides"* (names the operation and its
> operand). It may never say or show *"giving you {{b}}y = x - {{a}}"* or any algebraically-transformed
> restatement of the expression **after** the operation — that is the first solution step, not a hint.

This is checked **mechanically, not by human judgment**, because "does this hint give it away" is
exactly the kind of check a tired reviewer on question #1,400 will get wrong by pattern-fatigue. Every
`HintContent` at level 3 must self-report a `revealsExpression` field (§4, §6) — the AI generation prompt
is required to state, in a separate machine-checkable field, the plain evaluable expression (if any) that
the hint's own wording discloses. Gate `H2` (§8) then evaluates that self-reported expression against
`Question.answerExpression` across multiple parameter seeds using the same sandboxed evaluator the
grader uses (lane F §9.3's `mathjs`-based evaluator) — **never a string comparison**, because a hint that
leaks the answer in a *different but equivalent* form (`5 + 9y` when the key is `9y + 5`) would sail past
any string check while still being exactly the failure this gate exists to catch.

### 2.4 Generic-to-skill vs. specific-to-question — the biggest cost lever in this lane

This is the single decision that most determines how much this feature costs to build out across a
1,800-question launch bank (§7), so it gets argued honestly rather than asserted.

**The case for generic (authored once per skill, reused everywhere):** Levels 1 and 2 are, by
construction, about the *category* of problem and the *category* of method — "this is a linear equation
with the variable on one side" and "isolate the variable by inverse operations" are true of *every*
question tagged `algebra.linear_equations.one_step`, regardless of which numbers appear. Authoring these
once per skill and reusing them across every question (and every parameter variant of every question)
tagged with that skill is a ~600-skill cost, not an ~1,800-question cost (§7's numbers), and it is also
*pedagogically correct* — a hint that re-derives "this is an equation" from scratch for every single
question is redundant, not more helpful.

**The case for specific (authored per question):** A question-specific hint can reference the exact
surface form of *this* problem ("notice the fraction is on the right side, not the left") in a way a
generic skill-level hint cannot, and for level 3 specifically — the "concrete next step" — genericity
actively fails: "isolate the variable" is not concrete if it doesn't say which operand to move first when
a question has (say) both a fraction and a constant term on the same side.

**Recommendation: hybrid, split by level, not by skill or by question.** Levels 1–2 are generic-to-skill
(`SkillHintSet`, §4.2). Level 3 is specific-to-question (`Question.hints.proceduralTemplate`, §4.3),
because that is exactly the level where genericity stops being helpful. This is not a compromise for its
own sake — it is the point at which the cost/benefit curve actually bends: §7's cost model shows the
hybrid saves ≈19% of hint-generation spend versus making every level question-specific, and — more
importantly for a bootstrapped team — it means **adding a new question template to an already-seeded
skill costs one AI call and one small human review (the level-3 hint + the solution), not three.** A
question author extending the bank later never has to re-derive "what kind of problem is this" from
scratch.

**One escape hatch, used rarely:** `Question.hints.orientingOverride` / `strategicOverride` (§4.3) let an
author override the skill's generic level 1/2 for one unusual question (e.g. a question that deliberately
combines two skills, where the generic single-skill orienting hint would mislead). This is authored
manually, never AI-generated by default, and gate `H3` (§8) still enforces that when it's absent the
question correctly falls through to the skill default rather than silently having no level 1/2 hint at all.

### 2.5 Mapping hints onto attempts

The mission brief states the operator's decision as "several attempts with a hint after each," then "the
full worked solution at the end regardless." With exactly 3 hint levels, the natural mapping — and the one
this lane recommends pending ADR-006's confirmation (§12) — is:

| Attempt | On a wrong answer | On the final attempt |
|---|---|---|
| 1 | Show level 1 (orienting) | — |
| 2 | Show level 2 (strategic) | — |
| 3 | Show level 3 (procedural) | — |
| 4 | — | **Reveal the full worked solution**, regardless of correct/incorrect, and end the item |

This gives **4 total attempts, 3 hints**, which is both a clean 1:1 mapping (no hint is skipped, no
attempt goes unaddressed) and consistent with `AttemptEvent.hintsUsed` (ADR-002) already existing as a
per-attempt counter with nothing further to add to the schema. **This attempt count is this lane's
proposal, not a confirmed decision** — see §12.

---

## 3. The Worked-Solution Content Model

### 3.1 What the Dr Frost evidence actually requires

`corpus/drfrost-practice-ui-screenshots.md` [O, primary evidence, operator-supplied screenshots] is
explicit that a worked-solution step is **three things bound together**, not one:

1. A **plain-English reason** — *"① Add 5 to both sides to isolate x."*
2. The **algebra rendered before and after**, shown as a transformation acting on the actual equation
   (`x − 5 = 9y` with `+5 ↓` marked under both sides, then `x = 9y + 5` beneath) — not a restated final
   line with no visible working.
3. A **bold restatement of the final answer** at the top of the solution panel, before the step-by-step
   detail — Dr Frost's *"The answer is x = 9y + 5"* line.

None of this is optional decoration on top of "show the right answer" — per the corpus note's own
transferable-decision #7, this is *the difference between showing an answer and teaching a method*, which
is the entire pedagogical point of showing a solution instead of just a correctness verdict.

### 3.2 `SolutionStep` and `WorkedSolution` — TypeScript

A step needs two parallel representations of "before" and "after": a **LaTeX form for display** (matches
the convention `Question.templateLatex` already uses for display) and a **plain evaluable expression for
validation** (matches `Question.answerExpression`'s convention of being a `mathjs`-parseable string, not
LaTeX). This deliberately avoids inventing a LaTeX→evaluator parser — ADR-002 already established the
pattern of keeping a display form and an evaluable form as separate fields, and this reuses it rather than
solving LaTeX parsing as a side quest neither this lane nor lane F scoped.

```ts
export type SolutionOperation =
  | "add" | "subtract" | "multiply" | "divide"
  | "distribute" | "factor" | "expand" | "simplify"
  | "cross_multiply" | "substitute" | "convert_units" | "combine_like_terms" | "other";

export interface StepAnnotation {
  operation: SolutionOperation;
  /** What is being added/subtracted/multiplied/etc. Templated — e.g. "{{a}}". Absent for
   *  operations like "simplify" that don't have a single named operand. */
  operandTemplate?: string;
  appliesTo: "both_sides" | "lhs" | "rhs" | "numerator" | "denominator" | "whole_expression";
  /** For the Dr Frost-style "+5 ↓" visual marker: which way the operation is drawn moving. */
  directionHint?: "down" | "up" | "left" | "right" | "none";
}

export interface SolutionStep {
  stepId: string;              // stable, immutable once assigned — same invariant as blockId (ADR-002 §7)
  order: number;                // 1-indexed, matches the Dr Frost "①②③" numbering
  reasonTemplate: string;       // plain English, "{{param}}" placeholders, e.g. "Add {{a}} to both sides to isolate x."
  latexBeforeTemplate: string;  // DISPLAY ONLY. e.g. "x - {{a}} = {{b}}y"
  latexAfterTemplate: string;   // DISPLAY ONLY. e.g. "x = {{b}}y + {{a}}"
  beforeExpression: string;     // VALIDATION ONLY. mathjs-evaluable, mirrors answerExpression's convention.
  afterExpression: string;      // VALIDATION ONLY. mathjs-evaluable.
  annotation: StepAnnotation;
  media?: Array<{ type: "image" | "diagram"; url: string; alt: string }>;  // optional, e.g. a number line or area model
}

export interface WorkedSolution {
  solutionId: string;
  questionId: string;                    // FK -> Question
  finalAnswerTemplate: string;           // e.g. "x = {{b}}y + {{a}}" — the bold restatement shown FIRST (Dr Frost §3.1 pt.3)
  steps: SolutionStep[];                 // ordered by `order`, must be contiguous from 1
  sourceNoteBlockId?: string;            // optional deep-link back to the teaching note, reusing note_blocks index
  status: "ai_draft" | "in_review" | "published" | "archived";  // ADR-002's PublishStatus enum, reused verbatim
}
```

### 3.3 Extending `Question.workedSolution` — proposed Amendment to ADR-002

ADR-002 currently defines:

```ts
workedSolution: { noteBlockId?: string; standaloneContent?: Block[] };  // required non-empty
```

This lane does not own ADR-002 and cannot edit it, so this is a **proposal for the coordinator**, written
precisely enough to fold in directly. The extension is **additive** — neither existing field is renamed
or removed, so anything already built against the current shape keeps working:

```ts
// PROPOSED ADR-002 AMENDMENT 2 (this packet's proposal — not yet accepted)
export interface Question {
  // ...unchanged...
  workedSolution: {
    noteBlockId?: string;                  // EXISTING: link into a teaching note (unstructured reader path)
    standaloneContent?: Block[];           // EXISTING: freeform ProseMirror blocks (unstructured reader path)
    structuredSolution?: WorkedSolution;   // NEW (this packet): the step-structured, templated, annotated
                                            // solution defined in §3.2 — this is what the PRACTICE PLAYER
                                            // renders post-submission (Dr Frost-style); the other two
                                            // fields remain available for notes-embedded worked examples
                                            // that were never meant to carry per-step annotation.
  };  // required non-empty, per F §11 gate 3 — "non-empty" now means "at least one of the three keys present"
  hints: {                                 // NEW (this packet)
    proceduralTemplate: HintContent;       // level 3, ALWAYS question-specific — see §4.3
    orientingOverride?: HintContent | null;  // rare per-question override of the skill's generic level 1
    strategicOverride?: HintContent | null;  // rare per-question override of the skill's generic level 2
    targeted?: Array<{ misconceptionId: string; hint: HintContent }>;  // §6.1
  };
}
```

**Why a new top-level `hints` field rather than nesting it under `workedSolution`:** hints and the
solution have different visibility rules (hints are revealed progressively *during* the attempt; the
solution is revealed once, *after* the attempt sequence ends) and different authoring cadences (a hint can
be edited without touching the solution and vice versa). Conflating them under one JSON blob would make
the mechanical gates in §8 harder to scope narrowly per concern.

---

## 4. Reusable Hint Objects — TypeScript

```ts
export interface HintContent {
  hintId: string;
  level: 1 | 2 | 3;
  textTemplate: string;             // plain English, "{{param}}" placeholders where level 3 needs them
  latexTemplate?: string;           // optional templated maths fragment shown alongside the text
  /** Self-reported by the AI generator (or the human author), per §2.3: the plain evaluable
   *  expression this hint's wording discloses, if any. null when the hint discloses no value at all
   *  (true for essentially all level 1/2 hints; REQUIRED reasoning field for level 3). Checked by
   *  gate H2 — this is the field that makes the answer-leak check mechanical instead of a judgment call. */
  revealsExpression: string | null;
  misconceptionId?: string | null;  // present only on a targeted hint, §6.1 — otherwise absent
}

/** Authored ONCE per skill. Levels 1-2 only — see §2.4. Reused by every Question tagged with skillId. */
export interface SkillHintSet {
  skillId: string;                  // FK -> Skill
  orienting: HintContent;           // level 1
  strategic: HintContent;           // level 2
  sourceBlockId?: string;           // optional deep-link to the note block that teaches this skill's method
                                     // (the "Watch video ▷" / "Read the notes" pattern, corpus decision #3)
  status: "ai_draft" | "in_review" | "published" | "archived";
}
```

Resolution order the practice player uses to fetch a hint at a given level for a given question:
1. Level 3 → always `Question.hints.proceduralTemplate`.
2. Levels 1–2 → `Question.hints.orientingOverride` / `strategicOverride` if present and non-null,
   else `SkillHintSet` for the **first** entry in `Question.skillTags`
   (multi-skill questions use the primary tag; this mirrors how `skillTags[0]` is already the implicit
   primary tag convention nowhere else formalised in ADR-002 — flagged as a genuine gap in §12).

---

## 5. The Two AI Generation Prompts

Both share one property the grading/tutor prompts in lane D do not need: **there is no adversarial input
here.** The source material (question templates, skill descriptions, misconception catalogue) is
operator-curated authoring-time content, not untrusted student text, so neither prompt needs D's
nonce-delimiter injection defence. What both prompts *do* need, borrowed directly from lane F §9.2's
note-structuring prompt: an explicit **"do not invent, flag uncertainty"** instruction, because a
confidently-wrong hint or solution step is exactly the failure mode this whole pipeline exists to prevent.

### 5.1 Prompt 1 — Hint generation

One shared prompt, parameterised by `scope`, because "produce one rung of the ladder" is the same
underlying task whether the target is a `SkillHintSet` (levels 1–2, generic) or a `Question`'s level-3
hint (specific) — this keeps the author console to one "Generate hints" action rather than two subtly
different tools to maintain.

```text
SYSTEM:
You write hints for a mathematics hint ladder used by CBSE Class 6-8 students (India). You write
EXACTLY the JSON schema below and nothing else — no prose, no markdown fences.

The ladder has three levels. You are generating level: {{level}} (1=orienting, 2=strategic,
3=procedural). The rules for that level are:

LEVEL 1 (orienting): name what KIND of problem this is and what the student should notice about
its structure. Do NOT name the method or operation. Do NOT reference specific numbers.

LEVEL 2 (strategic): name the METHOD or first move, in general terms. Do NOT name which specific
operand to use. Do NOT perform any part of the operation.

LEVEL 3 (procedural): name the EXACT next operation and what it acts on, using this question's own
structure. You MAY reference this question's own parameters by name (e.g. "the {{a}} on the left").
You must NEVER state or imply the value or expression that results AFTER performing that operation —
that is the first step of the worked solution, not a hint, and providing it is a critical failure of
this task regardless of how the student might phrase a request for it.

You MUST self-report, in "revealsExpression", the plain mathjs-evaluable expression (no LaTeX, use
"^" for powers, "*" for multiplication) that your hint's own wording discloses, if any. For level 1
and 2 this MUST be null unless you have genuinely, unavoidably referenced a value. For level 3, think
carefully: if your hint text or latex contains anything that, once evaluated, equals the answer or
any transformed form of it, you have written a bottom-out hint by accident — report exactly what
value/expression you disclosed so it can be checked, do not simply omit it.

If you are not confident a hint is pedagogically correct for this skill/question, set "needsReview":
true and explain why in "reviewNote" rather than silently guessing.

SCOPE: {{scope}}   ("skill" for levels 1-2, generic across every question tagged with this skill;
                     "question" for level 3, specific to exactly this question template)

USER:
Skill: {{skill_title}} — {{skill_description}}
{{#if scope == "question"}}
Question template: {{templateText}}
Question LaTeX: {{templateLatex}}
Parameters: {{parameters_json}}
Answer expression (DO NOT reveal this or any equivalent form): {{answerExpression}}
{{/if}}
Known misconceptions for this skill (for awareness only — do not target one unless explicitly asked):
{{misconception_titles_for_skill}}
```

Output schema:

```json
{
  "hintId": "string, generated client-side, ignore",
  "level": 1,
  "textTemplate": "string, plain English, may contain {{paramName}} placeholders",
  "latexTemplate": "string or null",
  "revealsExpression": "string or null, mathjs-evaluable",
  "needsReview": false,
  "reviewNote": "string, present only if needsReview is true"
}
```

### 5.2 Prompt 2 — Worked-solution generation

```text
SYSTEM:
You write step-by-step worked solutions for a mathematics practice question, CBSE Class 6-8 (India).
You write EXACTLY the JSON schema below and nothing else — no prose, no markdown fences.

Each step MUST carry:
- a plain-English "reasonTemplate" stating WHY this step is taken (e.g. "Add {{a}} to both sides to
  isolate x"), using {{paramName}} placeholders for anything that depends on the question's parameters
- "latexBeforeTemplate" and "latexAfterTemplate" — the expression before and after this step, as
  DISPLAY LaTeX, using the same {{paramName}} placeholders
- "beforeExpression" and "afterExpression" — the SAME before/after values as PLAIN mathjs-evaluable
  strings (no LaTeX commands), used to mechanically verify your solution is actually correct — these
  must evaluate, under any valid substitution of the question's parameters, to the same values as the
  LaTeX forms
- an "annotation" naming the operation type and what it applies to (both_sides / lhs / rhs /
  numerator / denominator / whole_expression)

Do NOT skip algebraic steps a Class 6-8 student would need spelled out (e.g. do not go directly from
an equation to its fully simplified solution in one step if isolating the variable takes two distinct
operations — each operation is its own step). Do NOT invent a method not directly and unambiguously
correct for this question type; if you are uncertain a step is correct, set "needsReview": true on
that step and explain why, rather than silently guessing.

The FIRST step's "beforeExpression" must equal the question's own stated expression. The LAST step's
"afterExpression" must equal the question's answer expression, evaluated under the same parameters.
This will be independently re-verified by a sandboxed evaluator across many random parameter values —
do not rely on getting away with an error for the one example you reason through; verify your own
arithmetic against the parameters symbolically, not against one set of numbers.

USER:
Question template: {{templateText}}
Question LaTeX: {{templateLatex}}
Parameters: {{parameters_json}}
Answer expression: {{answerExpression}}
Question type: {{questionType}}
```

Output schema:

```json
{
  "finalAnswerTemplate": "string, e.g. \"x = {{b}}y + {{a}}\"",
  "steps": [
    {
      "order": 1,
      "reasonTemplate": "string",
      "latexBeforeTemplate": "string",
      "latexAfterTemplate": "string",
      "beforeExpression": "string, mathjs-evaluable",
      "afterExpression": "string, mathjs-evaluable",
      "annotation": {
        "operation": "add|subtract|multiply|divide|distribute|factor|expand|simplify|cross_multiply|substitute|convert_units|combine_like_terms|other",
        "operandTemplate": "string or omit",
        "appliesTo": "both_sides|lhs|rhs|numerator|denominator|whole_expression"
      },
      "needsReview": false,
      "reviewNote": "string, present only if needsReview is true"
    }
  ]
}
```

---

## 6. Reuse and Linkage

### 6.1 Misconceptions → targeted hints

**Decision: yes, at launch, but scoped narrowly.** ADR-002's `Misconception` is already first-class, and
lane D's LLM rubric grader (`research/D_ai_grading_and_tutor.md` §4.4) already returns a
`misconception_id`/`misconception_label` on a wrong free-response answer, not only on MCQ distractors —
so the signal needed to trigger a targeted hint already exists in the grading path with **zero new
detection work**.

**Mechanism — a substitution at the current ladder position, not a fourth rung:** if the student's wrong
answer on attempt *N* returns a `misconceptionId` that has an entry in `Question.hints.targeted`, show
that targeted hint **instead of** whatever generic level-*N* hint would otherwise have shown. The ladder
still resumes at level *N+1* on the next attempt — this keeps the attempt-count math in §2.5 unchanged and
avoids inventing a parallel "misconception track" that would need its own attempt budget.

**Scope at launch — the honest limit:** authoring a targeted hint for every misconception in the Eedi/
NCETM taxonomy (lane D §4.6) against every question is combinatorial and not realistic for a bootstrapped
team. Recommend authoring `targeted` hints only for the **top 3 highest-frequency misconceptions per
skill**, and only for **Tier A skills** (§11) at launch — everywhere else, a misconception-matched wrong
answer simply falls through to the next generic ladder rung, which is a graceful degradation, not a
missing feature. Gate `H9` (§8) enforces that a `targeted` hint's `misconceptionId` actually exists in the
`misconceptions` table and that its text isn't a lazy copy of the generic rung it's meant to improve on.

### 6.2 `skillTags` → note blocks

Both `SkillHintSet.sourceBlockId` and, optionally, a level-3 `HintContent`, can carry a deep-link into the
teaching note via the `note_blocks` derived index (ADR-002 §3) — this is the direct analogue of Dr Frost's
"Watch video ▷" affordance (`corpus/drfrost-practice-ui-screenshots.md`, transferable decision #3),
adopted here as "Read the notes." No new index is needed: `note_blocks` already maps skill → block, so
resolving "which block explains this skill's method" is a lookup, not new infrastructure.

### 6.3 The AI tutor

**Recommendation: yes, the tutor should see the authored hint ladder and solution for the question the
student is actively working on — as retrieved context, not as a quotable script.** Concretely: when the
tutor is in Practice mode (lane D §5.3) and the student is on a specific question, the server-side
retrieval step that already assembles RAG context for that turn additionally fetches
`Question.hints` and (once all three levels are exhausted) `workedSolution.structuredSolution` for that
exact `questionId`, and injects it into the model's context alongside the retrieved note chunks.

**Why this matters and why it isn't "just paste the hint":** lane D's own Practice-mode system prompt
(§5.3) already forbids the tutor from stating the final answer, using its own independently-reasoned
hint ladder ("ask what they tried" → "name the concept" → "work an analogous example" → "give the first
step"). Without seeing the *authored* ladder, the tutor can plausibly suggest a **different but equally
valid method** than the one the authored solution uses (e.g. tutor says "convert to decimals," authored
solution cross-multiplies) — mathematically fine, but confusing for a student who then sees a worked
solution that contradicts what the tutor just told them. Add one line to D's Practice-mode system prompt:

> *"If an authored hint ladder exists for this exact question, ground your guidance in the same method
> it uses. If you believe that authored method is genuinely wrong, say so is unusual and flag it — do not
> silently teach a contradictory approach."*

This is a recommendation for lane D's system prompt, not a file this packet can edit — surfaced here as
the concrete cross-lane wiring the coordinator needs to fold in.

---

## 7. Cost Model — Script and Output

**Assumptions used** (all `[A]` — flagged, not measured, because the actual CBSE 6–8 skill graph has not
been seeded yet; `P0.6` in `MASTER_PLAN.md` runs after this research, not before it):

| Input | Value | Rationale |
|---|---|---|
| Skill count, CBSE Class 6–8 Maths | 600 | IXL's own UK Year 7 maths listing runs to **402 skills for one year band** [O, cited in `research/A_ui_teardown_and_design_language.md` line 79 from `corpus/ixl-math.md`]. 600 across three grades (6–8) is a conservative multi-grade extrapolation from that one real reference point, not a measured CBSE count. |
| Question templates per skill | 3 | Variety beyond parameter randomisation alone — a single template's parameter space, however large, still shows the same surface structure every time. |
| Resulting question bank | 1,800 | 600 × 3 |
| Retry fraction (JSON schema validation failure → one repair call) | 5% | Lower than lane D's grading-path assumption because this schema is simpler than D's rubric-grading schema; not independently measured. |
| Batch scheduling | **Off-peak only** | This is a non-interactive batch job — lane D's own finding (§5.1) is that such jobs should be deliberately scheduled outside DeepSeek's peak IST windows (06:30–09:30, 11:30–15:30 weekdays) to guarantee the off-peak rate, so this uses pure off-peak pricing rather than D's 21%-peak-weighted blend for the always-on tutor path. |
| DeepSeek v4-flash off-peak pricing | input cache-hit $0.007 / input cache-miss $0.22 / output $0.66 per 1M tokens | [O, `research/D_ai_grading_and_tutor.md` §5.1, api-docs.deepseek.com/quick_start/pricing, read 2026-08-31] |
| USD→INR | 95.7 | [O, same rate D used, observed 2026-08-30] |

**Script** (`hint_solution_cost_model.py`, run this session with Python 3.12):

```python
USD_INR = 95.7
PRICE_OFF_PEAK = {"input_cache_hit": 0.007, "input_cache_miss": 0.22, "output": 0.66}

def cost_usd(input_cached, input_uncached, output_tok, price=PRICE_OFF_PEAK):
    return (input_cached / 1e6 * price["input_cache_hit"]
            + input_uncached / 1e6 * price["input_cache_miss"]
            + output_tok / 1e6 * price["output"])

SKILL_COUNT = 600
QUESTION_TEMPLATES_PER_SKILL = 3
QUESTION_COUNT = SKILL_COUNT * QUESTION_TEMPLATES_PER_SKILL   # 1,800
RETRY_FRACTION = 0.05

# Generic hint (levels 1+2), authored once per skill
hint_generic_cached_in, hint_generic_uncached_in, hint_generic_out = 500, 500, 350
# Level-3 hint, per question template
hint_l3_cached_in, hint_l3_uncached_in, hint_l3_out = 500, 400, 120
# Worked solution, per question template
solution_cached_in, solution_uncached_in, solution_out = 500, 700, 750

def with_retry(base_cost):
    return base_cost * (1 + RETRY_FRACTION)

hint_generic_cost_per_skill = with_retry(cost_usd(hint_generic_cached_in, hint_generic_uncached_in, hint_generic_out))
hint_l3_cost_per_question   = with_retry(cost_usd(hint_l3_cached_in, hint_l3_uncached_in, hint_l3_out))
solution_cost_per_question  = with_retry(cost_usd(solution_cached_in, solution_uncached_in, solution_out))
hint_full_cost_per_question = with_retry(cost_usd(500, 500 + 400, 350 + 120))  # naive: all 3 levels per question

hybrid_hint_total = hint_generic_cost_per_skill * SKILL_COUNT + hint_l3_cost_per_question * QUESTION_COUNT
naive_hint_total  = hint_full_cost_per_question * QUESTION_COUNT
solution_total    = solution_cost_per_question * QUESTION_COUNT

hybrid_grand_total_usd = hybrid_hint_total + solution_total
naive_grand_total_usd  = naive_hint_total + solution_total
```

**Actual run output [OBSERVED, this session]:**

```
Assumptions: 600 skills, 3 question templates/skill -> 1800 questions. Retry fraction 5%. Off-peak DeepSeek v4-flash pricing.

Per-skill generic hint (levels 1+2) cost:      $0.000362
Per-question level-3 hint cost:                 $0.000179
Per-question full hint ladder (naive) cost:      $0.000537
Per-question worked solution cost:               $0.000685

=== HYBRID (recommended): generic L1+L2 per skill, question-specific L3 per question ===
  Hint total:      $0.54
  Solution total:  $1.23
  Grand total:     $1.77  =  Rs 170

=== NAIVE (every hint level fully question-specific) ===
  Hint total:      $0.97
  Solution total:  $1.23
  Grand total:     $2.20  =  Rs 211

Hybrid saves $0.43 (Rs 41), a 19% reduction vs the fully question-specific baseline.

Per-question all-in AI generation cost (hybrid): $0.00098 = Rs 0.094
```

**The honest reading of this number:** whether the bank is 1,800 questions or, say, 5,000 (a plausible
outcome once real authoring starts and the "3 templates per skill" assumption turns out low), the total
AI generation spend for the *entire* hints-and-solutions content lane is **still under ₹1,000, one time.**
This matches lane D's own §5.4 finding for the tutor/grading path: DeepSeek spend on this platform is
never the constraint. The constraint this section actually surfaces is stated plainly in §11: **1,800
items each need a human to look at a rendered result before it reaches a student** — that review pass,
not the token bill, is the real production cost of this feature.

---

## 8. Mechanical Publish Gates

Extending lane F §11's checklist and ADR-003's `G7`–`G11` pattern with this lane's own gates, run at
publish, mechanically, on every `Question` carrying hints/`structuredSolution`:

| Gate | Checks | Fails publish when |
|---|---|---|
| **H1** | Every published `Question` resolves all three hint levels (question-specific or inherited from `SkillHintSet`, §4) and has a non-empty `structuredSolution` with ≥1 step. | Any level is unresolvable, or `steps.length === 0`. Reports exactly which level/field is missing. |
| **H2** | **The answer-leak check.** For every level-3 hint (and any `targeted` hint), evaluate the self-reported `revealsExpression` (§2.3, §5.1) against `Question.answerExpression` using the same sandboxed `mathjs` evaluator as lane F §9.3, across the same N=100 seeds used for `H5` below. | `revealsExpression` is non-null AND evaluates equal (within `acceptanceRule.tolerance`) to `answerExpression` for **any** sampled seed. Numeric evaluation, never string comparison — this is what catches an answer leaked in an equivalent-but-differently-written form (`5+9y` vs `9y+5`). |
| **H3** | Level 1/2 templates (`SkillHintSet.orienting`/`.strategic`, and any question-level override) contain **zero** `{{param}}`-style placeholders. | A `{{...}}` pattern is found in a level-1/2 `textTemplate` or `latexTemplate` — a mechanical lint that operationalises "generic to skill" and catches an author accidentally writing question-specific content into the shared slot. |
| **H4** | A level-3 hint's `textTemplate`/`latexTemplate`, once rendered for a sample seed, does not contain the corresponding first `SolutionStep.afterExpression`/`latexAfterTemplate` rendered for that same seed. | Structural match found — the hint has restated the result of the very step it's supposed to only be pointing at. |
| **H5** | **The solution-correctness sweep.** For N=100 random parameter seeds: generate the variant (reusing F §9.3's `generateVariant`), evaluate each step's `beforeExpression`/`afterExpression`, confirm each step's `before` matches the prior step's `after` (or the question's own stated expression for step 1), and confirm the **last** step's `after` equals `Question.answerExpression` within tolerance. | Any seed fails any link in the chain. Reports the seed and the exact step that broke — this is the mechanical version of the task's explicit "final step must evaluate to the answer key" requirement, extended across parameter space rather than checked once. |
| **H6** | Every `latexBeforeTemplate`/`latexAfterTemplate`/`latexTemplate`, rendered for one sample seed, parses under KaTeX without throwing. | Parse error — same spirit as lane F §11 gate 1 (`altText`) and gate 7 (`mhchem` snapshot), catching malformed maths markup before a human has to notice it by eye. |
| **H7** | Every `{{paramName}}` placeholder appearing anywhere in a hint or solution-step template is a member of `Question.parameters`. | An unrecognised placeholder is found — this is what stops a typo (`{{aa}}`) from rendering literally as `{{aa}}` in front of a student. |
| **H8** | **Human-saw-a-real-render gate.** The publish transaction requires a non-null `reviewed_render_seed` recorded against this `Question`'s hint/solution review, proving a reviewer opened at least one concretely-rendered instance (not just the raw JSON) before approving. | `reviewed_render_seed` is null at the point of the publish attempt. Mirrors lane F §3.3 gate 4's "database constraint, not a UI-only nudge" pattern exactly. |
| **H9** | Every `targeted` hint's `misconceptionId` exists in the `misconceptions` table (FK check), and its `textTemplate` is not identical (post-normalisation) to the generic level-2 rung it's meant to improve on. | FK violation, or a byte-identical (whitespace-normalised) match to the skill's generic strategic hint — catches an author claiming credit for a targeted hint that's actually just the generic one relabelled. |

None of `H1`–`H9` requires an LLM call to run — they are deterministic checks over already-generated
content, exactly the "cheap, mechanical, no judgment call" bar ADR-003 set for its own `G7`–`G11` gates.

---

## 9. Parameterisation Design

### 9.1 The problem, stated precisely

`Question` already supports parameter templates (ADR-002) specifically so a question shown to one student
is numerically different from the one shown to another (anti answer-sharing, per lane F §7's citation of
Dr Frost's own stated reason for doing this). A hint or solution step that hardcodes a number is
therefore **wrong for every student except the one whose seed happened to produce that literal value** —
the task's own example, "add 5 to both sides" being wrong when the parameter made it 7, is not a rare edge
case; it is the default outcome of not templating.

### 9.2 The mechanism

Every hint (`textTemplate`, `latexTemplate`) and every solution step (`reasonTemplate`,
`latexBeforeTemplate`, `latexAfterTemplate`, `beforeExpression`, `afterExpression`,
`StepAnnotation.operandTemplate`) uses the **exact same `{{paramName}}` placeholder convention** already
established by `Question.templateText`/`templateLatex` — no second templating syntax, no new renderer.
The same substitution function that turns a `Question` template into a concrete rendered question for a
given `variantSeed` (lane F §9.3's `generateVariant`) is reused, unmodified, to render every hint and
every solution step for that same seed.

### 9.3 Publish-time validation — extending lane F §9.3, not replacing it

The task asks specifically how the publish sweep verifies correctness "across N random parameter seeds,
not just one." This extends F's own `validateAtPublish` function with a solution-aware companion that
reuses its evaluator and its `generateVariant`:

```ts
function validateSolutionAtPublish(
  question: Question,
  solution: WorkedSolution,
  sampleCount = 100
): ValidationResult[] {
  const results: ValidationResult[] = [];
  for (let seed = 0; seed < sampleCount; seed++) {
    try {
      const params = generateVariant(question.parameters, seed);   // reused from lane F §9.3, unmodified
      const correctAnswer = math.evaluate(question.answerExpression, params);  // same sandboxed evaluator

      let previousAfter: number | null = null;
      for (const step of solution.steps) {
        const beforeVal = math.evaluate(step.beforeExpression, params);
        const afterVal  = math.evaluate(step.afterExpression, params);

        if (previousAfter !== null && Math.abs(previousAfter - beforeVal) > 1e-9) {
          results.push({ seed, ok: false, reason: `step ${step.order}: 'before' does not chain from the previous step's 'after'` });
        }
        // H7-equivalent: any {{param}} left unresolved after substitution is a hard fail
        for (const rendered of [renderTemplate(step.reasonTemplate, params), renderTemplate(step.latexBeforeTemplate, params), renderTemplate(step.latexAfterTemplate, params)]) {
          if (/\{\{.*?\}\}/.test(rendered)) {
            results.push({ seed, ok: false, reason: `step ${step.order}: unresolved placeholder after substitution` });
          }
        }
        previousAfter = afterVal;
      }

      // H5: the final step must land on the same answer the question's own key produces, for THIS seed
      const tolerance = question.acceptanceRule.tolerance ?? 1e-9;
      if (previousAfter === null || Math.abs(previousAfter - correctAnswer) > tolerance) {
        results.push({ seed, ok: false, reason: "final solution step does not evaluate to answerExpression for this seed" });
      }
    } catch (e) {
      results.push({ seed, ok: false, reason: String(e) });
    }
  }
  return results;
}
```

A question cannot leave `ai_draft`/`in_review` while `validateSolutionAtPublish` returns any `ok: false`
result — same enforcement pattern as F's own `validateAtPublish`, run alongside it in the same publish
transaction, not as a separate later pass a question could slip through.

### 9.4 Hints inherit the same sweep

`H2`'s answer-leak check and `H4`'s "hint doesn't restate the first step's result" check are themselves
run across the same N=100 seeds, for the same reason: a hint whose `revealsExpression` happens to differ
from the answer for seed 0 (the one an author might have glanced at while writing it) but coincides with
it for some other value of the parameters is exactly the bug this design has to catch, and it is
undetectable by eye — only the seed sweep finds it.

---

## 10. Linkage Summary

| Relates to | Decision |
|---|---|
| `Misconception` | Targeted hints at launch, scoped to top-3-per-skill and Tier A skills only (§6.1). Zero new detection work — reuses lane D's existing `misconceptionId` return from the grading call. |
| `skillTags` / note blocks | `SkillHintSet.sourceBlockId` deep-links into the teaching note via the existing `note_blocks` index — the Dr Frost "Watch video ▷" pattern, reused. |
| AI tutor | Tutor's Practice-mode retrieval additionally fetches this question's authored hints/solution as grounding context, so it doesn't teach a contradictory method (§6.3) — a one-line addition to lane D's existing system prompt, not a new capability. |
| `AttemptEvent` | No schema change required — `hintsUsed` (already in ADR-002) is sufficient for the 4-attempt/3-hint mapping in §2.5. An optional future addition, `highestHintLevelShown?: 1\|2\|3`, would let analytics distinguish "used one hint" from "needed all three," but is not proposed as blocking. |

---

## 11. The Honest Cost/Scope Verdict

§7 already establishes that AI generation spend is not the constraint — even a bank several times larger
than assumed here stays under ₹1,000 total. **The real cost is human review time**: roughly 1,800 items,
each needing a person to look at a concretely rendered hint ladder and solution (gate `H8` makes this
literally mechanically required, not optional) before it reaches a student.

**Recommendation: tier by review depth, not by generation method** — mapped directly onto the three
options the task poses:

- **Tier A — hand-authored, full review.** The skills a Class 6–8 student hits first and most often:
  `CurriculumPlacement.isCore === true`, ordered early by `sequenceInChapter`. AI drafts, a human
  fully reviews and edits every hint level and every solution step, `H1`–`H9` all run before that review
  even starts so the reviewer's time goes to pedagogical judgment, not to catching a malformed LaTeX
  string. **Caveat stated plainly**: at launch there is no real usage data yet — `AttemptEvent` doesn't
  exist until Phase 2 ships (`MASTER_PLAN.md` §14). "High-traffic" at launch is therefore a **syllabus-
  position proxy** (core, early-sequence skills), not a measured one. Re-tier using actual
  `AttemptEvent` frequency once ~4–6 weeks of live data exists — this is cheap to do later because the
  tier is a review-priority flag, not a schema difference.
- **Tier B — AI-drafted, sampled review.** The remaining core-but-less-central skills. `H1`–`H9` must all
  pass; a human reviews a random 20% sample of each authoring batch rather than every item, and a batch
  failing above a threshold on that sample (recommend: >1 in 20 sampled items needing a substantive edit)
  sends the **whole batch** back to full review rather than shipping the rest on a weakened guarantee.
- **Tier C — generic fallback only.** Enrichment/long-tail skills not yet core to the launch sequence.
  Ship with the skill's generic level 1–2 hints only (already produced regardless, since they're
  authored per-skill not per-question, §2.4) plus a **generic per-skill fallback level-3** ("try the
  operation named in the strategic hint on the term furthest from the variable" — deliberately vaguer
  than a real level-3, because a real one requires question-specific authoring this tier is explicitly
  deferring) and an AI-drafted solution flagged `needsReview: true`, gated behind a visible
  "Report a problem with this solution" affordance rather than blocking publish outright. Revisit once
  `AttemptEvent` shows whether these skills get real traffic at all — a skill nobody reaches doesn't need
  Tier A treatment just because it's in the bank.

**What this recommendation explicitly rejects:** "full authored hints for every question" as a uniform
launch bar. Given §7's numbers, that would not be rejected for cost reasons — it would be rejected because
it spends a bootstrapped team's scarcest resource (a human's attentive review time) uniformly across
1,800 items regardless of which ~150–200 of them (Tier A) a student will actually encounter in their
first weeks, which is the wrong allocation when the alternative (tiered, re-tiered from real telemetry)
costs nothing extra to build.

---

## 12. Open Questions

- **ADR-006 does not exist on disk as of this session.** This packet's own instructions state "the
  coordinator's ADR-006 sets the count" of the hint ladder — it was not found anywhere under
  `decisions/` (only ADR-001 through ADR-005 exist, checked via `grep -rl "ADR-006"` across the whole
  project, which returned zero hits outside this packet's own brief). This entire document proceeds on
  **N=3 levels** as a well-grounded assumption (matching both the task's own stated minimum and VanLehn's
  canonical ITS taxonomy, §2.1) — but it is genuinely a placeholder for a decision that should exist as
  its own ADR, and every schema/gate/cost number here would need re-deriving if ADR-006 lands on a
  different count.
- **The attempt-to-hint mapping in §2.5 (4 attempts, 3 hints, solution on the 4th) is this packet's
  proposal, not a confirmed operator decision.** The mission brief only says "several attempts with a
  hint after each" — "several" was not quantified anywhere found in `MASTER_PLAN.md`, `RESUME.md`, or
  `AUDIT_TRAIL.md` (searched via grep for "attempt" and "hint" this session).
- **`skillTags[0]`-as-primary-tag is an implicit convention this packet needed (§4, hint resolution for
  multi-skill questions) but ADR-002 never formalises it.** Worth the coordinator making explicit in
  ADR-002 itself, since other lanes may be making the same silent assumption independently.
- **Should Tier C's generic fallback level-3 hint be shown at all, or should Tier C questions simply skip
  straight from level 2 to the worked solution?** This packet recommends showing a deliberately vaguer
  generic level-3 (§11) on the theory that *some* level-3 guidance beats none, but a case exists for the
  opposite: a vague level-3 that doesn't meet the "concrete next step" bar (§2.2) may just frustrate a
  student expecting the same specificity Tier A questions deliver. Flagging rather than deciding.
- **Should the review-sample threshold in Tier B (§11, ">1 in 20 needing a substantive edit sends the
  batch back") be tuned per-skill or per-author?** Not designed further here — this is an operational
  parameter to tune against real review data, not a day-one architecture decision.

## 13. Could Not Verify

- **The exact CBSE Class 6–8 Maths skill count.** §7's `SKILL_COUNT = 600` is an extrapolation from IXL's
  UK-curriculum Year 7 count (402 skills, one year band), not a measured CBSE figure — `P0.6` (skill graph
  seeding) has not run at the time of this research, so no ground truth exists yet to check against.
  Re-run §7's script with the real count once `P0.6` completes; the script is written to make that a
  one-line change.
- **VanLehn's exact taxonomy terms ("Pointing Hint," "Teaching Hint," "Bottom-Out Hint")** are reported
  here via a live web search synthesis this session (2026-08-31) of secondary sources describing VanLehn's
  work (ResearchGate abstract page, an arXiv paper citing him), not a direct read of VanLehn's own primary
  publication — treat the *concept* (three escalating levels ending in an answer-reveal rung) as
  well-corroborated across multiple independent sources, but the exact three label-strings as
  paraphrased-from-secondary-source, not a verbatim primary quote.
- **Whether DeepSeek's JSON mode (§5) reliably enforces the `revealsExpression: null` vs. a real string
  distinction** — lane D's own §4.4 already flags that DeepSeek's structured output is whole-object JSON
  mode only, with no schema-constrained typing, so a model could in principle return `"revealsExpression":
  "null"` (the string) instead of a JSON `null`. Not tested this session; the publish-gate implementation
  should defensively treat both as "no disclosure" but this should be verified against a real API response
  before relying on it.
- **The realistic substantive-edit rate for Tier B's sampled review (§11)** — the ">1 in 20" threshold is
  a reasonable-sounding starting point, not derived from any measured editorial data, since no content of
  this kind has been authored yet on this platform.
