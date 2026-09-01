import { LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode,
} from "react";

/* VIDYA primitive kit. Notion-influenced: quiet 1px borders, one accent colour,
   shadows only on floating layers, hover-revealed affordances.
   Every primitive here is keyboard-operable and honours reduced motion. */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* ── Button ─────────────────────────────────────────────────────────── */
type Variant = "primary" | "secondary" | "ghost" | "danger";
const BTN: Record<Variant, string> = {
  primary: "bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-strong)]",
  secondary: "bg-[var(--surface)] text-[var(--ink)] border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
  ghost: "bg-transparent text-[var(--muted)] border-transparent hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]",
  danger: "bg-transparent text-[var(--danger)] border-[var(--danger)] hover:bg-[var(--danger-soft)]",
};

export function Button({
  className, variant = "primary", loading, size = "md", children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant; loading?: boolean; size?: "sm" | "md";
}) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[10px] border font-semibold",
        "transition-colors duration-150 motion-reduce:transition-none cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        BTN[variant], className,
      )}
    >
      {loading && <LoaderCircle size={15} aria-hidden className="animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...rest }:
ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={cx(
        "grid place-items-center size-9 rounded-[10px] border border-transparent text-[var(--muted)]",
        "hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] transition-colors motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ── Surfaces ───────────────────────────────────────────────────────── */
export function Card({ className, children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <section {...rest} className={cx(
      "rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5", className,
    )}>{children}</section>
  );
}

/** A row that reveals its actions on hover or keyboard focus, never at rest. */
export function HoverRow({ className, children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div {...rest} className={cx(
      "group flex items-center gap-3 rounded-[10px] px-3 py-2",
      "hover:bg-[var(--surface-soft)] focus-within:bg-[var(--surface-soft)]",
      "transition-colors motion-reduce:transition-none", className,
    )}>{children}</div>
  );
}
export const revealOnHover =
  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity motion-reduce:transition-none";

/* ── Mastery ────────────────────────────────────────────────────────── */
export type Band = "secure" | "developing" | "needswork" | "locked";
export const bandFor = (pct: number, unlocked = true): Band =>
  !unlocked ? "locked" : pct >= 70 ? "secure" : pct >= 45 ? "developing" : "needswork";
export const BAND_LABEL: Record<Band, string> = {
  secure: "Secure", developing: "Developing", needswork: "Needs work", locked: "Locked",
};
const BAND_BG: Record<Band, string> = {
  secure: "bg-[var(--secure)]", developing: "bg-[var(--developing)]",
  needswork: "bg-[var(--needswork)]", locked: "bg-[var(--locked)]",
};
const BAND_CHIP: Record<Band, string> = {
  secure: "bg-[var(--secure-soft)] text-[var(--secure)]",
  developing: "bg-[var(--developing-soft)] text-[var(--developing)]",
  needswork: "bg-[var(--needswork-soft)] text-[var(--needswork)]",
  locked: "bg-[var(--surface-strong)] text-[var(--locked)]",
};

/** Semantic tones are kept alongside the mastery bands on purpose: a booking
 *  status or a review-queue warning is not a mastery band, and collapsing the
 *  two would force call sites to misuse `band` to get a colour. */
const TONE_CHIP: Record<string, string> = {
  neutral: "bg-[var(--surface-strong)] text-[var(--muted)]",
  primary: "bg-[var(--primary-faint)] text-[var(--primary)]",
  success: "bg-[var(--secure-soft)] text-[var(--secure)]",
  warning: "bg-[var(--developing-soft)] text-[var(--developing)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function Chip({ children, band, tone = "neutral" }: {
  children: ReactNode; band?: Band;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}) {
  return (
    <span className={cx(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap",
      band ? BAND_CHIP[band] : TONE_CHIP[tone] ?? TONE_CHIP.neutral,
    )}>{children}</span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
      aria-label={label ?? `${pct}% mastery`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
      <span className={cx("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", BAND_BG[bandFor(pct)])}
        style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 72, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 42; const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}
      role="img" aria-label={label ?? `${pct}% mastery`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-[var(--surface-strong)]" />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          className={cx("transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none",
            bandFor(pct) === "secure" ? "stroke-[var(--secure)]"
              : bandFor(pct) === "developing" ? "stroke-[var(--developing)]" : "stroke-[var(--needswork)]")} />
      </svg>
      <strong className="absolute text-[15px] font-bold tabular-nums">{pct}%</strong>
    </div>
  );
}

/* ── Forms ──────────────────────────────────────────────────────────── */
export function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--ink)]">{label}</label>
      {children(id)}
      {error
        ? <p role="alert" className="text-[12px] font-medium text-[var(--danger)]">{error}</p>
        : hint && <p className="text-[12px] text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...rest} className={cx(
      "h-10 w-full rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3",
      "text-sm text-[var(--ink)] placeholder:text-[var(--faint)]",
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]",
      className,
    )} />
  );
}

/* ── Feedback ───────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, body, action }: {
  icon?: ReactNode; title: string; body: string; action?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-14 text-center">
      {icon && <span className="text-[var(--faint)]">{icon}</span>}
      <h3 className="font-display text-lg font-bold text-[var(--ink)]">{title}</h3>
      <p className="max-w-[36ch] text-sm text-[var(--muted)]">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx(
    "block animate-pulse rounded-[8px] bg-[var(--surface-strong)] motion-reduce:animate-none", className,
  )} />;
}

/** Toast: announces politely, auto-dismisses, and is dismissible by keyboard. */
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(t);
  }, [onClose, message]);
  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-[12px] bg-[var(--ink)] px-4 py-2.5 text-[13px] font-medium text-[var(--bg)] shadow-[var(--shadow)] sm:bottom-8">
      {message}
      <button onClick={onClose} aria-label="Dismiss" className="opacity-60 hover:opacity-100 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

/** Menu with outside-click and Escape close, and a focus ring on every item. */
export function Menu({ trigger, label, children, align = "start" }: {
  trigger: (open: boolean) => ReactNode; label: string; children: ReactNode; align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}
        aria-label={label} className="cursor-pointer">{trigger(open)}</button>
      {open && (
        <div role="menu" onClick={() => setOpen(false)} className={cx(
          "absolute top-[calc(100%+6px)] z-50 grid min-w-[200px] gap-0.5 rounded-[14px]",
          "border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow)]",
          align === "end" ? "right-0" : "left-0",
        )}>{children}</div>
      )}
    </div>
  );
}

export function MenuItem({ children, danger, shortcut, ...rest }:
ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; shortcut?: string }) {
  return (
    <button {...rest} role="menuitem" className={cx(
      "flex w-full items-center justify-between gap-3 rounded-[8px] px-2.5 py-2 text-left text-[13.5px]",
      "hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none cursor-pointer",
      danger ? "text-[var(--danger)]" : "text-[var(--ink)]",
    )}>
      <span className="flex items-center gap-2.5">{children}</span>
      {shortcut && <kbd className="rounded border border-[var(--line)] px-1 text-[10.5px] text-[var(--muted)]">{shortcut}</kbd>}
    </button>
  );
}
