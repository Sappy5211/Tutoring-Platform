import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  Megaphone,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Booking, DashboardData, Exam, SurfaceData } from "@vidya/contracts";
import {
  BAND_LABEL,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  ProgressBar,
  ProgressRing,
  Skeleton,
  Toast,
  bandFor,
  revealOnHover,
} from "@vidya/ui";
import { services } from "../../lib/services";
import { useAppStore } from "../../lib/store";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

const LazyEditor = lazy(() => import("./TiptapEditor"));


const TONE_TEXT: Record<string, string> = {
  neutral: "text-[var(--ink)]",
  primary: "text-[var(--primary)]",
  success: "text-[var(--secure)]",
  warning: "text-[var(--developing)]",
  danger: "text-[var(--danger)]",
};

const teacherQuickLinks = [
  { to: "/teacher/classes", Icon: UsersRound, title: "View classes", meta: "See who needs help" },
  { to: "/teacher/assignments", Icon: BookOpenCheck, title: "All assignments", meta: "Choose and preview questions" },
  { to: "/teacher/availability", Icon: CalendarCheck2, title: "Manage availability", meta: "Calls and bookings" },
  { to: "/teacher/reports", Icon: Target, title: "Review weak skills", meta: "Mastery by class" },
];

/* ── Onboarding option kit: labelled radios, tinted icon tile, number-key select ──
   Shared by every question step below. `Continue ↵` replaces the shortcut badge
   on the row you have selected; Enter submits the step's <form> the normal way,
   so no bespoke Enter handling is needed. The digit shortcut is a bonus for
   sighted keyboard users only — it listens on `window`, not inside the radio
   group, and screen readers already own the digit keys in browse mode, so this
   never fights or traps assistive-tech navigation. Standard Tab/Arrow/Space on
   the real radio inputs keeps working regardless of whether the shortcut fires. */
type OnboardingOption<T extends string> = { value: T; Icon: LucideIcon; bold: string; rest?: string };

function OnboardingOptionGroup<T extends string>({
  groupLabelId, options, selected, onSelect,
}: {
  groupLabelId: string;
  options: OnboardingOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  const groupName = useId();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && target.tagName === "TEXTAREA") return;
      if (target instanceof HTMLInputElement && target.type !== "radio" && target.type !== "checkbox") return;
      const index = Number(event.key) - 1;
      const option = options[index];
      if (!option) return;
      event.preventDefault();
      onSelect(option.value);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [options, onSelect]);

  return (
    <div role="radiogroup" aria-labelledby={groupLabelId} className="grid gap-2.5">
      {options.map(({ value, Icon, bold, rest }, index) => {
        const inputId = `${groupName}-${index}`;
        const isSelected = selected === value;
        return (
          <div
            key={value}
            className={cx(
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--primary)]",
              "flex items-center gap-3 rounded-[14px] border-2 px-3.5 py-3 transition-colors motion-reduce:transition-none",
              isSelected
                ? "border-[var(--primary)] bg-[var(--primary-faint)]"
                : "border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
            )}
          >
            <input
              type="radio"
              id={inputId}
              name={groupName}
              value={value}
              checked={isSelected}
              onChange={() => onSelect(value)}
              className="sr-only"
            />
            <label htmlFor={inputId} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              <span
                aria-hidden
                className={cx(
                  "grid size-10 shrink-0 place-items-center rounded-[10px] transition-colors motion-reduce:transition-none",
                  isSelected ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-strong)] text-[var(--ink-soft)]",
                )}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 text-[14.5px] leading-snug text-[var(--ink)]">
                <strong className="font-bold">{bold}</strong>
                {rest && <span className="font-normal text-[var(--muted)]">{rest}</span>}
              </span>
            </label>
            {isSelected ? (
              <button
                type="submit"
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                Continue <span aria-hidden>↵</span>
              </button>
            ) : (
              <kbd
                aria-hidden
                className="shrink-0 rounded-[6px] border border-[var(--line-strong)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]"
              >
                {index + 1}
              </kbd>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** One question, one screen: eyebrow, heading, optional justifying helper line,
 *  the option group, and the quiet step-progress indicator. Mounting a fresh
 *  instance per step (the parent keys/branches on `step`) moves focus to the new
 *  heading on mount, which is how the step change gets announced to assistive
 *  tech, alongside the `aria-live="polite"` region the caller wraps this in. */
function OnboardingQuestionStep<T extends string>({
  stepNumber, totalSteps, eyebrow, question, helper, options, selected, onSelect, onSubmit,
}: {
  stepNumber: number;
  totalSteps: number;
  eyebrow: string;
  question: string;
  helper?: string;
  options: OnboardingOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  onSubmit: () => void;
}) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <form
      onSubmit={(event) => { event.preventDefault(); if (selected) onSubmit(); }}
      className="grid gap-6"
    >
      <div className="grid gap-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">{eyebrow}</span>
        <h1
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] outline-none"
        >
          {question}
        </h1>
        {helper && <p className="text-sm leading-relaxed text-[var(--muted)]">{helper}</p>}
      </div>

      <OnboardingOptionGroup groupLabelId={headingId} options={options} selected={selected} onSelect={onSelect} />
    </form>
  );
}

