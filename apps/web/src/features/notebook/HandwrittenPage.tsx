import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Field, Input, Toast } from "@vidya/ui";
import { HandwritingCanvas } from "./HandwritingCanvas";

export function HandwrittenPage() {
  const [title, setTitle] = useState("Untitled page");
  const [card, setCard] = useState<{ question: string; answer: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-[860px] pb-16">
      <nav aria-label="Breadcrumb" className="pt-2 pb-4 text-[13px]">
        <Link to="/app/notebook" className="text-[var(--muted)] hover:text-[var(--ink)]">Notebook</Link>
      </nav>

      <header className="flex flex-wrap items-center gap-4 pb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Page name"
          className="min-w-0 flex-1 rounded-[8px] border border-transparent bg-transparent px-1 py-1 font-display text-[26px] font-bold tracking-tight text-[var(--ink)] text-balance hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--surface-soft)] focus-visible:outline-none"
        />
        {/* The arrow works here too: you write the question by hand, then
            attach a card to the page rather than to a line of text. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCard(card ? null : { question: "", answer: "" })}
          aria-pressed={Boolean(card)}
        >
          <ArrowRight size={15} aria-hidden /> {card ? "Remove card" : "Add card"}
        </Button>
      </header>

      <HandwritingCanvas />

      {card && (
        <div className="mt-4 grid gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--primary-faint)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--primary)]">
            <ArrowRight size={12} aria-hidden /> Card on this page
          </span>
          <Field label="Question" hint="Leave blank if it is in your handwriting above.">
            {(id) => (
              <Input
                id={id}
                value={card.question}
                onChange={(e) => setCard({ ...card, question: e.target.value })}
                placeholder="Question…"
              />
            )}
          </Field>
          <Field label="Answer">
            {(id) => (
              <Input
                id={id}
                value={card.answer}
                onChange={(e) => setCard({ ...card, answer: e.target.value })}
                placeholder="Answer…"
              />
            )}
          </Field>
          <Button size="sm" className="justify-self-start" onClick={() => setToast("Card saved")}>
            <Check size={15} aria-hidden /> Save card
          </Button>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
