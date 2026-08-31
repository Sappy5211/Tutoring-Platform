import { boolean, date, integer, jsonb, pgEnum, pgTable, primaryKey, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["student", "parent", "teacher", "author", "admin"]);
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), role: roleEnum("role").notNull(), displayName: text("display_name").notNull(),
  phone: text("phone"), email: text("email"), locale: text("locale").notNull().default("en-IN"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
export const students = pgTable("students", {
  id: uuid("id").primaryKey().references(() => users.id), board: text("board").notNull().default("CBSE"), gradeLevel: integer("grade_level").notNull(), isMinor: boolean("is_minor").notNull().default(true)
});
export const guardianLinks = pgTable("guardian_links", {
  guardianUserId: uuid("guardian_user_id").references(() => users.id).notNull(), studentId: uuid("student_id").references(() => students.id).notNull(),
  relationship: text("relationship").notNull(), isPrimary: boolean("is_primary").notNull().default(false), status: text("status").notNull().default("pending")
}, (t) => [primaryKey({ columns: [t.guardianUserId, t.studentId] })]);
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey(), title: text("title").notNull(), board: text("board").notNull(), gradeLevel: integer("grade_level").notNull(), subject: text("subject").notNull(), sequence: integer("sequence").notNull()
});
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey(), slug: text("slug").notNull().unique(), title: text("title").notNull(), subject: text("subject").notNull(), description: text("description").notNull(), seedDifficulty: real("seed_difficulty").notNull().default(1200)
});
export const curriculumPlacements = pgTable("curriculum_placements", {
  id: uuid("id").primaryKey(), skillId: uuid("skill_id").references(() => skills.id).notNull(), chapterId: uuid("chapter_id").references(() => chapters.id).notNull(), board: text("board").notNull(), gradeLevel: integer("grade_level").notNull(), sequenceInChapter: integer("sequence_in_chapter").notNull(), isCore: boolean("is_core").notNull().default(true)
});
export const skillEdges = pgTable("skill_edges", {
  id: uuid("id").primaryKey(), fromSkillId: uuid("from_skill_id").references(() => skills.id).notNull(), toSkillId: uuid("to_skill_id").references(() => skills.id).notNull(), type: text("type").notNull(), weight: real("weight").notNull(), required: boolean("required").notNull(), curriculumScope: jsonb("curriculum_scope")
});
export const noteVersions = pgTable("note_versions", {
  noteId: uuid("note_id").notNull(), version: integer("version").notNull(), status: text("status").notNull(), contentSnapshot: jsonb("content_snapshot").notNull(), publishedAt: timestamp("published_at", { withTimezone: true })
}, (t) => [primaryKey({ columns: [t.noteId, t.version] })]);
export const noteBlockRegistry = pgTable("note_block_registry", {
  blockId: uuid("block_id").primaryKey(), noteId: uuid("note_id").notNull(), firstVersion: integer("first_version").notNull(), retiredAt: timestamp("retired_at", { withTimezone: true })
});
export const exams = pgTable("exams", {
  id: uuid("id").primaryKey(), title: text("title").notNull(), board: text("board").notNull(), gradeLevel: integer("grade_level").notNull(), examDate: date("exam_date").notNull(), origin: text("origin").notNull(), createdByUserId: uuid("created_by_user_id").references(() => users.id).notNull(), ownerStudentId: uuid("owner_student_id").references(() => students.id), includeSkillIds: jsonb("include_skill_ids").notNull().default([]), excludeSkillIds: jsonb("exclude_skill_ids").notNull().default([])
});
export const attemptEvents = pgTable("attempt_events", {
  id: uuid("id").primaryKey(), studentId: uuid("student_id").references(() => students.id).notNull(), itemType: text("item_type").notNull(), questionId: uuid("question_id"), skillIds: jsonb("skill_ids").notNull(), isCorrect: boolean("is_correct").notNull(), gradingMethod: text("grading_method").notNull(), rawAnswer: text("raw_answer").notNull(), timeToAnswerMs: integer("time_to_answer_ms").notNull(), hintsUsed: integer("hints_used").notNull(), maxHintLevelReached: integer("max_hint_level_reached").notNull(), hintBeforeFirstAttempt: boolean("hint_before_first_attempt").notNull(), solutionViewed: boolean("solution_viewed").notNull(), solutionStepsRevealed: integer("solution_steps_revealed").notNull(), attemptNumber: integer("attempt_number").notNull(), masteryEvidence: text("mastery_evidence").notNull(), exclusionReason: text("exclusion_reason"), selectionPolicy: text("selection_policy").notNull(), selectionPropensity: real("selection_propensity"), policyVersion: text("policy_version").notNull(), clientTs: timestamp("client_ts", { withTimezone: true }).notNull(), serverTs: timestamp("server_ts", { withTimezone: true }).notNull()
});
export const classrooms = pgTable("classrooms", { id: uuid("id").primaryKey(), teacherId: uuid("teacher_id").references(() => users.id).notNull(), name: text("name").notNull(), gradeLevel: integer("grade_level").notNull() });
export const assignments = pgTable("assignments", { id: uuid("id").primaryKey(), classroomId: uuid("classroom_id").references(() => classrooms.id).notNull(), teacherId: uuid("teacher_id").references(() => users.id).notNull(), title: text("title").notNull(), skillIds: jsonb("skill_ids").notNull(), dueAt: timestamp("due_at", { withTimezone: true }).notNull(), status: text("status").notNull(), completionPercent: integer("completion_percent").notNull().default(0) });
