import type { AppRepository, AttemptEvent, Booking, DashboardData, Exam, GradeResult, GradingService, LearningCalendarEvent, NoteDocument, Question, QuestionComment, ServiceRegistry, SurfaceData, Teacher, TopicSummary, TutorChunk, UserRole } from "@vidya/contracts";

const band = (mastery: number): TopicSummary["band"] => mastery >= 85 ? "mastered" : mastery >= 65 ? "secure" : mastery >= 35 ? "developing" : "starting";
const topic = (grade: 5 | 6 | 7 | 8, index: number, title: string, mastery: number): TopicSummary => ({
  skill: { id: `g${grade}-s${index}`, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, subject: "maths", description: `Build confidence with ${title.toLowerCase()} through short explanations and deliberate practice.`, seedDifficulty: 900 + grade * 45 + index * 12 },
  mastery, band: band(mastery), dueCards: (index + grade) % 5, lastStudiedAt: index % 2 ? "Yesterday" : "3 days ago"
});

const curriculum = [
  { grade: 5 as const, names: [["Numbers and Operations", ["Large Numbers", "Factors and Multiples", "Fractions", "Decimals"]], ["Shapes and Measures", ["Angles and Shapes", "Perimeter and Area", "Volume", "Data Handling"]]] },
  { grade: 6 as const, names: [["Number Foundations", ["Knowing Our Numbers", "Whole Numbers", "Integers", "Fractions and Decimals"]], ["Geometry and Algebra", ["Basic Shapes", "Mensuration", "Introduction to Algebra", "Data Handling"]]] },
  { grade: 7 as const, names: [["Numbers and Relationships", ["Integers", "Fractions and Decimals", "Rational Numbers", "Comparing Quantities"]], ["Patterns and Space", ["Simple Equations", "Lines and Angles", "Triangles", "Perimeter and Area"]]] },
  { grade: 8 as const, names: [["Algebra and Numbers", ["Rational Numbers", "Linear Equations", "Squares and Square Roots", "Comparing Quantities"]], ["Geometry and Data", ["Understanding Quadrilaterals", "Mensuration", "Data Handling", "Graphs"]]] }
].map(({ grade, names }) => ({ grade, chapters: names.map(([title, topics], chapterIndex) => ({ id: `g${grade}-c${chapterIndex + 1}`, title: title as string, topics: (topics as string[]).map((name, index) => topic(grade, chapterIndex * 4 + index + 1, name, 24 + ((grade * 11 + index * 17 + chapterIndex * 13) % 70))) })) }));

const currentTopic = curriculum[2]!.chapters[1]!.topics[0]!;
const exam: Exam = { examId: "exam-annual", title: "School annual mathematics exam", board: "CBSE", gradeLevel: 7, examDate: "2026-03-14", origin: "parent", createdByUserId: "parent-1", ownerStudentId: "student-1", includeSkillIds: [], excludeSkillIds: [] };

const questions: Question[] = [
  {
    questionId: "q-linear-1", type: "algebraic_expression", skillId: currentTopic.skill.id, skillCode: "7A.04", skillTitle: "Solve a one-step equation", prompt: "Make x the subject of the formula:", promptLatex: "x - 5 = 9y", staticPrefixLatex: "x =", answerExpression: "9y+5", acceptanceRule: { method: "cas_equivalence" }, hints: ["Notice which operation is being applied to x.", "Use the inverse operation on both sides of the equation."], maxAttempts: 3,
    workedSolution: [
      { stepId: "s1", reason: "Add 5 to both sides to keep the equation balanced.", beforeLatex: "x-5=9y", annotation: "+5 on both sides", afterLatex: "x=9y+5" },
      { stepId: "s2", reason: "The variable is now isolated, so write the final answer clearly.", afterLatex: "x=9y+5" }
    ]
  },
  { questionId: "q-fraction-1", type: "numeric_entry", skillId: "g6-s4", skillCode: "6N.12", skillTitle: "Add fractions", prompt: "Write the answer in its simplest form.", promptLatex: "\\frac{1}{4}+\\frac{2}{4}", answerExpression: "3/4", acceptanceRule: { method: "numeric_tolerance" }, hints: ["The denominators are already the same.", "Add the numerators and keep the common denominator."], maxAttempts: 3, workedSolution: [{ stepId: "s1", reason: "Add the numerators because the parts are the same size.", afterLatex: "\\frac{1+2}{4}=\\frac{3}{4}" }] },
  { questionId: "q-percent-1", type: "numeric_entry", skillId: "g7-s4", skillCode: "7P.03", skillTitle: "Find a percentage", prompt: "What is 25% of 80?", answerExpression: "20", acceptanceRule: { method: "numeric_tolerance" }, hints: ["25% is one quarter.", "Divide 80 into four equal parts."], maxAttempts: 3, workedSolution: [{ stepId: "s1", reason: "Rewrite 25% as one quarter.", afterLatex: "25\\%=\\frac14" }, { stepId: "s2", reason: "Find one quarter of 80.", afterLatex: "80\\div4=20" }] }
];

