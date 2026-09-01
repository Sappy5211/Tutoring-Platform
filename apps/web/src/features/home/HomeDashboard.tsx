import {
  ArrowRight,
  BookMarked,
  CalendarDays,
  Flame,
  MoreHorizontal,
  Play,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import type {
  Booking,
  DashboardData,
  Exam,
  LearningCalendarEvent,
} from "@vidya/contracts";
import type { Band } from "@vidya/ui";
import {
  BAND_LABEL,
  Button,
  Card,
  EmptyState,
  Menu,
  MenuItem,
  ProgressRing,
  Skeleton,
  Toast,
  bandFor,
  revealOnHover,
} from "@vidya/ui";
import { services } from "../../lib/services";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* ── date helpers ───────────────────────────────────────────────────── */
const parseDateOnly = (value: string) =>
  new Date(value.length <= 10 ? `${value}T00:00:00` : value);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);

type Curriculum = Awaited<ReturnType<typeof services.repository.getCurriculum>>;

type Supplemental = {
  exams: Exam[];
  events: LearningCalendarEvent[];
  bookings: Booking[];
  curriculum: Curriculum;
};

/* ── widget shell ───────────────────────────────────────────────────── */
function Widget({ title, className, onHide, children }: {
  title: string; className?: string; onHide: () => void; children: ReactNode;
}) {
  return (
    <Card className={cx("group relative flex min-w-0 flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          {title}
        </span>
        <Menu
          label={`${title} widget options`}
          align="end"
          trigger={(open) => (
            <span className={cx(
              "grid size-7 place-items-center rounded-[8px] text-[var(--faint)]",
              "hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] transition-colors motion-reduce:transition-none",
              revealOnHover, open && "!opacity-100 bg-[var(--surface-soft)] text-[var(--ink)]",
            )}>
              <MoreHorizontal size={16} aria-hidden />
            </span>
          )}
        >
          <MenuItem onClick={onHide}>Hide widget</MenuItem>
        </Menu>
      </div>
      {children}
    </Card>
  );
}

/* ── widget: This week strip ────────────────────────────────────────── */
function WeekStrip({ events, bookings }: { events: LearningCalendarEvent[]; bookings: Booking[] }) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const hasStudy = events.some((e) => e.kind === "study" && sameDay(parseDateOnly(e.date), date));
    const hasCall = bookings.some((b) => b.status !== "cancelled" && sameDay(new Date(b.startsAt), date));
    return { date, marked: hasStudy || hasCall, isToday: sameDay(date, today) };
  });
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => (
        <div key={i} className="grid justify-items-center gap-1.5">
          <span className="text-[10.5px] font-medium text-[var(--faint)]">{labels[i]}</span>
          <span className={cx(
            "grid size-7 place-items-center rounded-full text-[12.5px] font-semibold tabular-nums",
            day.isToday ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-soft)]",
          )}>
            {day.date.getDate()}
          </span>
          <span className={cx(
            "size-1.5 rounded-full",
            day.marked ? "bg-[var(--primary)]" : "bg-transparent",
          )} aria-hidden />
        </div>
      ))}
    </div>
  );
}

