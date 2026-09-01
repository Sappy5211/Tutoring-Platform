import {
  ChevronRight, FileText, Flag, FolderPlus, Mic, Notebook, PenLine, Plus, Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, EmptyState, Menu, MenuItem, Toast } from "@vidya/ui";
import { DOCS, FOLDERS } from "./data";
import { materialRoute } from "../materials/data";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** The empty-state illustration: a dashed path threading page and folder shapes.
 *  Inline SVG rather than an asset - it themes with the palette (via CSS custom
 *  properties, not hard-coded hex) and costs no extra request. */
function EmptyIllustration() {
  return (
    <svg width="180" height="150" viewBox="0 0 240 200" role="img" aria-label="An empty folder">
      <path
        d="M96 78 C 60 96, 78 140, 112 150 C 146 160, 152 120, 130 108 C 108 96, 122 60, 150 52"
        fill="none" strokeDasharray="4 6" strokeWidth="2" className="stroke-[var(--line-strong)]"
      />
      <g transform="rotate(-12 92 84)">
        <rect x="74" y="60" width="36" height="46" rx="4" className="fill-[var(--surface)] stroke-[var(--line-strong)]" strokeWidth="1.5" />
        <text x="92" y="90" textAnchor="middle" className="fill-[var(--muted)] text-[11px] font-bold">PDF</text>
      </g>
      <rect x="118" y="44" width="34" height="34" rx="5" transform="rotate(14 135 61)" className="fill-[var(--primary-faint)] stroke-[var(--primary-soft)]" strokeWidth="1.5" />
      <rect x="152" y="30" width="26" height="26" rx="4" transform="rotate(-8 165 43)" className="fill-[var(--surface-strong)]" />
      <rect x="56" y="112" width="30" height="30" rx="5" transform="rotate(-16 71 127)" className="fill-[var(--surface-strong)]" />
      <path
        d="M96 150 h44 a6 6 0 0 1 6 6 v34 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 v-34 a6 6 0 0 1 6 -6 z"
        className="fill-[var(--primary-soft)] stroke-[var(--primary)]" strokeWidth="1.5"
      />
    </svg>
  );
}

function AddMenuTrigger({ open }: { open: boolean }) {
  return (
    <span className={cx(
      "grid size-10 place-items-center rounded-[10px] border text-[var(--ink-soft)] transition-colors motion-reduce:transition-none",
      "border-[var(--line-strong)]",
      open ? "bg-[var(--surface-soft)]" : "bg-[var(--surface)] hover:bg-[var(--surface-soft)]",
    )}>
      <Plus size={17} aria-hidden />
    </span>
  );
}

