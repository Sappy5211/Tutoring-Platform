import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { HandwritingCanvas } from "./HandwritingCanvas";

export function HandwrittenPage() {
  const [title, setTitle] = useState("Untitled page");
  const [card, setCard] = useState<{ question: string; answer: string } | null>(null);

  return (
    <div className="page folder hw-page">
      <nav className="folder__trail" aria-label="Breadcrumb">
        <Link to="/app/notebook">Notebook</Link>
      </nav>
      <header className="folder__head">
        <input className="folder__title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Page name" />
        <div className="folder__actions">
          {/* The arrow works here too: you write the question by hand, then
              attach a card to the page rather than to a line of text. */}
          <button
            className="folder__ghost"
            onClick={() => setCard(card ? null : { question: "", answer: "" })}
            aria-pressed={Boolean(card)}
          >
            <ArrowRight size={16} aria-hidden /> {card ? "Remove card" : "Add card"}
          </button>
        </div>
      </header>

      <HandwritingCanvas />

      {card && (
        <div className="hw-card">
          <span className="hw-card__badge"><ArrowRight size={14} aria-hidden /> Card on this page</span>
          <input
            placeholder="Question (or leave blank if it is in your handwriting above)"
            value={card.question}
            onChange={(e) => setCard({ ...card, question: e.target.value })}
            aria-label="Card question"
          />
          <input
            placeholder="Answer"
            value={card.answer}
            onChange={(e) => setCard({ ...card, answer: e.target.value })}
            aria-label="Card answer"
          />
          <button className="folder__primary"><Check size={15} aria-hidden /> Save card</button>
        </div>
      )}
    </div>
  );
}
