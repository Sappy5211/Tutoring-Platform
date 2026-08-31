import { Check, ChevronDown, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Subject } from "@vidya/contracts";
import { useAppStore } from "../lib/store";

type SubjectMeta = { id: Subject; label: string; blurb: string };

const SUBJECTS: [SubjectMeta, ...SubjectMeta[]] = [
  { id: "maths", label: "Mathematics", blurb: "Numbers, algebra, geometry" },
  { id: "science", label: "Science", blurb: "Class 6–8 combined science" },
  { id: "physics", label: "Physics", blurb: "Motion, force, energy" },
  { id: "chemistry", label: "Chemistry", blurb: "Matter, reactions, bonding" },
  { id: "biology", label: "Biology", blurb: "Life, cells, ecosystems" },
];

export function SubjectSwitcher() {
  const { subject, setSubject, accessFor } = useAppStore();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const active = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  // SUBJECTS is a non-empty tuple, so SUBJECTS[0] is always defined.

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const choose = (id: Subject) => {
    const access = accessFor(id);
    if (access.state === "unlocked") { setSubject(id); setOpen(false); return; }
    // Grade-locked is not for sale at this grade, so it must not push an upsell.
    if (access.state === "locked_plan") { setOpen(false); navigate("/app/upgrade"); }
  };

  return (
    <div className="subject-switcher" ref={wrapRef}>
      <button
        type="button"
        className="subject-switcher__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{active.label}</span>
        <ChevronDown size={15} aria-hidden />
      </button>

      {open && (
        <div className="subject-menu" role="menu" aria-label="Choose subject">
          {SUBJECTS.map(({ id, label, blurb }) => {
            const access = accessFor(id);
            const locked = access.state !== "unlocked";
            const isActive = id === subject;
            const note =
              access.state === "locked_grade"
                ? `Class ${access.availableFromGrade}+`
                : access.state === "locked_plan"
                  ? "Upgrade"
                  : blurb;
            return (
              <button
                key={id}
                role="menuitem"
                type="button"
                className={`subject-menu__item${locked ? " is-locked" : ""}${isActive ? " is-active" : ""}`}
                // Grade-locked subjects are genuinely unavailable, so they are
                // disabled. Plan-locked ones stay clickable - that click is the
                // upgrade path, and disabling it would hide the offer.
                disabled={access.state === "locked_grade"}
                aria-current={isActive || undefined}
                onClick={() => choose(id)}
              >
                <span className="subject-menu__text">
                  <strong>{label}</strong>
                  <small>{note}</small>
                </span>
                {isActive && <Check size={16} aria-label="Selected" />}
                {locked && <Lock size={14} aria-label={access.state === "locked_grade" ? "Not available at your grade" : "Locked - upgrade to unlock"} />}
              </button>
            );
          })}
          <p className="subject-menu__foot">
            Your plan includes Mathematics. <a href="/app/upgrade">See plans</a>
          </p>
        </div>
      )}
    </div>
  );
}
