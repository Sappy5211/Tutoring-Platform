import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Copy,
  Flame,
  Highlighter,
  Layers3,
  Link2,
  MessageCircleQuestion,
  Play,
  Printer,
  Send,
  Sparkles,
  Star,
  StickyNote,
  Target,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import katex from "katex";
import type {
  DashboardData,
  NoteDocument,
  Teacher,
  TopicSummary,
} from "@vidya/contracts";
import type { Band } from "@vidya/ui";
import {
  BAND_LABEL,
  Button,
  Card,
  Chip,
  EmptyState,
  HoverRow,
  IconButton,
  Menu,
  MenuItem,
  ProgressBar,
  ProgressRing,
  Toast,
  bandFor,
  revealOnHover,
} from "@vidya/ui";
import { services } from "../../lib/services";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomePage() {
  const data = useLoaderData() as DashboardData;
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(now);
  const firstName = data.studentName.split(" ")[0] ?? data.studentName;
  const remainingMinutes = Math.max(data.dailyGoalMinutes - data.completedMinutes, 0);
  const topicBand = bandFor(data.continueTopic.mastery);

  const examDate = new Date(data.exam.examDate);
  const daysToExam = Math.ceil((examDate.getTime() - now.getTime()) / 86_400_000);
  const examDateLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(examDate);

  return (
    <div className="mx-auto grid max-w-[640px] gap-8 pb-16">
      <header className="grid gap-1.5">
        <span className="text-[13px] font-medium text-[var(--muted)]">{weekday} &middot; your plan</span>
        <h1 className="font-display text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[38px]">
          {greetingFor(now.getHours())}, {firstName}.
        </h1>
      </header>

      <Card className="grid gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            What&rsquo;s next
          </span>
          <Chip band={topicBand}>{BAND_LABEL[topicBand]}</Chip>
        </div>
        <div className="grid gap-2">
          <h2 className="text-balance font-display text-2xl font-bold tracking-[-0.01em] text-[var(--ink)]">
            {data.continueTopic.skill.title}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {data.continueTopic.skill.description}
          </p>
        </div>
        <div className="grid gap-2">
          <ProgressBar value={data.continueTopic.mastery} label={`${data.continueTopic.mastery}% mastery on ${data.continueTopic.skill.title}`} />
          <div className="flex items-center justify-between text-[12.5px] text-[var(--muted)]">
            <span className="tabular-nums">{data.continueTopic.mastery}% mastery</span>
            <span className="tabular-nums">{data.continueTopic.dueCards} cards due</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate("/app/practice")}>
            <Play size={16} fill="currentColor" aria-hidden />
            Start &middot; {remainingMinutes || data.dailyGoalMinutes} min
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/topic/${data.continueTopic.skill.id}`)}
          >
            View topic
            <ArrowRight size={15} aria-hidden />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--line)]">
        <div className="grid justify-items-center gap-1 bg-[var(--surface)] px-3 py-4 text-center">
          <Flame size={16} className="text-[var(--faint)]" aria-hidden />
          <strong className="tabular-nums text-[17px] font-bold text-[var(--ink)]">{data.streakDays}</strong>
          <span className="text-[11px] leading-tight text-[var(--muted)]">day streak</span>
        </div>
        <Link
          to="/app/flashcards"
          className="grid justify-items-center gap-1 bg-[var(--surface)] px-3 py-4 text-center transition-colors hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
        >
          <BookMarked size={16} className="text-[var(--faint)]" aria-hidden />
          <strong className="tabular-nums text-[17px] font-bold text-[var(--ink)]">{data.dueCards}</strong>
          <span className="text-[11px] leading-tight text-[var(--muted)]">cards due</span>
        </Link>
        <div className="grid justify-items-center gap-1 bg-[var(--surface)] px-3 py-4 text-center">
          <Star size={16} className="text-[var(--faint)]" aria-hidden />
          {daysToExam > 0 ? (
            <>
              <strong className="tabular-nums text-[17px] font-bold text-[var(--ink)]">{daysToExam}</strong>
              <span className="text-[11px] leading-tight text-[var(--muted)]">days to exam</span>
            </>
          ) : (
            <>
              <strong className="text-[13px] font-bold text-[var(--ink)]">{examDateLabel}</strong>
              <span className="text-[11px] leading-tight text-[var(--muted)]">exam date</span>
            </>
          )}
        </div>
      </div>

      <section className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-[var(--muted)]">Chosen for you</h2>
          <Link
            to="/app/syllabus"
            className="inline-flex items-center gap-1 rounded-[8px] text-[13px] font-medium text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            See syllabus
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="grid gap-0.5">
          {data.recommendations.length === 0 ? (
            <EmptyState
              title="Nothing queued"
              body="Finish today's session and new recommendations will appear here."
            />
          ) : (
            data.recommendations.map((item) => {
              const band = bandFor(item.mastery);
              return (
                <Link
                  key={item.skill.id}
                  to={`/app/topic/${item.skill.id}`}
                  className="group flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
                >
                  <Chip band={band}>{item.mastery}%</Chip>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[var(--ink)]">
                      {item.skill.title}
                    </strong>
                    <span className="text-[12px] text-[var(--muted)]">
                      {item.dueCards > 0 ? `${item.dueCards} cards due` : "No cards due"}
                    </span>
                  </div>
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-[var(--faint)] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              );
            })
          )}
        </div>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

type Curriculum = Array<{
  grade: 5 | 6 | 7 | 8;
  chapters: Array<{ id: string; title: string; topics: TopicSummary[] }>;
}>;
const GRADES = [5, 6, 7, 8] as const;
const BAND_FILTERS: Array<{ id: "all" | Band; label: string }> = [
  { id: "all", label: "All" },
  { id: "secure", label: BAND_LABEL.secure },
  { id: "developing", label: BAND_LABEL.developing },
  { id: "needswork", label: BAND_LABEL.needswork },
];

export function SyllabusPage() {
  const curriculum = useLoaderData() as Curriculum;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const gradeParam = Number(searchParams.get("grade"));
  const grade = (GRADES as readonly number[]).includes(gradeParam)
    ? (gradeParam as (typeof GRADES)[number])
    : 7;
  const filterParam = searchParams.get("band");
  const filter = BAND_FILTERS.some((f) => f.id === filterParam) ? (filterParam as "all" | Band) : "all";

  const current = curriculum.find((item) => item.grade === grade) ?? curriculum[0]!;

  const setGrade = (next: number) =>
    setSearchParams((prev) => {
      prev.set("grade", String(next));
      return prev;
    }, { replace: true });
  const setFilter = (next: string) =>
    setSearchParams((prev) => {
      prev.set("band", next);
      return prev;
    }, { replace: true });

  return (
    <div className="mx-auto grid max-w-[1040px] gap-7 pb-16">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            CBSE mathematics &middot; Classes 5&ndash;8
          </span>
          <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
            Your learning map
          </h1>
          <p className="max-w-[52ch] text-sm leading-relaxed text-[var(--muted)]">
            Move through chapters in syllabus order, with mastery visible at every step.
          </p>
        </div>
        <Button onClick={() => navigate("/app/practice")}>
          <Sparkles size={16} aria-hidden />
          Start today&rsquo;s plan
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Choose class" className="inline-flex gap-1 overflow-x-auto rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] p-1">
          {GRADES.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={grade === g}
              onClick={() => setGrade(g)}
              className={cx(
                "whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer",
                grade === g ? "bg-[var(--surface)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              Class {g}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BAND_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={cx(
                "whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors motion-reduce:transition-none cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                filter === id
                  ? "border-[var(--primary)] bg-[var(--primary-faint)] text-[var(--primary-strong)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        {current.chapters.map((chapter, chapterIndex) => {
          const avgMastery = Math.round(
            chapter.topics.reduce((sum, item) => sum + item.mastery, 0) / chapter.topics.length,
          );
          const visibleTopics = chapter.topics.filter(
            (item) => filter === "all" || bandFor(item.mastery) === filter,
          );
          return (
            <Card key={chapter.id} className="grid gap-1 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-4">
                <span className="font-display text-2xl font-bold text-[var(--faint)]">
                  {String(chapterIndex + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[17px] font-bold tracking-[-0.01em] text-[var(--ink)]">
                    {chapter.title}
                  </h2>
                  <p className="text-[12.5px] text-[var(--muted)]">
                    {chapter.topics.length} skills &middot; Class {grade}
                  </p>
                </div>
                <ProgressRing value={avgMastery} size={56} label={`${chapter.title} average mastery`} />
              </div>
              {visibleTopics.length === 0 ? (
                <p className="px-1 py-3 text-[13px] text-[var(--faint)]">
                  No skills match this filter in this chapter.
                </p>
              ) : (
                <div className="grid gap-0.5">
                  {visibleTopics.map((item) => {
                    const band = bandFor(item.mastery);
                    return (
                      <Link
                        to={`/app/topic/${item.skill.id}`}
                        key={item.skill.id}
                        className="group flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
                      >
                        <Chip band={band}>{item.mastery}%</Chip>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm font-semibold text-[var(--ink)]">
                            {item.skill.title}
                          </strong>
                          <small className="text-[12px] text-[var(--muted)]">
                            {item.lastStudiedAt ? `Last studied ${item.lastStudiedAt.toLowerCase()}` : "Not started"}
                          </small>
                        </div>
                        <ChevronRight
                          size={17}
                          className="shrink-0 text-[var(--faint)] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function TopicPage() {
  const topic = useLoaderData() as TopicSummary;
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const band = bandFor(topic.mastery);
  const subject = topic.skill.subject.charAt(0).toUpperCase() + topic.skill.subject.slice(1);

  const copyLink = () => {
    void navigator.clipboard.writeText(window.location.href);
    setToast("Link copied");
  };

  return (
    <div className="mx-auto grid max-w-[1040px] gap-7 pb-16">
      <header className="flex flex-col gap-6 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/app/syllabus"
              className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              &larr; Syllabus
            </Link>
            <Chip>{subject}</Chip>
            <Chip band={band}>{BAND_LABEL[band]}</Chip>
          </div>
          <h1 className="text-balance font-display text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--ink)] sm:text-[34px]">
            {topic.skill.title}
          </h1>
          <p className="max-w-[58ch] text-sm leading-relaxed text-[var(--muted)]">
            {topic.skill.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate("/app/practice")}>
              <Play size={16} aria-hidden />
              Practise now
            </Button>
            <Button variant="secondary" onClick={() => navigate("/app/tutor")}>
              <Bot size={16} aria-hidden />
              Ask VIDYA
            </Button>
            <Menu label="More actions" align="end" trigger={(open) => (
              <span className={cx(
                "grid size-9 place-items-center rounded-[10px] border border-[var(--line-strong)] text-[var(--muted)] transition-colors",
                open ? "bg-[var(--surface-soft)] text-[var(--ink)]" : "hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]",
              )}>
                &hellip;
              </span>
            )}>
              <MenuItem onClick={copyLink}>
                <Link2 size={15} aria-hidden />
                Copy link to this topic
              </MenuItem>
              <MenuItem onClick={() => navigate("/app/flashcards")}>
                <Layers3 size={15} aria-hidden />
                Review flashcards
              </MenuItem>
            </Menu>
          </div>
        </div>
        <ProgressRing value={topic.mastery} size={116} label={`${topic.mastery}% mastery`} />
      </header>

      <nav role="tablist" aria-label="Topic sections" className="inline-flex w-fit gap-1 overflow-x-auto rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] p-1">
        <span
          role="tab"
          aria-selected="true"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-[9px] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink)]"
        >
          <BookOpen size={15} aria-hidden />
          Notes
        </span>
        <Link
          to="/app/practice"
          role="tab"
          aria-selected="false"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Target size={15} aria-hidden />
          Practice
        </Link>
        <Link
          to="/app/flashcards"
          role="tab"
          aria-selected="false"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Layers3 size={15} aria-hidden />
          Flashcards
        </Link>
        <Link
          to="/app/tutor"
          role="tab"
          aria-selected="false"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Bot size={15} aria-hidden />
          Ask AI
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="p-6 sm:p-7">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Lesson path
          </span>
          <h2 className="mt-1 mb-5 text-[19px] font-bold tracking-[-0.01em] text-[var(--ink)]">
            Three ideas, one connected method
          </h2>
          <ol className="grid gap-5">
            <li className="grid grid-cols-[28px_1fr_20px] items-start gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--surface-strong)] text-[12px] font-bold text-[var(--ink)]">1</span>
              <div>
                <strong className="block text-sm font-semibold text-[var(--ink)]">Recognise the relationship</strong>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                  Start with what the diagram or equation is already telling you.
                </p>
              </div>
              <CheckCircle2 size={19} className="mt-0.5 text-[var(--secure)]" aria-hidden />
            </li>
            <li className="grid grid-cols-[28px_1fr_20px] items-start gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--surface-strong)] text-[12px] font-bold text-[var(--ink)]">2</span>
              <div>
                <strong className="block text-sm font-semibold text-[var(--ink)]">Choose the matching rule</strong>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                  Connect the question to the property that unlocks it.
                </p>
              </div>
              <Play size={17} className="mt-0.5 text-[var(--muted)]" aria-hidden />
            </li>
            <li className="grid grid-cols-[28px_1fr_20px] items-start gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--surface-strong)] text-[12px] font-bold text-[var(--ink)]">3</span>
              <div>
                <strong className="block text-sm font-semibold text-[var(--ink)]">Explain the conclusion</strong>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                  State the final relationship using precise mathematical language.
                </p>
              </div>
              <BookOpen size={17} className="mt-0.5 text-[var(--faint)]" aria-hidden />
            </li>
          </ol>
        </Card>
        <Card className="grid content-start gap-3 p-6">
          <MessageCircleQuestion size={20} className="text-[var(--primary)]" aria-hidden />
          <h2 className="text-[16px] font-bold text-[var(--ink)]">Stuck on one step?</h2>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            The tutor will use this exact topic and cite the notes it draws from.
          </p>
          <Link
            to="/app/tutor"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Open focused tutor
            <ArrowRight size={14} aria-hidden />
          </Link>
        </Card>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export function NotesPage() {
  const note = useLoaderData() as NoteDocument;
  const location = useLocation();
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const targetId = location.hash ? location.hash.slice(1) : null;

  useEffect(() => {
    if (!targetId) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(targetId)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // Only re-run when the note or the specific target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, note.noteId]);

  const headings = note.content.filter((block) => block.type === "heading");

  return (
    <div className="mx-auto grid max-w-[1040px] gap-6 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Published teaching note
          </span>
          <h1 className="text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] sm:text-[32px]">
            {note.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => setBookmarked((v) => !v)} aria-pressed={bookmarked}>
            <BookMarked size={16} aria-hidden fill={bookmarked ? "currentColor" : "none"} />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} aria-hidden />
            Export PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_220px]">
        <aside className="hidden lg:grid lg:content-start lg:gap-1">
          <span className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--faint)]">
            On this page
          </span>
          {headings.map((block) => (
            <HoverRow key={block.attrs.blockId} className="!px-2 !py-1.5">
              <a
                href={`#${block.attrs.blockId}`}
                className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                {block.text}
              </a>
              <ArrowRight size={12} className={cx("shrink-0 text-[var(--faint)]", revealOnHover)} aria-hidden />
            </HoverRow>
          ))}
        </aside>

        <article className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
          <div className="grid gap-5">
            {note.content.map((block) => {
              const targeted = block.attrs.blockId === targetId;
              const wrap = (children: React.ReactNode) => (
                <div
                  id={block.attrs.blockId}
                  key={block.attrs.blockId}
                  className={cx(
                    "scroll-mt-24 rounded-[10px] transition-colors motion-reduce:transition-none",
                    targeted && "bg-[var(--primary-faint)] px-3 py-2 -mx-3",
                  )}
                >
                  {children}
                </div>
              );
              if (block.type === "heading")
                return wrap(
                  <h2 className="text-[20px] font-bold tracking-[-0.01em] text-[var(--ink)]">{block.text}</h2>,
                );
              if (block.type === "math")
                return wrap(
                  <div
                    className="overflow-x-auto py-1 text-[var(--ink)]"
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(block.latex ?? "", {
                        throwOnError: false,
                        displayMode: true,
                      }),
                    }}
                  />,
                );
              if (block.type === "callout")
                return wrap(
                  <aside className="flex items-start gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--primary-faint)] p-4 text-sm text-[var(--ink)]">
                    <Sparkles size={17} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden />
                    {block.text}
                  </aside>,
                );
              if (block.type === "worked_example")
                return wrap(
                  <details className="rounded-[12px] border border-[var(--line)] p-4 open:bg-[var(--surface-soft)]">
                    <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
                      Worked example
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{block.text}</p>
                  </details>,
                );
              return wrap(<p className="text-sm leading-relaxed text-[var(--ink-soft)]">{block.text}</p>);
            })}
          </div>
          <div className="mt-8 flex gap-2 border-t border-[var(--line)] pt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setToast("Select text to highlight it — coming in a later phase")}
            >
              <Highlighter size={14} aria-hidden />
              Highlight
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setToast("Personal notes are not saved in this preview yet")}
            >
              <StickyNote size={14} aria-hidden />
              Add note
            </Button>
          </div>
        </article>

        <aside className="grid content-start gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5">
          <Bot size={19} className="text-[var(--primary)]" aria-hidden />
          <h2 className="text-[15px] font-bold text-[var(--ink)]">Ask about this note</h2>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            Questions stay grounded in the material on this page.
          </p>
          <Link
            to="/app/tutor"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Start a conversation
            <ArrowRight size={14} aria-hidden />
          </Link>
        </aside>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

