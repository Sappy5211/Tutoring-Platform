export type Id = string;
export type GradeLevel = 5 | 6 | 7 | 8;
export type UserRole = "student" | "parent" | "teacher" | "author" | "admin";
export type MasteryBand = "starting" | "developing" | "secure" | "mastered";
export type PublishStatus = "ai_draft" | "in_review" | "published" | "archived";
export type GradingMethod = "exact" | "numeric_tolerance" | "cas_equivalence" | "llm_rubric" | "manual";
export type MasteryEvidence = "positive" | "negative" | "excluded";

export interface User {
  userId: Id;
  role: UserRole;
  displayName: string;
  phone?: string;
  email?: string;
  locale: "en-IN" | "hi-IN";
}

export interface Student {
  studentId: Id;
  board: "CBSE";
  gradeLevel: GradeLevel;
  isMinor: true;
}

export interface GuardianLink {
  guardianUserId: Id;
  studentId: Id;
  relationship: "parent" | "guardian";
  isPrimary: boolean;
  status: "pending" | "verified" | "revoked";
}

export interface ConsentRecord {
  consentId: Id;
  studentUserId: Id;
  parentUserId: Id;
  purpose: "account" | "learning_data" | "ai_processing" | "voice_audio" | "call_recording";
  status: "granted" | "withdrawn" | "pending";
  grantedAt: string | null;
}

/** ADR-008. Class 6-8 CBSE teaches Mathematics and Science as single subjects;
 *  Physics/Chemistry/Biology only separate from Class 11. They are modelled here
 *  so the switcher and pricing can show them, but they are grade-gated, not
 *  plan-gated, at launch. */
export type Subject =
  | "maths"
  | "science"
  | "physics"
  | "chemistry"
  | "biology";

export type SubjectAccess =
  /** In the student's plan and available at their grade. */
  | { state: "unlocked" }
  /** Available at this grade, but not in the student's plan. Sells. */
  | { state: "locked_plan"; requiredTier: PlanTier }
  /** In the plan or not, the curriculum does not cover it at this grade yet.
   *  Deliberately NOT an upsell - it is not for sale at Class 6-8. */
  | { state: "locked_grade"; availableFromGrade: number };

export type PlanTier = "free" | "single_subject" | "all_subjects";

export interface SubjectEntitlement {
  subject: Subject;
  access: SubjectAccess;
}

export interface Entitlement {
  userId: Id;
  tier: PlanTier;
  /** Server-evaluated. Never trust a client-side copy of this for gating
   *  anything that costs money or exposes paid content. */
  subjects: SubjectEntitlement[];
  practiceQuestionsPerDay: number | null;
  tutorMessagesPerDay: number | null;
  pdfExportEnabled: boolean;
  callCreditsRemaining: number;
}

/* ── Flashcards (ADR-003 deck split, ADR-009 import, P3 Anki mechanics) ── */

export type CardType =
  | "basic" | "concept" | "descriptor" | "cloze" | "multiple_choice" | "image_occlusion";

/** ADR-003 + ADR-009. Only "mastery" updates pMastery: exam-rehearsal MCQs can be
 *  answered by elimination, and imported decks pass no quality gate and carry no
 *  skillTags, so neither is evidence of understanding. */
export type DeckKind = "mastery" | "exam_rehearsal" | "personal_import";

export interface Flashcard {
  flashcardId: Id;
  type: CardType;
  deck: DeckKind;
  direction: "forward" | "reverse" | "both" | "none";
  enabled: boolean;
  front: string;
  back: string;
  /** LaTeX rendered with KaTeX; plain prose stays in front/back. */
  frontLatex?: string;
  backLatex?: string;
  /** Cards generated from the same note block are siblings and are buried
   *  together for the session - see P3 section 3. Matters more here than in Anki
   *  because our cards are auto-generated, so one block yields near-duplicates. */
  sourceBlockId?: Id;
  skillIds: Id[];
  status: PublishStatus;
}

export type CardPhase = "new" | "learning" | "review" | "relearning";
/** Again / Hard / Good / Easy - keyboard 1-4, matching the convention students
 *  who already use Anki will know. */
export type ReviewRating = 1 | 2 | 3 | 4;

export interface CardState {
  studentId: Id;
  flashcardId: Id;
  stability: number;
  difficulty: number;
  due: string;
  lastReview: string | null;
  reps: number;
  lapses: number;
  phase: CardPhase;
  /** Hidden until end of day (bury) or until released (suspend). */
  buriedUntil: string | null;
  suspended: boolean;
  /** P3 section 4: at threshold we do NOT suspend like Anki does - that would
   *  silently drop required syllabus. We route it to a teacher instead. */
  isLeech: boolean;
  flaggedForHelp: boolean;
}

export interface ReviewLogEntry {
  reviewId: Id;
  studentId: Id;
  flashcardId: Id;
  rating: ReviewRating;
  reviewedAt: string;
  elapsedMs: number;
  phaseBefore: CardPhase;
  scheduledDays: number;
}

export interface QueueCounts { newCards: number; learning: number; review: number }

export interface Skill {
  id: Id;
  slug: string;
  title: string;
  subject: Subject;
  description: string;
  seedDifficulty: number;
}

export interface Chapter {
  id: Id;
  title: string;
  board: "CBSE";
  gradeLevel: GradeLevel;
  subject: Subject;
  sequence: number;
}

