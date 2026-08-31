import { Focus, Layers, Lightbulb, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Chip, ProgressBar } from "@vidya/ui";
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
    <div className="page graph-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Knowledge map</span>
          <h1>See how ideas connect</h1>
          <p>Hover to light up a skill and everything it touches. Click to inspect, double-click to zoom in.</p>
        </div>
      </header>

      {suggestion && (
        <Card className="graph-suggestion">
          <span className="graph-suggestion__icon"><Lightbulb size={19} /></span>
          <div>
            <strong>Start with {suggestion.label}</strong>
            <p>Its prerequisites are secure and it is your weakest ready skill, so time here moves the most.</p>
          </div>
          <Button onClick={() => setSelectedId(suggestion.id)}>Show me</Button>
        </Card>
      )}

      <div className="graph-layout">
        <Card className="graph-canvas">
          <div className="graph-toolbar">
            <Chip tone="primary">Class 7 · Maths</Chip>
            <button onClick={() => setSelectedId(null)}><Focus size={15} /> Clear focus</button>
          </div>
          <ControlPanel forces={forces} setForces={setForces} frozen={frozen} setFrozen={setFrozen}
            query={query} setQuery={setQuery} />
          <BrainGraph nodes={SEED} edges={EDGES} forces={forces} frozen={frozen}
            selectedId={selectedId} onSelect={setSelectedId} searchQuery={query} />
        </Card>

        <Card className="graph-detail">
          {selected ? (
            <>
              <span className="eyebrow">Selected skill</span>
              <h2>{selected.label}</h2>
              <ProgressBar value={selected.mastery} />
              <p className="graph-detail__pct">{selected.mastery}% mastery</p>

              {needs.length > 0 && (
                <>
                  <h3>Needs first</h3>
                  <ul className="graph-list">
                    {needs.map((n) => (
                      <li key={n.id}>
                        <button onClick={() => setSelectedId(n.id)}>{n.label}</button>
                        <Chip tone={n.mastery >= 60 ? "success" : "warning"}>{n.mastery}%</Chip>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {shaky.length > 0 && (
                <p className="graph-detail__warn">
                  <Sparkles size={14} aria-hidden />
                  {shaky.map((s) => s.label).join(" and ")} {shaky.length === 1 ? "is" : "are"} shaky —
                  that is usually why this one feels hard.
                </p>
              )}

              {unlocks.length > 0 && (
                <>
                  <h3>Unlocks</h3>
                  <ul className="graph-list">
                    {unlocks.map((n) => (
                      <li key={n.id}>
                        <button onClick={() => setSelectedId(n.id)}>{n.label}</button>
                        <Chip tone="neutral">{n.mastery}%</Chip>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Link to="/app/practice"><Button className="graph-detail__cta">Practise {selected.label}</Button></Link>
            </>
          ) : (
            <div className="graph-detail__empty">
              <Layers size={24} aria-hidden />
              <h2>Nothing selected</h2>
              <p>Pick a skill on the map to see what it rests on and what it opens up.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
