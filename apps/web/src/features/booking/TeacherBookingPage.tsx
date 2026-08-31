import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import type { Teacher } from "@vidya/contracts";
import { Button, Card, Chip } from "@vidya/ui";
import { services } from "../../lib/services";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const availableDays = new Set([3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29]);
const slots = ["15:00", "15:30", "16:00", "17:30"];
const durations = [
  { minutes: 15, price: "₹349", label: "Quick check" },
  { minutes: 30, price: "₹599", label: "Focused help" },
  { minutes: 45, price: "₹849", label: "Deep working" },
];

export function TeacherBookingPage() {
  const teacher = useLoaderData() as Teacher;
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(3);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const days = useMemo(
    () => Array.from({ length: 30 }, (_, index) => index + 1),
    [],
  );
  const canBook = Boolean(
    selectedSlot && duration && query.trim().length >= 10,
  );
  const confirm = async () => {
    if (!canBook || !selectedSlot) return;
    setSubmitting(true);
    await services.booking.hold(
      teacher.teacherId,
      `2026-09-${String(selectedDay).padStart(2, "0")}T${selectedSlot}:00+05:30`,
    );
    setSubmitting(false);
    setConfirmed(true);
  };

  if (confirmed)
    return (
      <div className="booking-confirmed">
        <div className="booking-confirmed__mark">
          <Check />
        </div>
        <span className="eyebrow">Slot held in this prototype</span>
        <h1>Your session with {teacher.displayName} is ready.</h1>
        <p>
          {selectedDay} September 2026 · {selectedSlot} IST · {duration} minutes
        </p>
        <Card>
          <strong>Query shared with the teacher</strong>
          <p>{query}</p>
        </Card>
        <div>
          <Button variant="secondary" onClick={() => navigate("/app/calendar")}>
            <CalendarDays />
            View schedule
          </Button>
          <Button onClick={() => navigate("/app/home")}>Return home</Button>
        </div>
      </div>
    );

  return (
    <div className="teacher-booking-page">
      <Link to="/app/teachers" className="booking-back">
        <ArrowLeft />
        Back to teachers
      </Link>
      <Card className="booking-shell">
        <aside className="booking-teacher">
          <img
            src="/teacher-meera.svg"
            alt={`Portrait of ${teacher.displayName}`}
          />
          <div>
            <Chip tone="success">Available this week</Chip>
            <h1>{teacher.displayName}</h1>
            <p>{teacher.credentials}</p>
            <div className="teacher-rating">
              <Star fill="currentColor" />
              {teacher.rating}
              <span>· {teacher.yearsExperience} years teaching</span>
            </div>
          </div>
          <ul>
            <li>
              <GraduationCap />
              CBSE Classes 5–8 specialist
            </li>
            <li>
              <Video />
              Secure video link after confirmation
            </li>
            <li>
              <ShieldCheck />
              Learning context shared only with permission
            </li>
          </ul>
          <section>
            <span className="eyebrow">What do you need help with?</span>
            <label htmlFor="query-nature">
              Nature of your query <strong>Required</strong>
            </label>
            <textarea
              id="query-nature"
              required
              minLength={10}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe the exact question, topic, or step that is confusing. For example: I can form the equation but get stuck moving terms across the equals sign."
            />
            <small>
              {query.trim().length < 10
                ? "Please add at least 10 characters so your teacher can prepare."
                : "This will be attached to the booking context."}
            </small>
          </section>
        </aside>
        <main className="booking-picker">
          <header>
            <div>
              <span className="eyebrow">Choose your session</span>
              <h2>Select a date and time</h2>
            </div>
            <Chip tone="primary">
              <Globe2 />
              India Standard Time
            </Chip>
          </header>
          <div className="booking-columns">
            <section className="mini-calendar">
              <div className="mini-calendar__nav">
                <button aria-label="Previous month">
                  <ChevronLeft />
                </button>
                <strong>September 2026</strong>
                <button aria-label="Next month">
                  <ChevronRight />
                </button>
              </div>
              <div className="mini-calendar__weekdays">
                {weekdays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mini-calendar__days">
                <span />
                <span />
                {days.map((day) => (
                  <button
                    key={day}
                    disabled={!availableDays.has(day)}
                    className={selectedDay === day ? "selected" : ""}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedSlot(null);
                    }}
                    aria-label={`${day} September${availableDays.has(day) ? ", available" : ", unavailable"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <footer>
                <Globe2 />
                <span>
                  <strong>Time zone</strong>India Standard Time (IST)
                </span>
              </footer>
            </section>
            <section className="slot-picker">
              <h3>
                {new Date(
                  `2026-09-${String(selectedDay).padStart(2, "0")}T12:00:00`,
                ).toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <p>Select an available start time</p>
              <div>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={selectedSlot === slot ? "selected" : ""}
                  >
                    <Clock3 />
                    {slot}
                    {selectedSlot === slot && <Check />}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <section className="duration-picker">
            <div>
              <span className="eyebrow">Session length</span>
              <h3>
                How long should the meeting be? <strong>Required</strong>
              </h3>
            </div>
            <div>
              {durations.map((item) => (
                <button
                  key={item.minutes}
                  onClick={() => setDuration(item.minutes)}
                  className={duration === item.minutes ? "selected" : ""}
                >
                  <span>
                    <strong>{item.minutes} min</strong>
                    <small>{item.label}</small>
                  </span>
                  <b>{item.price}</b>
                </button>
              ))}
            </div>
          </section>
          <footer className="booking-submit">
            <div>
              <strong>
                {selectedSlot && duration
                  ? `${selectedDay} Sep · ${selectedSlot} · ${duration} min`
                  : "Complete the required details"}
              </strong>
              <span>
                {!selectedSlot
                  ? "Choose a time"
                  : !duration
                    ? "Choose a duration"
                    : query.trim().length < 10
                      ? "Describe your query"
                      : "Ready to continue"}
              </span>
            </div>
            <Button onClick={confirm} disabled={!canBook} loading={submitting}>
              Continue to confirmation
            </Button>
          </footer>
        </main>
      </Card>
    </div>
  );
}
