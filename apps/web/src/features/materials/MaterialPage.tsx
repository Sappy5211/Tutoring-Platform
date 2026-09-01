import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { STITCH_MATERIALS } from "./data";

export function MaterialPage() {
  const { materialId } = useParams();
  const index = STITCH_MATERIALS.findIndex((item) => item.id === materialId);

  if (index < 0) return <Navigate to="/app/notebook" replace />;

  const material = STITCH_MATERIALS[index]!;
  const previous = STITCH_MATERIALS[index - 1];
  const next = STITCH_MATERIALS[index + 1];

  return (
    <div className="stitch-material">
      <header className="stitch-material__bar">
        <Link to="/app/notebook" className="stitch-material__back">
          <ArrowLeft aria-hidden /> Materials
        </Link>
        <div>
          <strong>{material.title}</strong>
          <span>Large Numbers and Place Value · Class 5 Mathematics · {index + 1} of {STITCH_MATERIALS.length}</span>
        </div>
        <nav aria-label="Lesson navigation">
          {previous ? (
            <Link to={`/app/materials/${previous.id}`} aria-label={`Previous: ${previous.title}`}>
              <ArrowLeft aria-hidden />
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/app/materials/${next.id}`} aria-label={`Next: ${next.title}`}>
              <ArrowRight aria-hidden />
            </Link>
          ) : (
            <Link to="/app/flashcards" aria-label="Review chapter flashcards">
              <ArrowRight aria-hidden />
            </Link>
          )}
          <a href={material.source} target="_blank" rel="noreferrer" aria-label="Open original Stitch page in a new tab">
            <ExternalLink aria-hidden />
          </a>
        </nav>
      </header>
      <iframe className="stitch-material__frame" src={material.source} title={`${material.title} — original Google Stitch lesson`} />
    </div>
  );
}
