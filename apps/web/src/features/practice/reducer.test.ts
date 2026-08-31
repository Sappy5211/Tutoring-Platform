import { describe, expect, it, vi } from "vitest";
import { initialPracticeState, practiceReducer } from "./reducer";

describe("practiceReducer", () => {
  it("supports retry, hint, and correct resolution", () => {
    vi.spyOn(Date, "now").mockReturnValue(1);
    let state = practiceReducer(initialPracticeState(), { type: "ANSWER", value: "9y" });
    state = practiceReducer(state, { type: "SUBMIT" });
    state = practiceReducer(state, { type: "GRADE", result: { isCorrect: false, gradingMethod: "cas_equivalence", feedback: "Try again", status: "graded" }, maxAttempts: 3 });
    expect(state.status).toBe("incorrect_retry");
    expect(state.attemptNumber).toBe(2);
    state = practiceReducer(state, { type: "SHOW_HINT" });
    expect(state.hintsShown).toBe(1);
    state = practiceReducer(state, { type: "ANSWER", value: "9y+5" });
    state = practiceReducer(state, { type: "SUBMIT" });
    state = practiceReducer(state, { type: "GRADE", result: { isCorrect: true, gradingMethod: "cas_equivalence", feedback: "Correct", status: "graded" }, maxAttempts: 3 });
    expect(state).toMatchObject({ status: "resolved", outcome: "correct" });
  });
  it("keeps delayed grades neutral", () => {
    let state = practiceReducer({ ...initialPracticeState(), answer: "3/4" }, { type: "SUBMIT" });
    state = practiceReducer(state, { type: "DELAYED" });
    state = practiceReducer(state, { type: "FAIL" });
    state = practiceReducer(state, { type: "CONTINUE_PENDING" });
    expect(state.status).toBe("pending_review");
    expect(state.outcome).toBeUndefined();
  });
});
