# ADR-002 — The canonical data model spine

Status: PROPOSED (coordinator). Date: 2026-08-31.
Supersedes the conflicting model fragments in lanes C, E, F and B where they disagree.
**This is the contract. A coding agent implements this file, not the individual lane files.**

## Context

Lanes C (adaptive engine), E (India ops), F (content pipeline) and B (editor) each defined TypeScript
models independently and in parallel. That was the right call for research throughput and the wrong
thing to hand a coding agent: they overlap in seven places and **contradict each other in five**.
Reconciling them is coordinator work because every resolution is a cross-cutting architecture decision,
not a lane-local one. Left unreconciled, a cheap coding agent would pick arbitrarily per file and the
schema would fork.

## The seven collisions and their resolutions

### 1. Board and exam track were conflated — **the most consequential error found**
Lane C defined `Board = "CBSE" | "ICSE" | "STATE" | "JEE" | "NEET"`. JEE and NEET are **not boards**;
they are competitive exam tracks. A single student is simultaneously CBSE *and* preparing for JEE. Left
as one enum, that student cannot be represented at all.
**Resolution:** two orthogonal dimensions. `Board` (school curriculum a student is enrolled in) and
`ExamTrack` (optional competitive targets, zero or more).

### 2. Flat skill graph (C) vs curriculum hierarchy (E)
C modelled `SkillNode` with `boards: Board[]` and `gradeLevel`. E modelled
Board→Grade→Subject→Chapter→Topic→Skill. Both are right about different things: the *pedagogical*
prerequisite graph is board-agnostic (factoring a quadratic is the same skill in CBSE and ICSE), while
*navigation, sequencing and syllabus scope* are board-specific.
**Resolution:** separate them. A board-agnostic `Skill` graph, plus a `CurriculumPlacement` join that
maps one skill into many curricula with per-curriculum ordering. This is what makes E's "same topic
across multiple boards" requirement work without duplicating skills — and it means adding board #2 is
a data task, not a migration. Denormalising `boards[]` onto the skill (C's shape) would have forced
exactly the rewrite E was trying to prevent.

### 3. `contentRefs` (C) vs `skillTags` (F) — the same relation stored twice, in opposite directions
C put `contentRefs: string[]` on the skill (skill → blocks). F put `skillTags: string[]` on the block
(block → skills). Two write paths for one many-to-many relation is a guaranteed drift bug.
**Resolution:** `skillTags` on the block is the **single source of truth** (it is authored where the
content is authored). Skill → block is a **derived index** (`note_blocks`, which F already proposed),
rebuilt at publish. Never written by hand. Delete `SkillNode.contentRefs`.

### 4. Difficulty modelled on two scales, one of which contradicts lane C's own decision
C put `seedDifficulty` (Elo, ~1200) on the *skill*; F put `difficulty.irtParams {a,b,c}` on the
*question*. But C's decision table **explicitly rejected IRT at launch** on item-calibration grounds, so
F's `irtParams` is premature.
**Resolution:** difficulty lives on the **item**, on the Elo scale, updated online — `eloDifficulty` on
`Question`. `seedDifficulty` stays on `Skill` only as the seed for new items in that skill.
`irtParams` becomes optional and explicitly v2, populated by the batch calibration job in C's roadmap.

### 5. The grading enum exists in three incompatible versions
C: `"exact" | "cas_equivalence" | "manual"`. F: `"exact" | "numeric_tolerance" | "symbolic_equivalence"`.
D's actual verified ladder has **four** rungs and adds LLM rubric grading. Neither C nor F can represent
a rubric-graded answer, which is the whole point of the operator's "answers in a different format" ask.
**Resolution:** one enum, `GradingMethod`, matching D's ladder exactly, and it is the only one.

### 6. `Flashcard` (content) vs `CardState` (per-student scheduling) — relation never stated
**Resolution:** strict separation. `Flashcard` is authored content, shared by all students.
`CardState` is per-(student, flashcard) FSRS state. One-to-many. Publishing a new note version must
never reset `CardState`.

### 7. Personal annotations vs note re-publication
B's two-layer model anchors student highlights to blocks; F versions notes with immutable `blockId`.
**Resolution:** `blockId` immutability is promoted from an implementation note to a **hard invariant** —
it is the anchor the entire personal layer depends on. Editing a block's text preserves its id; only
deleting a block frees it, and ids are never reused. Personal-layer rows pointing at a deleted block
become `orphaned`, surfaced to the student, never silently dropped.

Plus one addition from `research/B2_remnote_verified.md`: **`Exam` is a first-class object**, not a
setting. It is published by the platform and subscribed to by students, so syllabus scope is authored
once.

## The canonical spine

```ts
// ═══ CURRICULUM ═══════════════════════════════════════════════════
export type Subject = "maths" | "physics" | "chemistry" | "biology";
export type Board     = "CBSE" | "ICSE" | "STATE_MH" | "STATE_TN" | "STATE_UP" /* … */;
export type ExamTrack = "JEE_MAIN" | "JEE_ADV" | "NEET" | "CUET" | "NTSE" | "OLYMPIAD";

/** Board-agnostic pedagogical unit. The graph node. */
export interface Skill {
  id: string; slug: string; title: string;
  subject: Subject;
  description: string;
  seedDifficulty: number;      // Elo seed for NEW items in this skill (~1200). Not item difficulty.
  createdAt: string; updatedAt: string;
  // NOTE: no `boards[]` (see §2), no `gradeLevel` (see §2), no `contentRefs` (see §3).
}

/** Places one skill into one curriculum, with that curriculum's ordering. Many per skill. */
export interface CurriculumPlacement {
  id: string;
  skillId: string;
  board: Board | null;         // null when placed purely by exam track
  examTrack: ExamTrack | null; // null when placed purely by board
  gradeLevel: number | null;   // 8–12; null for exam-track-only placement
  chapterId: string;           // FK -> Chapter
  sequenceInChapter: number;   // authored teaching order within the chapter
  isCore: boolean;             // in the examinable syllabus vs enrichment
}

export interface Chapter {
  id: string; title: string; board: Board | null; examTrack: ExamTrack | null;
  gradeLevel: number | null; subject: Subject; sequence: number;
  officialCode?: string;       // e.g. NCERT chapter number, for parent-facing credibility
}

export type EdgeType = "prerequisite" | "encompasses";
export interface SkillEdge {
  id: string; fromSkillId: string; toSkillId: string;
  type: EdgeType;
  weight: number;              // 0..1 fractional credit (FIRe-style)
  required: boolean;           // hard gate vs soft relationship
  /** ADR-004. NULL = applies in every curriculum (default, the common case).
   *  Set = applies ONLY in that curriculum and OVERRIDES the global edge for the same pair.
   *  Skill IDENTITY is board-agnostic; teaching ORDER is not. */
  curriculumScope: { board: Board | null; examTrack: ExamTrack | null } | null;
}

// ═══ CONTENT ══════════════════════════════════════════════════════
export interface NoteDocument { schemaVersion: 1; noteId: string; title: string;
                                type: "doc"; content: Block[]; }

export interface Block {
  type: string;
  attrs: {
    blockId: string;           // HARD INVARIANT: immutable, never reused. Anchor for the personal layer.
    skillTags?: string[];      // SOURCE OF TRUTH for skill<->content (§3). Required on teaching blocks.
    [k: string]: unknown;
  };
  content?: Block[]; text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

export type PublishStatus = "ai_draft" | "in_review" | "published" | "archived";
export interface NoteVersion {
  noteId: string; versionNumber: number; status: PublishStatus;
  contentSnapshot: NoteDocument;   // immutable once published
  publishedAt?: string; publishedBy?: string;
}

// ═══ ASSESSMENT ═══════════════════════════════════════════════════
/** THE single grading enum. Mirrors lane D's verified ladder, cheapest rung first. */
export type GradingMethod =
  | "exact"               // normalised string / MCQ
  | "numeric_tolerance"   // sig figs, rounding, units
  | "cas_equivalence"     // SymPy symbolic equivalence, hard timeout
  | "llm_rubric"          // structured rubric grading
  | "manual";             // human override / appeal outcome

export type QuestionType = "mcq" | "numeric_entry" | "algebraic_expression"
  | "multi_step_working" | "matching" | "ordering" | "graph_interaction";

export interface Question {
  questionId: string; type: QuestionType;
  templateText: string; templateLatex?: string;
  parameters: ParamSpec[];              // parameterised variants (anti answer-sharing)
  answerExpression: string;
  acceptanceRule: { method: GradingMethod; tolerance?: number;
                    normalisation?: Record<string, unknown>; rubricId?: string };
  options?: Array<{ optionId: string; expression: string; isCorrect: boolean;
                    sourceTransform?: string; misconceptionId?: string }>;
  eloDifficulty: number;                // LIVE, online-updated. The launch difficulty signal (§4).
  irtParams?: { a: number; b: number; c?: number };  // v2 only, batch-calibrated.
  skillTags: string[];
  workedSolution: { noteBlockId?: string; standaloneContent?: Block[] };  // required non-empty
  status: PublishStatus;
}

export type CardType = "basic" | "concept" | "descriptor" | "cloze"
                     | "multiple_choice" | "image_occlusion";
export interface Flashcard {                 // AUTHORED CONTENT, shared by all students
  flashcardId: string; type: CardType;
  deck: "mastery" | "exam_rehearsal";        // ADR-003. Only "mastery" updates pMastery.
  direction: "forward" | "reverse" | "both" | "none";   // per B2 §6 correction #2
  enabled: boolean;
  sourceBlockId?: string;                    // the note block that generated it
  skillTags: string[]; status: PublishStatus;
}

// ═══ PER-STUDENT STATE ════════════════════════════════════════════
export type SkillStatus = "locked" | "available" | "in_progress" | "mastered" | "needs_review";
export interface StudentSkillState {
  studentId: string; skillId: string;
  pMastery: number;                 // BKT posterior
  abilityRating: number;            // Elo, seeded 1200
  status: SkillStatus;
  attemptsCount: number; correctCount: number; consecutiveCorrect: number;
  lastPracticedAt: string | null; masteredAt: string | null; updatedAt: string;
}

export interface CardState {        // per (student, flashcard) FSRS state — NEVER reset on republish
  studentId: string; flashcardId: string;
  stability: number; difficulty: number;
  due: string; lastReview: string | null; reps: number; lapses: number;
  phase: "new" | "learning" | "review" | "relearning";
}

// ═══ EXAM (first-class, per B2 §3) ════════════════════════════════
export interface Exam {                       // PUBLISHED by the platform
  examId: string; title: string;              // "CBSE Class 10 Board — Mathematics"
  board: Board | null; examTrack: ExamTrack | null;
  gradeLevel: number | null;
  examDate: string;                            // ISO date
  /** Scope is DERIVED from CurriculumPlacement where board/examTrack/gradeLevel match
   *  AND isCore = true. These two arrays are OVERRIDES on that derived set, not the set
   *  itself — normally both empty. (Resolves the contradiction flagged in RED_TEAM #3.) */
  includeSkillIds: string[];                   // force-add, e.g. a skill placed as enrichment
  excludeSkillIds: string[];                   // force-remove, e.g. a deleted-this-year chapter
}
export interface StudentExam {                 // SUBSCRIBED by the student
  studentId: string; examId: string;
  isPrimary: boolean;                          // exactly one true per student per subject (ADR-004 §3)
  finalReviewEnabled: boolean; ensureMasteryEnabled: boolean;
  dailyGoalOverride: number | null; catchUpUntil: string | null;
}

// ═══ TELEMETRY (must ship with the frontend or the engine cannot be retrofitted) ═══
export type ItemType = "practice_question" | "flashcard" | "diagnostic" | "assessment";
export type SelectionPolicy = "diagnostic" | "graph_frontier" | "srs_due" | "bandit" | "manual";
export interface AttemptEvent {
  eventId: string; studentId: string; itemType: ItemType;
  questionId?: string; flashcardId?: string;
  skillIds: string[];
  isCorrect: boolean; gradingMethod: GradingMethod;
  rawAnswer: string; normalisedAnswer?: string;
  misconceptionId?: string;
  timeToAnswerMs: number; hintsUsed: number; attemptNumber: number;
  selectionPolicy: SelectionPolicy;
  selectionPropensity: number | null;   // REQUIRED for future off-policy bandit evaluation (lane C §5)
  policyVersion: string;
  clientTs: string; serverTs: string;
}
```

## Amendment 1 (2026-08-31) — entities the original spine omitted
Raised by `research/RED_TEAM_REVIEW.md` findings #1, #2, #6, #7, #14. All five were real: no lane was ever
assigned identity/auth, so every per-student table keyed off a `studentId` that no document defined.

```ts
// ═══ IDENTITY & CONSENT (was missing entirely — RED_TEAM #1) ═══════
export type UserRole = "student" | "parent" | "teacher" | "author" | "admin";
export interface User {
  userId: string; role: UserRole;
  phone?: string; email?: string;            // phone-first for India
  displayName: string; locale: "en-IN" | "hi-IN";
  createdAt: string; lastSeenAt: string | null; status: "active" | "suspended" | "deleted";
}
export interface Student {
  studentId: string;                          // === User.userId for role "student"
  board: Board | null; gradeLevel: number | null;
  examTracks: ExamTrack[];
  parentUserId: string | null;                // REQUIRED when isMinor
  isMinor: boolean;
}
export interface ParentGuardian { userId: string; verifiedAt: string | null;
                                  verificationMethod: "otp" | "digilocker" | "consent_manager" | null; }
/** DPDP Act 2023: verifiable parental consent BEFORE any collection beyond identifying the parent. */
export interface ConsentRecord {
  consentId: string; studentUserId: string; parentUserId: string;
  purpose: "account" | "learning_data" | "ai_processing" | "voice_audio" | "call_recording";
  status: "granted" | "withdrawn" | "pending";
  grantedAt: string | null; withdrawnAt: string | null;
  method: "otp" | "digilocker" | "consent_manager"; evidenceRef: string | null;
}

// ═══ COMMERCE (was missing entirely — RED_TEAM #2) ═════════════════
export type PlanTier = "free" | "plus";
export interface Subscription {
  subscriptionId: string; userId: string; tier: PlanTier;
  status: "active" | "past_due" | "cancelled" | "paused";
  gatewaySubscriptionId: string;              // Razorpay Subscriptions / UPI Autopay mandate
  currentPeriodEnd: string;
  cancelledAt: string | null;                 // mandate cancellation, per lane E §3.2
}
export interface Entitlement {                // evaluated server-side, never trusted from the client
  userId: string;
  practiceQuestionsPerDay: number | null;     // null = unlimited
  tutorMessagesPerDay: number | null;
  pdfExportEnabled: boolean;
  callCreditsRemaining: number;
}

// ═══ PERSONAL LAYER (lane B's two-layer model — RED_TEAM #6) ═══════
export interface PersonalAnnotation {
  annotationId: string; studentId: string;
  noteId: string; blockId: string;            // anchors to the IMMUTABLE blockId invariant
  kind: "highlight" | "note" | "bookmark";
  rangeStart?: number; rangeEnd?: number; body?: string; colour?: string;
  sourceVersion: number;                      // note version this was made against
  status: "active" | "orphaned";              // orphaned when its block is deleted — surfaced, never dropped
  createdAt: string; updatedAt: string;
}

// ═══ MISCONCEPTIONS (referenced everywhere, defined nowhere — RED_TEAM #7) ═══
export interface Misconception {
  misconceptionId: string; slug: string; title: string;
  description: string;                        // what the student wrongly believes
  skillIds: string[];
  remediationBlockId: string | null;          // the note block that fixes it
  source: "eedi" | "authored";                // Eedi/NeurIPS Diagnostic Questions seed, per lane D
}
```

**Teacher / AvailabilitySlot / Booking** are defined in `research/E_india_ops_and_market.md` §5.3 and are
adopted unchanged **except** that `Teacher.userId` now resolves to the `User` entity above, and
`Booking.studentId` to `Student`. They are not restated here; lane E is authoritative for that subsystem.

## Consequences

1. **`AttemptEvent` is a launch blocker, not a v2 nicety.** The frontend is built first; if these fields
   are not emitted from day one, the adaptive engine cannot be retrofitted onto history that was never
   captured. `selectionPropensity` and `policyVersion` cost nothing now and are the only thing making
   lane C's v3 bandit upgrade possible without a rewrite.
2. **`blockId` immutability is a hard invariant** with a test, not a convention. The entire personal
   annotation layer hangs off it.
3. **One grading enum.** Any lane file showing a different one is superseded by this document.
4. Adding a second board is a `CurriculumPlacement` insert, never a skill duplication.
5. `Skill.contentRefs` is deleted; skill→content is a derived index rebuilt at publish.

## Open questions
- Should `Exam` scope be `syllabusSkillIds` (explicit) or derived from `CurriculumPlacement`
  (`isCore: true` for a board+grade)? Derived is less to author and harder to override. Leaning derived
  with an explicit exclusion list.
- State boards are enumerated in `Board` as a growing union. If more than ~5 ship, move to a table.
