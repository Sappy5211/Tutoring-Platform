import {
  ChevronRight, Clock, FileText, FolderClosed, FolderOpen, Layers, MoreHorizontal,
  Plus, Search, Tag, Upload, X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { NotebookDoc } from "@vidya/contracts";
import { DOCS, FOLDERS } from "./data";

type Facet = "all" | "documents" | "folders" | "pdfs" | "tags" | "cards";
type Sort = "newest" | "oldest" | "az";

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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState<Facet>("documents");
  const [sort, setSort] = useState<Sort>("newest");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

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

  const rows = useMemo(() => {
    let list = DOCS.filter((doc) => {
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
  }, [facet, query, sort]);

  // Folders must honour the search too. Filtering only the documents left every
  // folder on screen while the document list narrowed, which reads as broken.
  const folderRows = useMemo(() => {
    if (facet !== "folders" && facet !== "all") return [];
    if (!query) return FOLDERS;
    const q = query.toLowerCase();
    return FOLDERS.filter((f) => f.title.toLowerCase().includes(q));
  }, [facet, query]);
  const grouped = useMemo(() => groupByDay(rows), [rows]);

  return (
    <div className="page nb-index">
      <header className="nb-index__head">
        <h1>Notebook</h1>
        <div className="nb-index__actions">
          <button className="nb-index__upload">
            <Upload size={16} aria-hidden /> Upload &amp; learn PDF
          </button>
          <button className="nb-index__create">
            <Plus size={16} aria-hidden /> Create
          </button>
        </div>
      </header>

      <div className="nb-index__filters">
        <div className="nb-index__search">
          <Search size={16} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebook…"
            aria-label="Search notebook"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>
          )}
        </div>

        <div className="nb-index__chips" ref={chipsRef} role="tablist" aria-label="Filter by type">
          {FACETS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={facet === id}
              className={`nb-chip${facet === id ? " is-active" : ""}`}
              onClick={() => setFacet(id)}
            >
              <Icon size={13} aria-hidden />
              {label}
              <em>{counts[id]}</em>
            </button>
          ))}
          <button
            className="nb-index__scroll"
            aria-label="Scroll filters"
            onClick={() => chipsRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <label className="nb-index__sort">
          <Clock size={14} aria-hidden />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort order">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>

      <div className="nb-index__list">
        {folderRows.length > 0 && (
          <section>
            <h2 className="nb-index__day">Folders</h2>
            {folderRows.map((folder) => (
              <article key={folder.folderId} className="nb-row">
                <span className="nb-row__icon nb-row__icon--folder"><FolderOpen size={16} /></span>
                <button className="nb-row__body" onClick={() => navigate(`/app/notebook/folder/${folder.folderId}`)}>
                  <strong>{folder.title}</strong>
                  <span>{folder.kind === "book" ? "Book" : "Chapter"} · {DOCS.filter((d) => d.folderId === folder.folderId).length} pages</span>
                </button>
                <button className="nb-row__more" aria-label={`More options for ${folder.title}`}>
                  <MoreHorizontal size={17} />
                </button>
              </article>
            ))}
          </section>
        )}

        {grouped.map(([day, docs]) => (
          <section key={day}>
            <h2 className="nb-index__day">{day}</h2>
            {docs.map((doc) => (
              <article key={doc.docId} className="nb-row">
                <span className={`nb-row__icon${doc.kind === "pdf" ? " nb-row__icon--pdf" : ""}`}>
                  <FileText size={16} />
                </span>
                <button className="nb-row__body" onClick={() => navigate(`/app/notebook/${doc.docId}`)}>
                  <strong>{doc.title}</strong>
                  <span>{doc.path.join(" › ")}</span>
                </button>
                {doc.cardCount > 0 && <span className="nb-row__cards">{doc.cardCount} cards</span>}
                <button
                  className="nb-row__more"
                  aria-label={`More options for ${doc.title}`}
                  aria-expanded={menuFor === doc.docId}
                  onClick={() => setMenuFor(menuFor === doc.docId ? null : doc.docId)}
                >
                  <MoreHorizontal size={17} />
                </button>
                {menuFor === doc.docId && (
                  <div className="nb-row__menu" role="menu">
                    <button role="menuitem" onClick={() => navigate(`/app/notebook/${doc.docId}`)}>Open</button>
                    <button role="menuitem">Rename</button>
                    <button role="menuitem">Move to…</button>
                    <button role="menuitem">Export</button>
                  </div>
                )}
              </article>
            ))}
          </section>
        ))}

        {rows.length === 0 && folderRows.length === 0 && (
          <div className="nb-index__empty">
            <FileText size={26} aria-hidden />
            <h3>Nothing here yet</h3>
            <p>{query ? `No results for “${query}”.` : "Create a note or upload a PDF to get started."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
