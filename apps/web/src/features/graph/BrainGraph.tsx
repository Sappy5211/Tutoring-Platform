import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BAND_COLORS, LABEL_ZOOM_THRESHOLD, bandFor, type GraphForces } from "./constants";

export interface SkillNode {
  id: string; label: string; mastery: number; unlocked: boolean;
  x: number; y: number; vx: number; vy: number; pinned?: boolean;
}
export interface SkillEdge { from: string; to: string }

/** Same interaction model as the CarbonAnswer brain graph — hover lights a node
 *  and its one-hop neighbourhood and dims everything else, click selects for the
 *  inspector, double-click zooms, labels appear past a zoom threshold, and
 *  reduced motion settles the layout then stops.
 *
 *  Implemented in SVG with our own force simulation rather than
 *  `react-force-graph-2d`: that package resolves its own copy of React under
 *  pnpm's strict layout, which throws "Invalid hook call" and drops the whole
 *  route into the error boundary. It is also ~130KB against a 200KB budget.
 *  Ours is a few KB and has no such conflict. */
export function BrainGraph({
  nodes: seed, edges, selectedId, onSelect, forces, frozen, searchQuery,
}: {
  nodes: SkillNode[]; edges: SkillEdge[];
  selectedId: string | null; onSelect: (id: string | null) => void;
  forces: GraphForces; frozen: boolean; searchQuery: string;
}) {
  const [nodes, setNodes] = useState<SkillNode[]>(seed);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const frame = useRef<number>();
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const focusId = hoverId ?? selectedId;
  const neighbourhood = useMemo(() => {
    if (!focusId) return null;
    const ids = new Set<string>([focusId]);
    const keys = new Set<string>();
    for (const e of edges) {
      if (e.from === focusId || e.to === focusId) { ids.add(e.from); ids.add(e.to); keys.add(`${e.from}->${e.to}`); }
    }
    return { ids, keys };
  }, [focusId, edges]);

  const step = useCallback(() => {
    setNodes((prev) => {
      const next = prev.map((n) => ({ ...n }));
      for (let i = 0; i < next.length; i += 1) {
        const a = next[i]!;
        if (a.pinned) continue;
        for (let j = 0; j < next.length; j += 1) {
          if (i === j) continue;
          const b = next[j]!;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = Math.max(dx * dx + dy * dy, 16);
          const f = (forces.repelForce * 2.2) / d2;
          a.vx += (dx / Math.sqrt(d2)) * f;
          a.vy += (dy / Math.sqrt(d2)) * f;
        }
        a.vx += (50 - a.x) * forces.centerForce * 0.005;
        a.vy += (46 - a.y) * forces.centerForce * 0.005;
      }
      for (const edge of edges) {
        const a = next.find((n) => n.id === edge.from);
        const b = next.find((n) => n.id === edge.to);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(Math.hypot(dx, dy), 0.01);
        const pull = (dist - forces.linkDistance * 0.42) * 0.008;
        if (!a.pinned) { a.vx += (dx / dist) * pull; a.vy += (dy / dist) * pull; }
        if (!b.pinned) { b.vx -= (dx / dist) * pull; b.vy -= (dy / dist) * pull; }
      }
      for (const n of next) {
        if (n.pinned) { n.vx = 0; n.vy = 0; continue; }
        n.vx *= 0.86; n.vy *= 0.86;
        n.x = Math.min(95, Math.max(5, n.x + n.vx));
        n.y = Math.min(90, Math.max(6, n.y + n.vy));
      }
      return next;
    });
  }, [edges, forces]);

  useEffect(() => {
    if (frozen) return;
    if (reduced) { for (let i = 0; i < 240; i += 1) step(); return; }
    const loop = () => { step(); frame.current = requestAnimationFrame(loop); };
    frame.current = requestAnimationFrame(loop);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [step, reduced, frozen]);

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 94;
      setNodes((prev) => prev.map((n) => (n.id === drag ? { ...n, x, y, pinned: true } : n)));
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [drag]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const matches = (n: SkillNode) =>
    searchQuery.length > 0 && n.label.toLowerCase().includes(searchQuery.toLowerCase());
  const dimmed = (id: string) => Boolean(neighbourhood && !neighbourhood.ids.has(id));
  const showLabels = zoom >= LABEL_ZOOM_THRESHOLD;

  const zoomTo = (node: SkillNode) => {
    setZoom(2.2);
    setPan({ x: 50 - node.x, y: 46 - node.y });
  };

  return (
    <div className="bg-wrap">
      <svg ref={svgRef} viewBox="0 0 100 94" role="application"
        aria-label="Knowledge map. Hover a skill to light up what it connects to; click to inspect.">
        <g transform={`translate(50 46) scale(${zoom}) translate(${-50 + pan.x} ${-46 + pan.y})`}>
          {edges.map((edge) => {
            const a = byId.get(edge.from); const b = byId.get(edge.to);
            if (!a || !b) return null;
            const on = Boolean(neighbourhood?.keys.has(`${edge.from}->${edge.to}`));
            return <line key={`${edge.from}-${edge.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              className={`bg-edge${on ? " is-on" : ""}${neighbourhood && !on ? " is-dim" : ""}`}
              strokeWidth={forces.linkThickness * 0.5} />;
          })}
          {nodes.map((node) => {
            const selected = node.id === selectedId;
            const r = (forces.nodeSize * (selected ? 1.3 : 1)) / (2.2 * zoom);
            return (
              <g key={node.id}
                className={`bg-node${selected ? " is-selected" : ""}${dimmed(node.id) ? " is-dim" : ""}`}
                transform={`translate(${node.x} ${node.y})`}
                role="button" tabIndex={0}
                aria-label={`${node.label}, ${node.mastery}% mastery`}
                aria-pressed={selected}
                onPointerDown={(e) => { e.preventDefault(); setDrag(node.id); }}
                onPointerEnter={() => setHoverId(node.id)}
                onPointerLeave={() => setHoverId(null)}
                onClick={() => onSelect(selected ? null : node.id)}
                onDoubleClick={() => zoomTo(node)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(node.id); } }}
              >
                {selected && <circle className="bg-halo" r={r * 2.1} />}
                <circle r={r} fill={BAND_COLORS[bandFor(node.mastery, node.unlocked)]}
                  stroke={matches(node) || selected ? "var(--ink)" : "none"} strokeWidth={0.5 / zoom} />
                {(showLabels || node.id === focusId) && (
                  <text y={r + 3.4 / zoom} fontSize={3.2 / zoom}>{node.label}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="bg-zoom" role="group" aria-label="Zoom">
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.3))}
          aria-label="Zoom in"
          className="grid cursor-pointer place-items-center transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <ZoomIn size={14} aria-hidden />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.3))}
          aria-label="Zoom out"
          className="grid cursor-pointer place-items-center transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <ZoomOut size={14} aria-hidden />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          aria-label="Reset view"
          className="grid cursor-pointer place-items-center transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Maximize2 size={13} aria-hidden />
        </button>
      </div>
    </div>
  );
}
