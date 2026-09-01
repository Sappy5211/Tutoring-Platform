import {
  ChevronRight, FileText, Flag, FolderPlus, Mic, Notebook, PenLine, Plus, Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DOCS, FOLDERS } from "./data";
import { materialRoute } from "../materials/data";

/** The empty-state illustration: a dashed path threading page and folder shapes.
 *  Inline SVG rather than an asset - it themes with the palette and costs no
 *  extra request. */
function EmptyIllustration() {
  return (
    <svg className="folder__art" viewBox="0 0 240 200" role="img" aria-label="An empty folder">
      <path d="M96 78 C 60 96, 78 140, 112 150 C 146 160, 152 120, 130 108 C 108 96, 122 60, 150 52"
        fill="none" strokeDasharray="4 6" />
      <g className="folder__art-page" transform="rotate(-12 92 84)">
        <rect x="74" y="60" width="36" height="46" rx="4" />
        <text x="92" y="90">PDF</text>
      </g>
      <rect className="folder__art-tile" x="118" y="44" width="34" height="34" rx="5" transform="rotate(14 135 61)" />
      <rect className="folder__art-tile" x="152" y="30" width="26" height="26" rx="4" transform="rotate(-8 165 43)" />
      <rect className="folder__art-tile" x="56" y="112" width="30" height="30" rx="5" transform="rotate(-16 71 127)" />
      <g className="folder__art-folder">
        <path d="M96 150 h44 a6 6 0 0 1 6 6 v34 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 v-34 a6 6 0 0 1 6 -6 z" />
      </g>
    </svg>
  );
}

export function FolderPage() {
  const { folderId = "" } = useParams();
  const navigate = useNavigate();
  const folder = FOLDERS.find((f) => f.folderId === folderId);
  const [title, setTitle] = useState(folder?.title ?? "Untitled folder");
  const [addOpen, setAddOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  const children = useMemo(() => FOLDERS.filter((f) => f.parentId === folderId), [folderId]);
  const docs = useMemo(() => DOCS.filter((d) => d.folderId === folderId), [folderId]);
  const isEmpty = children.length === 0 && docs.length === 0;

  const trail = useMemo(() => {
    const out: { id: string; title: string }[] = [];
    let cursor = folder;
    while (cursor) {
      out.unshift({ id: cursor.folderId, title: cursor.title });
      cursor = FOLDERS.find((f) => f.folderId === cursor?.parentId);
    }
    return out;
  }, [folder]);

  if (!folder) {
    return <div className="page"><p>That folder does not exist. <Link to="/app/notebook">Back to notebook</Link></p></div>;
  }

  // A top-level folder is a book, so what goes inside it is a chapter. Nested
  // folders just take another subfolder. Labelling by depth expresses the shelf
  // metaphor instead of making the reader infer it.
  const childLabel = folder.kind === "book" ? "Chapter" : "Subfolder";

  return (
    <div className="page folder">
      <nav className="folder__trail" aria-label="Breadcrumb">
        <Link to="/app/notebook">Notebook</Link>
        {trail.map((crumb) => (
          <span key={crumb.id}>
            <ChevronRight size={13} aria-hidden />
            <Link to={`/app/notebook/folder/${crumb.id}`}>{crumb.title}</Link>
          </span>
        ))}
      </nav>

      <header className="folder__head">
        <span className={`folder__icon folder__icon--${folder.kind}`} aria-hidden>
          <Notebook size={22} />
        </span>
        <input
          className="folder__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Folder name"
        />
        <div className="folder__actions">
          <button className="folder__primary" onClick={() => setCreateOpen(true)}>
            <FileText size={16} aria-hidden /> Create notes
          </button>
          <button className="folder__ghost"><Upload size={16} aria-hidden /> Upload PDF</button>
          <button className="folder__ghost"><Mic size={16} aria-hidden /> Record</button>
          <div className="folder__add" ref={addRef}>
            <button
              className="folder__ghost folder__ghost--icon"
              onClick={() => setAddOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={addOpen}
              aria-label="Add"
            >
              <Plus size={17} />
            </button>
            {addOpen && (
              <div className="folder__menu" role="menu">
                <button role="menuitem" onClick={() => setAddOpen(false)}>
                  <FolderPlus size={16} aria-hidden /> {childLabel}
                </button>
                {/* An Exam is a first-class object with a date that drives the
                    study schedule - not a setting buried in preferences. */}
                <button role="menuitem" onClick={() => setAddOpen(false)}>
                  <Flag size={16} aria-hidden /> Exam
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="folder__body">
        {isEmpty ? (
          <div className="folder__empty">
            <EmptyIllustration />
            <p>Your {childLabel.toLowerCase()}s and pages will appear here</p>
          </div>
        ) : (
          <div className="folder__grid">
            {children.map((child) => (
              <button
                key={child.folderId}
                className="folder__card folder__card--folder"
                onClick={() => navigate(`/app/notebook/folder/${child.folderId}`)}
              >
                <span className="folder__card-icon"><Notebook size={19} /></span>
                <strong>{child.title}</strong>
                <span>{DOCS.filter((d) => d.folderId === child.folderId).length} pages</span>
              </button>
            ))}
            {docs.map((doc) => (
              <button
                key={doc.docId}
                className="folder__card"
                onClick={() => navigate(materialRoute(doc.docId))}
              >
                <span className="folder__card-icon">
                  {doc.kind === "handwritten" ? <PenLine size={19} /> : <FileText size={19} />}
                </span>
                <strong>{doc.title}</strong>
                <span>{doc.cardCount > 0 ? `${doc.cardCount} cards` : doc.kind === "pdf" ? "PDF" : "No cards yet"}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {createOpen && (
        <div className="folder__dialog-backdrop" role="presentation" onMouseDown={() => setCreateOpen(false)}>
          <div className="folder__dialog" role="dialog" aria-modal="true" aria-label="Create notes"
            onMouseDown={(e) => e.stopPropagation()}>
            <h2>Create a page</h2>
            <p>Both kinds live in the same chapter, and both can hold cards.</p>
            <button className="folder__choice" onClick={() => navigate("/app/notebook/d-fractions")}>
              <span><FileText size={20} /></span>
              <div>
                <strong>Bullet notes</strong>
                <small>Typed outline. End a line with an arrow trigger to make a card.</small>
              </div>
            </button>
            <button className="folder__choice" onClick={() => navigate("/app/notebook/new/handwritten")}>
              <span><PenLine size={20} /></span>
              <div>
                <strong>Handwritten</strong>
                <small>Write with a stylus or finger. Add cards over your own writing.</small>
              </div>
            </button>
            <button className="folder__dialog-close" onClick={() => setCreateOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