const note: NoteDocument = { noteId: "note-lines", schemaVersion: 1, type: "doc", title: "Lines and angles", status: "published", content: [
  { type: "heading", attrs: { blockId: "b1", skillTags: [currentTopic.skill.id], level: 1 }, text: "Angles tell us how far a line turns" },
  { type: "paragraph", attrs: { blockId: "b2", skillTags: [currentTopic.skill.id] }, text: "An angle is formed where two rays meet. We name the meeting point the vertex." },
  { type: "math", attrs: { blockId: "b3", skillTags: [currentTopic.skill.id] }, latex: "\\angle ABC = 90^{\\circ}" },
  { type: "callout", attrs: { blockId: "b4", skillTags: [currentTopic.skill.id] }, text: "A right angle is exactly one quarter of a full turn." },
  { type: "worked_example", attrs: { blockId: "b5", skillTags: [currentTopic.skill.id] }, text: "If two angles on a straight line total 180° and one is 65°, the other is 115°." }
] };

const surfaces: Record<string, SurfaceData> = {
  progress: { eyebrow: "Learning insight", title: "Your progress", description: "See what is secure, what is growing, and where to spend the next ten minutes.", primaryAction: "View weekly report", metrics: [{ label: "Mastery", value: "68%", detail: "+7% this month", tone: "success" }, { label: "Study time", value: "4h 20m", detail: "This week" }, { label: "Skills secured", value: "34", detail: "of 52 started" }], items: [{ id: "p1", title: "Fractions and decimals", meta: "Strong improvement", value: "+14%", progress: 78 }, { id: "p2", title: "Lines and angles", meta: "Ready for practice", value: "62%", progress: 62 }, { id: "p3", title: "Rational numbers", meta: "Review recommended", value: "41%", progress: 41 }] },
  flashcards: { eyebrow: "Spaced review", title: "Flashcards", description: "A short review now keeps important ideas available later.", primaryAction: "Review 12 cards", metrics: [{ label: "Due now", value: "12", tone: "warning" }, { label: "Remembered", value: "86%", tone: "success" }, { label: "Review streak", value: "6 days" }], items: [{ id: "f1", title: "Angle relationships", meta: "4 cards due", progress: 72 }, { id: "f2", title: "Fraction operations", meta: "5 cards due", progress: 66 }, { id: "f3", title: "Simple equations", meta: "3 cards due", progress: 81 }] },
  assessment: { eyebrow: "Assessment", title: "Chapter check", description: "Ten questions, one attempt each. Hints stay hidden until you finish.", primaryAction: "Start assessment", metrics: [{ label: "Questions", value: "10" }, { label: "Time", value: "25 min" }, { label: "Best score", value: "—" }], items: questions.map((q, index) => ({ id: q.questionId, title: `Question ${index + 1}`, meta: q.skillTitle, status: "Not started" })) },
  "assessment-review": { eyebrow: "Assessment complete", title: "Review your method", description: "Your score is useful; the mistakes tell you what to learn next.", primaryAction: "Practise weak skills", metrics: [{ label: "Score", value: "8/10", tone: "success" }, { label: "Accuracy", value: "80%" }, { label: "Time", value: "18m" }], items: [{ id: "r1", title: "Questions 1–6", meta: "Correct", status: "Secure", progress: 100 }, { id: "r2", title: "Question 7", meta: "Sign error in an equation", status: "Review", progress: 45 }, { id: "r3", title: "Question 9", meta: "Area unit missing", status: "Review", progress: 45 }] },
  diagnostic: { eyebrow: "Starting point", title: "Find the right level", description: "A short, no-pressure check helps us choose where your learning path begins.", primaryAction: "Begin diagnostic", metrics: [{ label: "Questions", value: "12–18" }, { label: "Typical time", value: "15 min" }, { label: "Hints", value: "After completion" }], items: [{ id: "d1", title: "Number sense", meta: "Adapts as you answer" }, { id: "d2", title: "Geometry", meta: "Adapts as you answer" }, { id: "d3", title: "Patterns", meta: "Adapts as you answer" }] },
  settings: { eyebrow: "Account", title: "Settings", description: "Keep learning comfortable and your information under your control.", primaryAction: "Save changes", metrics: [], items: [{ id: "s1", title: "Appearance", meta: "Light, dark, or device setting", value: "System" }, { id: "s2", title: "Language", meta: "English ships first; Hindi is prepared", value: "English" }, { id: "s3", title: "Grade and board", meta: "CBSE curriculum", value: "Class 7" }, { id: "s4", title: "Notifications", meta: "Study reminders and teacher calls", value: "On" }] },
  upgrade: { eyebrow: "VIDYA Plus", title: "Learn without limits", description: "Full adaptive practice, unlimited tutor help, and detailed progress for families.", primaryAction: "Choose annual · ₹2,499", metrics: [{ label: "Monthly", value: "₹299" }, { label: "Annual", value: "₹2,499", detail: "Save ₹1,089", tone: "success" }, { label: "Teacher call", value: "₹599", detail: "30 minutes" }], items: [{ id: "u1", title: "Adaptive daily practice", meta: "Included in Plus", status: "Included" }, { id: "u2", title: "Unlimited AI tutor", meta: "Grounded in your notes", status: "Included" }, { id: "u3", title: "Teacher calls", meta: "Purchased separately", status: "Credits" }] },
  "parent-overview": { eyebrow: "Parent overview", title: "Aarav is building steady momentum", description: "A compact view of progress, goals, upcoming calls, and permissions.", primaryAction: "Set an exam goal", metrics: [{ label: "Weekly goal", value: "4/5 days", tone: "success" }, { label: "Mastery", value: "68%" }, { label: "Next call", value: "Tue 6:00" }], items: [{ id: "po1", title: "Consent and privacy", meta: "Learning data consent is active", status: "Verified" }, { id: "po2", title: "Annual exam goal", meta: "14 March · 42 skills in scope", status: "On track" }, { id: "po3", title: "VIDYA Plus", meta: "Renews 12 October", status: "Active" }] },
  "teacher-classes": { eyebrow: "Teaching", title: "Classes and students", description: "Move from a class-level signal to the exact skill where a student needs help.", primaryAction: "Create class", metrics: [{ label: "Classes", value: "3" }, { label: "Students", value: "74" }, { label: "Needs attention", value: "9", tone: "warning" }], items: [{ id: "tc1", title: "Class 7 · Batch A", meta: "28 students", value: "71%", progress: 71 }, { id: "tc2", title: "Class 6 · Batch B", meta: "24 students", value: "65%", progress: 65 }, { id: "tc3", title: "Class 8 · Foundation", meta: "22 students", value: "73%", progress: 73 }] },
  "teacher-assignments": { eyebrow: "Assignments", title: "Set focused practice", description: "Choose skills, preview questions, and give every learner work at the right level.", primaryAction: "New assignment", metrics: [{ label: "Active", value: "5" }, { label: "Due this week", value: "3" }, { label: "Average completion", value: "76%" }], items: [{ id: "ta1", title: "Solving simple equations", meta: "Class 7A · Due Friday", progress: 82 }, { id: "ta2", title: "Fractions checkpoint", meta: "Class 6B · Due tomorrow", progress: 64 }, { id: "ta3", title: "Mensuration review", meta: "Class 8 · Due Monday", progress: 41 }] },
  "teacher-availability": { eyebrow: "Teacher calls", title: "Availability and bookings", description: "Protect preparation time while making the next useful slot easy to book.", primaryAction: "Add availability", metrics: [{ label: "Open slots", value: "8" }, { label: "Booked", value: "4" }, { label: "This week", value: "₹1,000" }], items: [{ id: "av1", title: "Aarav Sharma", meta: "Today · 6:00 PM · Equations", status: "Confirmed" }, { id: "av2", title: "Diya Menon", meta: "Tomorrow · 5:30 PM · Fractions", status: "Confirmed" }, { id: "av3", title: "Open slot", meta: "Saturday · 11:00 AM", status: "Available" }] },
  "author-library": { eyebrow: "Content studio", title: "Curriculum library", description: "Organise content by grade and publishing state—not by whichever file changed most recently.", primaryAction: "New teaching note", metrics: [{ label: "Published", value: "46", tone: "success" }, { label: "In review", value: "8", tone: "warning" }, { label: "Drafts", value: "13" }], items: [{ id: "al1", title: "Class 5 · Fractions", meta: "8 notes · 42 questions", status: "Published" }, { id: "al2", title: "Class 6 · Integers", meta: "5 notes · 31 questions", status: "In review" }, { id: "al3", title: "Class 7 · Simple equations", meta: "7 notes · 38 questions", status: "Published" }, { id: "al4", title: "Class 8 · Linear equations", meta: "6 notes · 29 questions", status: "Draft" }] },
  "author-review": { eyebrow: "Human approval gate", title: "Review before students see it", description: "Check mathematical accuracy, source context, and the pedagogical shape of every generated item.", primaryAction: "Review next item", metrics: [{ label: "Waiting", value: "18", tone: "warning" }, { label: "Approved today", value: "9", tone: "success" }, { label: "Returned", value: "3" }], items: [{ id: "ar1", title: "Concept cards · Rational numbers", meta: "58% concept · 14% cloze · 6% MCQ", status: "Mix passes" }, { id: "ar2", title: "Worked solution · Linear equations", meta: "100 parameter seeds validated", status: "Needs review" }, { id: "ar3", title: "Question set · Comparing quantities", meta: "2 hints + step solution present", status: "Ready" }] },
  "author-questions": { eyebrow: "Question bank", title: "Questions, answer rules, and solutions", description: "Every question carries a grading contract, two hints, and a reviewed worked method.", primaryAction: "Create question", metrics: [{ label: "Published", value: "312" }, { label: "Parameterised", value: "164" }, { label: "Needs review", value: "21", tone: "warning" }], items: questions.map((q) => ({ id: q.questionId, title: q.skillTitle, meta: `${q.acceptanceRule.method} · ${q.maxAttempts} attempts`, status: "Published" })) },
  "author-ingest": { eyebrow: "Ingest", title: "Turn supplied material into a structured draft", description: "Upload is a starting point. Nothing reaches a student before an author reviews it.", primaryAction: "Upload source", metrics: [{ label: "Processing", value: "2" }, { label: "Ready to review", value: "5" }, { label: "Published automatically", value: "0", tone: "success" }], items: [{ id: "ai1", title: "Class 7 workshop notes.pdf", meta: "18 blocks · 12 suggested cards", status: "Ready" }, { id: "ai2", title: "Fractions examples.pdf", meta: "OCR and structure pass", status: "Processing" }] }
};

