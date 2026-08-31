import { ArrowRight, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import type { SurfaceData } from "@vidya/contracts";
import { Button, Card, Chip, ProgressBar } from "@vidya/ui";

export function SurfacePage() {
  const data = useLoaderData() as SurfaceData;
  return <div className="page page--surface">
    <header className="page-header"><div><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.description}</p></div>{data.primaryAction && <Button>{data.primaryAction}<ArrowRight size={17} /></Button>}</header>
    {data.metrics.length > 0 && <div className="metric-grid">{data.metrics.map((metric) => <Card key={metric.label} className="metric-card"><span>{metric.label}</span><strong>{metric.value}</strong>{metric.detail && <small>{metric.detail}</small>}</Card>)}</div>}
    <Card className="list-panel"><div className="panel-heading"><div><h2>Overview</h2><p>Everything shown here comes from the typed fixture repository.</p></div><button className="icon-button" aria-label="More options"><MoreHorizontal /></button></div>{data.items.length ? <div className="item-list">{data.items.map((item) => <article key={item.id} className="list-item"><span className="list-item__icon"><CheckCircle2 size={18} /></span><div className="list-item__body"><div><h3>{item.title}</h3>{item.status && <Chip tone={item.status.toLowerCase().includes("review") ? "warning" : "success"}>{item.status}</Chip>}</div><p>{item.meta}</p>{item.progress !== undefined && <ProgressBar value={item.progress} />}</div>{item.value && <strong>{item.value}</strong>}<button className="icon-button" aria-label={`Open ${item.title}`}><ArrowRight size={18} /></button></article>)}</div> : <div className="honest-empty"><CheckCircle2 /><h2>Nothing needs attention</h2><p>This state is intentionally empty—no fake activity is shown.</p></div>}</Card>
  </div>;
}