export interface CurriculumPlacement {
  id: Id;
  skillId: Id;
  board: "CBSE";
  gradeLevel: GradeLevel;
  chapterId: Id;
  sequenceInChapter: number;
  isCore: boolean;
}

export interface SkillEdge {
  id: Id;
  fromSkillId: Id;
  toSkillId: Id;
  type: "prerequisite" | "encompasses";
  weight: number;
  required: boolean;
  curriculumScope: { board: "CBSE" | null; gradeLevel: GradeLevel | null } | null;
}

export interface TopicSummary {
  skill: Skill;
  mastery: number;
  band: MasteryBand;
  dueCards: number;
  lastStudiedAt?: string;
}

export interface NoteBlock {
  type: "paragraph" | "heading" | "math" | "worked_example" | "callout";
  attrs: { blockId: Id; skillTags?: Id[]; level?: number };
  text?: string;
  latex?: string;
}

export interface NoteDocument {
  noteId: Id;
  schemaVersion: 1;
  title: string;
  type: "doc";
  content: NoteBlock[];
  status: PublishStatus;
}

export type QuestionType = "mcq" | "numeric_entry" | "algebraic_expression" | "multi_step_working" | "matching" | "ordering" | "graph_interaction";

export interface SolutionStep {
  stepId: Id;
  reason: string;
  beforeLatex?: string;
  annotation?: string;
  afterLatex?: string;
}

export interface Question {
  questionId: Id;
  type: QuestionType;
  skillId: Id;
  skillCode: string;
  skillTitle: string;
  prompt: string;
  promptLatex?: string;
  staticPrefixLatex?: string;
  answerExpression: string;
  acceptanceRule: { method: GradingMethod; tolerance?: number };
  options?: Array<{ optionId: Id; label: string }>;
  hints: [string, string];
  workedSolution: SolutionStep[];
  maxAttempts?: number;
}

export interface AttemptEvent {
  eventId: Id;
  studentId: Id;
  itemType: "practice_question" | "flashcard" | "diagnostic" | "assessment";
  questionId?: Id;
  flashcardId?: Id;
  skillIds: Id[];
  isCorrect: boolean;
  gradingMethod: GradingMethod;
  rawAnswer: string;
  timeToAnswerMs: number;
  hintsUsed: number;
  maxHintLevelReached: 0 | 1 | 2;
  hintBeforeFirstAttempt: boolean;
  solutionViewed: boolean;
  solutionStepsRevealed: number;
  attemptNumber: number;
  masteryEvidence: MasteryEvidence;
  exclusionReason?: "subsequent_attempt" | "too_fast" | "assessment_review" | "manual";
  selectionPolicy: "diagnostic" | "graph_frontier" | "srs_due" | "bandit" | "manual";
  selectionPropensity: number | null;
  policyVersion: string;
  clientTs: string;
  serverTs: string;
}

export interface QuestionComment {
  commentId: Id;
  studentId: Id;
  questionId: Id;
  attemptEventId: Id;
  body: string;
  createdAt: string;
  status: "open" | "shared_with_teacher" | "resolved";
}

export interface Exam {
  examId: Id;
  title: string;
  board: "CBSE";
  gradeLevel: GradeLevel;
  examDate: string;
  origin: "platform" | "student" | "parent";
  createdByUserId: Id;
  ownerStudentId: Id | null;
  includeSkillIds: Id[];
  excludeSkillIds: Id[];
}

export interface Classroom {
  classroomId: Id;
  teacherId: Id;
  name: string;
  gradeLevel: GradeLevel;
  studentCount: number;
}

export interface Assignment {
  assignmentId: Id;
  classroomId: Id;
  teacherId: Id;
  title: string;
  skillIds: Id[];
  dueAt: string;
  status: "draft" | "assigned" | "closed";
  completionPercent: number;
}

export interface Teacher {
  teacherId: Id;
  userId: Id;
  displayName: string;
  credentials: string;
  yearsExperience: number;
  rating: number;
  nextAvailableAt: string;
}

export interface Booking {
  bookingId: Id;
  teacherId: Id;
  studentId: Id;
  startsAt: string;
  status: "held" | "confirmed" | "completed" | "cancelled" | "no_show";
  weakSkillIds: Id[];
  joinUrl?: string;
}

export type LearningEventKind = "exam" | "study" | "assignment" | "teacher";
export interface LearningCalendarEvent {
  id: Id;
  title: string;
  date: string;
  time?: string;
  kind: LearningEventKind;
  detail: string;
}

export interface SurfaceMetric { label: string; value: string; detail?: string; tone?: "primary" | "success" | "warning" | "neutral" }
export interface SurfaceItem { id: Id; title: string; meta: string; value?: string; status?: string; progress?: number }
export interface SurfaceData {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: string;
  metrics: SurfaceMetric[];
  items: SurfaceItem[];
}

export interface DashboardData {
  studentName: string;
  gradeLevel: GradeLevel;
  dailyGoalMinutes: number;
  completedMinutes: number;
  streakDays: number;
  averageMastery: number;
  dueCards: number;
  exam: Exam;
  continueTopic: TopicSummary;
  recommendations: TopicSummary[];
}

export interface GradeResult {
  isCorrect: boolean;
  gradingMethod: GradingMethod;
  feedback: string;
  status: "graded" | "needs_human_review" | "timeout" | "error";
}

export interface TutorChunk { type: "token" | "citation" | "done"; value: string; blockId?: Id }
