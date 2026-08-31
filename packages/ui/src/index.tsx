import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

export function Button({ className = "", variant = "primary", loading, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; loading?: boolean }) {
  return <button className={`ui-button ui-button--${variant} ${className}`} disabled={loading || props.disabled} {...props}>{loading && <LoaderCircle aria-hidden className="ui-spin" size={17} />}{children}</button>;
}

export function Card({ className = "", children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "success" | "warning" | "danger" }) {
  return <span className={`ui-chip ui-chip--${tone}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="ui-progress" aria-label={label ?? `${value}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function ProgressRing({ value, size = 76, label }: { value: number; size?: number; label?: string }) {
  const radius = 42; const circumference = 2 * Math.PI * radius;
  return <div className="ui-ring" style={{ width: size, height: size }} aria-label={label ?? `${value}% mastery`} role="img"><svg viewBox="0 0 100 100" aria-hidden><circle className="ui-ring__track" cx="50" cy="50" r={radius} /><circle className="ui-ring__value" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} /></svg><strong>{value}%</strong></div>;
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return <div className="ui-empty">{icon}<h2>{title}</h2><p>{body}</p>{action}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) { return <span className={`ui-skeleton ${className}`} aria-hidden />; }