const teachers: Teacher[] = [
  { teacherId: "teacher-1", userId: "user-t1", displayName: "Meera Iyer", credentials: "M.Sc. Mathematics · CBSE specialist", yearsExperience: 9, rating: 4.9, nextAvailableAt: "Today · 6:00 PM" },
  { teacherId: "teacher-2", userId: "user-t2", displayName: "Rohan Gupta", credentials: "B.Ed. · Foundation mathematics", yearsExperience: 7, rating: 4.8, nextAvailableAt: "Tomorrow · 5:30 PM" },
  { teacherId: "teacher-3", userId: "user-t3", displayName: "Nandini Rao", credentials: "M.Sc. · Learning support", yearsExperience: 11, rating: 4.9, nextAvailableAt: "Saturday · 11:00 AM" }
];
const bookings: Booking[] = [{ bookingId: "booking-1", teacherId: "teacher-1", studentId: "student-1", startsAt: "2026-09-01T18:00:00+05:30", status: "confirmed", weakSkillIds: [currentTopic.skill.id], joinUrl: "#mock-call" }];
const calendarEvents: LearningCalendarEvent[] = [
  { id: "event-1", title: "Fractions checkpoint", date: "2026-09-03", time: "9:00 AM", kind: "assignment", detail: "Class 7 · 12 questions" },
  { id: "event-2", title: "Lines & angles review", date: "2026-09-08", time: "5:30 PM", kind: "study", detail: "20-minute focused plan" },
  { id: "event-3", title: "Call with Meera", date: "2026-09-12", time: "6:00 PM", kind: "teacher", detail: "Simple equations · 30 minutes" },
  { id: "event-4", title: "School maths exam", date: "2026-09-24", time: "10:00 AM", kind: "exam", detail: "Term assessment · Chapters 1–6" },
  { id: "event-5", title: "Flashcard catch-up", date: "2026-09-17", time: "5:00 PM", kind: "study", detail: "14 cards due" }
];
const savedAttempts: AttemptEvent[] = [];
const savedComments: QuestionComment[] = [];

