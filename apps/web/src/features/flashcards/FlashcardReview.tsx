import katex from "katex";
import { ArrowLeft, EyeOff, HelpCircle, Layers, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CardState, Flashcard, ReviewRating } from "@vidya/contracts";
import { Button, Card } from "@vidya/ui";
import {
  applyRating, endOfDay, isBuried, isDue, LEECH_THRESHOLD, newCardState, previewIntervals,
} from "./scheduler";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Mock deck. Real cards arrive from the repository at P3.5; the shapes are the
 *  contract types so swapping the source is a data change, not a rewrite. */
const DECK: Flashcard[] = [
  { flashcardId: "travellers-1", type: "basic", deck: "mastery", direction: "forward", enabled: true,
    front: "What is the new place value that comes just after Thousands?", back: "Ten-Thousands (TTh)", sourceBlockId: "travellers-place-value", skillIds: ["s-large-numbers"], status: "published" },
  { flashcardId: "travellers-2", type: "basic", deck: "mastery", direction: "forward", enabled: true,
    front: "How do you read the number 82,045 in words?", back: "Eighty-two thousand, forty-five. (Don't say ‘zero hundred’!)", sourceBlockId: "travellers-reading", skillIds: ["s-large-numbers"], status: "published" },
  { flashcardId: "travellers-3", type: "concept", deck: "mastery", direction: "forward", enabled: true,
    front: "Which number is larger: 12,500 or 9,999? Why?", back: "12,500. A number with 5 digits is always larger than a number with 4 digits.", sourceBlockId: "travellers-comparing", skillIds: ["s-comparing-numbers"], status: "published" },
  { flashcardId: "travellers-4", type: "basic", deck: "mastery", direction: "forward", enabled: true,
    front: "What is the smallest 5-digit number you can make using 0, 5, 8, 2, 9?", back: "20,589. Watch out for the Zero Trap: you can never put 0 first!", sourceBlockId: "travellers-forming", skillIds: ["s-forming-numbers"], status: "published" },
  { flashcardId: "travellers-5", type: "basic", deck: "mastery", direction: "forward", enabled: true,
    front: "Round 14,620 to the nearest thousand.", back: "15,000. The neighbour digit is 6, so round 14 thousand up to 15 thousand.", sourceBlockId: "travellers-rounding", skillIds: ["s-rounding"], status: "published" },
  { flashcardId: "travellers-6", type: "basic", deck: "mastery", direction: "forward", enabled: true,
    front: "If 60 people travel in boats that hold 15 people each, how many boats are needed?", back: "Use division: 60 ÷ 15 = 4 boats.", sourceBlockId: "travellers-division", skillIds: ["s-division"], status: "published" },
];

/** Matches the pattern already used in PracticePage and the notes reader.
 *  KaTeX is loaded for the whole app, so this costs nothing extra here. */
function MathDisplay({ value }: { value: string }) {
  return <span className="math-render" dangerouslySetInnerHTML={{
    __html: katex.renderToString(value, { throwOnError: false, displayMode: true }),
  }} />;
}

/** Rating colour reuses the shared mastery scale rather than inventing new
 *  hues: "Again"/"Easy" are literally a recall-confidence signal, the same
 *  axis mastery bands describe. "Good" carries the single brand accent
 *  because it is the default, most-travelled choice (and Space maps to it). */
const RATINGS: { rating: ReviewRating; label: string; text: string; ring: string }[] = [
  { rating: 1, label: "Again", text: "text-[var(--needswork)]", ring: "hover:border-[var(--needswork)] focus-visible:border-[var(--needswork)]" },
  { rating: 2, label: "Hard", text: "text-[var(--developing)]", ring: "hover:border-[var(--developing)] focus-visible:border-[var(--developing)]" },
  { rating: 3, label: "Good", text: "text-[var(--primary)]", ring: "hover:border-[var(--primary)] focus-visible:border-[var(--primary)]" },
  { rating: 4, label: "Easy", text: "text-[var(--secure)]", ring: "hover:border-[var(--secure)] focus-visible:border-[var(--secure)]" },
];

const toolButtonClass = "inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-transparent px-2 py-1.5 text-[12.5px] font-semibold text-[var(--muted)] transition-colors motion-reduce:transition-none hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

