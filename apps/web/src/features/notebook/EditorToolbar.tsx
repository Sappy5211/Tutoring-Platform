import {
  ChevronDown, Heading1, Image, Layers, ListChecks, MoreHorizontal, Plus, Table, Undo2,
} from "lucide-react";
import type { CardType } from "@vidya/contracts";
import { Menu, MenuItem } from "@vidya/ui";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

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

const TOOLBAR_BTN = "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[8px] px-2.5 text-[12.5px] font-medium " +
  "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] transition-colors motion-reduce:transition-none cursor-pointer";

/** Visual content for a menu-opening toolbar item. Not a real <button> — Menu
 *  already wraps this in one, so nesting a second would be invalid markup. */
function ToolbarTrigger({ icon: Icon, label, open }: { icon: typeof Layers; label: string; open: boolean }) {
  return (
    <span className={cx(TOOLBAR_BTN, open && "bg-[var(--surface-soft)] text-[var(--ink)]")}>
      <Icon size={16} aria-hidden />
      <span>{label}</span>
      <ChevronDown size={11} aria-hidden className={cx("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
    </span>
  );
}

export function EditorToolbar({ onInsert, onUndo }: {
  onInsert: (kind: string) => void; onUndo: () => void;
}) {
  return (
    <div role="toolbar" aria-label="Insert block" className="mt-3 flex flex-wrap items-center gap-1 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-1.5">
      <Menu label="Flashcard" trigger={(open) => <ToolbarTrigger icon={Layers} label="Flashcard" open={open} />}>
        <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--faint)]">Flashcards</div>
        {CARD_TYPES.map((item) => (
          <MenuItem key={item.id} onClick={() => onInsert(item.id)}>
            <span className="grid gap-0.5 py-0.5 text-left">
              <strong className="text-[13px] font-semibold text-[var(--ink)]">{item.label}</strong>
              <span className="text-[11px] font-normal text-[var(--muted)]">{item.hint}</span>
            </span>
          </MenuItem>
        ))}
      </Menu>

      <Menu label="Heading" trigger={(open) => <ToolbarTrigger icon={Heading1} label="Heading" open={open} />}>
        {HEADINGS.map((item) => (
          <MenuItem key={item.id} onClick={() => onInsert(item.id)}>{item.label}</MenuItem>
        ))}
      </Menu>

      <button className={TOOLBAR_BTN} onClick={() => onInsert("todo")}>
        <ListChecks size={16} aria-hidden /> Todo
      </button>
      <button className={TOOLBAR_BTN} onClick={() => onInsert("image")}>
        <Image size={16} aria-hidden /> Image
      </button>

      <Menu label="Table" trigger={(open) => <ToolbarTrigger icon={Table} label="Table" open={open} />}>
        {TABLES.map((item) => (
          <MenuItem key={item.id} onClick={() => onInsert(item.id)}>{item.label}</MenuItem>
        ))}
      </Menu>

      <Menu label="More" trigger={(open) => <ToolbarTrigger icon={Plus} label="More" open={open} />}>
        {MORE.map((item) => (
          <MenuItem key={item.id} onClick={() => onInsert(item.id)}>{item.label}</MenuItem>
        ))}
      </Menu>

      <button className={cx(TOOLBAR_BTN, "ml-auto")} onClick={onUndo}>
        <Undo2 size={16} aria-hidden /> Undo
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
  return (
    <Menu
      label="Page options"
      align="end"
      trigger={(open) => (
        <span className={cx(
          "grid size-9 place-items-center rounded-[10px] text-[var(--muted)] transition-colors motion-reduce:transition-none",
          "hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]",
          open && "bg-[var(--surface-soft)] text-[var(--ink)]",
        )}>
          <MoreHorizontal size={18} aria-hidden />
        </span>
      )}
    >
      {DOC_MENU.map((item) => (
        <MenuItem key={item.id} danger={item.danger} shortcut={item.shortcut} onClick={() => onPick(item.id)}>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
