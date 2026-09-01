import {
  BrainCircuit, ChevronRight, FileText, FolderClosed, FolderOpen, Layers, PanelLeftClose,
  PanelLeftOpen, Plus, Sparkles, StickyNote,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Folder, OutlineNode } from "@vidya/contracts";
import { Card, Chip, IconButton, Toast } from "@vidya/ui";
import { DOCS, FOLDERS, MY_NOTES_SEED, SEED_NODES } from "./data";
import { DocumentMenu, EditorToolbar } from "./EditorToolbar";
import { Outliner } from "./Outliner";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

type Tab = "notes" | "my-notes" | "my-cards" | "map";

const MASTERY_FILL: Record<string, string> = {
  secure: "fill-[var(--secure)]", developing: "fill-[var(--developing)]", starting: "fill-[var(--needswork)]",
};

/** Compact knowledge map, embedded rather than a separate destination — the
 *  graph is most useful beside the note it describes, not on its own page. */
function MiniGraph({ activeSkill }: { activeSkill: string }) {
  const nodes = [
    { id: "integers", label: "Integers", x: 20, y: 30, mastery: 82 },
    { id: "fractions", label: "Fractions", x: 50, y: 20, mastery: 74 },
    { id: "decimals", label: "Decimals", x: 78, y: 34, mastery: 61 },
    { id: "ratio", label: "Ratio", x: 46, y: 58, mastery: 56 },
    { id: "percent", label: "Percentages", x: 76, y: 70, mastery: 42 },
  ];
  const edges: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [2, 4]];
  const band = (m: number) => (m >= 70 ? "secure" : m >= 45 ? "developing" : "starting");
  return (
    <svg viewBox="0 0 100 88" className="w-full max-w-[280px]" role="img" aria-label="How this topic connects to nearby skills">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y} className="stroke-[var(--line-strong)]" strokeWidth="1" />
      ))}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={node.id === activeSkill ? 6 : 4.4} className={MASTERY_FILL[band(node.mastery)]} />
          {node.id === activeSkill && <circle cx={node.x} cy={node.y} r={9} fill="none" className="stroke-[var(--ink)]" strokeWidth="0.75" />}
          <text x={node.x} y={node.y + 11} textAnchor="middle" className="fill-[var(--muted)] text-[6px] font-semibold">{node.label}</text>
        </g>
      ))}
    </svg>
  );
}

