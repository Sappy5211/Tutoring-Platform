import { ArrowRight, Bot, BookOpen, RotateCcw, Send, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Chip } from "@vidya/ui";
import { services } from "../../lib/services";

type Message = { id: string; from: "student" | "coach"; text: string };

export function AiCoachDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", from: "coach", text: "I’m here when a step feels unclear. Tell me what you understand so far, and we’ll work from there." }
  ]);
  const [stuckCount, setStuckCount] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const context = location.pathname.includes("practice") ? "Current practice question" : location.pathname.includes("notes") ? "Published lesson note" : "Lines and angles";

  const ask = async (prompt: string) => {
    if (!prompt.trim() || streaming) return;
    setInput("");
    setStreaming(true);
    const studentId = crypto.randomUUID();
    const coachId = crypto.randomUUID();
    setMessages((current) => [...current, { id: studentId, from: "student", text: prompt }, { id: coachId, from: "coach", text: "" }]);
    let answer = "";
    for await (const chunk of services.tutor.stream(prompt)) {
      if (chunk.type === "token") {
        answer += chunk.value;
        setMessages((current) => current.map((message) => message.id === coachId ? { ...message, text: answer } : message));
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

  return <aside className={`ai-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} aria-label="VIDYA AI coach">
    <header className="ai-drawer__header"><div className="ai-coach-mark"><Bot /></div><div><strong>Ask VIDYA</strong><span>Learning coach</span></div><Chip tone="success">Grounded</Chip><button className="icon-button" onClick={onClose} aria-label="Close AI coach"><X /></button></header>
    <div className="ai-context"><BookOpen size={17} /><div><span>Using this page</span><strong>{context}</strong></div></div>
    <div className="ai-thread" aria-live="polite">{messages.map((message) => <div key={message.id} className={`ai-message ai-message--${message.from}`}><span>{message.from === "coach" ? "V" : "You"}</span><p>{message.text || "Thinking through a different approach…"}</p></div>)}</div>
    {messages.length > 1 && !streaming && <div className="ai-recovery"><span>Did that explanation help?</span><button onClick={stillStuck}><RotateCcw size={15} />I’m still stuck</button></div>}
    {stuckCount >= 2 && <div className="ai-escalation"><UsersRound /><div><strong>A teacher may be the best next step.</strong><p>You’ve tried a few approaches. With your permission, a teacher can receive this conversation and the related question.</p><Link to="/app/teachers" onClick={onClose}>See available teachers<ArrowRight size={15} /></Link></div></div>}
    <form className="ai-compose" onSubmit={(event) => { event.preventDefault(); void ask(input); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about what feels confusing…" rows={2} /><Button type="submit" disabled={!input.trim() || streaming} aria-label="Send question"><Send size={16} /></Button></form>
    <footer>VIDYA tries hints, examples, and smaller steps before suggesting live help.</footer>
  </aside>;
}
