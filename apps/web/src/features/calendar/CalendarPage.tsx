import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Sparkles,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import type { LearningCalendarEvent, LearningEventKind } from "@vidya/contracts";
import { Button, Card, Chip, EmptyState, type Band } from "@vidya/ui";

type View = "month" | "week" | "day" | "list";
type Draft = { title: string; date: string; time: string; kind: LearningEventKind; detail: string };

const TODAY_ISO = "2026-09-01";
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEWS: { id: View; label: string; Icon: LucideIcon }[] = [
  { id: "month", label: "Month", Icon: LayoutGrid },
  { id: "week", label: "Week", Icon: CalendarRange },
  { id: "day", label: "Day", Icon: CalendarDays },
  { id: "list", label: "List", Icon: ListIcon },
];

const KIND_STYLE: Record<LearningEventKind, { label: string; Icon: LucideIcon; dotVar: string; chip: { band?: Band; tone?: "primary" } }> = {
  exam: { label: "Exam", Icon: GraduationCap, dotVar: "--needswork", chip: { band: "needswork" } },
  assignment: { label: "Assignment", Icon: ClipboardList, dotVar: "--developing", chip: { band: "developing" } },
  study: { label: "Study plan", Icon: Sparkles, dotVar: "--secure", chip: { band: "secure" } },
  teacher: { label: "Teacher call", Icon: UsersRound, dotVar: "--primary", chip: { tone: "primary" } },
};

