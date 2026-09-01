import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import type { DashboardData, NoteDocument, Question, TopicSummary } from "@vidya/contracts";
import {
  BAND_LABEL,
  Card,
  Chip,
  EmptyState,
  ProgressBar,
  Skeleton,
  bandFor,
} from "@vidya/ui";
import { services } from "../../lib/services";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Mirrors AppRepository["getCurriculum"]'s return shape (see
 *  packages/contracts/src/repositories.ts) - kept local rather than exported
 *  from contracts because SyllabusPage already does the same. */
type Curriculum = Array<{
  grade: 5 | 6 | 7 | 8;
  chapters: Array<{ id: string; title: string; topics: TopicSummary[] }>;
}>;

type HubData = {
  curriculum: Curriculum;
  dashboard: DashboardData;
  note: NoteDocument;
  questions: Question[];
};

/** The IA doc's three example badges ("12 cards due", "3 questions left",
 *  "notes not opened") mapped onto real fields only - nothing here is a
 *  fabricated completion count. dueCards and lastStudiedAt come straight off
 *  TopicSummary; the question count comes from matching the real question
 *  bank by skillId. */
function waitingOn(topic: TopicSummary, questionCount: number): string {
  if (topic.dueCards > 0) return `${topic.dueCards} card${topic.dueCards === 1 ? "" : "s"} due`;
  if (questionCount > 0) return `${questionCount} question${questionCount === 1 ? "" : "s"} available`;
  if (!topic.lastStudiedAt) return "Notes not opened";
  return `Last studied ${topic.lastStudiedAt.toLowerCase()}`;
}

/** One of the three loop actions for the active topic. Deliberately plain and
 *  equal-weight - Read, Practice and Review are three ways into the same
 *  topic, not a ranked list. */
function ModeAction({ icon, label, caption, onClick }: {
  icon: ReactNode; label: string; caption: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "group grid gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4 text-left",
        "transition-colors motion-reduce:transition-none hover:bg-[var(--surface-soft)] cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--primary-faint)] text-[var(--primary)]">
          {icon}
        </span>
        <ArrowRight
          size={15}
          className="text-[var(--faint)] transition-transform motion-reduce:transition-none group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
      <div>
        <strong className="block text-sm font-semibold text-[var(--ink)]">{label}</strong>
        <span className="block text-[12.5px] leading-snug text-[var(--muted)]">{caption}</span>
      </div>
    </button>
  );
}

