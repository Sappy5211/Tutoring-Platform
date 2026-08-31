import type { GradeResult, Question } from "@vidya/contracts";

export type PracticeStatus = "answering" | "submitting" | "grading_delayed" | "grading_failed" | "incorrect_retry" | "resolved" | "pending_review";
export interface PracticeState {
  index: number;
  answer: string;
  attemptNumber: number;
  hintsShown: 0 | 1 | 2;
  hintBeforeFirstAttempt: boolean;
  status: PracticeStatus;
  outcome?: "correct" | "incorrect";
  feedback?: string;
  revealedSteps: number;
  startedAt: number;
}
export type PracticeAction =
  | { type: "ANSWER"; value: string }
  | { type: "SUBMIT" }
  | { type: "DELAYED" }
  | { type: "GRADE"; result: GradeResult; maxAttempts: number }
  | { type: "FAIL" }
  | { type: "CONTINUE_PENDING" }
  | { type: "SHOW_HINT" }
  | { type: "SHOW_STEP"; total: number }
  | { type: "NEXT" };

export const initialPracticeState = (): PracticeState => ({ index: 0, answer: "", attemptNumber: 1, hintsShown: 0, hintBeforeFirstAttempt: false, status: "answering", revealedSteps: 0, startedAt: Date.now() });

export function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case "ANSWER": return state.status === "answering" || state.status === "incorrect_retry" ? { ...state, answer: action.value, status: "answering" } : state;
    case "SUBMIT": return state.answer.trim() ? { ...state, status: "submitting" } : state;
    case "DELAYED": return state.status === "submitting" ? { ...state, status: "grading_delayed" } : state;
    case "GRADE": {
      if (action.result.status !== "graded") return { ...state, status: "grading_failed" };
      if (action.result.isCorrect) return { ...state, status: "resolved", outcome: "correct", feedback: action.result.feedback, revealedSteps: Number.MAX_SAFE_INTEGER };
      if (state.attemptNumber < action.maxAttempts) return { ...state, status: "incorrect_retry", feedback: action.result.feedback, attemptNumber: state.attemptNumber + 1 };
      return { ...state, status: "resolved", outcome: "incorrect", feedback: action.result.feedback, revealedSteps: 0 };
    }
    case "FAIL": return { ...state, status: "grading_failed" };
    case "CONTINUE_PENDING": return { ...state, status: "pending_review" };
    case "SHOW_HINT": {
      const next = Math.min(2, state.hintsShown + 1) as 0 | 1 | 2;
      return { ...state, hintsShown: next, hintBeforeFirstAttempt: state.attemptNumber === 1 || state.hintBeforeFirstAttempt };
    }
    case "SHOW_STEP": return { ...state, revealedSteps: Math.min(action.total, state.revealedSteps + 1) };
    case "NEXT": return { ...initialPracticeState(), index: state.index + 1 };
  }
}

export function maxAttemptsFor(question: Question) { return question.maxAttempts ?? (["numeric_entry", "algebraic_expression", "multi_step_working"].includes(question.type) ? 3 : 2); }