export function HomeDashboard() {
  const data = useLoaderData() as DashboardData;
  const navigate = useNavigate();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [supp, setSupp] = useState<Supplemental | null>(null);
  const [suppFailed, setSuppFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      services.repository.getExams(),
      services.repository.getCalendarEvents(),
      services.repository.getBookings(),
      services.repository.getCurriculum(),
    ]).then(([exams, events, bookings, curriculum]) => {
      if (!alive) return;
      setSupp({ exams, events, bookings, curriculum });
    }).catch(() => { if (alive) setSuppFailed(true); });
    return () => { alive = false; };
  }, []);

  const hide = (id: string) => setHidden((prev) => new Set(prev).add(id));

  /* Today */
  const remainingMinutes = Math.max(data.dailyGoalMinutes - data.completedMinutes, 0) || data.dailyGoalMinutes;
  const topicReason = data.continueTopic.dueCards > 0
    ? `${data.continueTopic.dueCards} review card${data.continueTopic.dueCards === 1 ? "" : "s"} waiting on this topic`
    : `${data.continueTopic.mastery}% mastery so far — keep building on it`;

  /* Upcoming exams — real data from getExams() + calendar "exam" events, combined and de-duplicated */
  const upcomingExams = (() => {
    if (!supp) return null;
    const today = new Date();
    const rows = [
      ...supp.exams.map((e) => ({ id: e.examId, title: e.title, date: parseDateOnly(e.examDate) })),
      ...supp.events.filter((e) => e.kind === "exam").map((e) => ({ id: e.id, title: e.title, date: parseDateOnly(e.date) })),
    ];
    const seen = new Set<string>();
    const deduped = rows.filter((r) => {
      const key = r.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return deduped
      .filter((r) => daysBetween(today, r.date) >= 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  })();

  /* Mastery bands — real counts from getCurriculum() topics */
  const bandCounts = (() => {
    if (!supp) return null;
    const topics = supp.curriculum.flatMap((g) => g.chapters).flatMap((c) => c.topics);
    const counts: Record<Band, number> = { secure: 0, developing: 0, needswork: 0, locked: 0 };
    for (const topic of topics) counts[bandFor(topic.mastery)] += 1;
    return { counts, total: topics.length };
  })();

  return (
    <div className="mx-auto grid max-w-[1100px] gap-5 pb-16">
      <header className="grid gap-1.5">
        <span className="text-[13px] font-medium text-[var(--muted)]">Home &middot; your dashboard</span>
        <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
          {data.studentName.split(" ")[0] ?? data.studentName}&rsquo;s week at a glance
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:[grid-auto-flow:dense]">
        {/* Today — wide, the only saturated button on the screen */}
        {!hidden.has("today") && (
          <Widget title="Today" onHide={() => hide("today")} className="sm:col-span-2 lg:col-span-2">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <h2 className="text-balance font-display text-2xl font-bold tracking-[-0.01em] text-[var(--ink)]">
                  {data.continueTopic.skill.title}
                </h2>
                <p className="text-sm text-[var(--muted)]">{topicReason}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => navigate("/app/practice")}>
                  <Play size={16} fill="currentColor" aria-hidden />
                  Start &middot; {remainingMinutes} min
                </Button>
                <span className="text-[12.5px] text-[var(--faint)]">
                  {data.dailyGoalMinutes} min daily goal &middot; {data.completedMinutes} done today
                </span>
              </div>
            </div>
          </Widget>
        )}

        {/* Upcoming exams — tall, nearest emphasised */}
        {!hidden.has("exams") && (
          <Widget title="Upcoming exams" onHide={() => hide("exams")} className="lg:row-span-2">
            {supp === null && !suppFailed ? (
              <div className="grid gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : suppFailed || !upcomingExams || upcomingExams.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={28} aria-hidden />}
                title="No exam scheduled"
                body="Add a date and VIDYA will start counting down and shaping practice around it."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setToast("Exam scheduling moves to Schedule soon — not wired yet.")}
                  >
                    Set an exam
                  </Button>
                }
              />
            ) : (
              <ul className="grid gap-4">
                {upcomingExams.map((exam, i) => {
                  const remaining = daysBetween(new Date(), exam.date);
                  const dateLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(exam.date);
                  return (
                    <li key={exam.id} className="grid gap-0.5">
                      <strong className={cx(
                        "block truncate font-semibold text-[var(--ink)]",
                        i === 0 ? "text-[16px]" : "text-[14px]",
                      )}>
                        {exam.title}
                      </strong>
                      <span className="flex items-center gap-1.5 text-[12.5px]">
                        <span className="text-[var(--faint)]">{dateLabel}</span>
                        <span className={cx(
                          "tabular-nums font-semibold",
                          i === 0 ? "text-[var(--ink)]" : "text-[var(--muted)]",
                        )}>
                          &middot; {remaining === 0 ? "today" : `${remaining} day${remaining === 1 ? "" : "s"} left`}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Widget>
        )}

        {/* This week */}
        {!hidden.has("week") && (
          <Widget title="This week" onHide={() => hide("week")}>
            {supp === null && !suppFailed ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <WeekStrip events={supp?.events ?? []} bookings={supp?.bookings ?? []} />
            )}
          </Widget>
        )}

        {/* Progress — ring + band bars */}
        {!hidden.has("progress") && (
          <Widget title="Mastery" onHide={() => hide("progress")}>
            <div className="flex items-center gap-4">
              <ProgressRing value={data.averageMastery} label={`${data.averageMastery}% overall mastery`} />
              <div className="grid flex-1 gap-2">
                {(["secure", "developing", "needswork"] as Band[]).map((band) => {
                  const count = bandCounts?.counts[band] ?? 0;
                  const total = bandCounts?.total ?? 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={band} className="grid gap-1">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-medium text-[var(--muted)]">{BAND_LABEL[band]}</span>
                        <span className="tabular-nums font-semibold text-[var(--ink-soft)]">
                          {bandCounts ? count : <Skeleton className="inline-block h-3 w-4" />}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
                        <span
                          className={cx(
                            "block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
                            band === "secure" && "bg-[var(--secure)]",
                            band === "developing" && "bg-[var(--developing)]",
                            band === "needswork" && "bg-[var(--needswork)]",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Widget>
        )}

        {/* Review queue */}
        {!hidden.has("review") && (
          <Widget title="Review queue" onHide={() => hide("review")}>
            <div className="grid gap-3">
              <div className="grid gap-0.5">
                <strong className="text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[var(--ink)]">
                  {data.dueCards}
                </strong>
                <span className="text-[12.5px] text-[var(--muted)]">cards due for review</span>
              </div>
              <Link
                to="/app/flashcards"
                className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <BookMarked size={14} aria-hidden />
                Go to review
                <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          </Widget>
        )}

        {/* Streak — kept modest */}
        {!hidden.has("streak") && (
          <Widget title="Streak" onHide={() => hide("streak")}>
            <div className="flex items-center gap-3">
              <Flame size={18} className="text-[var(--faint)]" aria-hidden />
              <div className="grid gap-0.5">
                <strong className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[var(--ink)]">
                  {data.streakDays}
                </strong>
                <span className="text-[12px] text-[var(--muted)]">days</span>
              </div>
            </div>
          </Widget>
        )}
      </div>

      {hidden.size > 0 && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => setHidden(new Set())}>
            Show {hidden.size} hidden widget{hidden.size > 1 ? "s" : ""}
          </Button>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
