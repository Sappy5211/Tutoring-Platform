import { Search, Snowflake, X } from "lucide-react";
import { BAND_COLORS, BAND_LABELS, BAND_ORDER, type GraphForces } from "./constants";

const SLIDERS: { key: keyof GraphForces; label: string; min: number; max: number; step: number }[] = [
  { key: "nodeSize", label: "Node size", min: 3, max: 16, step: 1 },
  { key: "linkThickness", label: "Link thickness", min: 0.2, max: 4, step: 0.2 },
  { key: "centerForce", label: "Centre force", min: 0, max: 1, step: 0.05 },
  { key: "repelForce", label: "Repel force", min: 20, max: 400, step: 10 },
  { key: "linkDistance", label: "Link distance", min: 15, max: 200, step: 5 },
];

export function ControlPanel({
  forces, setForces, frozen, setFrozen, query, setQuery,
}: {
  forces: GraphForces; setForces: (f: GraphForces) => void;
  frozen: boolean; setFrozen: (v: boolean) => void;
  query: string; setQuery: (v: string) => void;
}) {
  return (
    <div className="fg-controls">
      <div className="fg-controls__search">
        <Search size={15} aria-hidden />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a skill…" aria-label="Find a skill on the map" />
        {query && <button onClick={() => setQuery("")} aria-label="Clear"><X size={13} /></button>}
      </div>

      <div className="fg-controls__toggles">
        <button className={frozen ? "is-on" : ""} onClick={() => setFrozen(!frozen)} aria-pressed={frozen}>
          <Snowflake size={14} aria-hidden /> Freeze
        </button>

      </div>

      <details className="fg-controls__forces">
        <summary>Layout</summary>
        {SLIDERS.map((slider) => (
          <label key={slider.key}>
            <span>{slider.label}</span>
            <input type="range" min={slider.min} max={slider.max} step={slider.step}
              value={forces[slider.key]}
              onChange={(e) => setForces({ ...forces, [slider.key]: Number(e.target.value) })} />
          </label>
        ))}
      </details>

      <ul className="fg-legend">
        {BAND_ORDER.map((band) => (
          <li key={band}>
            <i style={{ background: BAND_COLORS[band] }} aria-hidden />
            {BAND_LABELS[band]}
          </li>
        ))}
      </ul>
    </div>
  );
}
