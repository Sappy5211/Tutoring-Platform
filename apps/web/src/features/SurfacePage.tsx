import { ArrowRight, CheckCircle2, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import type { SurfaceData, SurfaceItem } from "@vidya/contracts";
import { Button, Card, Chip, EmptyState, HoverRow, Menu, MenuItem, ProgressBar, revealOnHover, Toast, type Band } from "@vidya/ui";

/* This page is the shared fallback for every route that has not earned a
   bespoke design yet. Because the shape is generic, every string here comes
   straight from the typed SurfaceData fixture - nothing on screen is invented. */

const METRIC_TONE: Record<string, string> = {
  success: "text-[var(--secure)]",
  warning: "text-[var(--developing)]",
  primary: "text-[var(--primary)]",
};

function statusBand(status: string): Band | undefined {
  const s = status.toLowerCase();
  if (s.includes("needs") || s.includes("overdue") || s.includes("failed")) return "needswork";
  if (s.includes("review") || s.includes("processing") || s.includes("pending")) return "developing";
  if (["secure", "verified", "on track", "active", "confirmed", "available", "published", "ready", "mix passes", "included"].some((k) => s.includes(k))) return "secure";
  return undefined;
}

export function SurfacePage() {
  const data = useLoaderData() as SurfaceData;
  const revalidator = useRevalidator();
  const [toast, setToast] = useState<string | null>(null);
  const [openedId, setOpenedId] = useState<string | null>(null);

  const notify = (message: string) => setToast(message);
  const openItem = (item: SurfaceItem) => {
    setOpenedId(item.id);
    notify(`"${item.title}" does not have a detail view in this build yet.`);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="text-[13px] font-semibold text-[var(--primary)]">{data.eyebrow}</span>
          <h1 className="mt-1 text-balance font-display text-[26px] font-bold text-[var(--ink)] sm:text-[30px]">{data.title}</h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-[var(--muted)]">{data.description}</p>
        </div>
        {data.primaryAction && (
          <Button
            className="shrink-0"
            onClick={() => notify(`"${data.primaryAction}" is not wired up in this preview yet.`)}
          >
            {data.primaryAction}
            <ArrowRight size={17} aria-hidden />
          </Button>
        )}
      </header>

      {data.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.metrics.map((metric) => (
            <Card key={metric.label} className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-[var(--muted)]">{metric.label}</span>
              <strong className={`font-display text-[22px] font-bold tabular-nums ${metric.tone ? METRIC_TONE[metric.tone] ?? "text-[var(--ink)]" : "text-[var(--ink)]"}`}>
                {metric.value}
              </strong>
              {metric.detail && <small className="text-[12px] text-[var(--faint)]">{metric.detail}</small>}
            </Card>
          ))}
        </div>
      )}

      {/* Card bakes in p-5; -m-5 cancels it so these sections can run edge-to-edge
          with their own borders and padding (overriding with p-0 would lose the
          cascade, since Tailwind v4 emits padding utilities in scale order). */}
      <Card>
      <div className="-m-5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[16px] font-bold text-[var(--ink)]">Overview</h2>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">Everything shown here comes from the typed fixture repository.</p>
          </div>
          <Menu
            label="Page options"
            trigger={() => (
              <span className="grid size-9 place-items-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                <MoreHorizontal size={18} aria-hidden />
              </span>
            )}
          >
            <MenuItem
              onClick={() => {
                revalidator.revalidate();
                notify("Refreshing from the fixture repository…");
              }}
            >
              <RefreshCw size={15} aria-hidden />
              Refresh data
            </MenuItem>
            <MenuItem onClick={() => notify("Export is not available in this preview.")}>
              Export
            </MenuItem>
          </Menu>
        </div>

        {data.items.length ? (
          <div className="grid gap-0.5 p-2">
            {data.items.map((item) => {
              const band = item.status ? statusBand(item.status) : undefined;
              return (
                <HoverRow key={item.id} className={openedId === item.id ? "bg-[var(--surface-soft)]" : ""}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--surface-strong)] text-[var(--muted)]">
                    <CheckCircle2 size={17} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[14px] font-semibold text-[var(--ink)]">{item.title}</h3>
                      {item.status && <Chip band={band}>{item.status}</Chip>}
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-[var(--muted)]">{item.meta}</p>
                    {item.progress !== undefined && (
                      <div className="mt-2 max-w-[220px]">
                        <ProgressBar value={item.progress} label={`${item.title} progress`} />
                      </div>
                    )}
                  </div>
                  {item.value && <strong className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--ink)]">{item.value}</strong>}
                  <button
                    onClick={() => openItem(item)}
                    aria-label={`Open ${item.title}`}
                    className={`grid size-8 shrink-0 place-items-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] cursor-pointer ${revealOnHover}`}
                  >
                    <ArrowRight size={16} aria-hidden />
                  </button>
                </HoverRow>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle2 size={28} aria-hidden />}
            title="Nothing needs attention"
            body="This state is intentionally empty. No placeholder activity is shown here."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  revalidator.revalidate();
                  notify("Refreshing from the fixture repository…");
                }}
              >
                <RefreshCw size={15} aria-hidden />
                Refresh
              </Button>
            }
          />
        )}
      </div>
      </Card>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