export function FolderPage() {
  const { folderId = "" } = useParams();
  const navigate = useNavigate();
  const folder = FOLDERS.find((f) => f.folderId === folderId);
  const [title, setTitle] = useState(folder?.title ?? "Untitled folder");
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const notify = (message: string) => setToast(message);

  useEffect(() => {
    if (!createOpen) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setCreateOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [createOpen]);

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
    return (
      <div className="mx-auto w-full max-w-[1040px] py-10">
        <p className="text-sm text-[var(--muted)]">
          That folder does not exist.{" "}
          <Link to="/app/notebook" className="font-medium text-[var(--primary)] hover:underline">Back to notebook</Link>
        </p>
      </div>
    );
  }

  // A top-level folder is a book, so what goes inside it is a chapter. Nested
  // folders just take another subfolder. Labelling by depth expresses the shelf
  // metaphor instead of making the reader infer it.
  const childLabel = folder.kind === "book" ? "Chapter" : "Subfolder";

  return (
    <div className="mx-auto w-full max-w-[1040px] pb-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 pt-2 pb-4 text-[13px]">
        <Link to="/app/notebook" className="text-[var(--muted)] hover:text-[var(--ink)]">Notebook</Link>
        {trail.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <ChevronRight size={12} aria-hidden className="text-[var(--faint)]" />
            <Link
              to={`/app/notebook/folder/${crumb.id}`}
              className={i === trail.length - 1
                ? "font-medium text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"}
            >
              {crumb.title}
            </Link>
          </span>
        ))}
      </nav>

      <header className="flex flex-wrap items-center gap-4 pb-8">
        <span className={cx(
          "grid size-11 shrink-0 place-items-center rounded-[10px]",
          folder.kind === "book" ? "bg-[var(--primary-faint)] text-[var(--primary)]" : "bg-[var(--surface-strong)] text-[var(--ink-soft)]",
        )} aria-hidden>
          <Notebook size={21} />
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Folder name"
          className={cx(
            "min-w-0 flex-1 rounded-[8px] border border-transparent bg-transparent px-1 py-1",
            "font-display text-[26px] font-bold tracking-tight text-[var(--ink)] text-balance",
            "hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none",
          )}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <FileText size={15} aria-hidden /> Create notes
          </Button>
          <Button variant="secondary" size="sm" onClick={() => notify("Upload PDF is not wired up in this prototype")}>
            <Upload size={15} aria-hidden /> Upload PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => notify("Recording is not wired up in this prototype")}>
            <Mic size={15} aria-hidden /> Record
          </Button>
          <Menu label="Add" align="end" trigger={(open) => <AddMenuTrigger open={open} />}>
            <MenuItem onClick={() => notify(`New ${childLabel.toLowerCase()} is not wired up in this prototype`)}>
              <FolderPlus size={16} aria-hidden /> {childLabel}
            </MenuItem>
            {/* An Exam is a first-class object with a date that drives the
                study schedule - not a setting buried in preferences. */}
            <MenuItem onClick={() => notify("New exam is not wired up in this prototype")}>
              <Flag size={16} aria-hidden /> Exam
            </MenuItem>
          </Menu>
        </div>
      </header>

      <section>
        {isEmpty ? (
          <EmptyState
            icon={<EmptyIllustration />}
            title="No pages yet"
            body={`Your ${childLabel.toLowerCase()}s and pages will appear here.`}
            action={<Button size="sm" onClick={() => setCreateOpen(true)}><FileText size={15} aria-hidden /> Create notes</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <button
                key={child.folderId}
                onClick={() => navigate(`/app/notebook/folder/${child.folderId}`)}
                className="flex flex-col items-start gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <span className="grid size-9 place-items-center rounded-[8px] bg-[var(--primary-faint)] text-[var(--primary)]">
                  <Notebook size={18} aria-hidden />
                </span>
                <span className="grid gap-0.5">
                  <strong className="text-[14.5px] font-semibold text-[var(--ink)]">{child.title}</strong>
                  <span className="text-[12.5px] text-[var(--muted)]">{DOCS.filter((d) => d.folderId === child.folderId).length} pages</span>
                </span>
              </button>
            ))}
            {docs.map((doc) => (
              <button
                key={doc.docId}
                onClick={() => navigate(materialRoute(doc.docId))}
                className="flex flex-col items-start gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <span className="grid size-9 place-items-center rounded-[8px] bg-[var(--surface-strong)] text-[var(--ink-soft)]">
                  {doc.kind === "handwritten" ? <PenLine size={18} aria-hidden /> : <FileText size={18} aria-hidden />}
                </span>
                <span className="grid gap-0.5">
                  <strong className="text-[14.5px] font-semibold text-[var(--ink)]">{doc.title}</strong>
                  <span className="text-[12.5px] text-[var(--muted)]">
                    {doc.cardCount > 0 ? `${doc.cardCount} cards` : doc.kind === "pdf" ? "PDF" : "No cards yet"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {createOpen && (
        <div
          role="presentation"
          onMouseDown={() => setCreateOpen(false)}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/30 p-4"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Create notes"
            onMouseDown={(e) => e.stopPropagation()}
            className="grid w-full max-w-[400px] gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">Create a page</h2>
              <p className="mt-1 text-[13px] text-[var(--muted)]">Both kinds live in this {folder.kind === "book" ? "book" : "chapter"}, and both can hold cards.</p>
            </div>
            <button
              onClick={() => { setCreateOpen(false); navigate("/app/notebook/d-fractions"); }}
              className="flex items-center gap-3 rounded-[10px] border border-[var(--line)] p-3 text-left hover:bg-[var(--surface-soft)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[var(--primary-faint)] text-[var(--primary)]">
                <FileText size={17} aria-hidden />
              </span>
              <span className="grid gap-0.5">
                <strong className="text-[13.5px] font-semibold text-[var(--ink)]">Bullet notes</strong>
                <span className="text-[12px] text-[var(--muted)]">Typed outline. End a line with an arrow trigger to make a card.</span>
              </span>
            </button>
            <button
              onClick={() => { setCreateOpen(false); navigate("/app/notebook/new/handwritten"); }}
              className="flex items-center gap-3 rounded-[10px] border border-[var(--line)] p-3 text-left hover:bg-[var(--surface-soft)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[var(--primary-faint)] text-[var(--primary)]">
                <PenLine size={17} aria-hidden />
              </span>
              <span className="grid gap-0.5">
                <strong className="text-[13.5px] font-semibold text-[var(--ink)]">Handwritten</strong>
                <span className="text-[12px] text-[var(--muted)]">Write with a stylus or finger. Add cards over your own writing.</span>
              </span>
            </button>
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="justify-self-start">Cancel</Button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
