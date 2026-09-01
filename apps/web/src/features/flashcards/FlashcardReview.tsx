import katex from "katex";
import { ArrowLeft, EyeOff, HelpCircle, Layers, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CardState, Flashcard, ReviewRating } from "@vidya/contracts";
import { Button, Card } from "@vidya/ui";
import {
  applyRating, endOfDay, isBuried, isDue, LEECH_THRESHOLD, newCardState, previewIntervals,
} from "./scheduler";

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

const RATINGS: { rating: ReviewRating; label: string; tone: string }[] = [
  { rating: 1, label: "Again", tone: "again" },
  { rating: 2, label: "Hard", tone: "hard" },
  { rating: 3, label: "Good", tone: "good" },
  { rating: 4, label: "Easy", tone: "easy" },
];

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
      <div className="page">
        <Card className="review-done">
          <Sparkles size={30} aria-hidden />
          <h1>Deck clear for today</h1>
          {reviewed > 0
            ? <p>{reviewed} card{reviewed === 1 ? "" : "s"} reviewed · {accuracy}% recalled first time.</p>
            : <p>Nothing is due right now. Cards come back when you're about to forget them.</p>}
          <Link to="/app/home"><Button>Back to today</Button></Link>
        </Card>
      </div>
    );
  }

  const leechWarning = state.lapses >= LEECH_THRESHOLD / 2;

  return (
    <div className="page review">
      <header className="review__bar">
        <Link to="/app/home" className="icon-button" aria-label="Leave review"><ArrowLeft size={19} /></Link>
        <div className="review__counts" aria-label="Cards remaining by queue">
          <span className="review__count review__count--new">{counts.newCards} new</span>
          <span className="review__count review__count--learn">{counts.learning} learning</span>
          <span className="review__count review__count--due">{counts.review} review</span>
        </div>
        <span className="review__deck">{card.deck === "exam_rehearsal" ? "Exam practice" : "Mastery"}</span>
      </header>

      {leechWarning && (
        // P3 section 4: Anki suspends a leech. On a required syllabus that
        // silently removes the content the student most needs, so we route it to
        // a human instead - the best-qualified teacher-call signal we get.
        <div className="review__leech" role="status">
          <HelpCircle size={17} aria-hidden />
          <p>This one keeps slipping. Worth ten minutes with a teacher.</p>
          <Link to="/app/teachers" className="review__leech-cta">Book a call</Link>
        </div>
      )}

      <Card className="review__card">
        <p className="review__prompt">{card.front}</p>

        {revealed ? (
          <div className="review__answer">
            <hr />
            <p>{card.back}</p>
            {card.backLatex && <MathDisplay value={card.backLatex} />}
          </div>
        ) : (
          <Button className="review__reveal" onClick={() => setRevealed(true)}>
            Show answer <kbd>Space</kbd>
          </Button>
        )}
      </Card>

      {revealed && (
        <div className="review__ratings" role="group" aria-label="How well did you recall it?">
          {RATINGS.map(({ rating, label, tone }) => (
            <button key={rating} className={`review__rating review__rating--${tone}`} onClick={() => rate(rating)}>
              <strong>{label}</strong>
              {/* The interval preview is the mechanic that makes rating honest:
                  the cost of "Easy" is visible before you press it. */}
              <span>{previews[rating]}</span>
              <kbd>{rating}</kbd>
            </button>
          ))}
        </div>
      )}

      <div className="review__tools">
        <button onClick={() => advance((s) => ({ ...s, buriedUntil: endOfDay(now) }))}>
          <EyeOff size={16} aria-hidden /> Bury until tomorrow
        </button>
        <button onClick={() => advance((s) => ({ ...s, flaggedForHelp: true }))}>
          <HelpCircle size={16} aria-hidden /> Ask about this
        </button>
        <button onClick={() => { setRevealed(false); setStates(Object.fromEntries(DECK.map((c) => [c.flashcardId, newCardState("student-demo", c.flashcardId)]))); setReviewed(0); setAgain(0); }}>
          <RotateCcw size={16} aria-hidden /> Restart session
        </button>
        <span className="review__tools-note">
          <Layers size={14} aria-hidden /> Cards from the same note are held back until tomorrow
        </span>
      </div>
    </div>
  );
}
