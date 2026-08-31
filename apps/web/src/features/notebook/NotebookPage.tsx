import { BrainCircuit, ChevronRight, FileText, FolderClosed, FolderOpen, Layers, Plus, StickyNote } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Folder, OutlineNode } from "@vidya/contracts";
import { Card, Chip } from "@vidya/ui";
import { DOCS, FOLDERS, MY_NOTES_SEED, SEED_NODES } from "./data";
import { DocumentMenu, EditorToolbar } from "./EditorToolbar";
import { Outliner } from "./Outliner";

type Tab = "notes" | "my-notes" | "my-cards" | "map";

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
    <svg viewBox="0 0 100 88" className="mini-graph" role="img" aria-label="How this topic connects to nearby skills">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y} />
      ))}
      {nodes.map((node) => (
        <g key={node.id} className={node.id === activeSkill ? "is-active" : ""}>
          <circle cx={node.x} cy={node.y} r={node.id === activeSkill ? 6 : 4.4} className={band(node.mastery)} />
          <text x={node.x} y={node.y + 11}>{node.label}</text>
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
        <li key={folder.folderId} style={{ ["--depth" as string]: depth }}>
          <button className="tree__folder" onClick={() => onToggle(folder.folderId)} aria-expanded={open}>
            <ChevronRight size={13} className={open ? "is-open" : ""} aria-hidden />
            {open ? <FolderOpen size={15} /> : <FolderClosed size={15} />}
            <span>{folder.title}</span>
            {folder.owner === "student" && <em>mine</em>}
          </button>
          {open && (
            <ul>
              {render(folder.folderId, depth + 1)}
              {docs.map((doc) => (
                <li key={doc.docId} style={{ ["--depth" as string]: depth + 1 }}>
                  <button
                    className={`tree__doc${doc.docId === activeDoc ? " is-active" : ""}`}
                    onClick={() => onOpenDoc(doc.docId)}
                    aria-current={doc.docId === activeDoc || undefined}
                  >
                    <FileText size={14} aria-hidden />
                    <span>{doc.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });
  return <ul className="tree">{render(null, 0)}</ul>;
}

export function NotebookPage() {
  const [tab, setTab] = useState<Tab>("notes");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["f-maths", "f-number", "f-mine"]));
  const [activeDoc, setActiveDoc] = useState("d-fractions");
  const [nodes, setNodes] = useState<OutlineNode[]>(SEED_NODES);
  // A separate document, not a filtered view of the one above. Passing a slice
  // into Outliner and letting it write back destroyed the page - see Outliner.
  const [myNodes, setMyNodes] = useState<OutlineNode[]>(MY_NOTES_SEED);
  const [history, setHistory] = useState<OutlineNode[][]>([]);
  const [toast, setToast] = useState<string | null>(null);

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
    setToast(`${label[kind] ?? kind} inserted at the cursor`);
    window.setTimeout(() => setToast(null), 2200);
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
    <div className="page notebook">
      <aside className="notebook__sidebar" aria-label="Notebook files">
        <div className="notebook__sidebar-head">
          <strong>Notebook</strong>
          <button className="icon-button" aria-label="New folder or note"><Plus size={16} /></button>
        </div>
        <FolderTree folders={FOLDERS} openIds={openIds} onToggle={toggle} activeDoc={activeDoc} onOpenDoc={setActiveDoc} />
      </aside>

      <section className="notebook__main">
        <header className="notebook__head">
          <div>
            <span className="eyebrow">
              {FOLDERS.find((f) => f.folderId === doc?.folderId)?.title ?? "Notebook"}
            </span>
            <h1>{doc?.title ?? "Untitled"}</h1>
          </div>
          <div className="notebook__meta">
            <Chip tone="primary">{cards.length} cards</Chip>
            {aiPending > 0 && <Chip tone="warning">{aiPending} AI draft{aiPending === 1 ? "" : "s"} to review</Chip>}
            <DocumentMenu onPick={(id) => {
              if (id === "undo") undo();
              else if (id === "tutor") window.dispatchEvent(new Event("vidya:open-ai"));
              else { setToast(`“${id}” is not wired up in this prototype`); window.setTimeout(() => setToast(null), 2200); }
            }} />
          </div>
        </header>

        <nav className="notebook__tabs" role="tablist" aria-label="Notebook view">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id}
              className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
              <Icon size={15} aria-hidden />{label}
            </button>
          ))}
        </nav>

        {tab === "notes" && (
          <>
            <p className="notebook__hint">
              End a bullet with <kbd>==</kbd> to turn it into a card — the line becomes an arrow and you
              type the answer, or press <kbd>Tab</kbd> to accept the AI draft.
              <kbd>Enter</kbd> for a new bullet, <kbd>Tab</kbd> to indent.
            </p>
            <Card className="notebook__paper">
              <Outliner nodes={nodes} onChange={editCourse} />
            </Card>
            <EditorToolbar onInsert={insert} onUndo={undo} />
          </>
        )}

        {tab === "my-notes" && (
          <Card className="notebook__paper">
            <p className="notebook__hint">
              Your own notes sit alongside the course ones and are never overwritten when a course note is
              updated. Same editor, same card shortcuts.
            </p>
            <Outliner nodes={myNodes} onChange={setMyNodes} />
          </Card>
        )}

        {tab === "my-cards" && (
          <Card className="notebook__cards">
            {cards.length === 0
              ? <p className="notebook__hint">No cards here yet. End a bullet with <kbd>==</kbd> to make one.</p>
              : cards.map((card) => (
                <article key={card.nodeId} className="notebook__card-row">
                  <div>
                    <strong>{card.text || "Untitled card"}</strong>
                    <span>
                      {card.answerLayout === "children" ? "List answer below" :
                        card.answerLayout === "block" ? "Diagram answer" : card.answer || "No answer yet"}
                    </span>
                  </div>
                  {card.aiDrafted && <Chip tone="warning">AI draft</Chip>}
                  <Chip tone="neutral">{card.cardTrigger === "both" ? "Both ways" : card.cardTrigger === "reverse" ? "Reverse" : "Forward"}</Chip>
                </article>
              ))}
            <Link to="/app/flashcards" className="notebook__review-link">Review these cards →</Link>
          </Card>
        )}

        {tab === "map" && (
          <Card className="notebook__map">
            <MiniGraph activeSkill="fractions" />
            <div>
              <h2>Where this sits</h2>
              <p>Fractions supports ratio and percentages. Both are weaker than this topic, so time here pays off twice.</p>
              <Link to="/app/graph">Open the full map →</Link>
            </div>
          </Card>
        )}
      </section>
      {toast && <div className="notebook__toast" role="status">{toast}</div>}
    </div>
  );
}