function FolderTree({ folders, openIds, onToggle, activeDoc, onOpenDoc }: {
  folders: Folder[]; openIds: Set<string>; onToggle: (id: string) => void;
  activeDoc: string; onOpenDoc: (id: string) => void;
}) {
  const render = (parentId: string | null, depth: number) =>
    folders.filter((f) => f.parentId === parentId).sort((a, b) => a.order - b.order).map((folder) => {
      const open = openIds.has(folder.folderId);
      const docs = DOCS.filter((d) => d.folderId === folder.folderId);
      return (
        <li key={folder.folderId}>
          <button
            onClick={() => onToggle(folder.folderId)}
            aria-expanded={open}
            style={{ paddingLeft: 8 + depth * 16 }}
            className="flex w-full items-center gap-1.5 rounded-[8px] py-1.5 pr-2 text-left text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            <ChevronRight size={12} aria-hidden className={cx("shrink-0 text-[var(--faint)] transition-transform motion-reduce:transition-none", open && "rotate-90")} />
            {open ? <FolderOpen size={14} aria-hidden className="shrink-0 text-[var(--muted)]" /> : <FolderClosed size={14} aria-hidden className="shrink-0 text-[var(--muted)]" />}
            <span className="min-w-0 flex-1 truncate">{folder.title}</span>
            {folder.owner === "student" && <em className="shrink-0 text-[10.5px] font-semibold not-italic text-[var(--faint)]">mine</em>}
          </button>
          {open && (
            <ul>
              {render(folder.folderId, depth + 1)}
              {docs.map((doc) => (
                <li key={doc.docId}>
                  <button
                    onClick={() => onOpenDoc(doc.docId)}
                    aria-current={doc.docId === activeDoc || undefined}
                    style={{ paddingLeft: 8 + (depth + 1) * 16 }}
                    className={cx(
                      "flex w-full items-center gap-1.5 rounded-[8px] py-1.5 pr-2 text-left text-[13px] cursor-pointer",
                      doc.docId === activeDoc
                        ? "bg-[var(--primary-faint)] font-semibold text-[var(--primary)]"
                        : "text-[var(--ink-soft)] hover:bg-[var(--surface-soft)]",
                    )}
                  >
                    <FileText size={13} aria-hidden className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });
  return <ul className="grid gap-px p-2">{render(null, 0)}</ul>;
}

export function NotebookPage() {
  const [tab, setTab] = useState<Tab>("notes");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["f-maths", "f-number", "f-mine"]));
  const [treeOpen, setTreeOpen] = useState(true);
  const [activeDoc, setActiveDoc] = useState("d-fractions");
  const [nodes, setNodes] = useState<OutlineNode[]>(SEED_NODES);
  // A separate document, not a filtered view of the one above. Passing a slice
  // into Outliner and letting it write back destroyed the page - see Outliner.
  const [myNodes, setMyNodes] = useState<OutlineNode[]>(MY_NOTES_SEED);
  const [history, setHistory] = useState<OutlineNode[][]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (message: string) => setToast(message);

  const editCourse = (next: OutlineNode[]) => {
    setHistory((h) => [...h.slice(-24), nodes]);
    setNodes(next);
  };
  const undo = () => setHistory((h) => {
    if (!h.length) return h;
    setNodes(h[h.length - 1]!);
    return h.slice(0, -1);
  });
  const insert = (kind: string) => {
    const label: Record<string, string> = {
      basic: "Single-line card", multi_line: "Multi-line card", concept: "Concept card",
      descriptor: "Descriptor card", multiple_choice: "Multiple-choice card", cloze: "Cloze card",
    };
    notify(`${label[kind] ?? kind} inserted at the cursor`);
  };

  const toggle = (id: string) =>
    setOpenIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const doc = DOCS.find((d) => d.docId === activeDoc);
  const cards = useMemo(() => [...nodes, ...myNodes].filter((n) => n.cardTrigger !== null), [nodes, myNodes]);
  const aiPending = cards.filter((c) => c.aiDrafted).length;

  const TABS: { id: Tab; label: string; icon: typeof StickyNote }[] = [
    { id: "notes", label: "Course notes", icon: FileText },
    { id: "my-notes", label: "My notes", icon: StickyNote },
    { id: "my-cards", label: "My flashcards", icon: Layers },
    { id: "map", label: "Knowledge map", icon: BrainCircuit },
  ];

  return (
    <div className="flex gap-6">
      <aside aria-label="Notebook files" className={cx(
        "hidden shrink-0 overflow-hidden border-r border-[var(--line)] transition-[width] duration-200 motion-reduce:transition-none lg:block",
        treeOpen ? "w-[248px]" : "w-0 border-transparent",
      )}>
        <div className="flex w-[248px] items-center gap-1 border-b border-[var(--line)] px-2 py-2">
          <IconButton
            label={treeOpen ? "Collapse file list" : "Expand file list"}
            onClick={() => setTreeOpen((v) => !v)}
          >
            {treeOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </IconButton>
          <strong className="flex-1 truncate text-[13px] font-semibold text-[var(--ink)]">Notebook</strong>
          <IconButton label="New folder or note" onClick={() => notify("New folder or note is not wired up in this prototype")}>
            <Plus size={16} />
          </IconButton>
        </div>
        <div className="w-[248px]">
          <FolderTree folders={FOLDERS} openIds={openIds} onToggle={toggle} activeDoc={activeDoc} onOpenDoc={setActiveDoc} />
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex flex-wrap items-start justify-between gap-4 pb-4">
          <div className="min-w-0">
            <span className="text-[12.5px] font-semibold text-[var(--muted)]">
              {FOLDERS.find((f) => f.folderId === doc?.folderId)?.title ?? "Notebook"}
            </span>
            <h1 className="font-display text-[26px] font-bold tracking-tight text-[var(--ink)] text-balance">{doc?.title ?? "Untitled"}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Chip tone="primary">{cards.length} cards</Chip>
            {aiPending > 0 && (
              <Chip tone="neutral">
                <Sparkles size={11} aria-hidden /> {aiPending} AI draft{aiPending === 1 ? "" : "s"} to review
              </Chip>
            )}
            <DocumentMenu onPick={(id) => {
              if (id === "undo") undo();
              else if (id === "tutor") window.dispatchEvent(new Event("vidya:open-ai"));
              else notify(`“${id}” is not wired up in this prototype`);
            }} />
          </div>
        </header>

        <nav role="tablist" aria-label="Notebook view" className="flex items-center gap-1 border-b border-[var(--line)]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cx(
                "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors motion-reduce:transition-none",
                tab === id ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              <Icon size={15} aria-hidden />{label}
            </button>
          ))}
        </nav>

        {tab === "notes" && (
          <>
            <p className="py-4 text-[13px] leading-relaxed text-[var(--muted)]">
              End a bullet with <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)]">--</kbd>{" "}
              to turn it into a card — the line becomes an arrow and you type the answer, or press{" "}
              <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)]">Tab</kbd> to accept the AI draft.{" "}
              <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)]">Enter</kbd> for a new bullet,{" "}
              <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)]">Tab</kbd> to indent.
            </p>
            <Card className="p-5">
              <Outliner nodes={nodes} onChange={editCourse} />
            </Card>
            <EditorToolbar onInsert={insert} onUndo={undo} />
          </>
        )}

        {tab === "my-notes" && (
          <Card className="mt-4 p-5">
            <p className="pb-4 text-[13px] leading-relaxed text-[var(--muted)]">
              Your own notes sit alongside the course ones and are never overwritten when a course note is
              updated. Same editor, same card shortcuts.
            </p>
            <Outliner nodes={myNodes} onChange={setMyNodes} />
          </Card>
        )}

        {tab === "my-cards" && (
          <Card className="mt-4 grid gap-1 p-3">
            {cards.length === 0
              ? (
                <p className="p-3 text-[13px] text-[var(--muted)]">
                  No cards here yet. End a bullet with{" "}
                  <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)]">--</kbd>{" "}
                  to make one.
                </p>
              )
              : cards.map((card) => (
                <article key={card.nodeId} className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[var(--surface-soft)]">
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-[13.5px] font-semibold text-[var(--ink)]">{card.text || "Untitled card"}</strong>
                    <span className="block truncate text-[12px] text-[var(--muted)]">
                      {card.answerLayout === "children" ? "List answer below" :
                        card.answerLayout === "block" ? "Diagram answer" : card.answer || "No answer yet"}
                    </span>
                  </div>
                  {card.aiDrafted && <Chip tone="neutral"><Sparkles size={11} aria-hidden /> AI draft</Chip>}
                  <Chip tone="neutral">{card.cardTrigger === "both" ? "Both ways" : card.cardTrigger === "reverse" ? "Reverse" : "Forward"}</Chip>
                </article>
              ))}
            <Link to="/app/flashcards" className="justify-self-start px-3 py-2 text-[13px] font-semibold text-[var(--primary)] hover:underline">
              Review these cards →
            </Link>
          </Card>
        )}

        {tab === "map" && (
          <Card className="mt-4 flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center">
            <MiniGraph activeSkill="fractions" />
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">Where this sits</h2>
              <p className="mt-1 max-w-[46ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
                Fractions supports ratio and percentages. Both are weaker than this topic, so time here pays off twice.
              </p>
              <Link to="/app/graph" className="mt-2 inline-block text-[13px] font-semibold text-[var(--primary)] hover:underline">
                Open the full map →
              </Link>
            </div>
          </Card>
        )}
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