const seededEvents: LearningCalendarEvent[] = [
  { id: "event-1", title: "Fractions checkpoint", date: "2026-09-03", time: "09:00", kind: "assignment", detail: "Class 7 · 12 questions" },
  { id: "event-2", title: "Lines & angles review", date: "2026-09-08", time: "17:30", kind: "study", detail: "20-minute focused plan" },
  { id: "event-3", title: "Call with Meera", date: "2026-09-12", time: "18:00", kind: "teacher", detail: "Simple equations · 30 minutes" },
  { id: "event-4", title: "School maths exam", date: "2026-09-24", time: "10:00", kind: "exam", detail: "Term assessment · Chapters 1–6" },
  { id: "event-5", title: "Flashcard catch-up", date: "2026-09-17", time: "17:00", kind: "study", detail: "14 cards due" },
];

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromISO = (value: string) => new Date(`${value}T12:00:00`);
const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const startOfWeek = (date: Date) => {
  const day = (date.getDay() + 6) % 7; // Monday = 0
  return addDays(date, -day);
};
const formatTime = (time?: string) => {
  if (!time) return undefined;
  return new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

function EventPill({ event }: { event: LearningCalendarEvent }) {
  const { label, Icon, dotVar } = KIND_STYLE[event.kind];
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-2.5">
      <span
        aria-hidden
        className="mt-1 size-2 shrink-0 rounded-full"
        style={{ backgroundColor: `var(${dotVar})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          <Icon size={12} aria-hidden />
          {label}
          {event.time && <span className="normal-case tracking-normal text-[var(--faint)]">· {formatTime(event.time)}</span>}
        </div>
        <p className="mt-0.5 truncate text-[13.5px] font-semibold text-[var(--ink)]">{event.title}</p>
        <p className="truncate text-[12px] text-[var(--muted)]">{event.detail}</p>
      </div>
    </div>
  );
}

function ViewSwitcher({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <>
      <label className="sr-only" htmlFor="calendar-view">Calendar view</label>
      <select
        id="calendar-view"
        value={view}
        onChange={(event) => onChange(event.target.value as View)}
        className="h-9 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 text-[13px] font-semibold text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] sm:hidden"
      >
        {VIEWS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <div role="radiogroup" aria-label="Calendar view" className="hidden items-center gap-0.5 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] p-0.5 sm:flex">
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="radio"
            aria-checked={view === id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
              view === id ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Icon size={14} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

export function CalendarPage() {
  const initialEvents = useLoaderData() as LearningCalendarEvent[];
  const [events, setEvents] = useState(initialEvents.length ? initialEvents : seededEvents);
  const [view, setView] = useState<View>("month");
  const [filter, setFilter] = useState<LearningEventKind | "all">("all");
  const [anchorISO, setAnchorISO] = useState(TODAY_ISO);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>({ title: "", date: anchorISO, time: "09:00", kind: "exam", detail: "" });

  const anchor = fromISO(anchorISO);
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const weekStart = startOfWeek(anchor);

  const visibleEvents = useMemo(
    () => events.filter((event) => filter === "all" || event.kind === filter),
    [events, filter],
  );
  const eventsByDate = useMemo(() => {
    const map = new Map<string, LearningCalendarEvent[]>();
    for (const event of visibleEvents) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    return map;
  }, [visibleEvents]);

  const monthDays = useMemo(() => {
    const leading = (monthStart.getDay() + 6) % 7;
    const total = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: total }, (_, index) => new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1)),
    ];
  }, [monthStart]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const orderedDateKeys = useMemo(() => [...eventsByDate.keys()].sort(), [eventsByDate]);

  const shift = (amount: number) => {
    setAnchorISO((current) => {
      const date = fromISO(current);
      if (view === "month") return iso(new Date(date.getFullYear(), date.getMonth() + amount, 1));
      if (view === "week") return iso(addDays(date, amount * 7));
      if (view === "day") return iso(addDays(date, amount));
      return current;
    });
  };

  const openCreate = (date = anchorISO) => {
    setDraft((current) => ({ ...current, date }));
    setCreating(true);
  };
  const createEvent = () => {
    if (!draft.title.trim() || !draft.date) return;
    setEvents((current) => [...current, { ...draft, id: crypto.randomUUID() }]);
    setAnchorISO(draft.date);
    setCreating(false);
    setDraft({ title: "", date: draft.date, time: "09:00", kind: "exam", detail: "" });
  };

  const headerLabel =
    view === "month"
      ? monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : view === "week"
        ? `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${addDays(weekStart, 6).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
        : view === "day"
          ? anchor.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })
          : "All scheduled items";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <span className="text-[13px] font-semibold text-[var(--primary)]">Exams, learning, and live help</span>
        <h1 className="mt-1 text-balance font-display text-[26px] font-bold text-[var(--ink)] sm:text-[30px]">Your schedule</h1>
        <p className="mt-2 max-w-[60ch] text-[14px] text-[var(--muted)]">
          See school exams alongside the work that prepares you for them, without turning every day into a deadline.
        </p>
      </header>

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {view !== "list" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => shift(-1)}
                  aria-label="Previous"
                  className="grid size-8 place-items-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
                >
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <button
                  onClick={() => setAnchorISO(TODAY_ISO)}
                  className="rounded-[8px] px-2 py-1 text-[12.5px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => shift(1)}
                  aria-label="Next"
                  className="grid size-8 place-items-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
                >
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            )}
            <strong className="font-display text-[16px] font-bold text-[var(--ink)]">{headerLabel}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewSwitcher view={view} onChange={setView} />
            <Button size="sm" onClick={() => openCreate()}>
              <Plus size={15} aria-hidden />
              Add event
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] p-3" aria-label="Filter schedule">
          {(["all", "exam", "assignment", "study", "teacher"] as const).map((kind) => {
            const active = filter === kind;
            const label = kind === "all" ? "All" : KIND_STYLE[kind].label;
            return (
              <button
                key={kind}
                onClick={() => setFilter(kind)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                  active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {view === "month" && (
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--faint)]">
                {weekdays.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {monthDays.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} className="aspect-square" />;
                  const key = iso(day);
                  const dayEvents = eventsByDate.get(key) ?? [];
                  const selected = anchorISO === key;
                  const isToday = key === TODAY_ISO;
                  return (
                    <button
                      key={key}
                      onClick={() => setAnchorISO(key)}
                      aria-pressed={selected}
                      aria-label={`${day.toLocaleDateString("en-IN", { month: "long", day: "numeric" })}, ${dayEvents.length} events`}
                      className={`flex aspect-square flex-col items-start gap-1 rounded-[10px] border p-1.5 text-left transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary-faint)]"
                          : "border-transparent hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className={`grid size-6 place-items-center rounded-full text-[12.5px] font-semibold ${isToday ? "bg-[var(--primary)] text-white" : "text-[var(--ink)]"}`}>
                        {day.getDate()}
                      </span>
                      <span className="flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <i
                            key={event.id}
                            aria-hidden
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: `var(${KIND_STYLE[event.kind].dotVar})` }}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <h2 className="font-display text-[15px] font-bold text-[var(--ink)]">
                  {anchor.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                {(eventsByDate.get(anchorISO) ?? []).length ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(eventsByDate.get(anchorISO) ?? []).map((event) => <EventPill key={event.id} event={event} />)}
                  </div>
                ) : (
                  <div className="mt-3">
                    <EmptyState
                      icon={<CalendarDays size={26} aria-hidden />}
                      title="No events yet"
                      body="Keep this day free, or add an exam, study block, assignment, or call."
                      action={<Button variant="secondary" size="sm" onClick={() => openCreate(anchorISO)}>Add to this day</Button>}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-7">
              {weekDays.map((day) => {
                const key = iso(day);
                const dayEvents = eventsByDate.get(key) ?? [];
                const isToday = key === TODAY_ISO;
                return (
                  <div key={key} className="min-w-[140px]">
                    <div className={`mb-2 flex items-baseline justify-between rounded-[8px] px-2 py-1 text-[12.5px] font-semibold ${isToday ? "bg-[var(--primary-faint)] text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                      <span>{day.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span>{day.getDate()}</span>
                    </div>
                    <div className="grid gap-1.5">
                      {dayEvents.length
                        ? dayEvents.map((event) => <EventPill key={event.id} event={event} />)
                        : <p className="rounded-[10px] border border-dashed border-[var(--line)] p-2.5 text-center text-[12px] text-[var(--faint)]">No events</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "day" && (
            (eventsByDate.get(anchorISO) ?? []).length ? (
              <div className="grid gap-2">
                {(eventsByDate.get(anchorISO) ?? []).map((event) => <EventPill key={event.id} event={event} />)}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays size={26} aria-hidden />}
                title="No events on this day"
                body="Add an exam, study block, assignment, or call to fill this day in."
                action={<Button variant="secondary" size="sm" onClick={() => openCreate(anchorISO)}>Add to this day</Button>}
              />
            )
          )}

          {view === "list" && (
            orderedDateKeys.length ? (
              <div className="grid gap-5">
                {orderedDateKeys.map((key) => (
                  <div key={key}>
                    <h3 className="text-[12.5px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {fromISO(key).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
                    </h3>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {(eventsByDate.get(key) ?? []).map((event) => <EventPill key={event.id} event={event} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListIcon size={26} aria-hidden />}
                title="Nothing scheduled"
                body="Events you add, or that match the current filter, will show up here."
                action={<Button variant="secondary" size="sm" onClick={() => openCreate(TODAY_ISO)}>Add an event</Button>}
              />
            )
          )}
        </div>
      </Card>

      <Card className="flex items-start gap-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden />
        <div>
          <strong className="text-[13.5px] font-semibold text-[var(--ink)]">Exam pacing is active</strong>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            VIDYA uses the 24 September goal to balance new learning with spaced review.
          </p>
        </div>
      </Card>

      {creating && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[var(--ink)]/40 p-4"
          onMouseDown={() => setCreating(false)}
        >
          <form
            className="grid w-full max-w-md gap-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              createEvent();
            }}
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">New schedule item</span>
                <h2 className="mt-0.5 font-display text-[18px] font-bold text-[var(--ink)]">Add an event</h2>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Close event form"
                className="grid size-8 shrink-0 place-items-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
              >
                <X size={16} aria-hidden />
              </button>
            </header>

            <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
              Title
              <input
                autoFocus
                name="title"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="e.g. School maths exam"
                className="h-10 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-normal text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
                Date
                <input
                  type="date"
                  name="date"
                  value={draft.date}
                  onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                  className="h-10 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-normal text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
                Time
                <input
                  type="time"
                  name="time"
                  value={draft.time}
                  onChange={(event) => setDraft({ ...draft, time: event.target.value })}
                  className="h-10 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-normal text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
              Type
              <select
                name="kind"
                value={draft.kind}
                onChange={(event) => setDraft({ ...draft, kind: event.target.value as LearningEventKind })}
                className="h-10 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-normal text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
              >
                {(Object.keys(KIND_STYLE) as LearningEventKind[]).map((kind) => (
                  <option key={kind} value={kind}>{KIND_STYLE[kind].label}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
              Details
              <textarea
                name="detail"
                rows={3}
                value={draft.detail}
                onChange={(event) => setDraft({ ...draft, detail: event.target.value })}
                placeholder="Chapters, skills, or preparation notes"
                className="resize-none rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-[14px] font-normal text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
              />
            </label>

            <footer className="flex items-center justify-end gap-2 border-t border-[var(--line)] pt-4">
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={!draft.title.trim()}>Add to schedule</Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
