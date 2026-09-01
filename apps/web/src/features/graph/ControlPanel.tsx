import { ChevronDown, Search, Snowflake, SlidersHorizontal, X } from "lucide-react";
import { useId } from "react";
import { BAND_COLORS, BAND_LABELS, BAND_ORDER, type GraphForces } from "./constants";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

const SLIDERS: { key: keyof GraphForces; label: string; min: number; max: number; step: number }[] = [
  { key: "nodeSize", label: "Node size", min: 3, max: 16, step: 1 },
  { key: "linkThickness", label: "Link thickness", min: 0.2, max: 4, step: 0.2 },
  { key: "centerForce", label: "Centre pull", min: 0, max: 1, step: 0.05 },
  { key: "repelForce", label: "Repel force", min: 20, max: 400, step: 10 },
  { key: "linkDistance", label: "Link distance", min: 15, max: 200, step: 5 },
];

/** Formats a slider's current value the way a considered inspector would:
 *  tight decimals for the sub-1 force knobs, whole numbers for the rest. */
function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ControlPanel({
  forces, setForces, frozen, setFrozen, query, setQuery,
}: {
  forces: GraphForces; setForces: (f: GraphForces) => void;
  frozen: boolean; setFrozen: (v: boolean) => void;
  query: string; setQuery: (v: string) => void;
}) {
  const searchId = useId();
  return (
    <div className="grid gap-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
      <div className="flex items-center gap-2">
        <label htmlFor={searchId} className="sr-only">Find a skill on the map</label>
        <div className="relative min-w-0 flex-1">
          <Search size={14} aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a skill…"
            className={cx(
              "h-9 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-8 text-[13px]",
              "text-[var(--ink)] placeholder:text-[var(--faint)]",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]",
              query ? "pr-8" : "pr-3",
            )}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFrozen(!frozen)}
          aria-pressed={frozen}
          className={cx(
            "inline-flex h-9 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold",
            "transition-colors motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
            frozen
              ? "border-[var(--primary)] bg-[var(--primary-faint)] text-[var(--primary-strong)]"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]",
          )}
        >
          <Snowflake size={13} aria-hidden />
          {frozen ? "Frozen" : "Freeze"}
        </button>
      </div>

      <details className="group rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[12.5px] font-semibold text-[var(--muted)] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal size={13} aria-hidden />
            Layout forces
          </span>
          <ChevronDown
            size={14}
            aria-hidden
            className="text-[var(--faint)] transition-transform duration-150 motion-reduce:transition-none group-open:rotate-180"
          />
        </summary>

        <div className="mt-3 grid gap-4">
          {SLIDERS.map((slider) => (
            <label key={slider.key} className="grid gap-1.5">
              <span className="flex items-baseline justify-between text-[11.5px] text-[var(--muted)]">
                <span>{slider.label}</span>
                <span className="font-semibold tabular-nums text-[var(--ink-soft)]">
                  {formatValue(forces[slider.key])}
                </span>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={forces[slider.key]}
                onChange={(event) => setForces({ ...forces, [slider.key]: Number(event.target.value) })}
                aria-label={slider.label}
                aria-valuetext={formatValue(forces[slider.key])}
                className="h-1.5 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
            </label>
          ))}
        </div>
      </details>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-3.5" aria-label="Mastery band legend">
        {BAND_ORDER.map((band) => (
          <li key={band} className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--muted)]">
            <i aria-hidden className="block size-2 rounded-full" style={{ background: BAND_COLORS[band] }} />
            {BAND_LABELS[band]}
          </li>
        ))}
      </ul>
    </div>
  );
}
