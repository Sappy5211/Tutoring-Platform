import { useEffect, useMemo, useReducer, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Bot, Check, ChevronRight, Clock3, Lightbulb, MessageSquareText, Send, X } from "lucide-react";
import katex from "katex";
import { MathInput } from "@vidya/math-input";
import type { AttemptEvent, Question } from "@vidya/contracts";
import { Button, Card, Chip, ProgressBar } from "@vidya/ui";
import { services } from "../../lib/services";
import { initialPracticeState, maxAttemptsFor, practiceReducer } from "./reducer";

function MathDisplay({ value }: { value: string }) { return <span className="math-render" dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false, displayMode: true }) }} />; }

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
    try { await services.repository.saveQuestionComment({ commentId: crypto.randomUUID(), studentId: "student-1", questionId: question.questionId, attemptEventId: `latest-${question.questionId}`, body: comment, createdAt: new Date().toISOString(), status: "open" }); setCommentState("sent"); }
    catch { setCommentState("failed"); }
  };

  const next = () => { if (state.index + 1 >= questions.length) navigate("/app/practice/complete"); else { setComment(""); setCommentState("idle"); dispatch({ type: "NEXT" }); } };
  return <div className="practice-page">
    <header className="practice-header"><button onClick={() => navigate("/app/home")} className="icon-button" aria-label="Exit practice"><X /></button><div className="practice-header__progress"><div><strong>Focused practice</strong><span>{progress}% complete</span></div><ProgressBar value={progress} /></div><button className="text-button" onClick={() => navigate("/app/home")}>Continue later</button></header>
    <div className="question-tabs" aria-label="Questions">{questions.map((item, index) => <button key={item.questionId} className={index === state.index ? "current" : index < state.index ? "done" : ""} aria-current={index === state.index ? "step" : undefined} disabled={index > state.index}>{index < state.index ? <Check size={15} /> : index + 1}</button>)}</div>
    <main className="practice-stage">
      <Card className="question-card">
        <div className="skill-row"><div><span>{question.skillCode}</span><strong>{question.skillTitle}</strong></div><div><button><BookOpen size={16} />Read notes</button><button onClick={() => window.dispatchEvent(new Event("vidya:open-ai"))}><Bot size={16} />Ask VIDYA</button></div></div>
        <div className="question-prompt"><p>{question.prompt}</p>{question.promptLatex && <MathDisplay value={question.promptLatex} />}</div>
        <MathInput value={state.answer} onChange={(value) => dispatch({ type: "ANSWER", value })} staticPrefix={question.staticPrefixLatex} disabled={isChecking || resolved || state.status === "pending_review"} />
        {!resolved && state.status !== "pending_review" && <div className="answer-actions"><Button onClick={() => dispatch({ type: "SUBMIT" })} loading={isChecking} disabled={!state.answer.trim()}>{state.status === "grading_delayed" ? "Still checking…" : "Check answer"}</Button><span>Attempt {Math.min(state.attemptNumber, maxAttempts)} of {maxAttempts}</span></div>}
        {state.status === "grading_delayed" && <div className="neutral-feedback" role="status"><Clock3 />Still checking your working—algebra can take a few seconds.</div>}
        {state.status === "grading_failed" && <div className="neutral-feedback" role="alert"><Clock3 /><div><strong>This is taking longer than expected.</strong><span>Your answer is safe.</span></div><Button variant="secondary" onClick={() => dispatch({ type: "SUBMIT" })}>Retry</Button><Button variant="ghost" onClick={() => dispatch({ type: "CONTINUE_PENDING" })}>Continue without waiting</Button></div>}
        {state.status === "pending_review" && <div className="neutral-feedback" role="status"><Clock3 /><div><strong>Submitted for checking</strong><span>We’ll update this question when the result is ready.</span></div></div>}
        {state.status === "incorrect_retry" && <div className="retry-panel" role="status"><div className="feedback-strip feedback-strip--retry"><span>Not quite</span><p>{state.feedback}</p></div><div className="hint-offer"><Lightbulb /><div><strong>Want a small nudge?</strong><p>Hints help you learn. We simply record that this attempt was assisted.</p></div>{state.hintsShown < 2 && <Button variant="secondary" onClick={() => dispatch({ type: "SHOW_HINT" })}>Show hint {state.hintsShown + 1}</Button>}</div>{state.hintsShown > 0 && <div className="hint-card"><span>Hint {state.hintsShown} of 2</span><p>{question.hints[state.hintsShown - 1]}</p></div>}</div>}
        {resolved && <div className="resolution">
          <div className={`feedback-strip feedback-strip--${state.outcome}`} role="status"><span>{state.outcome === "correct" ? "Correct" : "Let’s learn from this one"}</span><p>{state.outcome === "correct" ? "Your answer is equivalent, even though it may be written differently." : "The ideal method is below. Compare each step with your attempt."}</p></div>
          <section className="worked-solution"><div className="worked-solution__heading"><div><span>Worked solution</span><h2>The clearest method</h2></div><Chip tone="primary">Always shown</Chip></div>{solutionSteps.map((step, index) => <article key={step.stepId} className="solution-step"><span>{index + 1}</span><div><p>{step.reason}</p>{step.beforeLatex && <MathDisplay value={step.beforeLatex} />}{step.annotation && <small>{step.annotation}</small>}{step.afterLatex && <MathDisplay value={step.afterLatex} />}</div></article>)}{state.revealedSteps < question.workedSolution.length && <Button variant="secondary" onClick={() => dispatch({ type: "SHOW_STEP", total: question.workedSolution.length })}>Show next step<ChevronRight size={17} /></Button>}</section>
          <section className="teacher-comment"><MessageSquareText /><div><h2>Still unsure? Leave context for a teacher.</h2><p>This question and your attempts will travel with your note.</p><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What part felt confusing?" /><div><Button variant="secondary" onClick={submitComment} loading={commentState === "sending"}><Send size={16} />Send note</Button>{commentState === "sent" && <Chip tone="success">Saved for your teacher</Chip>}{commentState === "failed" && <Chip tone="danger">Couldn’t send · try again</Chip>}</div></div></section>
          <footer className="question-footer"><button className="text-button" onClick={() => navigate("/app/home")}><ArrowLeft size={16} />Continue later</button><Button onClick={next}>{state.index + 1 === questions.length ? "Finish session" : "Next question"}<ArrowRight size={17} /></Button></footer>
        </div>}
      </Card>
    </main>
  </div>;
}

export function PracticeComplete() { const navigate = useNavigate(); return <div className="completion-page"><div className="completion-orbit"><Sparkle /></div><span className="eyebrow">Session complete</span><h1>You stayed with the method.</h1><p>Three questions reviewed. The useful part is that you now know exactly what to practise next.</p><div className="completion-stats"><div><strong>3</strong><span>questions</span></div><div><strong>1</strong><span>hint used</span></div><div><strong>12m</strong><span>focused time</span></div></div><Button onClick={() => navigate("/app/home")}>Back to today’s plan</Button></div>; }
function Sparkle() { return <span aria-hidden>✦</span>; }
