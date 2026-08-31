import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Focus, ListTree, Search } from "lucide-react";
import { Card, Chip, ProgressBar } from "@vidya/ui";

const nodes = [
  { id: "integers", label: "Integers", x: 18, y: 34, mastery: 82 }, { id: "fractions", label: "Fractions", x: 38, y: 18, mastery: 74 }, { id: "ratio", label: "Ratio", x: 60, y: 30, mastery: 56 }, { id: "percent", label: "Percentages", x: 78, y: 18, mastery: 42 }, { id: "algebra", label: "Algebra", x: 45, y: 58, mastery: 67 }, { id: "equations", label: "Equations", x: 68, y: 64, mastery: 48 }, { id: "geometry", label: "Geometry", x: 22, y: 73, mastery: 71 }, { id: "mensuration", label: "Mensuration", x: 47, y: 83, mastery: 36 }
];
const edges: Array<readonly [number, number]> = [[0,1],[1,2],[2,3],[0,4],[1,4],[4,5],[6,7],[4,7]];
export function GraphPage() {
  const [selected, setSelected] = useState(nodes[5]!);
  return <div className="page graph-page"><header className="page-header"><div><span className="eyebrow">Knowledge map</span><h1>See how ideas connect</h1><p>Focus on weak spots without losing sight of what supports them.</p></div><div className="graph-actions"><button><Search />Find a skill</button><button><Filter />Weak spots</button></div></header><div className="graph-layout"><Card className="graph-canvas"><div className="graph-toolbar"><Chip tone="primary">Class 7 · Maths</Chip><button><Focus />Centre</button></div><svg viewBox="0 0 100 100" role="img" aria-label="Connected mathematics skills">{edges.map(([a,b], index) => <line key={index} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y} />)}{nodes.map((node) => <g key={node.id} className={selected.id === node.id ? "selected" : ""} onClick={() => setSelected(node)} role="button" tabIndex={0}><circle cx={node.x} cy={node.y} r="5" className={node.mastery >= 70 ? "secure" : node.mastery >= 45 ? "developing" : "starting"} /><text x={node.x} y={node.y + 9}>{node.label}</text></g>)}</svg><div className="graph-mobile-tree"><ListTree /><p>The interactive graph becomes a curriculum tree on smaller screens.</p></div></Card><Card className="graph-detail"><span className="eyebrow">Selected skill</span><h2>{selected.label}</h2><p>{selected.mastery}% mastery</p><ProgressBar value={selected.mastery} /><h3>Why this matters</h3><p>This skill unlocks the next connected ideas and appears in your current exam goal.</p><Link to="/app/practice">Practise this skill</Link></Card></div></div>;
}
