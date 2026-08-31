import { BookOpen, Bot, BrainCircuit, CalendarDays, ChevronDown, CircleUserRound, FilePenLine, GraduationCap, Home, LibraryBig, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, Sparkles, Sun, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "@vidya/contracts";
import { useAppStore } from "../lib/store";
import { AiCoachDrawer } from "../features/student/AiCoachDrawer";

const nav: Record<UserRole, Array<{ to: string; label: string; icon: typeof Home }>> = {
  student: [
    { to: "/app/home", label: "Home", icon: Home }, { to: "/app/syllabus", label: "Learn", icon: LibraryBig }, { to: "/app/practice", label: "Practice", icon: Sparkles }, { to: "/app/tutor", label: "Ask VIDYA", icon: Bot }, { to: "/app/progress", label: "Progress", icon: BrainCircuit },
    { to: "/app/flashcards", label: "Flashcards", icon: BookOpen }, { to: "/app/calendar", label: "Schedule", icon: CalendarDays }, { to: "/app/teachers", label: "Teachers", icon: UsersRound }, { to: "/app/settings", label: "Settings", icon: Settings }
  ],
  parent: [{ to: "/parent/overview", label: "Overview", icon: Home }, { to: "/parent/goals", label: "Exam goals", icon: CalendarDays }, { to: "/parent/bookings", label: "Bookings", icon: UsersRound }, { to: "/parent/plan", label: "Plan", icon: Sparkles }],
  teacher: [{ to: "/teacher/dashboard", label: "Dashboard", icon: Home }, { to: "/teacher/classes", label: "Classes", icon: UsersRound }, { to: "/teacher/assignments", label: "Assignments", icon: FilePenLine }, { to: "/teacher/availability", label: "Calls & availability", icon: CalendarDays }, { to: "/teacher/reports", label: "Reports", icon: BrainCircuit }],
  author: [{ to: "/author/library", label: "Library", icon: LibraryBig }, { to: "/author/editor", label: "Editor", icon: FilePenLine }, { to: "/author/questions", label: "Questions", icon: GraduationCap }, { to: "/author/review", label: "Review queue", icon: Sparkles }, { to: "/author/ingest", label: "Upload & ingest", icon: BookOpen }],
  admin: [{ to: "/author/library", label: "Platform", icon: Home }]
};

const startFor: Record<UserRole, string> = { student: "/app/home", parent: "/parent/overview", teacher: "/teacher/dashboard", author: "/author/library", admin: "/author/library" };

export function Shell() {
  const { theme, setTheme, role, setRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation(); const navigate = useNavigate();
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { const routeRole: UserRole = location.pathname.startsWith("/parent/") ? "parent" : location.pathname.startsWith("/teacher/") ? "teacher" : location.pathname.startsWith("/author/") ? "author" : "student"; if (routeRole !== role) setRole(routeRole); }, [location.pathname, role, setRole]);
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); }, [location.pathname]);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette((value) => !value); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);
  useEffect(() => { const openCoach = () => setAiOpen(true); window.addEventListener("vidya:open-ai", openCoach); return () => window.removeEventListener("vidya:open-ai", openCoach); }, []);
  const chooseRole = (next: UserRole) => { setRole(next); navigate(startFor[next]); };
  return <div className={`app-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Open navigation">{open ? <X /> : <Menu />}</button>
      <NavLink to={startFor[role]} className="brand"><span className="brand__mark">V</span><span>VIDYA</span><small>Maths</small></NavLink>
      <button className="search-trigger" onClick={() => setPalette(true)}><Search size={18} /><span>Search anything</span><kbd>⌘ K</kbd></button>
      <div className="topbar__actions">
        {role === "student" && <button className="ask-vidya-trigger" onClick={() => setAiOpen(true)}><Bot size={17} /><span>Ask VIDYA</span></button>}
        <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon /> : <Sun />}</button>
        <label className="role-switcher"><CircleUserRound size={19} /><select value={role} onChange={(event) => chooseRole(event.target.value as UserRole)} aria-label="Preview persona"><option value="student">Student</option><option value="parent">Parent</option><option value="teacher">Teacher</option><option value="author">Author</option></select><ChevronDown size={15} /></label>
      </div>
    </header>
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Primary navigation">
      <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
      <div className="sidebar__context"><span className="avatar">{role === "student" ? "AS" : role === "parent" ? "PS" : role === "teacher" ? "MI" : "AU"}</span><div><strong>{role === "student" ? "Aarav Sharma" : role === "parent" ? "Priya Sharma" : role === "teacher" ? "Meera Iyer" : "Content team"}</strong><span>{role === "student" ? "CBSE · Class 7" : `${role[0]!.toUpperCase()}${role.slice(1)} workspace`}</span></div></div>
      <nav>{nav[role].map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} title={sidebarCollapsed ? label : undefined} aria-label={sidebarCollapsed ? label : undefined} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar__footer"><span className="signal-dot" />Mock workspace · all systems safe</div>
    </aside>
    <main id="main-content" className="main-content" tabIndex={-1}><Outlet /></main>
    <nav className="bottom-nav" aria-label="Mobile navigation">{nav[role].slice(0, 5).map(({ to, label, icon: Icon }, index) => <NavLink key={to} to={to} className={index === 2 ? "bottom-nav__primary" : ""}><Icon size={21} /><span>{label}</span></NavLink>)}</nav>
    {role === "student" && <><button className="ai-fab" onClick={() => setAiOpen(true)} aria-label="Open VIDYA AI coach"><Bot /><span>Ask VIDYA</span></button>{aiOpen && <AiCoachDrawer open onClose={() => setAiOpen(false)} />}</>}
    {palette && <div className="palette-backdrop" role="presentation" onMouseDown={() => setPalette(false)}><div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}><div className="command-palette__search"><Search size={20} /><input autoFocus placeholder="Search pages, skills, and actions…" onKeyDown={(event) => { if (event.key === "Escape") setPalette(false); }} /></div><p>Quick navigation</p>{nav[role].slice(0, 6).map(({ to, label, icon: Icon }) => <button key={to} onClick={() => { navigate(to); setPalette(false); }}><Icon size={18} />{label}<span>Go</span></button>)}</div></div>}
  </div>;
}
