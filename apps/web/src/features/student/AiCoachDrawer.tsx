import { ArrowRight, Bot, BookOpen, Copy, RotateCcw, Send, UsersRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Chip, IconButton, Toast, revealOnHover } from "@vidya/ui";
import { services } from "../../lib/services";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

type Message = {
  id: string;
  from: "student" | "coach";
  text: string;
  citation?: { value: string; blockId: string };
};

export function AiCoachDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "coach",
      text: "I’m here when a step feels unclear. Tell me what you understand so far, and we’ll work from there.",
    },
  ]);
  const [stuckCount, setStuckCount] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const threadEnd = useRef<HTMLDivElement>(null);

  const context = location.pathname.includes("practice")
    ? "Current practice question"
    : location.pathname.includes("notes")
      ? "Published lesson note"
      : location.pathname.includes("topic")
        ? "This topic's notes"
        : "Lines and angles";

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Mount in the off-screen position, then flip on the next frame so the
  // slide-in transition actually has two states to animate between (the
  // parent only mounts this component once it is already "open").
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ask = async (prompt: string) => {
    if (!prompt.trim() || streaming) return;
    setInput("");
    setStreaming(true);
    const studentId = crypto.randomUUID();
    const coachId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      { id: studentId, from: "student", text: prompt },
      { id: coachId, from: "coach", text: "" },
    ]);
    let answer = "";
    for await (const chunk of services.tutor.stream(prompt)) {
      if (chunk.type === "token") {
        answer += chunk.value;
        setMessages((current) => current.map((message) => (message.id === coachId ? { ...message, text: answer } : message)));
      } else if (chunk.type === "citation" && chunk.blockId) {
        const citation = { value: chunk.value, blockId: chunk.blockId };
        setMessages((current) => current.map((message) => (message.id === coachId ? { ...message, citation } : message)));
      }
    }
    setStreaming(false);
  };

  const stillStuck = () => {
    const next = stuckCount + 1;
    setStuckCount(next);
    void ask(next === 1
      ? "I am still stuck. Explain it again using a visual or everyday example, without giving away the answer."
      : "I am still stuck after the earlier explanations. Break the idea into the smallest possible steps and check my understanding after each one.");
  };

  const copyMessage = (text: string) => {
    void navigator.clipboard.writeText(text);
    setToast("Copied to clipboard");
  };

  return (
    <aside
      className={cx(
        "fixed inset-y-0 right-0 z-[80] flex w-full flex-col border-l border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] sm:w-[400px]",
        open && visible ? "translate-x-0" : "translate-x-full",
        "transition-transform duration-200 motion-reduce:transition-none",
      )}
      aria-hidden={!open}
      aria-label="VIDYA AI coach"
    >
      <header className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--primary-faint)] text-[var(--primary)]">
          <Bot size={17} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[14px] font-bold text-[var(--ink)]">Ask VIDYA</strong>
          <span className="text-[12px] text-[var(--muted)]">Learning coach</span>
        </div>
        <Chip tone="primary">Grounded</Chip>
        <IconButton label="Close AI coach" onClick={onClose}>
          <X size={18} aria-hidden />
        </IconButton>
      </header>

      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5">
        <BookOpen size={15} className="shrink-0 text-[var(--muted)]" aria-hidden />
        <div className="min-w-0 leading-tight">
          <span className="block text-[10.5px] text-[var(--muted)]">Using this page</span>
          <strong className="block truncate text-[12.5px] font-semibold text-[var(--ink)]">{context}</strong>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={cx("group flex gap-2", message.from === "student" && "flex-row-reverse")}>
            <span
              className={cx(
                "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                message.from === "coach" ? "bg-[var(--primary-faint)] text-[var(--primary)]" : "bg-[var(--surface-strong)] text-[var(--ink-soft)]",
              )}
              aria-hidden
            >
              {message.from === "coach" ? "V" : "You"}
            </span>
            <div className={cx("grid max-w-[85%] gap-1.5", message.from === "student" && "justify-items-end")}>
              <div
                className={cx(
                  "rounded-[14px] px-3 py-2 text-[13px] leading-relaxed",
                  message.from === "coach" ? "bg-[var(--surface-soft)] text-[var(--ink)]" : "bg-[var(--primary)] text-white",
                )}
              >
                {message.text || <i className="text-[var(--faint)]">Thinking through a different approach&hellip;</i>}
              </div>
              {message.citation && (
                <a
                  href={`/app/notes#${message.citation.blockId}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <BookOpen size={10} aria-hidden />
                  {message.citation.value}
                </a>
              )}
              {message.text && (
                <IconButton
                  label="Copy message"
                  className={cx("size-5", revealOnHover)}
                  onClick={() => copyMessage(message.text)}
                >
                  <Copy size={11} aria-hidden />
                </IconButton>
              )}
            </div>
          </div>
        ))}
        <div ref={threadEnd} />
      </div>

      {messages.length > 1 && !streaming && (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] px-4 py-2.5 text-[12.5px]">
          <span className="text-[var(--muted)]">Did that explanation help?</span>
          <button
            onClick={stillStuck}
            className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 font-semibold text-[var(--primary)] hover:bg-[var(--primary-faint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
          >
            <RotateCcw size={13} aria-hidden />
            I&rsquo;m still stuck
          </button>
        </div>
      )}

      {stuckCount >= 2 && (
        <div className="mx-4 mb-3 flex gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
          <UsersRound size={18} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden />
          <div>
            <strong className="block text-[13px] font-bold text-[var(--ink)]">A teacher may be the best next step.</strong>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
              You&rsquo;ve tried a few approaches. With your permission, a teacher can receive this conversation and the related question.
            </p>
            <Link
              to="/app/teachers"
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              See available teachers
              <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
        </div>
      )}

      <form
        className="flex items-end gap-2 border-t border-[var(--line)] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about what feels confusing…"
          rows={2}
          className="max-h-24 min-h-[42px] flex-1 resize-none rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--faint)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void ask(input);
            }
          }}
        />
        <Button type="submit" disabled={!input.trim() || streaming} loading={streaming} aria-label="Send question">
          <Send size={15} aria-hidden />
        </Button>
      </form>
      <footer className="border-t border-[var(--line)] px-4 py-2.5 text-[11px] leading-relaxed text-[var(--faint)]">
        VIDYA tries hints, examples, and smaller steps before suggesting live help.
      </footer>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </aside>
  );
}
