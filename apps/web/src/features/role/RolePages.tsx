import { lazy, Suspense, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GripVertical,
  Layers3,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  Upload,
  UsersRound,
} from "lucide-react";
import type { DashboardData, SurfaceData } from "@vidya/contracts";
import { Button, Card, Chip, ProgressBar, ProgressRing } from "@vidya/ui";

const LazyEditor = lazy(() => import("./TiptapEditor"));
const teacherActions = [
  { Icon: UsersRound, title: "View classes", meta: "See who needs help" },
  {
    Icon: BookOpenCheck,
    title: "Create worksheet",
    meta: "Choose and preview questions",
  },
  {
    Icon: CalendarCheck2,
    title: "Open call calendar",
    meta: "4 bookings this week",
  },
  {
    Icon: Target,
    title: "Review weak skills",
    meta: "9 students need attention",
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState(7);
  return (
    <main className="onboarding">
      <section className="onboarding__brand">
        <span className="brand__mark">V</span>
        <strong>VIDYA</strong>
        <p>A calmer way to master school mathematics.</p>
        <div className="onboarding__promise">
          <Sparkles />
          <span>Clear notes</span>
          <Target />
          <span>Practice that adapts</span>
          <UsersRound />
          <span>A real teacher when needed</span>
        </div>
      </section>
      <section className="onboarding__panel">
        <div className="onboarding__progress">
          <span>Step {step} of 3</span>
          <ProgressBar value={(step / 3) * 100} />
        </div>
        {step === 1 && (
          <div className="onboarding__content">
            <span className="eyebrow">Let’s begin</span>
            <h1>Which class are you learning in?</h1>
            <p>
              This sets the syllabus and keeps every recommendation relevant.
            </p>
            <div className="grade-picker">
              {[5, 6, 7, 8].map((item) => (
                <button
                  key={item}
                  className={grade === item ? "active" : ""}
                  onClick={() => setGrade(item)}
                >
                  <span>Class</span>
                  <strong>{item}</strong>
                  {grade === item && <Check />}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)}>
              Continue
              <ArrowRight />
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className="onboarding__content">
            <span className="eyebrow">Parent or guardian</span>
            <h1>Learning data needs a grown-up’s permission.</h1>
            <p>
              We’ll send a secure consent request before saving personalised
              learning history. No advertising profiles. No hidden sharing.
            </p>
            <Card className="consent-card">
              <CircleUserRound />
              <div>
                <strong>Priya Sharma</strong>
                <span>Primary parent · +91 ••••• 1184</span>
              </div>
              <Chip tone="warning">Verification stub</Chip>
            </Card>
            <label className="consent-check">
              <input type="checkbox" defaultChecked />I understand which
              learning data VIDYA will use and why.
            </label>
            <Button onClick={() => setStep(3)}>
              Record consent shape
              <ArrowRight />
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="onboarding__content">
            <span className="eyebrow">Your goal</span>
            <h1>When is the next school maths exam?</h1>
            <p>
              Classes 5–8 have school-set dates, so you or your parent choose
              the goal.
            </p>
            <label className="field-label">
              Exam name
              <input defaultValue="Annual mathematics exam" />
            </label>
            <label className="field-label">
              Date
              <input type="date" defaultValue="2026-03-14" />
            </label>
            <Button onClick={() => navigate("/app/home")}>
              Build my Class {grade} plan
              <ArrowRight />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export function TeacherDashboard() {
  const data = useLoaderData() as SurfaceData;
  return (
    <div className="page teacher-dashboard">
      <header className="page-header">
        <div>
          <span className="eyebrow">Teacher workspace · Monday</span>
          <h1>Good morning, Meera.</h1>
          <p>Three places need your attention before today’s first call.</p>
        </div>
        <Button>
          <Plus />
          Set an assignment
        </Button>
      </header>
      <div className="teacher-overview">
        <Card className="teacher-profile">
          <div className="teacher-profile__avatar">MI</div>
          <div>
            <Chip tone="success">Available</Chip>
            <h2>Meera Iyer</h2>
            <p>CBSE mathematics · Classes 5–8</p>
          </div>
          <div className="teacher-profile__stats">
            <span>
              <strong>74</strong>students
            </span>
            <span>
              <strong>4.9</strong>rating
            </span>
            <span>
              <strong>9y</strong>experience
            </span>
          </div>
        </Card>
        <Card className="mastery-overview">
          <ProgressRing value={69} size={110} />
          <div>
            <span className="eyebrow">Shared class mastery</span>
            <h2>69% secure</h2>
            <p>Class 7 improved by 6 points this month.</p>
          </div>
        </Card>
      </div>
      <div className="teacher-columns">
        <Card className="teacher-feed">
          <div className="panel-heading">
            <div>
              <h2>Student activity</h2>
              <p>The clearest signals, not a noisy feed.</p>
            </div>
            <button className="icon-button" aria-label="Student activity options">
              <MoreHorizontal />
            </button>
          </div>
          {data.items.map((item) => (
            <article key={item.id}>
              <span className="activity-icon">
                <CheckCircle2 />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.meta}</p>
                <small>Today</small>
              </div>
              <Chip
                tone={
                  item.progress && item.progress < 60 ? "warning" : "success"
                }
              >
                {item.progress ?? 80}%
              </Chip>
            </article>
          ))}
        </Card>
        <aside>
          <Card className="quick-actions">
            <h2>Quick actions</h2>
            {teacherActions.map(({ Icon, title, meta }) => (
              <button key={title}>
                <span>
                  <Icon size={19} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{meta}</small>
                </div>
                <ChevronRight />
              </button>
            ))}
          </Card>
          <Card className="next-call">
            <Clock3 />
            <span className="eyebrow">Next booked call</span>
            <h2>Aarav · 6:00 PM</h2>
            <p>Simple equations · 3 recent attempts attached</p>
            <Button variant="secondary">Open context</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

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

export function ParentGoalPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Parent-set schedule</span>
          <h1>Exam goals</h1>
          <p>
            Set the school’s date and VIDYA will shape a realistic daily plan
            around it.
          </p>
        </div>
        <Button>
          <Plus />
          Add exam
        </Button>
      </header>
      <div className="goal-grid">
        <Card className="goal-card">
          <CalendarCheck2 />
          <Chip tone="success">Primary goal</Chip>
          <h2>Annual mathematics exam</h2>
          <p>14 March 2026 · Class 7 · 42 skills</p>
          <ProgressBar value={63} />
          <div>
            <span>On track</span>
            <strong>25 min/day</strong>
          </div>
          <Button variant="secondary">Edit schedule</Button>
        </Card>
        <Card className="goal-explainer">
          <Sparkles />
          <h2>A goal complements spaced review.</h2>
          <p>
            It changes the daily pace without throwing away what memory
            scheduling already knows.
          </p>
          <ul>
            <li>
              <Check />
              Learning period for new ideas
            </li>
            <li>
              <Check />
              Final review near the date
            </li>
            <li>
              <Check />
              Catch-up without an impossible daily total
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