export function LearnHub() {
  const navigate = useNavigate();
  const [data, setData] = useState<HubData | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      services.repository.getCurriculum(),
      services.repository.getDashboard(),
      services.repository.getNote("note-lines"),
      services.repository.getPracticeQuestions(),
    ])
      .then(([curriculum, dashboard, note, questions]) => {
        if (!alive) return;
        setData({ curriculum, dashboard, note, questions });
        setActiveSkillId((current) => current ?? dashboard.continueTopic.skill.id);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <div className="mx-auto max-w-[900px] pb-16">
        <EmptyState
          title="Learn isn&rsquo;t available right now"
          body="We couldn&rsquo;t load your syllabus. Try again in a moment."
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto grid max-w-[900px] gap-6 pb-16">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
        <Skeleton className="h-72 w-full rounded-[16px]" />
      </div>
    );
  }

  const { curriculum, dashboard, note, questions } = data;
  const chapters = curriculum.find((g) => g.grade === dashboard.gradeLevel)?.chapters ?? [];
  const allTopics = chapters.flatMap((c) => c.topics);
  const activeTopic = allTopics.find((t) => t.skill.id === activeSkillId) ?? dashboard.continueTopic;
  const noteSkillIds = new Set(note.content.flatMap((block) => block.attrs.skillTags ?? []));
  const questionCountFor = (skillId: string) => questions.filter((q) => q.skillId === skillId).length;

  const band = bandFor(activeTopic.mastery);
  const isContinuing = activeTopic.skill.id === dashboard.continueTopic.skill.id;
  // Only "/app/notes" is known to be about this exact skill - the note's
  // blocks are tagged with it. Every other topic has no linked note in the
  // current data, so Read honestly falls back to browsing materials rather
  // than pretending a document exists.
  const readHref = noteSkillIds.has(activeTopic.skill.id) ? "/app/notes" : "/app/notebook";
  const activeQuestionCount = questionCountFor(activeTopic.skill.id);

  return (
    <div className="mx-auto grid max-w-[900px] gap-8 pb-16">
      <header className="grid gap-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Class {dashboard.gradeLevel} &middot; CBSE Mathematics
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
          Learn
        </h1>
        <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--muted)]">
          Read the note, try it, then review the cards it makes &mdash; one topic at a time.
        </p>
      </header>

      <Card className="grid gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            <Sparkles size={13} className="text-[var(--primary)]" aria-hidden />
            {isContinuing ? "Continue where you left off" : "Now viewing"}
          </span>
          <Chip band={band}>{BAND_LABEL[band]}</Chip>
        </div>

        <div className="grid gap-2">
          <h2 className="text-balance font-display text-2xl font-bold tracking-[-0.01em] text-[var(--ink)]">
            {activeTopic.skill.title}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{activeTopic.skill.description}</p>
        </div>

        <div className="grid gap-2">
          <ProgressBar
            value={activeTopic.mastery}
            label={`${activeTopic.mastery}% mastery on ${activeTopic.skill.title}`}
          />
          <div className="flex items-center justify-between text-[12.5px] text-[var(--muted)]">
            <span className="tabular-nums">{activeTopic.mastery}% mastery</span>
            <span className="tabular-nums">
              {activeTopic.dueCards > 0 ? `${activeTopic.dueCards} cards due` : "No cards due"}
            </span>
          </div>
        </div>

        {!isContinuing && (
          <button
            onClick={() => setActiveSkillId(dashboard.continueTopic.skill.id)}
            className="inline-flex w-fit cursor-pointer items-center gap-1 text-[13px] font-medium text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Back to where you left off &middot; {dashboard.continueTopic.skill.title}
            <ArrowRight size={13} aria-hidden />
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <ModeAction
            icon={<BookOpen size={17} aria-hidden />}
            label="Read"
            caption={readHref === "/app/notes" ? "Published note available" : "No note linked yet — browse materials"}
            onClick={() => navigate(readHref)}
          />
          <ModeAction
            icon={<Target size={17} aria-hidden />}
            label="Practice"
            caption={
              activeQuestionCount > 0
                ? `${activeQuestionCount} question${activeQuestionCount === 1 ? "" : "s"} tagged to this skill`
                : "No practice set tagged yet"
            }
            onClick={() => navigate("/app/practice")}
          />
          <ModeAction
            icon={<Layers3 size={17} aria-hidden />}
            label="Review"
            caption={
              activeTopic.dueCards > 0
                ? `${activeTopic.dueCards} card${activeTopic.dueCards === 1 ? "" : "s"} due`
                : "No cards due right now"
            }
            onClick={() => navigate("/app/flashcards")}
          />
        </div>
      </Card>

      <section className="grid gap-4">
        <h2 className="text-[13px] font-semibold text-[var(--muted)]">Your syllabus, in order</h2>
        {chapters.length === 0 ? (
          <EmptyState title="Nothing to learn yet" body="Your syllabus hasn&rsquo;t loaded any chapters." />
        ) : (
          <div className="grid gap-5">
            {chapters.map((chapter, chapterIndex) => (
              <Card key={chapter.id} className="grid gap-1 p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-4">
                  <span className="font-display text-2xl font-bold text-[var(--faint)]">
                    {String(chapterIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)]">
                      {chapter.title}
                    </h3>
                    <p className="text-[12.5px] text-[var(--muted)]">{chapter.topics.length} skills</p>
                  </div>
                </div>
                <div className="grid gap-0.5">
                  {chapter.topics.map((item) => {
                    const rowBand = bandFor(item.mastery);
                    const isActive = item.skill.id === activeTopic.skill.id;
                    const status = waitingOn(item, questionCountFor(item.skill.id));
                    return (
                      <button
                        key={item.skill.id}
                        onClick={() => setActiveSkillId(item.skill.id)}
                        aria-pressed={isActive}
                        className={cx(
                          "group flex items-center gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors motion-reduce:transition-none cursor-pointer",
                          "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]",
                          isActive ? "bg-[var(--primary-faint)]" : "hover:bg-[var(--surface-soft)]",
                        )}
                      >
                        <Chip band={rowBand}>{item.mastery}%</Chip>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm font-semibold text-[var(--ink)]">
                            {item.skill.title}
                          </strong>
                          <small className="text-[12px] text-[var(--muted)]">{status}</small>
                        </div>
                        <ChevronRight
                          size={17}
                          className={cx(
                            "shrink-0 text-[var(--faint)] transition-transform motion-reduce:transition-none",
                            isActive ? "translate-x-0.5 text-[var(--primary)]" : "group-hover:translate-x-0.5",
                          )}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
