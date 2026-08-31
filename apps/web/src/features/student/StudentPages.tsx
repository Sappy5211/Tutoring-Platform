import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Layers3,
  MessageCircleQuestion,
  Play,
  Sparkles,
  Star,
  Target,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import katex from "katex";
import type {
  DashboardData,
  NoteDocument,
  Teacher,
  TopicSummary,
} from "@vidya/contracts";
import { Button, Card, Chip, ProgressBar, ProgressRing } from "@vidya/ui";
import { services } from "../../lib/services";

export function HomePage() {
  const data = useLoaderData() as DashboardData;
  const navigate = useNavigate();
  return (
    <div className="page home-page">
      <header className="welcome">
        <div>
          <span className="eyebrow">Monday · your learning plan</span>
          <h1>Good morning, {data.studentName}.</h1>
          <p>One focused session will keep you on track today.</p>
        </div>
        <div className="streak-pill">
          <Flame />
          {data.streakDays} day streak
        </div>
      </header>
      <Card className="daily-card">
        <div className="daily-card__copy">
          <Chip tone="primary">Today · {data.dailyGoalMinutes} minutes</Chip>
          <h2>Continue with lines and angles</h2>
          <p>
            Two ideas to review, then four questions chosen from your developing
            skills.
          </p>
          <div className="daily-card__progress">
            <ProgressBar
              value={(data.completedMinutes / data.dailyGoalMinutes) * 100}
            />
            <span>
              {data.completedMinutes} of {data.dailyGoalMinutes} minutes
              complete
            </span>
          </div>
          <Button onClick={() => navigate("/app/practice")}>
            <Play size={17} fill="currentColor" />
            Start focused practice
          </Button>
        </div>
        <div className="daily-card__visual">
          <ProgressRing
            value={data.averageMastery}
            size={130}
            label="Overall mastery"
          />
          <span>Overall mastery</span>
        </div>
      </Card>
      <section className="dashboard-grid">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Next best steps</span>
              <h2>Chosen for you</h2>
            </div>
            <Link to="/app/syllabus">
              See syllabus
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="recommendation-list">
            {data.recommendations.map((item, index) => (
              <Card key={item.skill.id} className="recommendation-card">
                <span className="recommendation-card__number">
                  0{index + 1}
                </span>
                <div>
                  <Chip
                    tone={item.band === "developing" ? "warning" : "success"}
                  >
                    {item.band}
                  </Chip>
                  <h3>{item.skill.title}</h3>
                  <p>{item.skill.description}</p>
                  <div>
                    <span>{item.mastery}% mastery</span>
                    <span>{item.dueCards} cards due</span>
                  </div>
                </div>
                <Link
                  to="/app/practice"
                  aria-label={`Practise ${item.skill.title}`}
                >
                  <ChevronRight />
                </Link>
              </Card>
            ))}
          </div>
        </div>
        <aside>
          <Card className="exam-card">
            <div className="exam-card__icon">
              <CalendarDays />
            </div>
            <span className="eyebrow">Your exam goal</span>
            <h2>14 March</h2>
            <p>{data.exam.title}</p>
            <div className="exam-card__status">
              <CheckCircle2 />
              On track
            </div>
            <button>Edit goal</button>
          </Card>
          <Card className="quick-stats">
            <div>
              <BookMarked />
              <span>
                <strong>{data.dueCards}</strong> flashcards due
              </span>
            </div>
            <div>
              <Target />
              <span>
                <strong>4</strong> skills near secure
              </span>
            </div>
            <div>
              <Clock3 />
              <span>
                <strong>42m</strong> studied this week
              </span>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

type Curriculum = Array<{
  grade: 5 | 6 | 7 | 8;
  chapters: Array<{ id: string; title: string; topics: TopicSummary[] }>;
}>;
export function SyllabusPage() {
  const curriculum = useLoaderData() as Curriculum;
  const [grade, setGrade] = useState<5 | 6 | 7 | 8>(7);
  const [filter, setFilter] = useState("all");
  const current = curriculum.find((item) => item.grade === grade)!;
  const filters = [
    { id: "all", label: "All" },
    { id: "developing", label: "Developing" },
    { id: "secure", label: "Secure" },
  ];
  return (
    <div className="page syllabus-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">CBSE mathematics · Classes 5–8</span>
          <h1>Your learning map</h1>
          <p>
            Move through chapters in syllabus order, with mastery visible at
            every step.
          </p>
        </div>
        <Button>
          <Sparkles size={17} />
          Start today’s plan
        </Button>
      </header>
      <div className="filter-row">
        <div className="segmented" aria-label="Choose class">
          {curriculum.map((item) => (
            <button
              className={grade === item.grade ? "active" : ""}
              key={item.grade}
              onClick={() => setGrade(item.grade)}
            >
              Class {item.grade}
            </button>
          ))}
        </div>
        <div className="filter-chips">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="chapter-list">
        {current.chapters.map((chapter, chapterIndex) => (
          <Card key={chapter.id} className="chapter-card">
            <div className="chapter-card__header">
              <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
              <div>
                <h2>{chapter.title}</h2>
                <p>
                  {chapter.topics.length} skills · Class {grade}
                </p>
              </div>
              <ProgressRing
                value={Math.round(
                  chapter.topics.reduce((sum, item) => sum + item.mastery, 0) /
                    chapter.topics.length,
                )}
                size={62}
              />
            </div>
            <div className="topic-list">
              {chapter.topics
                .filter((item) => filter === "all" || item.band === filter)
                .map((item) => (
                  <Link
                    to={`/app/topic/${item.skill.id}`}
                    key={item.skill.id}
                    className="topic-row"
                  >
                    <span className={`mastery-dot mastery-dot--${item.band}`} />
                    <div>
                      <strong>{item.skill.title}</strong>
                      <small>
                        {item.lastStudiedAt
                          ? `Last studied ${item.lastStudiedAt.toLowerCase()}`
                          : "Not started"}
                      </small>
                    </div>
                    <span>{item.mastery}%</span>
                    <ChevronRight size={18} />
                  </Link>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TopicPage() {
  const topic = useLoaderData() as TopicSummary;
  const navigate = useNavigate();
  return (
    <div className="page topic-page">
      <header className="topic-hero">
        <div>
          <Link to="/app/syllabus">Class 7 · Geometry</Link>
          <Chip tone="warning">{topic.band}</Chip>
          <h1>{topic.skill.title}</h1>
          <p>{topic.skill.description}</p>
          <div className="topic-actions">
            <Button onClick={() => navigate("/app/practice")}>
              <Play size={17} />
              Practise now
            </Button>
            <Button variant="secondary" onClick={() => navigate("/app/tutor")}>
              <Bot size={17} />
              Ask VIDYA
            </Button>
          </div>
        </div>
        <ProgressRing value={topic.mastery} size={150} />
      </header>
      <nav className="mode-tabs">
        <button className="active">
          <BookOpen />
          Notes
        </button>
        <Link to="/app/practice">
          <Target />
          Practice
        </Link>
        <Link to="/app/flashcards">
          <Layers3 />
          Flashcards
        </Link>
        <Link to="/app/tutor">
          <Bot />
          Ask AI
        </Link>
      </nav>
      <div className="topic-content">
        <Card>
          <span className="eyebrow">Lesson path</span>
          <h2>Three ideas, one connected method</h2>
          <div className="lesson-steps">
            <div>
              <span>1</span>
              <section>
                <strong>Recognise the relationship</strong>
                <p>
                  Start with what the diagram or equation is already telling
                  you.
                </p>
              </section>
              <CheckCircle2 />
            </div>
            <div>
              <span>2</span>
              <section>
                <strong>Choose the matching rule</strong>
                <p>Connect the question to the property that unlocks it.</p>
              </section>
              <Play />
            </div>
            <div>
              <span>3</span>
              <section>
                <strong>Explain the conclusion</strong>
                <p>
                  State the final relationship using precise mathematical
                  language.
                </p>
              </section>
              <BookOpen />
            </div>
          </div>
        </Card>
        <Card className="topic-side">
          <MessageCircleQuestion />
          <h2>Stuck on one step?</h2>
          <p>
            The tutor will use this exact topic and cite the notes it draws
            from.
          </p>
          <Link to="/app/tutor">
            Open focused tutor
            <ArrowRight />
          </Link>
        </Card>
      </div>
    </div>
  );
}

export function NotesPage() {
  const note = useLoaderData() as NoteDocument;
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <div className="page notes-page">
      <header className="notes-header">
        <div>
          <span className="eyebrow">Published teaching note</span>
          <h1>{note.title}</h1>
          <p>Class 7 · Geometry · Updated today</p>
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <BookMarked size={17} />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button variant="secondary">Export PDF</Button>
        </div>
      </header>
      <div className="notes-layout">
        <aside className="notes-outline">
          <span>On this page</span>
          {note.content
            .filter((block) => block.type === "heading")
            .map((block) => (
              <a key={block.attrs.blockId} href={`#${block.attrs.blockId}`}>
                {block.text}
              </a>
            ))}
        </aside>
        <article className="note-paper">
          {note.content.map((block) => {
            if (block.type === "heading")
              return (
                <h2 id={block.attrs.blockId} key={block.attrs.blockId}>
                  {block.text}
                </h2>
              );
            if (block.type === "math")
              return (
                <div
                  key={block.attrs.blockId}
                  className="note-math"
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(block.latex ?? "", {
                      throwOnError: false,
                      displayMode: true,
                    }),
                  }}
                />
              );
            if (block.type === "callout")
              return (
                <aside key={block.attrs.blockId} className="note-callout">
                  <Sparkles />
                  {block.text}
                </aside>
              );
            if (block.type === "worked_example")
              return (
                <details key={block.attrs.blockId} className="worked-example">
                  <summary>Worked example</summary>
                  <p>{block.text}</p>
                </details>
              );
            return <p key={block.attrs.blockId}>{block.text}</p>;
          })}
          <div className="annotation-rail">
            <button aria-label="Highlight selection">Highlight</button>
            <button aria-label="Add a personal note">Add note</button>
          </div>
        </article>
        <aside className="notes-companion">
          <Bot />
          <h2>Ask about this note</h2>
          <p>Questions stay grounded in the material on this page.</p>
          <Link to="/app/tutor">
            Start a conversation
            <ArrowRight />
          </Link>
        </aside>
      </div>
    </div>
  );
}

export function TutorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "student" | "tutor"; text: string }>
  >([
    {
      from: "tutor",
      text: "Hi Aarav. We’re looking at lines and angles. What feels unclear?",
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const send = async () => {
    if (!input.trim() || streaming) return;
    const message = input;
    setInput("");
    setMessages((list) => [
      ...list,
      { from: "student", text: message },
      { from: "tutor", text: "" },
    ]);
    setStreaming(true);
    let text = "";
    for await (const chunk of services.tutor.stream(message))
      if (chunk.type === "token") {
        text += chunk.value;
        setMessages((list) => [...list.slice(0, -1), { from: "tutor", text }]);
      }
    setStreaming(false);
  };
  return (
    <div className="page tutor-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Grounded tutor · Practice mode</span>
          <h1>Ask VIDYA</h1>
          <p>
            Hints first, answers later—and every explanation points back to your
            learning material.
          </p>
        </div>
        <Chip tone="success">Using published notes</Chip>
      </header>
      <div className="tutor-layout">
        <Card className="chat-panel">
          <div className="chat-thread">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message chat-message--${message.from}`}
              >
                <span>{message.from === "tutor" ? "V" : "AS"}</span>
                <div>{message.text || <i>Thinking…</i>}</div>
              </div>
            ))}
          </div>
          <div className="chat-compose">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the step that is confusing…"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <Button onClick={send} disabled={!input.trim() || streaming}>
              Send
              <ArrowRight size={17} />
            </Button>
          </div>
        </Card>
        <aside>
          <Card>
            <span className="eyebrow">Current context</span>
            <h2>Lines and angles</h2>
            <p>3 published note blocks retrieved</p>
            <div className="citation-list">
              <button>Angles tell us how far a line turns</button>
              <button>Worked example · supplementary angles</button>
            </div>
          </Card>
          <Card className="escalate-card">
            <UsersRound />
            <h2>Need a person?</h2>
            <p>
              A teacher can see this conversation and the attempts that led
              here.
            </p>
            <Link to="/app/teachers">
              Find a teacher
              <ArrowRight />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function TeachersPage() {
  const teachers = useLoaderData() as Teacher[];
  const navigate = useNavigate();
  return (
    <div className="page teachers-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">30-minute focused help</span>
          <h1>Book a mathematics teacher</h1>
          <p>
            Choose a qualified teacher. They’ll receive the exact skills and
            questions you want help with.
          </p>
        </div>
        <Chip tone="primary">From ₹599</Chip>
      </header>
      <div className="teacher-grid">
        {teachers.map((teacher, index) => (
          <Card key={teacher.teacherId} className="teacher-card">
            <div className="teacher-avatar">
              {teacher.displayName
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div className="teacher-card__rating">
              <Star size={15} fill="currentColor" />
              {teacher.rating}
            </div>
            <h2>{teacher.displayName}</h2>
            <p>{teacher.credentials}</p>
            <div>
              <span>{teacher.yearsExperience} years</span>
              <span>CBSE · Classes 5–8</span>
            </div>
            <small>Next available</small>
            <strong>{teacher.nextAvailableAt}</strong>
            <Button
              onClick={() =>
                navigate(`/app/teachers/${teacher.teacherId}/book`)
              }
            >
              {index === 0 ? "View times" : "View profile"}
              <ArrowRight size={17} />
            </Button>
          </Card>
        ))}
      </div>
      <Card className="booking-context">
        <Target />
        <div>
          <strong>Your teacher won’t start cold.</strong>
          <p>
            With permission, the booking includes recent attempts, weak skills,
            and the relevant tutor conversation.
          </p>
        </div>
      </Card>
    </div>
  );
}
