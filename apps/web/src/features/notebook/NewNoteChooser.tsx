import { ArrowRight, FileText, PenLine } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAppStore } from "../../lib/store";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@vidya/ui";

/** The fork where a student decides how they think: typed structure they can
 *  turn into flashcards, or a blank page for their own hand. Shared by every
 *  place a note can be created so the choice is made once, well, and the same
 *  way everywhere - not a plain list buried on one page. */

export type NoteMode = "bullet" | "blank";

// Both routes already exist elsewhere in the app; this component only frames
// the decision, it does not own note creation.
const BLANK_TARGET = "/app/notebook/new/handwritten";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** A tiny lived-in preview: a bullet line, the `--` card trigger, and the
 *  answer it produces - so the difference is seen, not read about. */
function BulletPreview() {
  return (
    <div aria-hidden className="grid gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-soft)]">
        <span className="text-[var(--faint)]">•</span> Angles in a triangle
      </div>
      <div className="flex items-center gap-1.5 pl-4 text-[11.5px]">
        <span className="font-mono text-[var(--faint)]">--</span>
        <span className="text-[var(--muted)]">sum = ?</span>
        <ArrowRight size={11} className="shrink-0 text-[var(--primary)]" />
        <span className="rounded-[6px] bg-[var(--primary-faint)] px-1.5 py-0.5 font-semibold text-[var(--primary)]">180°</span>
      </div>
    </div>
  );
}

/** A loose scribbled stroke standing in for a stylus mark - the point is the
 *  freehand line, not a literal diagram. */
function ScribblePreview() {
  return (
    <div aria-hidden className="grid place-items-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-3">
      <svg width="100%" height="34" viewBox="0 0 220 54" role="presentation" preserveAspectRatio="xMidYMid meet">
        <path
          d="M10 42 C 24 8, 40 48, 54 18 S 76 6, 86 32 S 110 46, 128 12 S 156 4, 168 30 S 196 44, 212 16"
          fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-[var(--primary)]"
        />
      </svg>
    </div>
  );
}

function ChooserCard({
  refEl, title, good, selected, icon, shortcutKey, preview, onFocusMode, onCommit,
}: {
  refEl: React.Ref<HTMLButtonElement>; title: string; good: string; selected: boolean;
  icon: ReactNode; shortcutKey: string; preview: ReactNode; onFocusMode: () => void; onCommit: () => void;
}) {
  return (
    <button
      ref={refEl}
      type="button"
      onClick={onCommit}
      onFocus={onFocusMode}
      aria-pressed={selected}
      className={cx(
        "grid gap-3 rounded-[16px] border p-4 text-left transition-colors motion-reduce:transition-none cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
        selected
          ? "border-[var(--primary)] bg-[var(--primary-faint)]"
          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cx(
          "grid size-9 shrink-0 place-items-center rounded-[8px]",
          selected ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-strong)] text-[var(--ink-soft)]",
        )}>
          {icon}
        </span>
        <span className="flex items-center gap-1.5">
          {selected && <span className="text-[11px] font-semibold text-[var(--primary)]">Enter ↵</span>}
          <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--muted)]">
            {shortcutKey}
          </kbd>
        </span>
      </div>
      <span className="grid gap-1">
        <strong className="text-[15px] font-semibold text-[var(--ink)]">{title}</strong>
        <span className="text-[12.5px] text-[var(--muted)]">{good}</span>
      </span>
      {preview}
    </button>
  );
}

export function NewNoteChooser({ open, onClose, contextLabel }: {
  open: boolean; onClose: () => void;
  /** e.g. "book" or "chapter" - lets the folder page keep its own framing. */
  contextLabel?: string;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NoteMode>("bullet");
  const addPersonalNote = useAppStore((state) => state.addPersonalNote);
  const dialogRef = useRef<HTMLDivElement>(null);
  const bulletRef = useRef<HTMLButtonElement>(null);
  const blankRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const hintId = useId();

  const focusMode = (mode: NoteMode) => {
    (mode === "bullet" ? bulletRef : blankRef).current?.focus();
  };

  // Move focus in on open (to the first card), and hand it back to whatever
  // triggered the dialog on close - never let focus fall back to <body>.
  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus?.();
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setSelected("bullet");
    const frame = requestAnimationFrame(() => bulletRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const commit = (mode: NoteMode) => {
    // Create a real note rather than opening an existing fixture document -
    // a chooser headed "how do you want to make notes" has to actually make one.
    const noteId = addPersonalNote({ title: "Untitled note", mode, cards: [] });
    onClose();
    navigate(mode === "bullet" ? `/app/notebook/${noteId}` : BLANK_TARGET);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "1") { e.preventDefault(); focusMode("bullet"); return; }
    if (e.key === "2") { e.preventDefault(); focusMode("blank"); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusMode(selected === "bullet" ? "blank" : "bullet");
      return;
    }
    if (e.key === "Tab") {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  };

  if (!open) return null;

  return (
    <div role="presentation" onMouseDown={onClose} className="fixed inset-0 z-[80] grid place-items-center bg-black/30 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="grid w-full max-w-[560px] gap-5 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] outline-none"
      >
        <div>
          <h2 id={titleId} className="font-display text-lg font-bold text-[var(--ink)]">
            How do you want to make notes?
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Both live in this {contextLabel ?? "notebook"}, and both can hold flashcards.
          </p>
          <p id={hintId} className="sr-only">
            Press 1 or 2 to choose, arrow keys to move between options, Enter to confirm, Escape to close.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ChooserCard
            refEl={bulletRef}
            title="Bullet notes"
            good="Good for definitions and worked steps you'll want as flashcards."
            selected={selected === "bullet"}
            icon={<FileText size={17} aria-hidden />}
            shortcutKey="1"
            preview={<BulletPreview />}
            onFocusMode={() => setSelected("bullet")}
            onCommit={() => commit("bullet")}
          />
          <ChooserCard
            refEl={blankRef}
            title="Blank page"
            good="Good for diagrams, geometry and working out by hand."
            selected={selected === "blank"}
            icon={<PenLine size={17} aria-hidden />}
            shortcutKey="2"
            preview={<ScribblePreview />}
            onFocusMode={() => setSelected("blank")}
            onCommit={() => commit("blank")}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} className="justify-self-start">Cancel</Button>
      </div>
    </div>
  );
}
