import katex from "katex";
import { ArrowDown, ArrowLeftRight, ArrowRight, ChevronRight, LineChart, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { AnswerLayout, CardTrigger, OutlineNode } from "@vidya/contracts";
import { suggestAnswer } from "./data";

/** Typed at the end of a bullet, these turn it into a flashcard and render as an
 *  arrow — the RemNote mechanic. Longest first so `<->` wins over `->`. */
const TRIGGERS: [string, CardTrigger][] = [
  ["<->", "both"], ["<>", "both"], ["==", "forward"], ["->", "forward"], ["<-", "reverse"],
];

const ARROW: Record<CardTrigger, typeof ArrowRight> = {
  forward: ArrowRight, reverse: ArrowRight, both: ArrowLeftRight,
};

function InlineMath({ value }: { value: string }) {
  return <span className="math-render" dangerouslySetInnerHTML={{
    __html: katex.renderToString(value, { throwOnError: false, displayMode: false }),
  }} />;
}

/** IMPORTANT: `nodes` must be the COMPLETE node list for the document. Every
 *  edit maps over it and hands the whole array back, so passing a filtered
 *  subset would write that subset back as the entire document and delete
 *  everything else. That bug shipped once - a tab rendered a one-node slice and
 *  a single keystroke wiped the page. A different document means a different
 *  node array, never a filter over this one. */
export function Outliner({ nodes, onChange }: {
  nodes: OutlineNode[];
  onChange: (next: OutlineNode[]) => void;
}) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ nodeId: string; text: string } | null>(null);
  const answerRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, OutlineNode[]>();
    for (const node of nodes) {
      const list = map.get(node.parentId) ?? [];
      list.push(node);
      map.set(node.parentId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [nodes]);

  const patch = useCallback((nodeId: string, changes: Partial<OutlineNode>) => {
    onChange(nodes.map((n) => (n.nodeId === nodeId ? { ...n, ...changes } : n)));
  }, [nodes, onChange]);

  /** The core interaction: typing a trigger at the end of the question converts
   *  the bullet into a card, strips the trigger from the text, and moves the
   *  cursor to the answer — where an AI draft is offered on Tab. */
  const handleText = useCallback((node: OutlineNode, value: string) => {
    if (!node.cardTrigger) {
      const hit = TRIGGERS.find(([token]) => value.endsWith(token));
      if (hit) {
        const [token, trigger] = hit;
        const question = value.slice(0, -token.length).trimEnd();
        patch(node.nodeId, { text: question, cardTrigger: trigger, answerLayout: "inline", answer: "" });
        setSuggestion({ nodeId: node.nodeId, text: suggestAnswer(question) });
        requestAnimationFrame(() => answerRefs.current[node.nodeId]?.focus());
        return;
      }
    }
    patch(node.nodeId, { text: value });
  }, [patch]);

  const addSibling = useCallback((node: OutlineNode) => {
    const nodeId = `n-${Math.random().toString(36).slice(2, 9)}`;
    const next = nodes.map((n) =>
      n.parentId === node.parentId && n.order > node.order ? { ...n, order: n.order + 1 } : n);
    onChange([...next, {
      nodeId, docId: node.docId, parentId: node.parentId, order: node.order + 1,
      text: "", cardTrigger: null, answerLayout: "inline", collapsed: false, aiDrafted: false,
    }]);
    setFocusId(nodeId);
  }, [nodes, onChange]);

  const indent = useCallback((node: OutlineNode, direction: 1 | -1) => {
    const siblings = childrenOf.get(node.parentId) ?? [];
    if (direction === 1) {
      const above = siblings.filter((s) => s.order < node.order).pop();
      if (above) patch(node.nodeId, { parentId: above.nodeId, order: (childrenOf.get(above.nodeId)?.length ?? 0) });
      return;
    }
    const parent = nodes.find((n) => n.nodeId === node.parentId);
    if (parent) patch(node.nodeId, { parentId: parent.parentId, order: parent.order + 0.5 });
  }, [childrenOf, nodes, patch]);

  const setLayout = (node: OutlineNode, layout: AnswerLayout) =>
    patch(node.nodeId, { answerLayout: layout });

  const render = (parentId: string | null, depth: number) =>
    (childrenOf.get(parentId) ?? []).map((node) => {
      const kids = childrenOf.get(node.nodeId) ?? [];
      const isCard = node.cardTrigger !== null;
      const Arrow = isCard ? (node.answerLayout === "children" ? ArrowDown : ARROW[node.cardTrigger!]) : null;
      const showSuggestion = suggestion?.nodeId === node.nodeId && !node.answer;

      return (
        <li key={node.nodeId} className="outline__item" style={{ ["--depth" as string]: depth }}>
          <div className={`outline__row${isCard ? " is-card" : ""}`}>
            <button
              className={`outline__twist${kids.length ? "" : " is-empty"}`}
              onClick={() => patch(node.nodeId, { collapsed: !node.collapsed })}
              aria-label={node.collapsed ? "Expand" : "Collapse"}
              aria-expanded={!node.collapsed}
              tabIndex={kids.length ? 0 : -1}
            >
              {kids.length > 0 && <ChevronRight size={13} className={node.collapsed ? "" : "is-open"} />}
            </button>
            <span className="outline__dot" aria-hidden />

            <input
              className="outline__text"
              value={node.text}
              autoFocus={focusId === node.nodeId}
              placeholder={depth === 0 ? "Heading or idea…" : "Type a point, or end with == to make a card"}
              onChange={(e) => handleText(node, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") { e.preventDefault(); addSibling(node); }
                if (e.key === "Tab") { e.preventDefault(); indent(node, e.shiftKey ? -1 : 1); }
              }}
              aria-label={isCard ? "Card question" : "Bullet"}
            />

            {isCard && node.answerLayout === "inline" && (
              <>
                <span className="outline__arrow" aria-label={`Card, ${node.cardTrigger}`}>
                  {Arrow && <Arrow size={15} />}
                </span>
                <span className="outline__answer-wrap">
                  <input
                    ref={(el) => { answerRefs.current[node.nodeId] = el; }}
                    className={`outline__answer${node.aiDrafted ? " is-ai" : ""}`}
                    value={node.answer ?? ""}
                    placeholder={showSuggestion ? "" : "Answer…"}
                    onChange={(e) => patch(node.nodeId, { answer: e.target.value, aiDrafted: false })}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      // Tab accepts the AI draft. It lands marked as AI-written and
                      // stays that way until edited — ADR-003's gate means nothing
                      // AI-authored is silently treated as reviewed.
                      if (e.key === "Tab" && showSuggestion) {
                        e.preventDefault();
                        patch(node.nodeId, { answer: suggestion.text, aiDrafted: true });
                        setSuggestion(null);
                      }
                      if (e.key === "Enter") { e.preventDefault(); addSibling(node); }
                    }}
                    aria-label="Card answer"
                  />
                  {showSuggestion && (
                    <span className="outline__ghost" aria-hidden>
                      <kbd>Tab</kbd> {suggestion.text}
                    </span>
                  )}
                </span>
              </>
            )}

            {isCard && node.answerLayout === "children" && (
              <span className="outline__arrow" title="Answer is the indented list below"><ArrowDown size={15} /></span>
            )}
            {isCard && node.answerLayout === "block" && (
              <span className="outline__arrow"><LineChart size={15} /></span>
            )}

            {isCard && (
              <span className="outline__tools">
                {node.aiDrafted && <span className="outline__ai" title="AI draft — review before it counts"><Sparkles size={12} /> AI</span>}
                <select
                  className="outline__layout"
                  value={node.answerLayout}
                  onChange={(e) => setLayout(node, e.target.value as AnswerLayout)}
                  aria-label="Answer layout"
                >
                  <option value="inline">→ inline</option>
                  <option value="children">↓ list</option>
                  <option value="block">▣ block</option>
                </select>
              </span>
            )}
          </div>

          {isCard && node.answerLayout === "inline" && node.answerLatex && (
            <div className="outline__latex"><InlineMath value={node.answerLatex} /></div>
          )}
          {isCard && node.answerLayout === "block" && (
            <div className="outline__block">
              <LineChart size={17} aria-hidden />
              <p>A diagram or graph answers this card — it will not fit on a line.</p>
            </div>
          )}

          {kids.length > 0 && !node.collapsed && <ul className="outline__children">{render(node.nodeId, depth + 1)}</ul>}
        </li>
      );
    });

  return <ul className="outline">{render(null, 0)}</ul>;
}
