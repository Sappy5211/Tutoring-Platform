import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Plus,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import type { LearningCalendarEvent } from "@vidya/contracts";
import { Button, Card, Chip } from "@vidya/ui";

type EventKind = "exam" | "study" | "assignment" | "teacher";
type LearningEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: EventKind;
  detail: string;
};

const seededEvents: LearningEvent[] = [
  {
    id: "event-1",
    title: "Fractions checkpoint",
    date: "2026-09-03",
    time: "9:00 AM",
    kind: "assignment",
    detail: "Class 7 · 12 questions",
  },
  {
    id: "event-2",
    title: "Lines & angles review",
    date: "2026-09-08",
    time: "5:30 PM",
    kind: "study",
    detail: "20-minute focused plan",
  },
  {
    id: "event-3",
    title: "Call with Meera",
    date: "2026-09-12",
    time: "6:00 PM",
    kind: "teacher",
    detail: "Simple equations · 30 minutes",
  },
  {
    id: "event-4",
    title: "School maths exam",
    date: "2026-09-24",
    time: "10:00 AM",
    kind: "exam",
    detail: "Term assessment · Chapters 1–6",
  },
  {
    id: "event-5",
    title: "Flashcard catch-up",
    date: "2026-09-17",
    time: "5:00 PM",
    kind: "study",
    detail: "14 cards due",
  },
];

