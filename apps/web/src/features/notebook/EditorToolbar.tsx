import {
  ChevronDown, Heading1, Image, Layers, ListChecks, MoreHorizontal, Plus, Table, Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CardType } from "@vidya/contracts";

/** Card types offered from the toolbar. Verified against Anki/RemNote's real
 *  set, minus the ones our card-type policy caps - MCQ is here because exam
 *  rehearsal genuinely needs it, but it lands in a separate deck. */
const CARD_TYPES: { id: CardType | "multi_line"; label: string; hint: string }[] = [
  { id: "basic", label: "Single line", hint: "Question → answer on one line" },
  { id: "multi_line", label: "Multi line", hint: "Answer is the indented list below" },
  { id: "concept", label: "Concept", hint: "Term ↔ definition, both directions" },
  { id: "descriptor", label: "Descriptor", hint: "A property of the concept above" },
  { id: "multiple_choice", label: "Multiple choice", hint: "Exam rehearsal — not scored for mastery" },
  { id: "cloze", label: "Cloze", hint: "Hide part of the sentence" },
];

const HEADINGS = [
  { id: "h1", label: "Heading 1" }, { id: "h2", label: "Heading 2" }, { id: "h3", label: "Heading 3" },
  { id: "p", label: "Body text" },
];

const TABLES = [
  { id: "table", label: "Table" }, { id: "grid", label: "Two-column grid" }, { id: "compare", label: "Compare & contrast" },
];

const MORE = [
  { id: "math", label: "Maths block" }, { id: "callout", label: "Callout" },
  { id: "mistake", label: "Common mistake" }, { id: "worked", label: "Worked example" },
  { id: "divider", label: "Divider" }, { id: "code", label: "Code" },
];

function Menu({ id, label, Icon, items, open, setOpen, onPick, header }: {
  id: string; label: string; Icon: typeof Layers;
  items: { id: string; label: string; hint?: string }[];
  open: string | null; setOpen: (v: string | null) => void;
  onPick: (itemId: string) => void; header?: string;
}) {
  const isOpen = open === id;
  return (
    <div className="etb__item">
      {isOpen && (
        <div className="etb__menu" role="menu" aria-label={label}>
          {header && <span className="etb__menu-head">{header}</span>}
          {items.map((item) => (
            <button key={item.id} role="menuitem" onClick={() => { onPick(item.id); setOpen(null); }}>
              <strong>{item.label}</strong>
              {item.hint && <small>{item.hint}</small>}
            </button>
          ))}
        </div>
      )}
      <button
        className={`etb__btn${isOpen ? " is-open" : ""}`}
        onClick={() => setOpen(isOpen ? null : id)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Icon size={19} aria-hidden />
        <span>{label}</span>
        <ChevronDown size={12} aria-hidden className="etb__caret" />
      </button>
    </div>
  );
}

export function EditorToolbar({ onInsert, onUndo }: {
  onInsert: (kind: string) => void; onUndo: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="etb" ref={rootRef} role="toolbar" aria-label="Insert block">
      <Menu id="card" label="Flashcard" Icon={Layers} header="Flashcards" items={CARD_TYPES}
        open={open} setOpen={setOpen} onPick={onInsert} />
      <Menu id="heading" label="Heading" Icon={Heading1} items={HEADINGS}
        open={open} setOpen={setOpen} onPick={onInsert} />
      <button className="etb__btn" onClick={() => onInsert("todo")}>
        <ListChecks size={19} aria-hidden /><span>Todo</span>
      </button>
      <button className="etb__btn" onClick={() => onInsert("image")}>
        <Image size={19} aria-hidden /><span>Image</span>
      </button>
      <Menu id="table" label="Table" Icon={Table} items={TABLES}
        open={open} setOpen={setOpen} onPick={onInsert} />
      <Menu id="more" label="More" Icon={Plus} items={MORE}
        open={open} setOpen={setOpen} onPick={onInsert} />
      <button className="etb__btn" onClick={onUndo}>
        <Undo2 size={19} aria-hidden /><span>Undo</span>
      </button>
    </div>
  );
}

const DOC_MENU: { id: string; label: string; shortcut?: string; danger?: boolean }[] = [
  { id: "cards", label: "Flashcards in this page" },
  { id: "icon", label: "Change page icon" },
  { id: "tutor", label: "Learn with the AI tutor" },
  { id: "share", label: "Share page" },
  { id: "undo", label: "Undo", shortcut: "⌘Z" },
  { id: "find", label: "Find or filter", shortcut: "⌘F" },
  { id: "status", label: "Change status" },
  { id: "pane", label: "Open in another pane" },
  { id: "move", label: "Move to…" },
  { id: "print", label: "Print" },
  { id: "export", label: "Export" },
  { id: "stats", label: "Stats" },
  { id: "delete", label: "Delete page", danger: true },
];

export function DocumentMenu({ onPick }: { onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  return (
    <div className="doc-menu" ref={ref}>
      <button className="icon-button" onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu" aria-expanded={open} aria-label="Page options">
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="doc-menu__panel" role="menu">
          {DOC_MENU.map((item) => (
            <button key={item.id} role="menuitem" className={item.danger ? "is-danger" : ""}
              onClick={() => { onPick(item.id); setOpen(false); }}>
              {item.label}
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
