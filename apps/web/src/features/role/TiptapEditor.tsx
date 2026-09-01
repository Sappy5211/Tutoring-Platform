import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code2, GripVertical, Heading2, Image, Italic, List, Plus, Sigma, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Toast } from "@vidya/ui";

const SEED_CONTENT = `
  <h2>Angles tell us how far a line turns</h2>
  <p>An angle is formed where two rays meet. We call their meeting point the <strong>vertex</strong>.</p>
  <blockquote>A right angle is exactly one quarter of a full turn.</blockquote>
  <h3>Try connecting this idea</h3>
  <p>When two angles sit on a straight line, what must their total be?</p>
`;

function ToolbarButton({ editor, label, active, onClick, children }: {
  editor: Editor; label: string; active: boolean; onClick: () => void; children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={!editor.isEditable}
      className={`grid size-8 place-items-center rounded-[8px] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
        active
          ? "bg-[var(--primary-faint)] text-[var(--primary)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

const SLASH_ITEMS = [
  { id: "heading", Icon: Heading2, title: "Heading", detail: "Structure a section" },
  { id: "maths", Icon: Sigma, title: "Maths", detail: "Formula with KaTeX preview" },
  { id: "flashcard", Icon: Sparkles, title: "Flashcard", detail: "Concept or descriptor card" },
  { id: "image", Icon: Image, title: "Image", detail: "Add accessible teaching media" },
] as const;

export default function TiptapEditor() {
  const [slashOpen, setSlashOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content: SEED_CONTENT,
    editorProps: { attributes: { class: "tiptap-editor", "aria-label": "Teaching note editor" } },
  });

  if (!editor) return null;

  const runSlashItem = (id: (typeof SLASH_ITEMS)[number]["id"]) => {
    if (id === "heading") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      setSlashOpen(false);
      return;
    }
    const label = SLASH_ITEMS.find((item) => item.id === id)?.title ?? id;
    setToast(`${label} blocks are not wired up in this editor yet.`);
    setSlashOpen(false);
  };

  return (
    <div className="relative grid gap-3">
      <div
        aria-label="Text formatting"
        className="flex w-fit items-center gap-0.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[var(--shadow-sm)]"
      >
        <ToolbarButton editor={editor} label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} aria-hidden />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} aria-hidden />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} aria-hidden />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} aria-hidden />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={16} aria-hidden />
        </ToolbarButton>
      </div>

      <div className="flex items-start gap-2">
        <span aria-hidden className="mt-1.5 text-[var(--faint)]">
          <GripVertical size={16} />
        </span>
        <button
          type="button"
          onClick={() => setSlashOpen((v) => !v)}
          aria-label="Insert a block"
          aria-expanded={slashOpen}
          className="mt-1 grid size-6 place-items-center rounded-[6px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer"
        >
          <Plus size={15} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <EditorContent
            editor={editor}
            className="prose-note min-h-[220px] text-[15px] leading-relaxed text-[var(--ink)] [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--line-strong)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--ink-soft)] [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-bold [&_h3]:font-display [&_h3]:mt-5 [&_h3]:text-[17px] [&_h3]:font-bold [&_p]:my-2.5 [&_strong]:font-semibold [&_pre]:my-3 [&_pre]:rounded-[10px] [&_pre]:bg-[var(--surface-strong)] [&_pre]:p-3 [&_pre]:text-[13px] focus-visible:outline-none"
          />
        </div>
      </div>

      {slashOpen && (
        <div
          role="menu"
          aria-label="Insert a block"
          className="ml-8 grid w-[260px] gap-0.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow)]"
        >
          <span className="px-2.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--faint)]">Insert a block</span>
          {SLASH_ITEMS.map(({ id, Icon, title, detail }) => (
            <button
              key={id}
              role="menuitem"
              onClick={() => runSlashItem(id)}
              className="flex w-full items-center gap-3 rounded-[8px] px-2.5 py-2 text-left hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none cursor-pointer"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[var(--surface-strong)] text-[var(--muted)]">
                <Icon size={16} aria-hidden />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-[13.5px] font-semibold text-[var(--ink)]">{title}</strong>
                <small className="block truncate text-[12px] text-[var(--muted)]">{detail}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[12px] text-[var(--faint)]">
        Type “/” for blocks · Draft only, not saved in this prototype
      </p>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
