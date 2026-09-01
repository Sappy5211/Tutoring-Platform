import { useEffect, useMemo, useReducer, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Bot, Check, ChevronRight, Clock3, Lightbulb,
  MessageSquareText, Send, Sparkles, X,
} from "lucide-react";
import katex from "katex";
import { MathInput } from "@vidya/math-input";
import type { AttemptEvent, Question } from "@vidya/contracts";
import { Button, Chip, IconButton, ProgressBar } from "@vidya/ui";
import { services } from "../../lib/services";
import { initialPracticeState, maxAttemptsFor, practiceReducer } from "./reducer";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

function MathDisplay({ value }: { value: string }) {
  return (
    <span
      className="math-render block overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false, displayMode: true }) }}
    />
  );
}

export function PracticePage() {
  const questions = useLoaderData() as Question[];
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(practiceReducer, undefined, initialPracticeState);
  const [comment, setComment] = useState("");
  const [commentState, setCommentState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const question = questions[state.index % questions.length]!;
  const maxAttempts = maxAttemptsFor(question);
  const isChecking = state.status === "submitting" || state.status === "grading_delayed";
  const resolved = state.status === "resolved";
  const progress = Math.round(((state.index + (resolved ? 1 : 0)) / questions.length) * 100);
  const solutionSteps = useMemo(() => question.workedSolution.slice(0, state.revealedSteps), [question, state.revealedSteps]);

  useEffect(() => {
    if (state.status !== "submitting") return;
    const delayed = window.setTimeout(() => dispatch({ type: "DELAYED" }), 1500);
    const timeout = window.setTimeout(() => dispatch({ type: "FAIL" }), 8000);
    let active = true;
    services.grading.grade(question, state.answer).then(async (result) => {
      if (!active) return;
      window.clearTimeout(delayed); window.clearTimeout(timeout);
      const isFirst = state.attemptNumber === 1;
      const tooFast = Date.now() - state.startedAt < 2500;
      const masteryEvidence = !isFirst || tooFast ? "excluded" : result.isCorrect && !state.hintBeforeFirstAttempt ? "positive" : "negative";
      const event: AttemptEvent = { eventId: crypto.randomUUID(), studentId: "student-1", itemType: "practice_question", questionId: question.questionId, skillIds: [question.skillId], isCorrect: result.isCorrect, gradingMethod: result.gradingMethod, rawAnswer: state.answer, timeToAnswerMs: Date.now() - state.startedAt, hintsUsed: state.hintsShown, maxHintLevelReached: state.hintsShown, hintBeforeFirstAttempt: state.hintBeforeFirstAttempt, solutionViewed: false, solutionStepsRevealed: 0, attemptNumber: state.attemptNumber, masteryEvidence, exclusionReason: !isFirst ? "subsequent_attempt" : tooFast ? "too_fast" : undefined, selectionPolicy: "graph_frontier", selectionPropensity: 1 / questions.length, policyVersion: "mock-frontier-v1", clientTs: new Date().toISOString(), serverTs: new Date().toISOString() };
      await services.repository.saveAttempt(event);
      dispatch({ type: "GRADE", result, maxAttempts });
    }).catch(() => dispatch({ type: "FAIL" }));
    return () => { active = false; window.clearTimeout(delayed); window.clearTimeout(timeout); };
  }, [state.status]);

  const submitComment = async () => {
    if (!comment.trim()) return; setCommentState("sending");
    try {
      await services.repository.saveQuestionComment({ commentId: crypto.randomUUID(), studentId: "student-1", questionId: question.questionId, attemptEventId: `latest-${question.questionId}`, body: comment, createdAt: new Date().toISOString(), status: "open" });
      setCommentState("sent");
    } catch { setCommentState("failed"); }
  };

  const next = () => {
    if (state.index + 1 >= questions.length) navigate("/app/practice/complete");
    else { setComment(""); setCommentState("idle"); dispatch({ type: "NEXT" }); }
  };

  return (
    // "practice-page" is a bare structural hook, not a styling class: the shared
    // styles.css already gives this exact classname a full-bleed breakout from
    // the app shell's padding and a `body:has(.practice-page)` rule that hides
    // the mobile bottom-nav/AI FAB and docks the maths keyboard flush to the
    // screen edge — exactly the "no busy screen" behaviour this brief asks for.
    // Every other class below is fresh Tailwind on nodes of my own.
    <div className="practice-page">
      <header className="sticky top-[62px] z-10 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 py-3 backdrop-blur-md min-[760px]:top-[70px] sm:px-6">
        <div className="mx-auto flex w-full max-w-[820px] items-center gap-3">
          <IconButton label="Exit practice" onClick={() => navigate("/app/home")} className="flex-shrink-0">
            <X size={19} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <strong className="font-display text-[13px] font-bold text-[var(--ink)]">Focused practice</strong>
              <span className="text-[12px] font-medium text-[var(--muted)]">{progress}% complete</span>
            </div>
            <ProgressBar value={progress} label={`${progress}% of session complete`} />
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => navigate("/app/home")}>
            <span className="hidden sm:inline">Continue later</span>
            <span className="sm:hidden">Later</span>
          </Button>
        </div>
      </header>

      <div className="border-b border-[var(--line)]">
        <nav aria-label="Questions" className="mx-auto flex w-full max-w-[820px] gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {questions.map((item, index) => {
            const isCurrent = index === state.index;
            const isDone = index < state.index;
            return (
              <button
                key={item.questionId}
                disabled={index > state.index}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${index + 1}${isDone ? ", completed" : isCurrent ? ", current" : ", not yet reached"}`}
                className={cx(
                  "grid size-9 flex-shrink-0 place-items-center rounded-[10px] border text-[13px] font-bold",
                  "transition-colors motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                  isCurrent && "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]",
                  isDone && "cursor-default border-[var(--primary)] bg-[var(--primary)] text-white",
                  !isCurrent && !isDone && "cursor-not-allowed border-[var(--line-strong)] bg-[var(--surface)] text-[var(--faint)]",
                )}
              >
                {isDone ? <Check size={15} /> : index + 1}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Card's fixed padding doesn't fit a panel built from divided
            sections (header strip, prompt, feedback, solution, comment,
            footer each need their own), so this reuses Card's exact visual
            tokens directly rather than nesting inside it. Worth a
            `padding="none"` prop on the shared Card primitive. */}
        <div className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3.5 sm:px-7">
            <div className="grid gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--primary)]">{question.skillCode}</span>
              <strong className="text-[13.5px] font-semibold text-[var(--ink)]">{question.skillTitle}</strong>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/app/topic/${question.skillId}`)}>
                <BookOpen size={15} /> Read notes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.dispatchEvent(new Event("vidya:open-ai"))}>
                <Bot size={15} /> Ask VIDYA
              </Button>
            </div>
          </div>

          <div className="px-5 pb-3 pt-6 sm:px-7 sm:pt-8">
            <p className="m-0 text-[16.5px] font-semibold leading-relaxed text-[var(--ink)] sm:text-[17.5px]">{question.prompt}</p>
            {question.promptLatex && <div className="mt-3"><MathDisplay value={question.promptLatex} /></div>}
          </div>

          <div className="px-5 pb-2 sm:px-7">
            <MathInput
              value={state.answer}
              onChange={(value) => dispatch({ type: "ANSWER", value })}
              staticPrefix={question.staticPrefixLatex}
              disabled={isChecking || resolved || state.status === "pending_review"}
            />
          </div>

          {!resolved && state.status !== "pending_review" && (
            <div className="flex flex-wrap items-center gap-3 px-5 pb-6 sm:px-7">
              <Button onClick={() => dispatch({ type: "SUBMIT" })} loading={isChecking} disabled={!state.answer.trim()}>
                {state.status === "grading_delayed" ? "Still checking…" : "Check answer"}
              </Button>
              <span className="text-[12px] font-medium text-[var(--muted)]">
                Attempt {Math.min(state.attemptNumber, maxAttempts)} of {maxAttempts}
              </span>
            </div>
          )}

          {state.status === "grading_delayed" && (
            <div role="status" className="mx-5 mb-6 flex items-center gap-3 rounded-[12px] bg-[var(--surface-soft)] px-4 py-3.5 sm:mx-7">
              <Clock3 size={17} className="flex-shrink-0 text-[var(--muted)]" aria-hidden />
              <p className="m-0 text-[13px] font-medium text-[var(--muted)]">Still checking your working—algebra can take a few seconds.</p>
            </div>
          )}

          {state.status === "grading_failed" && (
            <div role="alert" className="mx-5 mb-6 grid gap-3 rounded-[12px] bg-[var(--surface-soft)] px-4 py-4 sm:mx-7">
              <div className="flex items-center gap-3">
                <Clock3 size={17} className="flex-shrink-0 text-[var(--muted)]" aria-hidden />
                <div className="grid gap-0.5">
                  <strong className="text-[13.5px] font-semibold text-[var(--ink)]">This is taking longer than expected.</strong>
                  <span className="text-[12px] text-[var(--muted)]">Your answer is safe.</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "SUBMIT" })}>Retry</Button>
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "CONTINUE_PENDING" })}>Continue without waiting</Button>
              </div>
            </div>
          )}

          {state.status === "pending_review" && (
            <div role="status" className="mx-5 mb-6 flex items-center gap-3 rounded-[12px] bg-[var(--surface-soft)] px-4 py-3.5 sm:mx-7">
              <Clock3 size={17} className="flex-shrink-0 text-[var(--muted)]" aria-hidden />
              <div className="grid gap-0.5">
                <strong className="text-[13.5px] font-semibold text-[var(--ink)]">Submitted for checking</strong>
                <span className="text-[12px] text-[var(--muted)]">We’ll update this question when the result is ready.</span>
              </div>
            </div>
          )}

          {state.status === "incorrect_retry" && (
            // Amber (the same "developing" token every mastery surface uses)
            // reads as "still in progress", not a failure: attempts remain.
            <div className="border-t border-[var(--line)] motion-safe:animate-[review-reveal_.2s_ease-out] motion-reduce:animate-none">
              <div role="status" className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-[var(--developing-soft)] px-5 py-4 sm:px-7">
                <span className="text-[14.5px] font-bold text-[var(--developing)]">Not quite</span>
                <p className="m-0 text-[13px] text-[var(--developing)]">{state.feedback}</p>
              </div>
              <div className="grid grid-cols-[30px_1fr] items-start gap-x-3 gap-y-3 px-5 pt-4 sm:px-7">
                <Lightbulb size={18} className="mt-0.5 text-[var(--developing)]" aria-hidden />
                <div className="grid gap-1">
                  <strong className="text-[13.5px] font-semibold text-[var(--ink)]">Want a small nudge?</strong>
                  <p className="m-0 text-[12px] text-[var(--muted)]">Hints help you learn. We simply record that this attempt was assisted.</p>
                </div>
                {state.hintsShown < 2 && (
                  <div className="col-span-2">
                    <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "SHOW_HINT" })}>
                      Show hint {state.hintsShown + 1}
                    </Button>
                  </div>
                )}
              </div>
              {state.hintsShown > 0 && (
                <div className="mx-5 my-4 grid gap-2 sm:mx-7">
                  {/* Every rung climbed stays visible — a ladder you can only see
                      the top of isn't much of a ladder. */}
                  {Array.from({ length: state.hintsShown }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[10px] border-l-4 border-[var(--developing)] bg-[var(--developing-soft)] px-4 py-3 motion-safe:animate-[review-reveal_.18s_ease-out] motion-reduce:animate-none"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--developing)]">Hint {i + 1} of 2</span>
                      <p className="m-0 mt-1 text-[13px] leading-relaxed text-[var(--ink)]">{question.hints[i]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {resolved && (
            <div className="border-t border-[var(--line)]">
              <div
                role="status"
                className={cx(
                  "flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-4 sm:px-7",
                  "motion-safe:animate-[review-reveal_.2s_ease-out] motion-reduce:animate-none",
                  state.outcome === "correct" ? "bg-[var(--secure-soft)]" : "bg-[var(--needswork-soft)]",
                )}
              >
                <span className={cx("text-[14.5px] font-bold", state.outcome === "correct" ? "text-[var(--secure)]" : "text-[var(--needswork)]")}>
                  {state.outcome === "correct" ? "Correct" : "Let’s learn from this one"}
                </span>
                <p className={cx("m-0 text-[13px]", state.outcome === "correct" ? "text-[var(--secure)]" : "text-[var(--needswork)]")}>
                  {state.outcome === "correct"
                    ? "Your answer is equivalent, even though it may be written differently."
                    : "The ideal method is below. Compare each step with your attempt."}
                </p>
              </div>

              <section className="px-5 py-6 sm:px-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--primary)]">Worked solution</span>
                    <h2 className="font-display m-0 mt-1 text-[20px] font-bold tracking-tight text-[var(--ink)]">The clearest method</h2>
                  </div>
                  <Chip tone="primary">Always shown</Chip>
                </div>

                <ol className="m-0 grid list-none gap-0 p-0">
                  {solutionSteps.map((step, index) => (
                    <li
                      key={step.stepId}
                      className={cx("grid grid-cols-[32px_1fr] gap-3.5 py-4", index > 0 && "border-t border-[var(--line)]")}
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-[var(--primary-soft)] text-[13px] font-bold text-[var(--primary-strong)]">
                        {index + 1}
                      </span>
                      <div className="grid gap-2 pt-0.5">
                        <p className="m-0 text-[13.5px] font-semibold text-[var(--ink)]">{step.reason}</p>
                        {step.beforeLatex && <MathDisplay value={step.beforeLatex} />}
                        {step.annotation && (
                          <span className="w-fit rounded-[7px] bg-[var(--primary-faint)] px-2 py-1 text-[11.5px] font-semibold text-[var(--primary)]">
                            {step.annotation}
                          </span>
                        )}
                        {step.afterLatex && <MathDisplay value={step.afterLatex} />}
                      </div>
                    </li>
                  ))}
                </ol>

                {state.revealedSteps < question.workedSolution.length && (
                  <Button
                    variant="secondary" size="sm" className="mt-2"
                    onClick={() => dispatch({ type: "SHOW_STEP", total: question.workedSolution.length })}
                  >
                    Show next step <ChevronRight size={16} />
                  </Button>
                )}
              </section>

              <section className="grid grid-cols-[32px_1fr] gap-3 border-t border-[var(--line)] bg-[var(--surface-soft)] px-5 py-6 sm:px-7">
                <MessageSquareText size={20} className="text-[var(--primary)]" aria-hidden />
                <div className="grid gap-2.5">
                  <div>
                    <h2 className="font-display m-0 text-[15px] font-bold text-[var(--ink)]">Still unsure? Leave context for a teacher.</h2>
                    <p className="m-0 mt-1 text-[12px] text-[var(--muted)]">This question and your attempts will travel with your note.</p>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="What part felt confusing?"
                    aria-label="Note for your teacher"
                    className="min-h-[80px] w-full resize-y rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] p-3 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                  />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button variant="secondary" size="sm" onClick={submitComment} loading={commentState === "sending"}>
                      <Send size={15} /> Send note
                    </Button>
                    {commentState === "sent" && (
                      <span className="rounded-full bg-[var(--secure-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--secure)]">
                        Saved for your teacher
                      </span>
                    )}
                    {commentState === "failed" && (
                      <span className="rounded-full bg-[var(--needswork-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--needswork)]">
                        Couldn’t send · try again
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-4 sm:px-7">
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/home")}>
                  <ArrowLeft size={15} /> Continue later
                </Button>
                <Button onClick={next}>
                  {state.index + 1 === questions.length ? "Finish session" : "Next question"} <ArrowRight size={16} />
                </Button>
              </footer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function PracticeComplete() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
        <Sparkles size={34} aria-hidden />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--primary)]">Session complete</span>
      <h1 className="font-display m-0 text-[32px] font-bold tracking-tight text-[var(--ink)] sm:text-[40px]">
        You stayed with the method.
      </h1>
      <p className="m-0 max-w-[46ch] text-[15px] leading-relaxed text-[var(--muted)]">
        Three questions reviewed. The useful part is that you now know exactly what to practise next.
      </p>
      <div className="mt-1 flex w-full max-w-[420px] gap-3">
        <div className="grid flex-1 gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 py-4">
          <strong className="text-[22px] font-bold text-[var(--ink)]">3</strong>
          <span className="text-[11px] text-[var(--muted)]">questions</span>
        </div>
        <div className="grid flex-1 gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 py-4">
          <strong className="text-[22px] font-bold text-[var(--ink)]">1</strong>
          <span className="text-[11px] text-[var(--muted)]">hint used</span>
        </div>
        <div className="grid flex-1 gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 py-4">
          <strong className="text-[22px] font-bold text-[var(--ink)]">12m</strong>
          <span className="text-[11px] text-[var(--muted)]">focused time</span>
        </div>
      </div>
      <Button onClick={() => navigate("/app/home")} className="mt-2">Back to today’s plan</Button>
    </div>
  );
}