/* ── Onboarding: RemNote-style question flow — one question per screen, keyboard-first ── */
type OnboardingRole = "student" | "parent" | "teacher";
type OnboardingClass = "6" | "7" | "8";
type OnboardingGoal = "school-exams" | "specific-test" | "stronger";
type OnboardingSource = "friend" | "school" | "social" | "search" | "ad";

const ONBOARDING_STEPS = ["role", "class", "goal", "source", "consent"] as const;
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const ROLE_OPTIONS: OnboardingOption<OnboardingRole>[] = [
  { value: "student", Icon: GraduationCap, bold: "Student", rest: " — it's me, learning" },
  { value: "parent", Icon: UsersRound, bold: "Parent", rest: " setting this up for my child" },
  { value: "teacher", Icon: BookOpenCheck, bold: "Teacher", rest: " — using VIDYA with my class" },
];

const CLASS_OPTIONS: OnboardingOption<OnboardingClass>[] = [
  { value: "6", Icon: Layers3, bold: "Class 6" },
  { value: "7", Icon: Layers3, bold: "Class 7" },
  { value: "8", Icon: Layers3, bold: "Class 8" },
];

const GOAL_OPTIONS: OnboardingOption<OnboardingGoal>[] = [
  { value: "school-exams", Icon: CalendarCheck2, bold: "School exams", rest: " — staying ahead of what's coming up in class" },
  { value: "specific-test", Icon: Target, bold: "A specific test", rest: " — NTSE, Olympiad, or something similar" },
  { value: "stronger", Icon: Sparkles, bold: "Getting stronger at maths", rest: " — just steady practice, no test in mind" },
];

const SOURCE_OPTIONS: OnboardingOption<OnboardingSource>[] = [
  { value: "friend", Icon: UsersRound, bold: "A friend or family member" },
  { value: "school", Icon: BookOpenCheck, bold: "School or a teacher" },
  { value: "social", Icon: MessageCircle, bold: "Social media" },
  { value: "search", Icon: Search, bold: "Searching online" },
  { value: "ad", Icon: Megaphone, bold: "An advertisement" },
];