export class FixtureRepository implements AppRepository {
  async getDashboard(): Promise<DashboardData> { return { studentName: "Aarav", gradeLevel: 7, dailyGoalMinutes: 25, completedMinutes: 10, streakDays: 6, averageMastery: 68, dueCards: 12, exam, continueTopic: currentTopic, recommendations: [curriculum[2]!.chapters[0]!.topics[3]!, curriculum[2]!.chapters[1]!.topics[1]!] }; }
  async getCurriculum() { return curriculum; }
  async getTopic(skillId: string) { return curriculum.flatMap((g) => g.chapters).flatMap((c) => c.topics).find((t) => t.skill.id === skillId) ?? currentTopic; }
  async getNote() { return note; }
  async getPracticeQuestions() { return questions; }
  async getSurface(surfaceId: string, role: UserRole) { return surfaces[surfaceId] ?? { eyebrow: role === "teacher" ? "Teacher workspace" : role === "author" ? "Content studio" : "VIDYA", title: surfaceId.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "), description: "This workflow is ready for review with schema-shaped mock data.", primaryAction: "Continue", metrics: [], items: [] }; }
  async getTeachers() { return teachers; }
  async getBookings() { return bookings; }
  async getExams() { return [exam]; }
  async getCalendarEvents() { return calendarEvents; }
  async saveAttempt(event: AttemptEvent) { savedAttempts.push(event); }
  async saveQuestionComment(comment: QuestionComment) { savedComments.push(comment); }
}

class MockGrading implements GradingService {
  async grade(question: Question, answer: string): Promise<GradeResult> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const normal = answer.replace(/\s/g, "").toLowerCase();
    const expected = question.answerExpression.replace(/\s/g, "").toLowerCase();
    const equivalent = question.questionId === "q-linear-1" && ["9y+5", "5+9y"].includes(normal);
    const isCorrect = normal === expected || equivalent;
    return { isCorrect, gradingMethod: question.acceptanceRule.method, feedback: isCorrect ? "That is mathematically equivalent. Nice, clear work." : "Not yet. Check the operation you need to undo.", status: "graded" };
  }
}

class MockTutor {
  async *stream(): AsyncIterable<TutorChunk> {
    for (const value of ["Let’s ", "look at the relationship ", "between the two quantities first. ", "What operation is currently attached to x?"]) { await new Promise((resolve) => setTimeout(resolve, 120)); yield { type: "token", value }; }
    yield { type: "citation", value: "Lines and angles · Note 2", blockId: "b2" };
    yield { type: "done", value: "" };
  }
}

const repository = new FixtureRepository();
export const services: ServiceRegistry = {
  repository, grading: new MockGrading(), selection: { selectPractice: () => repository.getPracticeQuestions() }, tutor: new MockTutor(),
  booking: { async hold() { return { holdId: "hold-mock", expiresAt: new Date(Date.now() + 300000).toISOString() }; } },
  payment: { async createCheckout() { return { checkoutId: "checkout-mock", status: "mock" }; } }
};
