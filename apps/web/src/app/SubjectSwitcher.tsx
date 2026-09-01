import { Check, ChevronDown, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Subject } from "@vidya/contracts";
import { Chip, Menu } from "@vidya/ui";
import { useAppStore } from "../lib/store";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

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
  const navigate = useNavigate();
  const active = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  // SUBJECTS is a non-empty tuple, so SUBJECTS[0] is always defined.

  const choose = (id: Subject) => {
    const access = accessFor(id);
    if (access.state === "unlocked") { setSubject(id); return; }
    // Grade-locked is not for sale at this grade, so it must not push an upsell.
    if (access.state === "locked_plan") navigate("/app/upgrade");
  };

  return (
    <Menu
      label={`Choose subject — ${active.label} selected`}
      trigger={(open) => (
        <span className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-[13px] font-semibold tracking-tight text-[var(--ink)] transition-colors hover:border-[var(--line-strong)] motion-reduce:transition-none">
          {active.label}
          <ChevronDown size={14} aria-hidden className={cx("text-[var(--muted)] transition-transform motion-reduce:transition-none", open && "rotate-180")} />
        </span>
      )}
    >
      {SUBJECTS.map(({ id, label, blurb }) => {
        const access = accessFor(id);
        const locked = access.state !== "unlocked";
        const isActive = id === subject;
        return (
          <button
            key={id}
            role="menuitem"
            type="button"
            // Grade-locked subjects are genuinely unavailable, so they are
            // disabled. Plan-locked ones stay clickable - that click is the
            // upgrade path, and disabling it would hide the offer.
            disabled={access.state === "locked_grade"}
            aria-current={isActive || undefined}
            onClick={() => choose(id)}
            className={cx(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left",
              "hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-45",
              isActive && "bg-[var(--primary-faint)]",
            )}
          >
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="truncate text-[13.5px] font-semibold text-[var(--ink)]">{label}</strong>
              {access.state === "locked_grade" ? (
                <Chip band="locked">Class {access.availableFromGrade}+</Chip>
              ) : access.state === "locked_plan" ? (
                <Chip tone="primary">Upgrade</Chip>
              ) : (
                <small className="truncate text-[11.5px] text-[var(--muted)]">{blurb}</small>
              )}
            </span>
            {isActive && <Check size={16} aria-label="Selected" className="shrink-0 text-[var(--primary)]" />}
            {locked && (
              <Lock
                size={13}
                aria-label={access.state === "locked_grade" ? "Not available at your grade" : "Locked - upgrade to unlock"}
                className="shrink-0 text-[var(--muted)]"
              />
            )}
          </button>
        );
      })}
      <div className="mt-1 border-t border-[var(--line)] px-2.5 pb-1 pt-2 text-[11.5px] text-[var(--muted)]">
        Your plan includes Mathematics. <Link to="/app/upgrade" className="font-semibold text-[var(--primary)]">See plans</Link>
      </div>
    </Menu>
  );
}