const GOAL_LABEL: Record<OnboardingGoal, string> = {
  "school-exams": "School exams",
  "specific-test": "A specific test",
  stronger: "Getting stronger at maths",
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const setGradeLevel = useAppStore((state) => state.setGradeLevel);
  const [stepIndex, setStepIndex] = useState(0);
  const [role, setRole] = useState<OnboardingRole | null>(null);
  const [classLevel, setClassLevel] = useState<OnboardingClass | null>(null);
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [source, setSource] = useState<OnboardingSource | null>(null);
  const [consented, setConsented] = useState(false);

  const step: OnboardingStep = ONBOARDING_STEPS[stepIndex] ?? "role";
  const totalSteps = ONBOARDING_STEPS.length;
  const stepNumber = stepIndex + 1;

  const goNext = () => setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const finish = (event: FormEvent) => {
    event.preventDefault();
    if (!consented) return;
    // The class answer has to actually change the app, or the question is
    // theatre. The shell and page eyebrows read this one value.
    if (classLevel) setGradeLevel(Number(classLevel));
    navigate("/app/home");
  };

  const classQuestion = role === "parent"
    ? "Which class is your child in?"
    : role === "teacher"
      ? "Which class do you mainly teach?"
      : "Which class are you in?";

  const consentHeadingId = useId();
  const consentHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (step === "consent") consentHeadingRef.current?.focus(); }, [step]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center gap-8 px-5 py-14">
        <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--ink)]">
          <span aria-hidden className="grid size-8 place-items-center rounded-[10px] bg-[var(--primary)] text-[13px] font-bold text-white">V</span>
          VIDYA
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            {stepIndex === 0 ? (
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 rounded-[8px] text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <ArrowLeft size={15} aria-hidden />
                Sign in instead
              </Link>
            ) : (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <ArrowLeft size={15} aria-hidden />
                Back
              </button>
            )}
            <span className="text-[12.5px] font-medium tabular-nums text-[var(--muted)]">Step {stepNumber} of {totalSteps}</span>
          </div>
          <ProgressBar value={(stepNumber / totalSteps) * 100} label={`Step ${stepNumber} of ${totalSteps}`} />
        </div>

        <div aria-live="polite">
          {step === "role" && (
            <OnboardingQuestionStep
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              eyebrow="CBSE Mathematics · Classes 6–8"
              question="Who's studying with VIDYA?"
              helper="This decides what your home screen looks like, so we get it right first."
              options={ROLE_OPTIONS}
              selected={role}
              onSelect={setRole}
              onSubmit={goNext}
            />
          )}

          {step === "class" && (
            <OnboardingQuestionStep
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              eyebrow="Syllabus"
              question={classQuestion}
              helper="This sets the syllabus and keeps every question and note relevant."
              options={CLASS_OPTIONS}
              selected={classLevel}
              onSelect={setClassLevel}
              onSubmit={goNext}
            />
          )}

          {step === "goal" && (
            <OnboardingQuestionStep
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              eyebrow="Your goal"
              question="What are you working towards?"
              helper="We'll shape how your daily practice is paced around this."
              options={GOAL_OPTIONS}
              selected={goal}
              onSelect={setGoal}
              onSubmit={goNext}
            />
          )}

          {step === "source" && (
            <OnboardingQuestionStep
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              eyebrow="Almost done"
              question="How did you hear about VIDYA?"
              helper="This helps us understand what's working, so more students like you can find us."
              options={SOURCE_OPTIONS}
              selected={source}
              onSelect={setSource}
              onSubmit={goNext}
            />
          )}

          {step === "consent" && (
            <form onSubmit={finish} className="grid gap-6">
              <div className="grid gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">Parent or guardian</span>
                <h1
                  ref={consentHeadingRef}
                  id={consentHeadingId}
                  tabIndex={-1}
                  className="text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] outline-none"
                >
                  One last thing: a grown-up&rsquo;s permission
                </h1>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Learning data needs consent from a parent or guardian under India&rsquo;s data protection law
                  (DPDP). No advertising profiles, no hidden sharing.
                </p>
              </div>

              {(classLevel || goal) && (
                <p className="rounded-[10px] bg-[var(--surface-soft)] px-3 py-2 text-[12.5px] text-[var(--ink-soft)]">
                  {classLevel ? `Class ${classLevel}` : "Class not set"}
                  {goal ? ` · ${GOAL_LABEL[goal]}` : ""}
                </p>
              )}

              <Card className="flex items-center gap-3 p-4">
                <CircleUserRound size={28} className="shrink-0 text-[var(--muted)]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-semibold text-[var(--ink)]">Priya Sharma</strong>
                  <span className="text-[12.5px] text-[var(--muted)]">Primary parent &middot; +91 ••••• 1184</span>
                </div>
                <Chip tone="warning">Awaiting confirmation</Chip>
              </Card>

              <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)]">
                <input
                  type="checkbox"
                  required
                  checked={consented}
                  onChange={(event) => setConsented(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-[var(--line-strong)] accent-[var(--primary)]"
                />
                I understand which learning data VIDYA will use and why.
              </label>
              {!consented && (
                <p className="-mt-4 flex items-start gap-2 text-[12px] text-[var(--muted)]">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
                  A parent or guardian needs to confirm this before we finish setup.
                </p>
              )}

              <Button type="submit" disabled={!consented}>
                Finish setup
                <ArrowRight size={16} aria-hidden />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


/* ── Teacher: operationally dense, mastery bands doing the heavy lifting ── */
export function TeacherDashboard() {
  const data = useLoaderData() as SurfaceData;
  const navigate = useNavigate();
  const [items, setItems] = useState(data.items);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMeta, setNewMeta] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [nextCall, setNextCall] = useState<
    "loading" | null | { when: string; studentName: string; status: Booking["status"] }
  >("loading");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([services.repository.getBookings(), services.repository.getDashboard()]).then(
      ([bookings, dashboard]: [Booking[], DashboardData]) => {
        if (cancelled) return;
        const upcoming = bookings.find(
          (booking) => booking.teacherId === "teacher-1" && booking.status !== "cancelled" && booking.status !== "completed",
        );
        if (!upcoming) { setNextCall(null); return; }
        const when = new Intl.DateTimeFormat("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" }).format(
          new Date(upcoming.startsAt),
        );
        setNextCall({ when, studentName: dashboard.studentName, status: upcoming.status });
      },
    );
    return () => { cancelled = true; };
  }, []);

  const addAssignment = (event: FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) { setToast("Give the assignment a title first"); return; }
    setItems((list) => [{ id: crypto.randomUUID(), title: newTitle.trim(), meta: newMeta.trim() || "No class set yet", progress: 0 }, ...list]);
    setNewTitle("");
    setNewMeta("");
    setShowAddForm(false);
    setToast("Assignment added to this list");
  };

  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 pb-16">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">{data.eyebrow}</span>
          <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[32px]">
            {data.title}
          </h1>
          <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--muted)]">{data.description}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            <img src="/teacher-meera.svg" alt="" width={36} height={36} className="size-9 rounded-full" />
            <div className="grid">
              <strong className="text-[13px] font-semibold text-[var(--ink)]">Meera Iyer</strong>
              <span className="text-[11.5px] text-[var(--muted)]">CBSE Maths &middot; Classes 5&ndash;8</span>
            </div>
            <Chip tone="success">Available</Chip>
          </div>
          <Button onClick={() => setShowAddForm((v) => !v)}>
            <Plus size={16} aria-hidden />
            {data.primaryAction ?? "New assignment"}
          </Button>
        </div>
      </header>

      {data.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--line)]">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="grid gap-1 bg-[var(--surface)] px-4 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{metric.label}</span>
              <strong className={cx("text-[20px] font-bold tabular-nums", TONE_TEXT[metric.tone ?? "neutral"])}>
                {metric.value}
              </strong>
              {metric.detail && <span className="text-[11.5px] text-[var(--muted)]">{metric.detail}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold text-[var(--ink)]">Assignments</h2>
              <p className="text-[12.5px] text-[var(--muted)]">{items.length} active &middot; mastery band shows who needs a nudge</p>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={addAssignment} className="grid gap-2 border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <label className="grid gap-1">
                <span className="text-[12px] font-medium text-[var(--muted)]">Title</span>
                <Input
                  name="assignment-title"
                  autoComplete="off"
                  required
                  placeholder="Assignment title&hellip;"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[12px] font-medium text-[var(--muted)]">Class and due date</span>
                <Input
                  name="assignment-meta"
                  autoComplete="off"
                  placeholder="Class 7A &middot; Due Friday&hellip;"
                  value={newMeta}
                  onChange={(event) => setNewMeta(event.target.value)}
                />
              </label>
              <Button type="submit" size="sm">Add</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X size={14} aria-hidden />
                Cancel
              </Button>
            </form>
          )}

          {items.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              body="Assignments you set will show up here with live completion and mastery."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    <th scope="col" className="px-5 py-2 font-semibold">Assignment</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Completion</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Mastery</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const pct = item.progress ?? 0;
                    const band = bandFor(pct);
                    return (
                      <tr key={item.id} className="group border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-soft)] focus-within:bg-[var(--surface-soft)]">
                        <td className="px-5 py-3">
                          <strong className="block text-[13.5px] font-semibold text-[var(--ink)]">{item.title}</strong>
                          <span className="text-[12px] text-[var(--muted)]">{item.meta}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24"><ProgressBar value={pct} label={`${pct}% complete on ${item.title}`} /></div>
                            <span className="tabular-nums text-[12.5px] text-[var(--muted)]">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3"><Chip band={band}>{BAND_LABEL[band]}</Chip></td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => navigate("/teacher/assignments")}
                            className={cx(
                              "inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-[12.5px] font-semibold text-[var(--primary)]",
                              "hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer",
                              revealOnHover,
                            )}
                          >
                            Open
                            <ChevronRight size={13} aria-hidden />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <aside className="grid content-start gap-4">
          <Card className="grid gap-0.5 p-3">
            <h2 className="px-2 pb-1 pt-1 text-[13px] font-bold text-[var(--ink)]">Quick actions</h2>
            {teacherQuickLinks.map(({ to, Icon, title, meta }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
              >
                <Icon size={18} className="shrink-0 text-[var(--muted)]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[13px] font-semibold text-[var(--ink)]">{title}</strong>
                  <small className="block truncate text-[11.5px] text-[var(--muted)]">{meta}</small>
                </div>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-[var(--faint)] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden
                />
              </Link>
            ))}
          </Card>

          <Card className="grid gap-2 p-5">
            <Clock3 size={18} className="text-[var(--muted)]" aria-hidden />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">Next booked call</span>
            {nextCall === "loading" ? (
              <div className="grid gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : nextCall ? (
              <>
                <h2 className="text-[16px] font-bold text-[var(--ink)]">{nextCall.studentName} &middot; {nextCall.when}</h2>
                <p className="text-[13px] text-[var(--muted)]">
                  Status: {nextCall.status === "confirmed" ? "Confirmed" : nextCall.status}
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigate("/teacher/availability")}>
                  Open context
                </Button>
              </>
            ) : (
              <p className="text-[13px] text-[var(--muted)]">No calls booked right now.</p>
            )}
          </Card>
        </aside>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ── Author editor: out of scope for this pass, left untouched ── */
export function AuthorEditorPage() {
  const [status, setStatus] = useState<"Draft" | "In review">("Draft");
  return (
    <div className="author-editor-page">
      <header className="editor-topbar">
        <div>
          <Chip tone={status === "Draft" ? "neutral" : "warning"}>
            {status}
          </Chip>
          <span>Class 7 · Geometry</span>
          <strong>Lines and angles</strong>
        </div>
        <div>
          <button className="icon-button" aria-label="More options">
            <MoreHorizontal />
          </button>
          <Button variant="secondary" onClick={() => setStatus("In review")}>
            Send to review
          </Button>
          <Button>Publish</Button>
        </div>
      </header>
      <div className="editor-layout">
        <aside className="document-tree">
          <div>
            <strong>Curriculum</strong>
            <button>
              <Plus />
            </button>
          </div>
          <label>
            <Search />
            <input placeholder="Search content" />
          </label>
          <nav>
            <button className="active">
              <FileText />
              Lines and angles
            </button>
            <button>
              <FileText />
              Triangle properties
            </button>
            <button>
              <Layers3 />
              Geometry flashcards
            </button>
            <button>
              <FileText />
              Practice set
            </button>
          </nav>
        </aside>
        <main className="editor-canvas">
          <div className="editor-title">
            <span>📐</span>
            <h1 contentEditable suppressContentEditableWarning>
              Lines and angles
            </h1>
            <div>
              <button>
                <Upload />
                Attach source
              </button>
              <button>
                <Mic />
                Dictate
              </button>
              <button>
                <Sparkles />
                Draft with AI
              </button>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="editor-loading">Loading the editor route…</div>
            }
          >
            <LazyEditor />
          </Suspense>
        </main>
        <aside className="editor-inspector">
          <span className="eyebrow">Publishing checks</span>
          <h2>Content quality</h2>
          <div className="quality-score">
            <ProgressRing value={86} size={92} />
            <span>Ready for review</span>
          </div>
          {[
            "Every block has an immutable ID",
            "Skill tags are present",
            "Maths renders correctly",
            "Human approval required",
          ].map((item) => (
            <div className="check-row" key={item}>
              <CheckCircle2 />
              {item}
            </div>
          ))}
          <hr />
          <h3>Generated cards</h3>
          <div className="mix-row">
            <span>Concept / descriptor</span>
            <strong>58%</strong>
          </div>
          <ProgressBar value={58} />
          <div className="mix-row">
            <span>Cloze</span>
            <strong>14%</strong>
          </div>
          <ProgressBar value={14} />
          <div className="mix-row">
            <span>Exam MCQ</span>
            <strong>6%</strong>
          </div>
          <ProgressBar value={6} />
        </aside>
      </div>
    </div>
  );
}

