import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from "ts-fsrs";
import type { CardPhase, CardState, ReviewRating } from "@vidya/contracts";

/** FSRS is Anki's own scheduler, available separately under MIT (ADR-009).
 *  Desired retention is FIXED at the documented 0.90 default and deliberately
 *  not exposed to students - P3 section 5: every scheduling knob Anki offers is
 *  a way for a child to make their own schedule worse. */
export const DESIRED_RETENTION = 0.9;
export const LEECH_THRESHOLD = 8;

const engine = fsrs(generatorParameters({ request_retention: DESIRED_RETENTION, enable_fuzz: true }));

const PHASE_TO_STATE: Record<CardPhase, State> = {
  new: State.New, learning: State.Learning, review: State.Review, relearning: State.Relearning,
};
const STATE_TO_PHASE: Record<number, CardPhase> = {
  [State.New]: "new", [State.Learning]: "learning", [State.Review]: "review", [State.Relearning]: "relearning",
};
const RATING: Record<ReviewRating, Grade> = {
  1: Rating.Again, 2: Rating.Hard, 3: Rating.Good, 4: Rating.Easy,
};

const toCard = (state: CardState): Card => ({
  ...createEmptyCard(new Date(state.lastReview ?? Date.now())),
  due: new Date(state.due),
  stability: state.stability,
  difficulty: state.difficulty,
  reps: state.reps,
  lapses: state.lapses,
  state: PHASE_TO_STATE[state.phase],
  last_review: state.lastReview ? new Date(state.lastReview) : undefined,
});

/** Every rating button previews when the card returns. P3 section 1 calls this
 *  the mechanic that makes rating honest - the cost of "Easy" is visible before
 *  you press it - so the UI must never render a button without it. */
export function previewIntervals(state: CardState, now = new Date()): Record<ReviewRating, string> {
  const scheduled = engine.repeat(toCard(state), now);
  const out = {} as Record<ReviewRating, string>;
  ([1, 2, 3, 4] as ReviewRating[]).forEach((rating) => {
    out[rating] = humanise(scheduled[RATING[rating]].card.due, now);
  });
  return out;
}

export function applyRating(state: CardState, rating: ReviewRating, now = new Date()): CardState {
  const next = engine.repeat(toCard(state), now)[RATING[rating]].card;
  const lapses = next.lapses;
  return {
    ...state,
    stability: next.stability,
    difficulty: next.difficulty,
    due: next.due.toISOString(),
    lastReview: now.toISOString(),
    reps: next.reps,
    lapses,
    phase: STATE_TO_PHASE[next.state] ?? "review",
    // P3 section 4: at threshold we stop normal review and raise a teacher
    // prompt. Anki suspends here; for a required syllabus that would silently
    // drop the exact content the student is struggling with most.
    isLeech: lapses >= LEECH_THRESHOLD,
  };
}

export function humanise(due: Date, now = new Date()): string {
  const mins = Math.round((due.getTime() - now.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days}d`;
  const months = Math.round(days / 30.4);
  if (months < 12) return `${months}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export const isBuried = (state: CardState, now = new Date()) =>
  Boolean(state.buriedUntil && new Date(state.buriedUntil) > now);

/** End of the local day, matching Anki's "buried until the clock rolls over". */
export function endOfDay(now = new Date()): string {
  const d = new Date(now); d.setHours(23, 59, 59, 999); return d.toISOString();
}

export function isDue(state: CardState, now = new Date()) {
  return !state.suspended && !state.isLeech && !isBuried(state, now) && new Date(state.due) <= now;
}

export const newCardState = (studentId: string, flashcardId: string): CardState => {
  const empty = createEmptyCard(new Date());
  return {
    studentId, flashcardId,
    stability: empty.stability, difficulty: empty.difficulty,
    due: empty.due.toISOString(), lastReview: null,
    reps: 0, lapses: 0, phase: "new",
    buriedUntil: null, suspended: false, isLeech: false, flaggedForHelp: false,
  };
};
