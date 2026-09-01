import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Smartphone,
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
  { minutes: 15, price: 349, label: "Quick check" },
  { minutes: 30, price: 599, label: "Focused help" },
  { minutes: 45, price: 849, label: "Deep working" },
];
const paymentMethods = [
  { id: "upi", Icon: Smartphone, label: "UPI", detail: "Pay with any UPI app" },
  { id: "card", Icon: CreditCard, label: "Card", detail: "Credit or debit" },
  { id: "netbanking", Icon: Building2, label: "Net banking", detail: "All major banks" },
] as const;
type PaymentMethod = (typeof paymentMethods)[number]["id"];
type Step = "details" | "payment" | "confirmed";

const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function TeacherBookingPage() {
  const teacher = useLoaderData() as Teacher;
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [selectedDay, setSelectedDay] = useState(3);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const days = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1), []);

  const canBook = Boolean(selectedSlot && duration && query.trim().length >= 10);
  const selectedDuration = durations.find((item) => item.minutes === duration) ?? null;
  const dateLabel = new Date(`2026-09-${String(selectedDay).padStart(2, "0")}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pay = async () => {
    if (!method || !selectedSlot || !selectedDuration) return;
    setSubmitting(true);
    await services.booking.hold(
      teacher.teacherId,
      `2026-09-${String(selectedDay).padStart(2, "0")}T${selectedSlot}:00+05:30`,
    );
    setSubmitting(false);
    setStep("confirmed");
  };

  if (step === "confirmed" && selectedDuration)
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-5 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-[var(--secure-soft)] text-[var(--secure)]">
          <Check size={26} aria-hidden />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Slot held in this prototype
        </span>
        <h1 className="text-balance font-display text-[24px] font-bold text-[var(--ink)]">
          Your session with {teacher.displayName} is ready.
        </h1>
        <p className="text-[14px] text-[var(--muted)]">
          {dateLabel} · {selectedSlot} IST · {selectedDuration.minutes} minutes · {rupees(selectedDuration.price)} paid via{" "}
          {paymentMethods.find((item) => item.id === method)?.label}
        </p>
        <Card className="w-full text-left">
          <strong className="text-[13px] font-semibold text-[var(--ink)]">Query shared with the teacher</strong>
          <p className="mt-1.5 text-[14px] text-[var(--ink-soft)]">{query}</p>
        </Card>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => navigate("/app/calendar")}>
            <CalendarDays size={16} aria-hidden />
            View schedule
          </Button>
          <Button className="flex-1" onClick={() => navigate("/app/home")}>Return home</Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/app/teachers"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} aria-hidden />
        Back to teachers
      </Link>

      <Card className="mt-4 grid gap-6 p-0 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-5 border-b border-[var(--line)] p-5 lg:border-b-0 lg:border-r">
          <img
            src="/teacher-meera.svg"
            alt={`Portrait of ${teacher.displayName}`}
            width={88}
            height={88}
            className="size-22 rounded-[16px] object-cover"
          />
          <div>
            <Chip band="secure">Available this week</Chip>
            <h1 className="mt-2 font-display text-[19px] font-bold text-[var(--ink)]">{teacher.displayName}</h1>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">{teacher.credentials}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
              <Star size={14} fill="currentColor" className="text-[var(--developing)]" aria-hidden />
              {teacher.rating}
              <span className="font-normal text-[var(--muted)]">· {teacher.yearsExperience} years teaching</span>
            </div>
          </div>
          <ul className="grid gap-2.5 text-[13px] text-[var(--ink-soft)]">
            <li className="flex items-center gap-2">
              <GraduationCap size={16} className="shrink-0 text-[var(--muted)]" aria-hidden />
              CBSE Classes 5–8 specialist
            </li>
            <li className="flex items-center gap-2">
              <Video size={16} className="shrink-0 text-[var(--muted)]" aria-hidden />
              Secure video link after confirmation
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0 text-[var(--muted)]" aria-hidden />
              Learning context shared only with permission
            </li>
          </ul>

          {step === "details" && (
            <div className="grid gap-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                What do you need help with?
              </span>
              <label htmlFor="query-nature" className="text-[13px] font-semibold text-[var(--ink)]">
                Nature of your query <span className="font-normal text-[var(--muted)]">Required</span>
              </label>
              <textarea
                id="query-nature"
                required
                minLength={10}
                rows={4}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Describe the exact question, topic, or step that is confusing…"
                className="w-full resize-none rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] p-3 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
              />
              <small className="text-[12px] text-[var(--muted)]">
                {query.trim().length < 10
                  ? "Add at least 10 characters so your teacher can prepare."
                  : "This will be attached to the booking context."}
              </small>
            </div>
          )}
        </aside>

        {step === "details" ? (
          <main className="grid gap-6 p-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Choose your session
                </span>
                <h2 className="mt-1 font-display text-[19px] font-bold text-[var(--ink)]">Select a date and time</h2>
              </div>
              <Chip tone="primary">
                <Globe2 size={13} aria-hidden />
                India Standard Time
              </Chip>
            </header>

            <div className="grid gap-5 md:grid-cols-[minmax(0,260px)_1fr]">
              <section aria-label="Choose a date">
                <div className="flex items-center justify-between px-1">
                  <button
                    aria-label="Previous month"
                    disabled
                    className="grid size-8 place-items-center rounded-[8px] text-[var(--faint)] disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} aria-hidden />
                  </button>
                  <strong className="text-[13px] font-semibold text-[var(--ink)]">September 2026</strong>
                  <button
                    aria-label="Next month"
                    disabled
                    className="grid size-8 place-items-center rounded-[8px] text-[var(--faint)] disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} aria-hidden />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1 px-1 text-center text-[11px] font-semibold text-[var(--faint)]">
                  {weekdays.map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  <span />
                  <span />
                  {days.map((day) => {
                    const available = availableDays.has(day);
                    const selected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        disabled={!available}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedSlot(null);
                        }}
                        aria-pressed={selected}
                        aria-label={`${day} September${available ? ", available" : ", unavailable"}`}
                        className={`grid aspect-square place-items-center rounded-[8px] text-[13px] font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                          selected
                            ? "bg-[var(--primary)] text-white font-semibold"
                            : available
                              ? "text-[var(--ink)] hover:bg-[var(--surface-soft)] cursor-pointer"
                              : "text-[var(--faint)] cursor-not-allowed"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <footer className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3 text-[12px] text-[var(--muted)]">
                  <Globe2 size={14} aria-hidden />
                  <span><strong className="font-semibold text-[var(--ink)]">Time zone </strong>India Standard Time (IST)</span>
                </footer>
              </section>

              <section aria-label="Choose a start time">
                <h3 className="font-display text-[16px] font-bold text-[var(--ink)]">{dateLabel}</h3>
                <p className="mt-0.5 text-[13px] text-[var(--muted)]">Select an available start time</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const selected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={selected}
                        className={`flex items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[13.5px] font-semibold transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                          selected
                            ? "border-[var(--primary)] bg-[var(--primary-faint)] text-[var(--primary)]"
                            : "border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        <Clock3 size={14} aria-hidden />
                        {slot}
                        {selected && <Check size={14} aria-hidden />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Session length
                  </span>
                  <h3 className="mt-1 text-[15px] font-semibold text-[var(--ink)]">
                    How long should the meeting be? <span className="font-normal text-[var(--muted)]">Required</span>
                  </h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {durations.map((item) => {
                      const selected = duration === item.minutes;
                      return (
                        <button
                          key={item.minutes}
                          onClick={() => setDuration(item.minutes)}
                          aria-pressed={selected}
                          className={`flex flex-col gap-1 rounded-[10px] border p-3 text-left transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                            selected
                              ? "border-[var(--primary)] bg-[var(--primary-faint)]"
                              : "border-[var(--line-strong)] hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
                          }`}
                        >
                          <strong className={`text-[14px] font-semibold ${selected ? "text-[var(--primary)]" : "text-[var(--ink)]"}`}>
                            {item.minutes} min
                          </strong>
                          <small className="text-[12px] text-[var(--muted)]">{item.label}</small>
                          <b className={`mt-1 text-[13px] font-bold ${selected ? "text-[var(--primary)]" : "text-[var(--ink)]"}`}>
                            {rupees(item.price)}
                          </b>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            <footer className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong className="block text-[14px] font-semibold text-[var(--ink)]">
                  {selectedSlot && duration ? `${selectedDay} Sep · ${selectedSlot} · ${duration} min` : "Complete the required details"}
                </strong>
                <span className="text-[13px] text-[var(--muted)]">
                  {!selectedSlot ? "Choose a time" : !duration ? "Choose a duration" : query.trim().length < 10 ? "Describe your query" : "Ready to continue"}
                </span>
              </div>
              <Button onClick={() => setStep("payment")} disabled={!canBook}>
                Continue to payment
              </Button>
            </footer>
          </main>
        ) : (
          <main className="grid gap-6 p-5">
            <header>
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">Last step</span>
              <h2 className="mt-1 font-display text-[19px] font-bold text-[var(--ink)]">Review and pay</h2>
            </header>

            <Card className="grid gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--muted)]">Teacher</span>
                <strong className="font-semibold text-[var(--ink)]">{teacher.displayName}</strong>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--muted)]">Session</span>
                <strong className="font-semibold text-[var(--ink)]">{dateLabel} · {selectedSlot} IST</strong>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--muted)]">Duration</span>
                <strong className="font-semibold text-[var(--ink)]">{selectedDuration?.minutes} minutes</strong>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-[15px]">
                <span className="font-semibold text-[var(--ink)]">Total</span>
                <strong className="font-display text-[19px] font-bold text-[var(--ink)]">
                  {selectedDuration ? rupees(selectedDuration.price) : "—"}
                </strong>
              </div>
            </Card>

            <div>
              <span className="text-[13px] font-semibold text-[var(--ink)]">Pay with</span>
              <div role="radiogroup" aria-label="Payment method" className="mt-2 grid gap-2 sm:grid-cols-3">
                {paymentMethods.map(({ id, Icon, label, detail }) => {
                  const selected = method === id;
                  return (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMethod(id)}
                      className={`flex flex-col items-start gap-2 rounded-[10px] border p-3 text-left transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary-faint)]"
                          : "border-[var(--line-strong)] hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <Icon size={18} aria-hidden className={selected ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                      <strong className={`text-[13.5px] font-semibold ${selected ? "text-[var(--primary)]" : "text-[var(--ink)]"}`}>
                        {label}
                      </strong>
                      <small className="text-[11.5px] text-[var(--muted)]">{detail}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-[10px] bg-[var(--surface-soft)] p-3 text-[12.5px] leading-snug text-[var(--ink-soft)]">
              <ShieldCheck size={15} aria-hidden className="mt-0.5 shrink-0 text-[var(--muted)]" />
              Payments are encrypted end to end. This prototype does not process a real charge.
            </p>

            <footer className="flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" onClick={() => setStep("details")}>
                <ArrowLeft size={15} aria-hidden />
                Back
              </Button>
              <Button onClick={pay} disabled={!method} loading={submitting}>
                <Banknote size={16} aria-hidden />
                Pay {selectedDuration ? rupees(selectedDuration.price) : ""} &amp; confirm
              </Button>
            </footer>
          </main>
        )}
      </Card>
    </div>
  );
}
