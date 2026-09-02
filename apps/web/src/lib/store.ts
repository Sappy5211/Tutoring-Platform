import { create } from "zustand";
import type { Entitlement, Subject, SubjectEntitlement, UserRole } from "@vidya/contracts";

/** Mock entitlement for the prototype. Mirrors the server-evaluated shape in
 *  ADR-002 Amendment 1 / ADR-008 so swapping in the real one is a data change.
 *  Default: a single-subject (Maths) plan, so the lock states are visible. */
const mockSubjects: SubjectEntitlement[] = [
  { subject: "maths", access: { state: "unlocked" } },
  { subject: "science", access: { state: "locked_plan", requiredTier: "all_subjects" } },
  // Grade-locked, not plan-locked: CBSE splits Science into these at Class 11.
  { subject: "physics", access: { state: "locked_grade", availableFromGrade: 11 } },
  { subject: "chemistry", access: { state: "locked_grade", availableFromGrade: 11 } },
  { subject: "biology", access: { state: "locked_grade", availableFromGrade: 11 } },
];

const mockEntitlement: Entitlement = {
  userId: "user-demo",
  tier: "single_subject",
  subjects: mockSubjects,
  practiceQuestionsPerDay: 5,
  tutorMessagesPerDay: 10,
  pdfExportEnabled: false,
  callCreditsRemaining: 0,
};

/** A note the student made themselves, kept in the store so the "create" flows
 *  actually produce something. Onboarding's first flashcard and the new-note
 *  chooser both write here - without it both flows navigate somewhere and leave
 *  nothing behind, which is the one thing that made the pattern worth copying. */
export interface PersonalNote {
  noteId: string;
  title: string;
  mode: "bullet" | "blank";
  createdAt: string;
  cards: { front: string; back: string }[];
}

interface AppState {
  /** Single source of truth for the grade shown in chrome. Onboarding sets it;
   *  the sidebar and page eyebrows read it instead of hardcoding a class, which
   *  is how the app ended up claiming Class 5, Class 7 and Classes 6-8 at once. */
  gradeLevel: number;
  theme: "light" | "dark";
  role: UserRole;
  subject: Subject;
  entitlement: Entitlement;
  personalNotes: PersonalNote[];
  addPersonalNote: (note: Omit<PersonalNote, "noteId" | "createdAt">) => string;
  setGradeLevel: (grade: number) => void;
  setTheme: (theme: "light" | "dark") => void;
  setRole: (role: UserRole) => void;
  setSubject: (subject: Subject) => void;
  setEntitlement: (entitlement: Entitlement) => void;
  accessFor: (subject: Subject) => SubjectEntitlement["access"];
}

export const useAppStore = create<AppState>((set, get) => ({
  gradeLevel: 7,
  theme: "light",
  role: "student",
  subject: "maths",
  entitlement: mockEntitlement,
  personalNotes: [],
  addPersonalNote: (note) => {
    const noteId = `own-${crypto.randomUUID().slice(0, 8)}`;
    set((state) => ({
      personalNotes: [
        { ...note, noteId, createdAt: new Date().toISOString() },
        ...state.personalNotes,
      ],
    }));
    return noteId;
  },
  setGradeLevel: (gradeLevel) => set({ gradeLevel }),
  setTheme: (theme) => set({ theme }),
  setRole: (role) => set({ role }),
  /** Guard here too, not only in the UI - a locked subject must never become
   *  the active one just because something called setSubject. */
  setSubject: (subject) => {
    const access = get().accessFor(subject);
    if (access.state === "unlocked") set({ subject });
  },
  setEntitlement: (entitlement) => set({ entitlement }),
  accessFor: (subject) =>
    get().entitlement.subjects.find((s) => s.subject === subject)?.access ?? {
      state: "locked_plan",
      requiredTier: "all_subjects",
    },
}));
