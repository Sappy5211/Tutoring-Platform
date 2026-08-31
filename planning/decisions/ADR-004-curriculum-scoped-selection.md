# ADR-004 — Curriculum-scoped prerequisites and concurrent exam goals

Status: PROPOSED (coordinator). Date: 2026-08-31.
Raised by `research/RED_TEAM_REVIEW.md` finding #4. **Amends ADR-002 and lane C §5.**

## Context

ADR-002 split `Board` from `ExamTrack` and introduced `CurriculumPlacement` so one `Skill` could sit in
many curricula. Its stated justification was that "the pedagogical prerequisite graph is board-agnostic —
factoring a quadratic is the same skill in CBSE and ICSE."

**That justification conflated two different things: skill *identity* and prerequisite *order*.** Skill
identity genuinely is board-agnostic. Teaching order is not. A JEE-track treatment routinely reorders
which sub-skills gate which, relative to a school board's sequence, because problem-solving depth changes
the dependency structure. A single global `SkillEdge` graph can encode exactly one order.

Worse, the fix never reached the code that needed it. Lane C's `selectNextItem(studentId, subjectContext)`
takes only a `Subject`. Curriculum enters only as a soft tie-break re-ranking of an already-computed
candidate pool — it does not change **which skills are gated**, which is the thing that actually matters.
So the CBSE-student-preparing-for-JEE case that ADR-002 was written to solve was resolved at the schema
level and left broken at the algorithm level, while the master plan presented it as closed.

A second, related gap: `Exam`/`StudentExam` allow a student to subscribe to two exams (CBSE boards in
March, JEE Main in April) with overlapping skills and different dates. Nothing anywhere specifies how two
exam schedules merge into one daily plan.

## Decision

### 1. Prerequisite edges are curriculum-scopable, with a global default

```ts
export interface SkillEdge {
  id: string;
  fromSkillId: string; toSkillId: string;
  type: "prerequisite" | "encompasses";
  weight: number; required: boolean;
  /** NULL = applies in every curriculum (the common case, and the default).
   *  Set = this edge applies ONLY within that curriculum, and OVERRIDES any
   *  global edge between the same pair. */
  curriculumScope: { board: Board | null; examTrack: ExamTrack | null } | null;
}
```

Resolution rule, in order: for a given student context, an edge between A and B is the **scoped** edge if
one exists for that board/track, otherwise the **global** edge, otherwise no edge. Exactly one edge is
ever active between a pair for a given context — no merging, no ambiguity.

Rationale: the overwhelming majority of maths prerequisites genuinely are universal, so making every edge
curriculum-specific would triple the authoring burden for no benefit. Making scoping *optional with a
global default* keeps the common case free and the exceptional case expressible. This is the smallest
change that makes the schema honest.

### 2. `selectNextItem` takes a curriculum context

```ts
interface CurriculumContext {
  board: Board | null;
  examTrack: ExamTrack | null;   // the ACTIVE track, when a student has several
  gradeLevel: number | null;
}
function selectNextItem(studentId: string, subject: Subject, ctx: CurriculumContext): Item
```

Lane C §5's step 3 changes from "FOR EACH skill WHERE subject = subjectContext" to walking only skills
that have a `CurriculumPlacement` matching `ctx`, and evaluating prerequisite gates using the resolution
rule in §1. Curriculum stops being a tie-break and becomes a filter on the candidate pool, which is what
it always should have been.

### 3. Concurrent exam goals — one active context, explicit switching

When a student is subscribed to more than one `Exam`:

- **One exam is `primary` at a time.** `StudentExam.isPrimary` (exactly one true per student per subject).
  It supplies the `CurriculumContext` for selection and owns the Exam Daily Goal.
- **The daily goal is not summed.** Two exam schedulers each computing a daily goal and adding them
  produces a number no student can meet, which destroys trust in the goal — the single thing the
  exam-scheduler mechanism depends on. The primary exam's goal is *the* goal.
- **Secondary exams contribute scope, not schedule.** Their `syllabusSkillIds` are unioned into what
  counts as "in scope" so a skill needed only for JEE is not treated as off-syllabus. But their dates do
  not drive pacing.
- **Automatic hand-over.** When the primary exam's date passes, the next-nearest subscribed exam becomes
  primary automatically, and the student is told this happened. A student who finishes boards in March
  and has JEE in April should not have to reconfigure anything.
- **The Final Review Period is the exception** and may run for a secondary exam, because it is a
  fixed short burst near a date rather than an ongoing pacing claim.

## Consequences

- `SkillEdge` gains `curriculumScope`; ADR-002 is amended.
- Lane C's pseudocode signature changes. The engine's logic is otherwise unaffected — this is a filter
  change, not an algorithm change.
- Content authoring gains an occasional task: when a track genuinely reorders prerequisites, author a
  scoped edge. Expect this to be rare in Maths and more common when Physics arrives.
- Seeding the graph now requires knowing the launch curriculum, reinforcing the re-sequencing of
  skill-graph seeding into Phase 1 (red-team finding #8).

## Open questions
- Is one primary exam per **subject** right, or per student overall? Per subject, since a student may sit
  boards in Maths and Physics on different dates. Confirm when Science is scoped.
- Should `curriculumScope` allow a set of curricula rather than one? Deferred — YAGNI until a real case
  appears, and the resolution rule stays simpler without it.