type ChatMessage = { id: string; from: "student" | "tutor"; text: string; citation?: { value: string; blockId: string } };

export function TutorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "tutor",
      text: "Hi Aarav. We’re looking at lines and angles. What feels unclear?",
    },
  ]);
  const [citations, setCitations] = useState<Array<{ value: string; blockId: string }>>([]);
  const [streaming, setStreaming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const message = input;
    setInput("");
    const tutorId = crypto.randomUUID();
    setMessages((list) => [
      ...list,
      { id: crypto.randomUUID(), from: "student", text: message },
      { id: tutorId, from: "tutor", text: "" },
    ]);
    setStreaming(true);
    let text = "";
    for await (const chunk of services.tutor.stream(message)) {
      if (chunk.type === "token") {
        text += chunk.value;
        setMessages((list) => list.map((m) => (m.id === tutorId ? { ...m, text } : m)));
      } else if (chunk.type === "citation" && chunk.blockId) {
        const citation = { value: chunk.value, blockId: chunk.blockId };
        setMessages((list) => list.map((m) => (m.id === tutorId ? { ...m, citation } : m)));
        setCitations((list) => (list.some((c) => c.blockId === citation.blockId) ? list : [...list, citation]));
      }
    }
    setStreaming(false);
  };

  const copyMessage = (text: string) => {
    void navigator.clipboard.writeText(text);
    setToast("Copied to clipboard");
  };

  return (
    <div className="mx-auto grid max-w-[1040px] gap-6 pb-16">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Grounded tutor &middot; Practice mode
          </span>
          <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] sm:text-[32px]">
            Ask VIDYA
          </h1>
          <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--muted)]">
            Hints first, answers later, and every explanation points back to your learning material.
          </p>
        </div>
        <Chip tone="primary">Using published notes</Chip>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="flex h-[560px] flex-col p-0 overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={cx("group flex gap-2.5", message.from === "student" && "flex-row-reverse")}>
                <span
                  className={cx(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                    message.from === "tutor" ? "bg-[var(--primary-faint)] text-[var(--primary)]" : "bg-[var(--surface-strong)] text-[var(--ink-soft)]",
                  )}
                  aria-hidden
                >
                  {message.from === "tutor" ? "V" : "AS"}
                </span>
                <div className={cx("grid max-w-[80%] gap-1.5", message.from === "student" && "justify-items-end")}>
                  <div
                    className={cx(
                      "rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                      message.from === "tutor"
                        ? "bg-[var(--surface-soft)] text-[var(--ink)]"
                        : "bg-[var(--primary)] text-white",
                    )}
                  >
                    {message.text || <i className="text-[var(--faint)]">Thinking&hellip;</i>}
                  </div>
                  {message.citation && (
                    <a
                      href={`/app/notes#${message.citation.blockId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      <BookOpen size={11} aria-hidden />
                      {message.citation.value}
                    </a>
                  )}
                  {message.text && (
                    <IconButton
                      label="Copy message"
                      className={cx("size-6", revealOnHover)}
                      onClick={() => copyMessage(message.text)}
                    >
                      <Copy size={12} aria-hidden />
                    </IconButton>
                  )}
                </div>
              </div>
            ))}
            <div ref={threadEnd} />
          </div>
          <form
            className="flex items-end gap-2 border-t border-[var(--line)] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the step that is confusing…"
              rows={1}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || streaming} loading={streaming}>
              Send
              <Send size={15} aria-hidden />
            </Button>
          </form>
        </Card>

        <aside className="grid content-start gap-4">
          <Card className="grid gap-2 p-5">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Grounded in
            </span>
            {citations.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-[var(--faint)]">
                Ask a question and the notes it draws from will show up here.
              </p>
            ) : (
              <div className="grid gap-0.5">
                {citations.map((citation) => (
                  <HoverRow key={citation.blockId} className="!px-2">
                    <a
                      href={`/app/notes#${citation.blockId}`}
                      className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      <BookOpen size={14} className="shrink-0 text-[var(--muted)]" aria-hidden />
                      <span className="truncate">{citation.value}</span>
                    </a>
                    <ArrowRight size={13} className={cx("shrink-0 text-[var(--faint)]", revealOnHover)} aria-hidden />
                  </HoverRow>
                ))}
              </div>
            )}
          </Card>
          <Card className="grid gap-2 p-5">
            <UsersRound size={19} className="text-[var(--muted)]" aria-hidden />
            <h2 className="text-[15px] font-bold text-[var(--ink)]">Need a person?</h2>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              A teacher can see this conversation and the attempts that led here.
            </p>
            <Link
              to="/app/teachers"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Find a teacher
              <ArrowRight size={14} aria-hidden />
            </Link>
          </Card>
        </aside>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export function TeachersPage() {
  const teachers = useLoaderData() as Teacher[];
  const navigate = useNavigate();

  return (
    <div className="mx-auto grid max-w-[1040px] gap-7 pb-16">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            30-minute focused help
          </span>
          <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
            Book a mathematics teacher
          </h1>
          <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--muted)]">
            Choose a qualified teacher. They&rsquo;ll receive the exact skills and questions you want help with.
          </p>
        </div>
        <Chip tone="primary">From &#8377;599</Chip>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {teachers.map((teacher, index) => (
          <Card key={teacher.teacherId} className="grid gap-3 p-6">
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-full bg-[var(--primary-faint)] text-[15px] font-bold text-[var(--primary)]">
                {teacher.displayName.split(" ").map((part) => part[0]).join("")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-[12px] font-semibold text-[var(--ink)]">
                <Star size={13} fill="currentColor" aria-hidden />
                {teacher.rating}
              </span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--ink)]">{teacher.displayName}</h2>
              <p className="text-[13px] text-[var(--muted)]">{teacher.credentials}</p>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-[var(--muted)]">
              <span>{teacher.yearsExperience} years</span>
              <span aria-hidden>&middot;</span>
              <span>CBSE &middot; Classes 5&ndash;8</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
              <div>
                <small className="block text-[11.5px] text-[var(--faint)]">Next available</small>
                <strong className="text-[13px] font-semibold text-[var(--ink)]">{teacher.nextAvailableAt}</strong>
              </div>
              <Button onClick={() => navigate(`/app/teachers/${teacher.teacherId}/book`)}>
                {index === 0 ? "View times" : "View profile"}
                <ArrowRight size={15} aria-hidden />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-start gap-4 p-6">
        <Target size={20} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden />
        <div>
          <strong className="block text-sm font-semibold text-[var(--ink)]">
            Your teacher won&rsquo;t start cold.
          </strong>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
            With permission, the booking includes recent attempts, weak skills, and the relevant tutor conversation.
          </p>
        </div>
      </Card>
    </div>
  );
}
