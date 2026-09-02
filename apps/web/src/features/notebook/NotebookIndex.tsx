import {
  ChevronDown, ChevronRight, Clock, FileText, FolderClosed, FolderOpen, Layers, MoreHorizontal,
  Plus, Search, Tag, Upload, X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { NotebookDoc } from "@vidya/contracts";
import { Button, EmptyState, HoverRow, Input, Menu, MenuItem, revealOnHover, Toast } from "@vidya/ui";
import { useAppStore } from "../../lib/store";
import { DOCS, FOLDERS } from "./data";
import { materialRoute } from "../materials/data";
import { NewNoteChooser } from "./NewNoteChooser";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

type Facet = "all" | "documents" | "folders" | "pdfs" | "tags" | "cards";
type Sort = "newest" | "oldest" | "az";

const SORT_LABEL: Record<Sort, string> = { newest: "Newest first", oldest: "Oldest first", az: "A–Z" };

/** The row's hover-revealed overflow trigger. Not a real <button> — Menu already
 *  wraps this in one, and a button inside a button is invalid markup. */
function RowMenuTrigger({ open }: { open: boolean }) {
  return (
    <span className={cx(
      "grid size-8 shrink-0 place-items-center rounded-[8px] text-[var(--muted)]",
      "hover:bg-[var(--surface-strong)] hover:text-[var(--ink)] transition-colors motion-reduce:transition-none",
      revealOnHover, open && "opacity-100 bg-[var(--surface-strong)] text-[var(--ink)]",
    )}>
      <MoreHorizontal size={16} aria-hidden />
    </span>
  );
}

/** Groups by calendar day, newest first, and labels the recent ones in words -
 *  "Today" is more useful than a date a student has to decode. */
function groupByDay(docs: NotebookDoc[]) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const groups = new Map<string, NotebookDoc[]>();
  for (const doc of docs) {
    const label = doc.updatedAt === today ? "Today"
      : doc.updatedAt === yesterday ? "Yesterday"
        : new Date(doc.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    const list = groups.get(label) ?? [];
    list.push(doc);
    groups.set(label, list);
  }
  return [...groups.entries()];
}

export function NotebookIndex() {
  const personalNotes = useAppStore((state) => state.personalNotes);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState<Facet>("documents");
  const [sort, setSort] = useState<Sort>("newest");
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const notify = (message: string) => setToast(message);

  const counts = useMemo(() => ({
    all: DOCS.length + FOLDERS.length,
    documents: DOCS.filter((d) => d.kind === "document").length,
    folders: FOLDERS.length,
    pdfs: DOCS.filter((d) => d.kind === "pdf").length,
    tags: new Set(DOCS.flatMap((d) => d.tags)).size,
    cards: DOCS.reduce((sum, d) => sum + d.cardCount, 0),
  }), []);

  const FACETS: { id: Facet; label: string; icon: typeof FileText }[] = [
    { id: "all", label: "All", icon: Layers },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "folders", label: "Folders", icon: FolderClosed },
    { id: "pdfs", label: "PDFs", icon: Upload },
    { id: "tags", label: "Tags", icon: Tag },
    // Anki/RemNote put "Daily Notes" here. We have no daily-note concept, and
    // cards are what a student actually wants to find - so this slot earns its
    // place rather than being copied.
    { id: "cards", label: "Flashcards", icon: Layers },
  ];

  // Notes the student made are theirs and must appear alongside course
  // material - a create flow that produces something you cannot then find is
  // no better than one that produces nothing.
  const ownDocs: NotebookDoc[] = useMemo(() => personalNotes.map((note) => ({
    docId: note.noteId,
    folderId: null,
    title: note.title,
    owner: "student",
    updatedAt: note.createdAt.slice(0, 10),
    kind: note.mode === "blank" ? "handwritten" : "document",
    path: ["My notes"],
    tags: ["Mine"],
    cardCount: note.cards.length,
  })), [personalNotes]);

  const rows = useMemo(() => {
    let list = [...ownDocs, ...DOCS].filter((doc) => {
      if (facet === "documents" && doc.kind !== "document") return false;
      if (facet === "pdfs" && doc.kind !== "pdf") return false;
      if (facet === "folders") return false;
      if (facet === "tags" && doc.tags.length === 0) return false;
      if (facet === "cards" && doc.cardCount === 0) return false;
      if (query) {
        const q = query.toLowerCase();
        return doc.title.toLowerCase().includes(q)
          || doc.path.some((p) => p.toLowerCase().includes(q))
          || doc.tags.some((t) => t.toLowerCase().includes(q));
      }
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "az" ? a.title.localeCompare(b.title)
        : sort === "oldest" ? a.updatedAt.localeCompare(b.updatedAt)
          : b.updatedAt.localeCompare(a.updatedAt));
    return list;
  }, [facet, query, sort, ownDocs]);

  // Folders must honour the search too. Filtering only the documents left every
  // folder on screen while the document list narrowed, which reads as broken.
  const folderRows = useMemo(() => {
    if (facet !== "folders" && facet !== "all") return [];
    if (!query) return FOLDERS;
    const q = query.toLowerCase();
    return FOLDERS.filter((f) => f.title.toLowerCase().includes(q));
  }, [facet, query]);
  const grouped = useMemo(() => groupByDay(rows), [rows]);
  const isEmpty = rows.length === 0 && folderRows.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1040px] pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-display text-[30px] font-bold leading-none tracking-tight text-[var(--ink)] text-balance sm:text-[34px]">
            Materials
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Course notes, your own pages, and uploaded PDFs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => notify("Upload & learn PDF is not wired up in this prototype")}
          >
            <Upload size={15} aria-hidden /> Upload PDF
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} aria-hidden /> Create
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[300px]">
          <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials…"
            aria-label="Search materials"
            className="pl-9 pr-8"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div ref={chipsRef} role="tablist" aria-label="Filter by type" className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {FACETS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={facet === id}
                onClick={() => setFacet(id)}
                className={cx(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold",
                  "transition-colors motion-reduce:transition-none cursor-pointer",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                  facet === id
                    ? "bg-[var(--primary-faint)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]",
                )}
              >
                <Icon size={12} aria-hidden />
                {label}
                <span className="tabular-nums">{counts[id]}</span>
              </button>
            ))}
          </div>
          <button
            aria-label="Scroll filters"
            onClick={() => chipsRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
            className="grid size-8 shrink-0 place-items-center rounded-[8px] text-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] cursor-pointer sm:hidden"
          >
            <ChevronRight size={15} />
          </button>

          <Menu
            label="Sort order"
            align="end"
            trigger={(open) => (
              <span className={cx(
                "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] border px-3 text-[13px] font-medium",
                "border-[var(--line-strong)] text-[var(--ink-soft)] transition-colors motion-reduce:transition-none",
                open ? "bg-[var(--surface-soft)]" : "bg-[var(--surface)] hover:bg-[var(--surface-soft)]",
              )}>
                <Clock size={13} aria-hidden /> {SORT_LABEL[sort]} <ChevronDown size={13} aria-hidden />
              </span>
            )}
          >
            <MenuItem onClick={() => setSort("newest")}>Newest first</MenuItem>
            <MenuItem onClick={() => setSort("oldest")}>Oldest first</MenuItem>
            <MenuItem onClick={() => setSort("az")}>A–Z</MenuItem>
          </Menu>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {folderRows.length > 0 && (
          <section>
            <h2 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Folders</h2>
            <div>
              {folderRows.map((folder) => (
                <HoverRow key={folder.folderId}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[var(--primary-faint)] text-[var(--primary)]">
                    <FolderOpen size={15} aria-hidden />
                  </span>
                  <button
                    onClick={() => navigate(`/app/notebook/folder/${folder.folderId}`)}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 py-1 text-left cursor-pointer"
                  >
                    <strong className="truncate text-[14.5px] font-semibold text-[var(--ink)]">{folder.title}</strong>
                    <span className="truncate text-[12.5px] text-[var(--muted)]">
                      {folder.kind === "book" ? "Book" : "Chapter"} · {DOCS.filter((d) => d.folderId === folder.folderId).length} pages
                    </span>
                  </button>
                  <Menu label={`More options for ${folder.title}`} align="end" trigger={(open) => <RowMenuTrigger open={open} />}>
                    <MenuItem onClick={() => navigate(`/app/notebook/folder/${folder.folderId}`)}>Open</MenuItem>
                    <MenuItem onClick={() => notify(`Renaming “${folder.title}” is not wired up in this prototype`)}>Rename</MenuItem>
                    <MenuItem onClick={() => notify("Move to… is not wired up in this prototype")}>Move to…</MenuItem>
                  </Menu>
                </HoverRow>
              ))}
            </div>
          </section>
        )}

        {grouped.map(([day, docs]) => (
          <section key={day}>
            <h2 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">{day}</h2>
            <div>
              {docs.map((doc) => (
                <HoverRow key={doc.docId}>
                  <span className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-[8px]",
                    doc.kind === "pdf" ? "bg-[var(--needswork-soft)] text-[var(--needswork)]" : "bg-[var(--surface-strong)] text-[var(--muted)]",
                  )}>
                    <FileText size={15} aria-hidden />
                  </span>
                  <button
                    onClick={() => navigate(`/app/notebook/${doc.docId}`)}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 py-1 text-left cursor-pointer"
                  >
                    <strong className="truncate text-[14.5px] font-semibold text-[var(--ink)]">{doc.title}</strong>
                    <span className="truncate text-[12.5px] text-[var(--muted)]">{doc.path.join(" › ")}</span>
                  </button>
                  {doc.cardCount > 0 && (
                    <span className="hidden shrink-0 text-[12px] tabular-nums text-[var(--faint)] sm:inline">{doc.cardCount} cards</span>
                  )}
                  <Menu label={`More options for ${doc.title}`} align="end" trigger={(open) => <RowMenuTrigger open={open} />}>
                    <MenuItem onClick={() => navigate(`/app/notebook/${doc.docId}`)}>Open</MenuItem>
                    <MenuItem onClick={() => notify(`Renaming “${doc.title}” is not wired up in this prototype`)}>Rename</MenuItem>
                    <MenuItem onClick={() => notify("Move to… is not wired up in this prototype")}>Move to…</MenuItem>
                    <MenuItem onClick={() => notify("Export is not wired up in this prototype")}>Export</MenuItem>
                  </Menu>
                </HoverRow>
              ))}
            </div>
          </section>
        ))}

        {isEmpty && (
          <EmptyState
            icon={<FileText size={26} aria-hidden />}
            title="Nothing here yet"
            body={query ? `No results for “${query}”.` : "Create a note or upload a PDF to get started."}
            action={!query && (
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={15} aria-hidden /> Create a note</Button>
            )}
          />
        )}
      </div>

      <NewNoteChooser open={createOpen} onClose={() => setCreateOpen(false)} />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