const kindLabel: Record<EventKind, string> = {
  exam: "Exam",
  study: "Study plan",
  assignment: "Assignment",
  teacher: "Teacher call",
};
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function ScheduleCalendar({
  initialEvents = seededEvents,
}: {
  initialEvents?: LearningEvent[];
}) {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<EventKind | "all">("all");
  const [selectedDate, setSelectedDate] = useState("2026-09-24");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    date: "2026-09-24",
    time: "09:00",
    kind: "exam" as EventKind,
    detail: "",
  });
  const monthLabel = month.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const leading = (first.getDay() + 6) % 7;
    const total = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from(
        { length: total },
        (_, index) =>
          new Date(month.getFullYear(), month.getMonth(), index + 1),
      ),
    ];
  }, [month]);
  const visibleEvents = events.filter(
    (event) => filter === "all" || event.kind === filter,
  );
  const selectedEvents = visibleEvents.filter(
    (event) => event.date === selectedDate,
  );
  const navigate = (amount: number) =>
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  const create = () => {
    if (!draft.title.trim() || !draft.date) return;
    setEvents((current) => [...current, { ...draft, id: crypto.randomUUID() }]);
    setSelectedDate(draft.date);
    setCreating(false);
    setDraft({
      title: "",
      date: draft.date,
      time: "09:00",
      kind: "exam",
      detail: "",
    });
  };

  return (
    <div className="calendar-layout">
      <Card className="calendar-card">
        <header className="calendar-toolbar">
          <div>
            <span className="eyebrow">Learning schedule</span>
            <h2>{monthLabel}</h2>
          </div>
          <div className="calendar-nav">
            <button onClick={() => navigate(-1)} aria-label="Previous month">
              <ChevronLeft />
            </button>
            <button onClick={() => setMonth(new Date(2026, 8, 1))}>
              Today
            </button>
            <button onClick={() => navigate(1)} aria-label="Next month">
              <ChevronRight />
            </button>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus />
            Add event
          </Button>
        </header>
        <div className="calendar-filters" aria-label="Filter schedule">
          {(["all", "exam", "assignment", "study", "teacher"] as const).map(
            (kind) => (
              <button
                key={kind}
                className={filter === kind ? "active" : ""}
                onClick={() => setFilter(kind)}
              >
                {kind === "all" ? "All" : kindLabel[kind]}
              </button>
            ),
          )}
        </div>
        <div className="calendar-grid calendar-grid--head">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((day, index) =>
            day ? (
              <button
                key={iso(day)}
                className={`calendar-day ${selectedDate === iso(day) ? "selected" : ""}`}
                onClick={() => setSelectedDate(iso(day))}
                aria-label={`${day.toLocaleDateString("en-IN", { month: "long", day: "numeric" })}, ${visibleEvents.filter((event) => event.date === iso(day)).length} events`}
              >
                <span>{day.getDate()}</span>
                <div>
                  {visibleEvents
                    .filter((event) => event.date === iso(day))
                    .slice(0, 2)
                    .map((event) => (
                      <i
                        key={event.id}
                        className={`event-dot event-dot--${event.kind}`}
                      >
                        {event.title}
                      </i>
                    ))}
                </div>
              </button>
            ) : (
              <span
                className="calendar-day calendar-day--empty"
                key={`empty-${index}`}
              />
            ),
          )}
        </div>
      </Card>
      <aside className="calendar-agenda">
        <Card>
          <span className="eyebrow">Selected day</span>
          <h2>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {selectedEvents.length ? (
            <div className="agenda-list">
              {selectedEvents.map((event) => (
                <article
                  key={event.id}
                  className={`agenda-event agenda-event--${event.kind}`}
                >
                  <span>
                    {event.kind === "exam" ? (
                      <GraduationCap />
                    ) : event.kind === "teacher" ? (
                      <UsersRound />
                    ) : event.kind === "study" ? (
                      <Sparkles />
                    ) : (
                      <CalendarDays />
                    )}
                  </span>
                  <div>
                    <Chip
                      tone={
                        event.kind === "exam"
                          ? "warning"
                          : event.kind === "teacher"
                            ? "primary"
                            : "success"
                      }
                    >
                      {kindLabel[event.kind]}
                    </Chip>
                    <h3>{event.title}</h3>
                    <p>{event.detail}</p>
                    {event.time && (
                      <small>
                        <Clock3 />
                        {event.time}
                      </small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="calendar-empty">
              <CalendarDays />
              <strong>No events yet</strong>
              <p>
                Keep this day free or add an exam, study block, assignment, or
                call.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft((current) => ({ ...current, date: selectedDate }));
                  setCreating(true);
                }}
              >
                Add to this day
              </Button>
            </div>
          )}
        </Card>
        <Card className="calendar-insight">
          <Sparkles />
          <div>
            <strong>Exam pacing is active</strong>
            <p>
              VIDYA uses the 24 September goal to balance new learning with
              spaced review.
            </p>
          </div>
        </Card>
      </aside>
      {creating && (
        <div className="dialog-backdrop" onMouseDown={() => setCreating(false)}>
          <form
            className="event-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
          >
            <header>
              <div>
                <span className="eyebrow">New schedule item</span>
                <h2>Add an event</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreating(false)}
                aria-label="Close event form"
              >
                <X />
              </button>
            </header>
            <label>
              Title
              <input
                autoFocus
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                placeholder="e.g. School maths exam"
              />
            </label>
            <div className="event-form-row">
              <label>
                Date
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft({ ...draft, date: event.target.value })
                  }
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={draft.time}
                  onChange={(event) =>
                    setDraft({ ...draft, time: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Type
              <select
                value={draft.kind}
                onChange={(event) =>
                  setDraft({ ...draft, kind: event.target.value as EventKind })
                }
              >
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="study">Study plan</option>
                <option value="teacher">Teacher call</option>
              </select>
            </label>
            <label>
              Details
              <textarea
                value={draft.detail}
                onChange={(event) =>
                  setDraft({ ...draft, detail: event.target.value })
                }
                placeholder="Chapters, skills, or preparation notes"
              />
            </label>
            <footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!draft.title.trim()}>
                Add to schedule
              </Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

export function CalendarPage() {
  const events = useLoaderData() as LearningCalendarEvent[];
  return (
    <div className="page calendar-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Exams, learning, and live help</span>
          <h1>Your schedule</h1>
          <p>
            See school exams alongside the work that prepares you for
            them—without turning every day into a deadline.
          </p>
        </div>
      </header>
      <ScheduleCalendar initialEvents={events} />
    </div>
  );
}
