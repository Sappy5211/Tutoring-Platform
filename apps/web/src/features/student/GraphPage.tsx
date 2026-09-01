import { Focus, Layers, Lightbulb, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Chip, EmptyState, HoverRow, ProgressBar, bandFor } from "@vidya/ui";
import { BrainGraph, type SkillNode } from "../graph/BrainGraph";
import { ControlPanel } from "../graph/ControlPanel";
import { DEFAULT_FORCES, type GraphForces } from "../graph/constants";

const SEED: SkillNode[] = [
  { id: "integers", label: "Integers", mastery: 82, unlocked: true, x: 22, y: 26, vx: 0, vy: 0 },
  { id: "fractions", label: "Fractions", mastery: 74, unlocked: true, x: 44, y: 18, vx: 0, vy: 0 },
  { id: "decimals", label: "Decimals", mastery: 61, unlocked: true, x: 66, y: 24, vx: 0, vy: 0 },
  { id: "ratio", label: "Ratio", mastery: 56, unlocked: true, x: 40, y: 46, vx: 0, vy: 0 },
  { id: "percent", label: "Percentages", mastery: 38, unlocked: true, x: 66, y: 52, vx: 0, vy: 0 },
  { id: "algebra", label: "Algebra", mastery: 64, unlocked: true, x: 24, y: 58, vx: 0, vy: 0 },
  { id: "equations", label: "Equations", mastery: 44, unlocked: true, x: 44, y: 72, vx: 0, vy: 0 },
  { id: "geometry", label: "Geometry", mastery: 70, unlocked: true, x: 76, y: 74, vx: 0, vy: 0 },
  { id: "mensuration", label: "Perimeter & area", mastery: 33, unlocked: true, x: 60, y: 86, vx: 0, vy: 0 },
];

const EDGES: { from: string; to: string }[] = [
  { from: "integers", to: "fractions" }, { from: "fractions", to: "decimals" },
  { from: "fractions", to: "ratio" }, { from: "ratio", to: "percent" },
  { from: "decimals", to: "percent" }, { from: "integers", to: "algebra" },
  { from: "algebra", to: "equations" }, { from: "ratio", to: "equations" },
  { from: "geometry", to: "mensuration" }, { from: "algebra", to: "mensuration" },
];

export function GraphPage() {
  const [selectedId, setSelectedId] = useState<string | null>("percent");
  const [forces, setForces] = useState<GraphForces>(DEFAULT_FORCES);
  const [frozen, setFrozen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = SEED.find((n) => n.id === selectedId) ?? null;

  const needs = useMemo(
    () => EDGES.filter((e) => e.to === selectedId).map((e) => SEED.find((n) => n.id === e.from)!),
    [selectedId]);
  const unlocks = useMemo(
    () => EDGES.filter((e) => e.from === selectedId).map((e) => SEED.find((n) => n.id === e.to)!),
    [selectedId]);

  /** The map's point: the weakest skill whose prerequisites are already solid.
   *  Not "here is your data" but "start here, and here is why". */
  const suggestion = useMemo(() => {
    const ready = SEED.filter((node) => {
      const prereqs = EDGES.filter((e) => e.to === node.id).map((e) => SEED.find((n) => n.id === e.from)!);
      return prereqs.length > 0 && prereqs.every((p) => p.mastery >= 60);
    });
    return ready.sort((a, b) => a.mastery - b.mastery)[0] ?? null;
  }, []);

  const shaky = needs.filter((n) => n.mastery < 60);

  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 pb-16">
      <header className="grid gap-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Knowledge map
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]">
          See how ideas connect
        </h1>
        <p className="max-w-[62ch] text-sm leading-relaxed text-[var(--muted)]">
          Hover to light up a skill and everything it touches. Click to inspect, double-click to zoom in.
        </p>
      </header>

      {suggestion && (
        <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-faint)] text-[var(--primary)]">
            <Lightbulb size={18} aria-hidden />
          </span>
          <div className="flex-1">
            <strong className="block text-sm font-bold text-[var(--ink)]">Start with {suggestion.label}</strong>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">
              Its prerequisites are secure and it is your weakest ready skill, so time here moves the most.
            </p>
          </div>
          <Button onClick={() => setSelectedId(suggestion.id)}>Show me</Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="grid gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip tone="primary">Class 7 &middot; Maths</Chip>
            <button
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--line)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
            >
              <Focus size={14} aria-hidden />
              Clear focus
            </button>
          </div>
          <ControlPanel forces={forces} setForces={setForces} frozen={frozen} setFrozen={setFrozen}
            query={query} setQuery={setQuery} />
          <BrainGraph nodes={SEED} edges={EDGES} forces={forces} frozen={frozen}
            selectedId={selectedId} onSelect={setSelectedId} searchQuery={query} />
        </Card>

        <Card className="grid content-start gap-4 p-5">
          {selected ? (
            <>
              <div className="grid gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Selected skill
                </span>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[var(--ink)]">{selected.label}</h2>
              </div>
              <div className="grid gap-1.5">
                <ProgressBar value={selected.mastery} label={`${selected.label} mastery`} />
                <p className="text-[12.5px] font-medium text-[var(--muted)]">{selected.mastery}% mastery</p>
              </div>

              {needs.length > 0 && (
                <div className="grid gap-1">
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                    Needs first
                  </h3>
                  <ul className="grid gap-0.5">
                    {needs.map((n) => (
                      <li key={n.id}>
                        <HoverRow className="!px-2">
                          <button
                            onClick={() => setSelectedId(n.id)}
                            className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium text-[var(--ink)] cursor-pointer"
                          >
                            {n.label}
                          </button>
                          <Chip band={bandFor(n.mastery)}>{n.mastery}%</Chip>
                        </HoverRow>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {shaky.length > 0 && (
                <p className="flex items-start gap-2 rounded-[10px] bg-[var(--needswork-soft)] p-3 text-[12.5px] leading-relaxed text-[var(--needswork)]">
                  <Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden />
                  {shaky.map((s) => s.label).join(" and ")} {shaky.length === 1 ? "is" : "are"} shaky &mdash;
                  that is usually why this one feels hard.
                </p>
              )}

              {unlocks.length > 0 && (
                <div className="grid gap-1">
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                    Unlocks
                  </h3>
                  <ul className="grid gap-0.5">
                    {unlocks.map((n) => (
                      <li key={n.id}>
                        <HoverRow className="!px-2">
                          <button
                            onClick={() => setSelectedId(n.id)}
                            className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium text-[var(--ink)] cursor-pointer"
                          >
                            {n.label}
                          </button>
                          <Chip band={bandFor(n.mastery)}>{n.mastery}%</Chip>
                        </HoverRow>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link to="/app/practice" className="mt-1">
                <Button className="w-full">Practise {selected.label}</Button>
              </Link>
            </>
          ) : (
            <EmptyState
              icon={<Layers size={24} aria-hidden />}
              title="Nothing selected"
              body="Pick a skill on the map to see what it rests on and what it opens up."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