export function FlashcardReview() {
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(DECK.map((c) => [c.flashcardId, newCardState("student-demo", c.flashcardId)])));
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [again, setAgain] = useState(0);

  const now = new Date();
  /** Sibling burying (P3 section 3): cards generated from the same note block are
   *  near-duplicates of one idea. Without this a session becomes four versions of
   *  the same question, which reads as a broken product. */
  const queue = useMemo(
    () => DECK.filter((c) => {
      const s = states[c.flashcardId];
      if (!s) return false;
      // Buried/suspended/leech cards leave the queue whatever their phase. A new
      // card can be buried too - checking phase first would let a buried sibling
      // straight back in, which silently defeats the burying below.
      if (s.suspended || s.isLeech || isBuried(s, now)) return false;
      return s.phase === "new" || isDue(s, now);
    }),
    [states],
  );
  const counts = useMemo(() => {
    let newCards = 0, learning = 0, review = 0;
    for (const c of queue) {
      const phase = states[c.flashcardId]?.phase;
      if (phase === "new") newCards += 1;
      else if (phase === "learning" || phase === "relearning") learning += 1;
      else review += 1;
    }
    return { newCards, learning, review };
  }, [queue, states]);

  // Always the head of the queue. An index would drift: a rated or buried card
  // leaves the queue, so incrementing an index skips the card that slid into its
  // place. Found by testing - the count was right and the next card was wrong.
  const card = queue[0];
  const state = card ? states[card.flashcardId] : undefined;
  const previews = useMemo(() => (state ? previewIntervals(state, now) : null), [state]);

  const advance = useCallback((updater: (s: CardState) => CardState, buriedSiblings: string[] = []) => {
    if (!card) return;
    setStates((prev) => {
      const next = { ...prev };
      const current = prev[card.flashcardId];
      if (current) next[card.flashcardId] = updater(current);
      for (const id of buriedSiblings) {
        const sib = prev[id];
        if (sib) next[id] = { ...sib, buriedUntil: endOfDay(now) };
      }
      return next;
    });
    setRevealed(false);
  }, [card]);

  const rate = useCallback((rating: ReviewRating) => {
    if (!card) return;
    const siblings = DECK
      .filter((c) => c.sourceBlockId && c.sourceBlockId === card.sourceBlockId && c.flashcardId !== card.flashcardId)
      .map((c) => c.flashcardId);
    setReviewed((n) => n + 1);
    if (rating === 1) setAgain((n) => n + 1);
    advance((s) => applyRating(s, rating, now), siblings);
  }, [card, advance]);

  // Anki's keys, kept deliberately: 1-4 to rate, Space to reveal then Good.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!card) return;
      if (!revealed && (event.code === "Space" || event.key === "Enter")) { event.preventDefault(); setRevealed(true); return; }
      if (!revealed) return;
      if (event.code === "Space" || event.key === "Enter") { event.preventDefault(); rate(3); return; }
      if (["1", "2", "3", "4"].includes(event.key)) { event.preventDefault(); rate(Number(event.key) as ReviewRating); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, rate]);

  if (!card || !state || !previews) {
    const accuracy = reviewed ? Math.round(((reviewed - again) / reviewed) * 100) : 0;
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-[560px] items-center justify-center px-4">
        <Card className="grid justify-items-center gap-3 px-8 py-14 text-center shadow-[var(--shadow-sm)]">
          <span className="grid size-14 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <Sparkles size={26} aria-hidden />
          </span>
          <h1 className="font-display m-0 text-2xl font-bold tracking-tight text-[var(--ink)]">Deck clear for today</h1>
          {reviewed > 0
            ? <p className="m-0 max-w-[38ch] text-sm text-[var(--muted)]">{reviewed} card{reviewed === 1 ? "" : "s"} reviewed · {accuracy}% recalled first time.</p>
            : <p className="m-0 max-w-[38ch] text-sm text-[var(--muted)]">Nothing is due right now. Cards come back when you're about to forget them.</p>}
          <Link to="/app/home" className="mt-1"><Button>Back to today</Button></Link>
        </Card>
      </div>
    );
  }

  const leechWarning = state.lapses >= LEECH_THRESHOLD / 2;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center gap-2.5">
        <Link
          to="/app/home"
          aria-label="Leave review"
          className="grid size-9 flex-shrink-0 place-items-center rounded-[10px] text-[var(--muted)] transition-colors motion-reduce:transition-none hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5" aria-label="Cards remaining by queue">
          <span className="rounded-full bg-[var(--primary-faint)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--primary-strong)]">
            {counts.newCards} new
          </span>
          <span className="rounded-full bg-[var(--developing-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--developing)]">
            {counts.learning} learning
          </span>
          <span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--muted)]">
            {counts.review} review
          </span>
        </div>

        <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          {card.deck === "exam_rehearsal" ? "Exam practice" : "Mastery"}
        </span>
      </header>

      {leechWarning && (
        // P3 section 4: Anki suspends a leech. On a required syllabus that
        // silently removes the content the student most needs, so we route it to
        // a human instead - the best-qualified teacher-call signal we get.
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-[14px] border border-[var(--developing)] bg-[var(--developing-soft)] px-4 py-3"
        >
          <HelpCircle size={17} className="flex-shrink-0 text-[var(--developing)]" aria-hidden />
          <p className="m-0 flex-1 text-[13.5px] font-semibold text-[var(--developing)]">
            This one keeps slipping. Worth ten minutes with a teacher.
          </p>
          <Link to="/app/teachers" className="flex-shrink-0 whitespace-nowrap text-[13px] font-bold text-[var(--primary)]">
            Book a call
          </Link>
        </div>
      )}

      {/* The card is the quietest thing on screen: no chrome besides the
          1px border every surface gets, generous padding, and nothing that
          moves until the student asks it to. */}
      <Card className="grid min-h-[240px] items-center justify-items-center gap-6 px-6 py-10 text-center sm:px-12">
        <p className="m-0 max-w-[46ch] text-xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-[22px]">
          {card.front}
        </p>

        {revealed ? (
          <div className="grid w-full max-w-[46ch] gap-3 motion-safe:animate-[review-reveal_.18s_ease-out] motion-reduce:animate-none">
            <hr aria-hidden className="mx-auto w-14 border-t-2 border-[var(--line-strong)]" />
            <p className="m-0 text-[17px] leading-relaxed text-[var(--ink)]">{card.back}</p>
            {card.backLatex && (
              <div className="rounded-[11px] bg-[var(--surface-soft)] px-4 py-2.5">
                <MathDisplay value={card.backLatex} />
              </div>
            )}
          </div>
        ) : (
          <Button onClick={() => setRevealed(true)} className="gap-2.5">
            Show answer
            <kbd className="rounded border border-white/25 bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold">Space</kbd>
          </Button>
        )}
      </Card>

      {revealed && (
        <div
          role="group"
          aria-label="How well did you recall it? Each button shows when the card returns."
          className="grid grid-cols-2 gap-2 motion-safe:animate-[review-reveal_.18s_ease-out] motion-reduce:animate-none sm:grid-cols-4"
        >
          {RATINGS.map(({ rating, label, text, ring }) => (
            <button
              key={rating}
              onClick={() => rate(rating)}
              className={cx(
                "grid cursor-pointer justify-items-center gap-1 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-2 py-3",
                "transition-colors motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                ring,
              )}
            >
              <strong className={cx("text-[13.5px] font-bold", text)}>{label}</strong>
              {/* The interval preview is the mechanic that makes rating honest:
                  the cost of "Easy" is visible before you press it. Kept large
                  and tabular-numeric so it reads at a glance, not as a footnote. */}
              <span className="text-[13px] font-semibold tabular-nums text-[var(--ink-soft)]">{previews[rating]}</span>
              <kbd className="mt-0.5 rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1.5 text-[10px] font-semibold text-[var(--muted)]">
                {rating}
              </kbd>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-1">
        <button onClick={() => advance((s) => ({ ...s, buriedUntil: endOfDay(now) }))} className={toolButtonClass}>
          <EyeOff size={15} aria-hidden /> Bury until tomorrow
        </button>
        <button onClick={() => advance((s) => ({ ...s, flaggedForHelp: true }))} className={toolButtonClass}>
          <HelpCircle size={15} aria-hidden /> Ask about this
        </button>
        <button
          onClick={() => {
            setRevealed(false);
            setStates(Object.fromEntries(DECK.map((c) => [c.flashcardId, newCardState("student-demo", c.flashcardId)])));
            setReviewed(0);
            setAgain(0);
          }}
          className={toolButtonClass}
        >
          <RotateCcw size={15} aria-hidden /> Restart session
        </button>
        <span className="ml-auto hidden items-center gap-1.5 text-[11.5px] text-[var(--faint)] sm:inline-flex">
          <Layers size={13} aria-hidden /> Cards from the same note are held back until tomorrow
        </span>
      </div>
    </div>
  );
}