/* ── Parent: plain-spoken and reassuring, no gamification ── */
export function ParentGoalPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [paceMinutes, setPaceMinutes] = useState(25);
  const [editingPace, setEditingPace] = useState(false);
  const [draftPace, setDraftPace] = useState("25");
  const [extraGoals, setExtraGoals] = useState<Array<{ id: string; title: string; examDate: string }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([services.repository.getExams(), services.repository.getDashboard()]).then(
      ([examList, dashboardData]: [Exam[], DashboardData]) => {
        if (cancelled) return;
        setExams(examList);
        setDashboard(dashboardData);
        setPaceMinutes(dashboardData.dailyGoalMinutes);
        setDraftPace(String(dashboardData.dailyGoalMinutes));
      },
    );
    return () => { cancelled = true; };
  }, []);

  const primaryExam = exams?.[0] ?? null;
  const examDateObj = primaryExam ? new Date(primaryExam.examDate) : null;
  const daysToExam = examDateObj ? Math.ceil((examDateObj.getTime() - Date.now()) / 86_400_000) : null;
  const examDateLabel = examDateObj
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(examDateObj)
    : null;
  const skillsInScopeLabel = primaryExam && primaryExam.includeSkillIds.length > 0
    ? `${primaryExam.includeSkillIds.length} skills in scope`
    : `Full Class ${primaryExam?.gradeLevel ?? dashboard?.gradeLevel ?? ""} syllabus in scope`;

  const savePace = () => {
    const value = Number(draftPace);
    if (!Number.isFinite(value) || value < 5) { setToast("Enter at least 5 daily minutes"); return; }
    setPaceMinutes(Math.round(value));
    setEditingPace(false);
    setToast("Daily study target updated for this session");
  };

  const addGoal = (event: FormEvent) => {
    event.preventDefault();
    if (!newGoalTitle.trim() || !newGoalDate) { setToast("Add a title and a date to create a goal"); return; }
    setExtraGoals((list) => [...list, { id: crypto.randomUUID(), title: newGoalTitle.trim(), examDate: newGoalDate }]);
    setNewGoalTitle("");
    setNewGoalDate("");
    setShowAddForm(false);
    setToast("Exam goal added for this session");
  };

  const removeGoal = (id: string) => setExtraGoals((list) => list.filter((goal) => goal.id !== id));

  return (
    <div className="mx-auto grid max-w-[1040px] gap-7 pb-16">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">Parent-set schedule</span>
          <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
            {dashboard ? `${dashboard.studentName}’s exam goals` : "Exam goals"}
          </h1>
          <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--muted)]">
            The school sets the exam date. VIDYA shapes the daily plan around it, and you can adjust how many
            minutes a day that plan asks for.
          </p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)}>
          <Plus size={16} aria-hidden />
          Add exam
        </Button>
      </header>

      {showAddForm && (
        <form onSubmit={addGoal}>
          <Card className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <Field label="Exam name">
              {(id) => (
                <Input
                  id={id}
                  name="goal-title"
                  autoComplete="off"
                  required
                  placeholder="Term 2 mathematics exam&hellip;"
                  value={newGoalTitle}
                  onChange={(event) => setNewGoalTitle(event.target.value)}
                />
              )}
            </Field>
            <Field label="Date">
              {(id) => (
                <Input
                  id={id}
                  name="goal-date"
                  type="date"
                  autoComplete="off"
                  required
                  value={newGoalDate}
                  onChange={(event) => setNewGoalDate(event.target.value)}
                />
              )}
            </Field>
            <Button type="submit">Add</Button>
            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
              <X size={14} aria-hidden />
              Cancel
            </Button>
          </Card>
        </form>
      )}

      {exams === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="grid gap-3 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </Card>
          <Card className="grid gap-3 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {primaryExam ? (
            <Card className="grid gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <CalendarCheck2 className="text-[var(--muted)]" aria-hidden />
                <Chip tone="primary">Primary goal</Chip>
              </div>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[var(--ink)]">{primaryExam.title}</h2>
                <p className="mt-1 text-[13px] text-[var(--muted)]">
                  {examDateLabel} &middot; Class {primaryExam.gradeLevel} &middot; {skillsInScopeLabel}
                </p>
                {daysToExam !== null && (
                  daysToExam > 0
                    ? <p className="mt-1 text-[12.5px] text-[var(--muted)]">{daysToExam} days away</p>
                    : <p className="mt-1 text-[12.5px] text-[var(--danger)]">This date has passed. Ask the school for the next confirmed date.</p>
                )}
              </div>
              {dashboard && (
                <div className="grid gap-1.5">
                  <ProgressBar value={dashboard.averageMastery} label={`${dashboard.averageMastery}% average mastery`} />
                  <div className="flex items-center justify-between text-[12.5px] text-[var(--muted)]">
                    <span className="tabular-nums">{dashboard.averageMastery}% average mastery</span>
                    <span className="tabular-nums">{paceMinutes} min/day target</span>
                  </div>
                </div>
              )}
              {editingPace ? (
                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid gap-1">
                    <span className="text-[12px] font-medium text-[var(--muted)]">Daily minutes</span>
                    <Input
                      type="number"
                      name="daily-minutes"
                      autoComplete="off"
                      min={5}
                      max={120}
                      value={draftPace}
                      onChange={(event) => setDraftPace(event.target.value)}
                      className="w-24"
                    />
                  </label>
                  <Button size="sm" onClick={savePace}>
                    <Check size={14} aria-hidden />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingPace(false)}>Cancel</Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => { setDraftPace(String(paceMinutes)); setEditingPace(true); }}
                >
                  <Pencil size={14} aria-hidden />
                  Adjust daily target
                </Button>
              )}
            </Card>
          ) : (
            <EmptyState
              icon={<CalendarCheck2 size={28} aria-hidden />}
              title="No exam goal set yet"
              body="Add the school's exam date and VIDYA will shape a daily plan around it."
              action={<Button onClick={() => setShowAddForm(true)}><Plus size={16} aria-hidden />Add exam</Button>}
            />
          )}

          <Card className="grid content-start gap-3 p-6">
            <ShieldCheck className="text-[var(--primary)]" aria-hidden />
            <h2 className="text-[16px] font-bold text-[var(--ink)]">How this fits with daily review</h2>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              An exam goal changes today&rsquo;s pace without discarding what spaced review already knows.
            </p>
            <ul className="grid gap-2 text-[13px] text-[var(--ink-soft)]">
              <li className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--secure)]" aria-hidden />
                A learning period for new ideas, then a final review near the date.
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--secure)]" aria-hidden />
                Catch-up days are spread out, never one impossible session.
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--secure)]" aria-hidden />
                No pace change happens without this page.
              </li>
            </ul>
          </Card>

          {extraGoals.map((goal) => {
            const goalDateObj = new Date(goal.examDate);
            const goalDateLabel = Number.isNaN(goalDateObj.getTime())
              ? goal.examDate
              : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(goalDateObj);
            return (
              <Card key={goal.id} className="grid gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <CalendarCheck2 className="text-[var(--muted)]" aria-hidden />
                  <Chip tone="neutral">Added this session</Chip>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)]">{goal.title}</h2>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">{goalDateLabel}</p>
                </div>
                <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => removeGoal(goal.id)}>
                  <X size={14} aria-hidden />
                  Remove
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
