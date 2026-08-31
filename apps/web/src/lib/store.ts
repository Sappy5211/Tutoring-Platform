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

interface AppState {
  theme: "light" | "dark";
  role: UserRole;
  subject: Subject;
  entitlement: Entitlement;
  setTheme: (theme: "light" | "dark") => void;
  setRole: (role: UserRole) => void;
  setSubject: (subject: Subject) => void;
  setEntitlement: (entitlement: Entitlement) => void;
  accessFor: (subject: Subject) => SubjectEntitlement["access"];
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: "light",
  role: "student",
  subject: "maths",
  entitlement: mockEntitlement,
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
