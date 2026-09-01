import {
  BookOpen, Bot, BrainCircuit, CalendarDays, ChevronDown, CircleUserRound, FilePenLine,
  GraduationCap, Home, LibraryBig, Menu, Moon, NotebookPen, PanelLeftClose, PanelLeftOpen,
  Search, Settings, Sparkles, Sun, UsersRound, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "@vidya/contracts";
import { Button, IconButton } from "@vidya/ui";
import { useAppStore } from "../lib/store";
import { AiCoachDrawer } from "../features/student/AiCoachDrawer";
import { SubjectSwitcher } from "./SubjectSwitcher";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

const THEME_STORAGE_KEY = "vidya:theme";
const PREVIEW_ROLES: UserRole[] = ["student", "parent", "teacher", "author"];

const nav: Record<UserRole, Array<{ to: string; label: string; icon: typeof Home }>> = {
  student: [
    { to: "/app/home", label: "Home", icon: Home }, { to: "/app/syllabus", label: "Learn", icon: LibraryBig }, { to: "/app/notebook", label: "Materials", icon: NotebookPen }, { to: "/app/practice", label: "Practice", icon: Sparkles }, { to: "/app/tutor", label: "Ask VIDYA", icon: Bot }, { to: "/app/progress", label: "Progress", icon: BrainCircuit },
    { to: "/app/flashcards", label: "Flashcards", icon: BookOpen }, { to: "/app/calendar", label: "Schedule", icon: CalendarDays }, { to: "/app/teachers", label: "Teachers", icon: UsersRound }, { to: "/app/settings", label: "Settings", icon: Settings }
  ],
  parent: [{ to: "/parent/overview", label: "Overview", icon: Home }, { to: "/parent/goals", label: "Exam goals", icon: CalendarDays }, { to: "/parent/bookings", label: "Bookings", icon: UsersRound }, { to: "/parent/plan", label: "Plan", icon: Sparkles }],
  teacher: [{ to: "/teacher/dashboard", label: "Dashboard", icon: Home }, { to: "/teacher/classes", label: "Classes", icon: UsersRound }, { to: "/teacher/assignments", label: "Assignments", icon: FilePenLine }, { to: "/teacher/availability", label: "Calls & availability", icon: CalendarDays }, { to: "/teacher/reports", label: "Reports", icon: BrainCircuit }],
  author: [{ to: "/author/library", label: "Library", icon: LibraryBig }, { to: "/author/editor", label: "Editor", icon: FilePenLine }, { to: "/author/questions", label: "Questions", icon: GraduationCap }, { to: "/author/review", label: "Review queue", icon: Sparkles }, { to: "/author/ingest", label: "Upload & ingest", icon: BookOpen }],
  admin: [{ to: "/author/library", label: "Platform", icon: Home }]
};

const startFor: Record<UserRole, string> = { student: "/app/home", parent: "/parent/overview", teacher: "/teacher/dashboard", author: "/author/library", admin: "/author/library" };

type PaletteItem = { id: string; label: string; hint: string; icon: typeof Home; onSelect: () => void; index: number };
type PaletteGroup = { title: string; items: PaletteItem[] };

export function Shell() {
  const { theme, setTheme, role, setRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // When collapsed the sidebar is not gone, it is peekable: hovering the toggle
  // (or the left edge) slides it out as an overlay, leaving is enough to hide it
  // again, and clicking the toggle locks it back open.
  const [peek, setPeek] = useState(false);
  const location = useLocation(); const navigate = useNavigate();
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);
  useEffect(() => {
    // Picks up a persisted choice once on mount. `theme`/`setTheme` are left out
    // of the deps on purpose - this must not re-fire every time the toggle runs.
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if ((stored === "light" || stored === "dark") && stored !== theme) setTheme(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { const routeRole: UserRole = location.pathname.startsWith("/parent/") ? "parent" : location.pathname.startsWith("/teacher/") ? "teacher" : location.pathname.startsWith("/author/") ? "author" : "student"; if (routeRole !== role) setRole(routeRole); }, [location.pathname, role, setRole]);
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); }, [location.pathname]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => {
          if (!value) lastFocusedRef.current = document.activeElement as HTMLElement;
          return !value;
        });
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => { const openCoach = () => setAiOpen(true); window.addEventListener("vidya:open-ai", openCoach); return () => window.removeEventListener("vidya:open-ai", openCoach); }, []);
  useEffect(() => { const alt = (event: KeyboardEvent) => { if (event.altKey && event.key.toLowerCase() === "s") { event.preventDefault(); setSidebarCollapsed((v) => !v); setPeek(false); } }; window.addEventListener("keydown", alt); return () => window.removeEventListener("keydown", alt); }, []);
  useEffect(() => { if (!sidebarCollapsed) setPeek(false); }, [sidebarCollapsed]);
  useEffect(() => { if (palette) { setQuery(""); setActiveIndex(0); } }, [palette]);

  const chooseRole = (next: UserRole) => { setRole(next); navigate(startFor[next]); };

  const openPalette = () => { lastFocusedRef.current = document.activeElement as HTMLElement; setPalette(true); };
  const closePalette = () => { setPalette(false); lastFocusedRef.current?.focus?.(); };

  const paletteGroups = useMemo<PaletteGroup[]>(() => {
    const q = query.trim().toLowerCase();
    const pages = nav[role]
      .filter((item) => item.label.toLowerCase().includes(q))
      .map((item) => ({ id: `page:${item.to}`, label: item.label, hint: "Go to page", icon: item.icon, onSelect: () => navigate(item.to) }));
    const actions = [
      {
        id: "action:theme", label: theme === "light" ? "Switch to dark theme" : "Switch to light theme",
        hint: "Toggle", icon: theme === "light" ? Moon : Sun,
        onSelect: () => setTheme(theme === "light" ? "dark" : "light"),
      },
      {
        id: "action:sidebar", label: sidebarCollapsed ? "Lock sidebar open" : "Collapse sidebar",
        hint: "⌥S", icon: sidebarCollapsed ? PanelLeftOpen : PanelLeftClose,
        onSelect: () => { setSidebarCollapsed((v) => !v); setPeek(false); },
      },
      ...(role === "student" ? [{ id: "action:ask-vidya", label: "Ask VIDYA", hint: "Open AI coach", icon: Bot, onSelect: () => setAiOpen(true) }] : []),
      ...PREVIEW_ROLES.filter((r) => r !== role).map((r) => ({
        id: `action:role:${r}`, label: `Preview as ${r[0]!.toUpperCase()}${r.slice(1)}`,
        hint: "Switch persona", icon: CircleUserRound, onSelect: () => chooseRole(r),
      })),
    ].filter((item) => item.label.toLowerCase().includes(q));

    let cursor = 0;
    const withIndex = (items: Omit<PaletteItem, "index">[]): PaletteItem[] => items.map((item) => ({ ...item, index: cursor++ }));
    return [
      { title: "Pages", items: withIndex(pages) },
      { title: "Quick actions", items: withIndex(actions) },
    ].filter((group) => group.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role, theme, sidebarCollapsed, navigate]);

  const flatPaletteItems = useMemo(() => paletteGroups.flatMap((group) => group.items), [paletteGroups]);
  const activeIndexSafe = flatPaletteItems.length === 0 ? -1 : Math.min(activeIndex, flatPaletteItems.length - 1);
  const activeItem = activeIndexSafe >= 0 ? flatPaletteItems[activeIndexSafe] : undefined;

  useEffect(() => {
    if (!palette || !activeItem) return;
    document.getElementById(`palette-option-${activeItem.id}`)?.scrollIntoView({ block: "nearest" });
  }, [palette, activeItem]);

  const runPaletteItem = (item: PaletteItem | undefined) => {
    if (!item) return;
    item.onSelect();
    closePalette();
  };

  const handlePaletteKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { closePalette(); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatPaletteItems.length - 1)); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); return; }
    if (event.key === "Enter") { event.preventDefault(); runPaletteItem(activeItem); }
  };

  return <div className={`app-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${peek ? "is-peeking" : ""}`}>
    <a
      className="fixed z-[1000] -translate-y-24 rounded-[10px] bg-[var(--ink)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg)] transition-transform focus:left-4 focus:top-4 focus:translate-y-0 motion-reduce:transition-none"
      href="#main-content"
    >
      Skip to content
    </a>

    <header className="topbar">
      <IconButton
        className="md:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </IconButton>

      <span className="sidebar-toggle-wrap hidden md:inline-flex" onPointerEnter={() => sidebarCollapsed && setPeek(true)}>
        <IconButton
          className="sidebar-toggle"
          onClick={() => { setSidebarCollapsed((v) => !v); setPeek(false); }}
          aria-expanded={!sidebarCollapsed}
          label={sidebarCollapsed ? "Lock sidebar open" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </IconButton>
        <span className="sidebar-tip" role="tooltip">{sidebarCollapsed ? "Lock sidebar open" : "Collapse sidebar"} · <kbd>⌥</kbd><kbd>S</kbd></span>
      </span>

      <NavLink to={startFor[role]} className="flex shrink-0 items-center gap-2" aria-label="VIDYA home">
        <span aria-hidden className="grid size-7 place-items-center rounded-[10px] bg-[var(--primary)] font-display text-[13px] font-extrabold text-white">V</span>
        <span className="font-display text-[17px] font-bold tracking-tight text-[var(--ink)]">VIDYA</span>
      </NavLink>

      {role === "student" && <SubjectSwitcher />}

      <div className="flex flex-1 justify-center px-1">
        <button
          type="button"
          onClick={openPalette}
          className="hidden h-9 w-full max-w-[420px] cursor-pointer items-center gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-left text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink)] md:flex motion-reduce:transition-none"
        >
          <Search size={16} aria-hidden />
          <span className="flex-1 truncate">Search anything</span>
          <kbd className="rounded-[6px] border border-[var(--line-strong)] bg-[var(--surface)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--muted)]">⌘K</kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton className="md:hidden" label="Search pages and actions" onClick={openPalette}>
          <Search size={19} />
        </IconButton>
        {role === "student" && (
          <Button variant="secondary" size="sm" className="hidden md:inline-flex" onClick={() => setAiOpen(true)}>
            <Bot size={16} aria-hidden /> Ask VIDYA
          </Button>
        )}
        <IconButton
          label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </IconButton>
        <label className="relative hidden h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] pl-2.5 pr-7 hover:border-[var(--line-strong)] sm:flex">
          <CircleUserRound size={16} aria-hidden className="text-[var(--muted)]" />
          <select
            value={role}
            onChange={(event) => chooseRole(event.target.value as UserRole)}
            aria-label="Preview persona"
            className="cursor-pointer appearance-none bg-transparent text-[13px] font-semibold text-[var(--ink)] outline-none"
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
            <option value="author">Author</option>
          </select>
          <ChevronDown size={13} aria-hidden className="pointer-events-none absolute right-2.5 text-[var(--muted)]" />
        </label>
      </div>
    </header>

    <aside
      className={cx("sidebar", open && "is-open")}
      aria-label="Primary navigation"
      onPointerEnter={() => sidebarCollapsed && setPeek(true)}
      onPointerLeave={() => setPeek(false)}
    >
      <div className="mb-3 flex items-center gap-2.5 border-b border-[var(--line)] px-2 pb-4 pt-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--primary-soft)] text-[13px] font-bold text-[var(--primary-strong)]">
          {role === "student" ? "AS" : role === "parent" ? "PS" : role === "teacher" ? "MI" : "AU"}
        </span>
        <div className="grid min-w-0 gap-0.5">
          <strong className="truncate text-[13px] font-semibold text-[var(--ink)]">
            {role === "student" ? "Aarav Sharma" : role === "parent" ? "Priya Sharma" : role === "teacher" ? "Meera Iyer" : "Content team"}
          </strong>
          <span className="truncate text-[11px] text-[var(--muted)]">
            {role === "student" ? "CBSE · Class 5" : `${role[0]!.toUpperCase()}${role.slice(1)} workspace`}
          </span>
        </div>
      </div>
      <nav>
        {nav[role].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            aria-label={sidebarCollapsed ? label : undefined}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <Icon size={19} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 border-t border-[var(--line)] px-2 pb-0.5 pt-4 text-[11px] text-[var(--muted)]">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--secure)]" />
        Class 5 pilot · materials ready
      </div>
    </aside>

    <main id="main-content" className="main-content" tabIndex={-1}><Outlet /></main>

    <nav className="bottom-nav" aria-label="Mobile navigation">
      {nav[role].slice(0, 5).map(({ to, label, icon: Icon }, index) => (
        <NavLink key={to} to={to} className={index === 2 ? "bottom-nav__primary" : ""}>
          <Icon size={21} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    {role === "student" && <>
      <button className="ai-fab" onClick={() => setAiOpen(true)} aria-label="Open VIDYA AI coach"><Bot aria-hidden /><span>Ask VIDYA</span></button>
      {aiOpen && <AiCoachDrawer open onClose={() => setAiOpen(false)} />}
    </>}

    {palette && (
      <div
        role="presentation"
        className="fixed inset-0 z-[100] flex justify-center bg-[color-mix(in_srgb,var(--ink)_45%,transparent)] px-4 pt-[10vh] backdrop-blur-sm"
        onMouseDown={closePalette}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onMouseDown={(event) => event.stopPropagation()}
          className="h-fit w-full max-w-[600px] overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]"
        >
          <div className="flex items-center gap-2.5 border-b border-[var(--line)] px-4 py-3">
            <Search size={18} aria-hidden className="text-[var(--muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
              onKeyDown={handlePaletteKeyDown}
              placeholder="Search pages and actions…"
              role="combobox"
              aria-expanded
              aria-controls="command-palette-listbox"
              aria-activedescendant={activeItem ? `palette-option-${activeItem.id}` : undefined}
              className="flex-1 border-0 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--faint)]"
            />
            <kbd className="rounded-[6px] border border-[var(--line-strong)] px-1.5 py-0.5 text-[10.5px] text-[var(--muted)]">esc</kbd>
          </div>

          <div id="command-palette-listbox" role="listbox" aria-label="Results" className="max-h-[60vh] overflow-y-auto p-2">
            {flatPaletteItems.length === 0 ? (
              <p className="px-3 py-8 text-center text-[13px] text-[var(--muted)]">No matches for "{query}".</p>
            ) : (
              paletteGroups.map((group) => (
                <div key={group.title} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-[var(--faint)]">{group.title}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const selected = item.index === activeIndexSafe;
                    return (
                      <button
                        key={item.id}
                        id={`palette-option-${item.id}`}
                        role="option"
                        aria-selected={selected}
                        type="button"
                        tabIndex={-1}
                        onMouseEnter={() => setActiveIndex(item.index)}
                        onClick={() => runPaletteItem(item)}
                        className={cx(
                          "flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13.5px]",
                          selected ? "bg-[var(--surface-soft)] text-[var(--ink)]" : "text-[var(--ink-soft)]",
                        )}
                      >
                        <Icon size={17} aria-hidden className="shrink-0 text-[var(--muted)]" />
                        <span className="flex-1 truncate">{item.label}</span>
                        <span className="shrink-0 text-[11px] text-[var(--faint)]">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--muted)]">
            <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--line)] px-1">↑</kbd><kbd className="rounded border border-[var(--line)] px-1">↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--line)] px-1">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--line)] px-1">esc</kbd> close</span>
          </div>
        </div>
      </div>
    )}
  </div>;
}
