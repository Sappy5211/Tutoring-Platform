import type { AttemptEvent, Booking, DashboardData, Exam, GradeResult, LearningCalendarEvent, NoteDocument, Question, QuestionComment, SurfaceData, Teacher, TopicSummary, TutorChunk, UserRole } from "./model";

export interface AppRepository {
  getDashboard(): Promise<DashboardData>;
  getCurriculum(): Promise<Array<{ grade: 5 | 6 | 7 | 8; chapters: Array<{ id: string; title: string; topics: TopicSummary[] }> }>>;
  getTopic(skillId: string): Promise<TopicSummary>;
  getNote(noteId: string): Promise<NoteDocument>;
  getPracticeQuestions(): Promise<Question[]>;
  getSurface(surfaceId: string, role: UserRole): Promise<SurfaceData>;
  getTeachers(): Promise<Teacher[]>;
  getBookings(): Promise<Booking[]>;
  getExams(): Promise<Exam[]>;
  getCalendarEvents(): Promise<LearningCalendarEvent[]>;
  saveAttempt(event: AttemptEvent): Promise<void>;
  saveQuestionComment(comment: QuestionComment): Promise<void>;
}

export interface GradingService { grade(question: Question, answer: string): Promise<GradeResult> }
export interface SelectionService { selectPractice(studentId: string, skillId?: string): Promise<Question[]> }
export interface TutorService { stream(message: string): AsyncIterable<TutorChunk> }
export interface BookingService { hold(teacherId: string, startsAt: string): Promise<{ holdId: string; expiresAt: string }> }
export interface PaymentService { createCheckout(productId: string): Promise<{ checkoutId: string; status: "mock" }> }

export interface ServiceRegistry {
  repository: AppRepository;
  grading: GradingService;
  selection: SelectionService;
  tutor: TutorService;
  booking: BookingService;
  payment: PaymentService;
}
