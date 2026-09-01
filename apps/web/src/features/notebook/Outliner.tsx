import katex from "katex";
import { ArrowDown, ArrowLeftRight, ArrowRight, ChevronRight, LineChart, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { AnswerLayout, CardTrigger, OutlineNode } from "@vidya/contracts";
import { Menu, MenuItem, revealOnHover } from "@vidya/ui";
import { suggestAnswer } from "./data";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Typed at the end of a bullet, these turn it into a flashcard and render as an
 *  arrow. Longest first so `<->` wins over `->`. `--` is our own trigger, not
 *  RemNote's `==`, so a line reading "a -- b" never gets caught mid-arrow. */
const TRIGGERS: [string, CardTrigger][] = [
  ["<->", "both"], ["<>", "both"], ["--", "forward"], ["->", "forward"], ["<-", "reverse"],
];

const ARROW: Record<CardTrigger, typeof ArrowRight> = {
  forward: ArrowRight, reverse: ArrowRight, both: ArrowLeftRight,
};

const LAYOUT_LABEL: Record<AnswerLayout, string> = {
  inline: "Inline answer", children: "List answer", block: "Diagram / block",
};

function InlineMath({ value }: { value: string }) {
  return <span className="block overflow-x-auto" dangerouslySetInnerHTML={{
    __html: katex.renderToString(value, { throwOnError: false, displayMode: false }),
  }} />;
}

/** The row's hover-revealed layout switcher. Replaces the old <select> — a
 *  native dropdown looked out of place among quiet bullet rows. Not a real
 *  <button>: Menu already wraps this in one. */
function LayoutMenuTrigger({ open }: { open: boolean }) {
  return (
    <span className={cx(
      "grid size-6 shrink-0 place-items-center rounded-[6px] text-[var(--faint)]",
      "hover:bg-[var(--surface-strong)] hover:text-[var(--muted)] transition-colors motion-reduce:transition-none",
      revealOnHover, open && "opacity-100 bg-[var(--surface-strong)] text-[var(--muted)]",
    )}>
      <ChevronRight size={12} aria-hidden className="rotate-90" />
    </span>
  );
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
        <li key={node.nodeId}>
          <div
            className="group flex items-start gap-1 rounded-[8px] py-[3px] pr-2 hover:bg-[var(--surface-soft)] focus-within:bg-[var(--surface-soft)]"
            style={{ paddingLeft: depth * 22 }}
          >
            <button
              onClick={() => patch(node.nodeId, { collapsed: !node.collapsed })}
              aria-label={node.collapsed ? "Expand" : "Collapse"}
              aria-expanded={!node.collapsed}
              tabIndex={kids.length ? 0 : -1}
              className={cx(
                "mt-[7px] grid size-4 shrink-0 place-items-center rounded-[4px] text-[var(--faint)]",
                "hover:bg-[var(--surface-strong)] hover:text-[var(--muted)] transition-colors motion-reduce:transition-none",
                kids.length ? revealOnHover : "invisible",
              )}
            >
              {kids.length > 0 && (
                <ChevronRight size={12} className={cx("transition-transform motion-reduce:transition-none", !node.collapsed && "rotate-90")} />
              )}
            </button>
            <span className="mt-[11px] size-[5px] shrink-0 rounded-full bg-[var(--faint)]" aria-hidden />

            <input
              value={node.text}
              autoFocus={focusId === node.nodeId}
              placeholder={depth === 0 ? "Heading or idea…" : "Type a point, or end with -- to make a card"}
              onChange={(e) => handleText(node, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") { e.preventDefault(); addSibling(node); }
                if (e.key === "Tab") { e.preventDefault(); indent(node, e.shiftKey ? -1 : 1); }
              }}
              aria-label={isCard ? "Card question" : "Bullet"}
              className={cx(
                "min-w-0 flex-1 bg-transparent px-1.5 py-[5px] text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]",
                depth === 0 && "font-display font-bold",
              )}
            />

            {isCard && node.answerLayout === "inline" && (
              <>
                <span className="mt-[3px] grid size-6 shrink-0 place-items-center text-[var(--primary)]" aria-label={`Card, ${node.cardTrigger}`}>
                  {Arrow && <Arrow size={14} aria-hidden />}
                </span>
                <span className="relative flex min-w-0 flex-[1.2] items-center">
                  <input
                    ref={(el) => { answerRefs.current[node.nodeId] = el; }}
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
                    className={cx(
                      "w-full min-w-0 rounded-[6px] px-1.5 py-[5px] text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]",
                      node.aiDrafted && "bg-[var(--primary-faint)]",
                    )}
                  />
                  {showSuggestion && (
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 px-1.5 text-[14px] text-[var(--faint)]">
                      <kbd className="rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-1 py-px text-[10px] font-semibold text-[var(--muted)]">Tab</kbd>
                      <span className="truncate">{suggestion.text}</span>
                    </span>
                  )}
                </span>
              </>
            )}

            {isCard && node.answerLayout === "children" && (
              <span className="mt-[3px] grid size-6 shrink-0 place-items-center text-[var(--primary)]" title="Answer is the indented list below">
                <ArrowDown size={14} aria-hidden />
              </span>
            )}
            {isCard && node.answerLayout === "block" && (
              <span className="mt-[3px] grid size-6 shrink-0 place-items-center text-[var(--primary)]">
                <LineChart size={14} aria-hidden />
              </span>
            )}

            {isCard && (
              <span className="mt-[3px] flex shrink-0 items-center gap-1">
                {node.aiDrafted && (
                  <span
                    title="AI draft — review before it counts"
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[var(--primary-faint)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--primary)]"
                  >
                    <Sparkles size={10} aria-hidden /> AI
                  </span>
                )}
                <Menu label="Change answer layout" align="end" trigger={(open) => <LayoutMenuTrigger open={open} />}>
                  {(["inline", "children", "block"] as const).map((layout) => (
                    <MenuItem key={layout} onClick={() => setLayout(node, layout)}>
                      {layout === "inline" && <ArrowRight size={14} aria-hidden />}
                      {layout === "children" && <ArrowDown size={14} aria-hidden />}
                      {layout === "block" && <LineChart size={14} aria-hidden />}
                      {LAYOUT_LABEL[layout]}
                    </MenuItem>
                  ))}
                </Menu>
              </span>
            )}
          </div>

          {isCard && node.answerLayout === "inline" && node.answerLatex && (
            <div className="mt-1 text-[15px] text-[var(--ink-soft)]" style={{ paddingLeft: depth * 22 + 30 }}>
              <InlineMath value={node.answerLatex} />
            </div>
          )}
          {isCard && node.answerLayout === "block" && (
            <div
              className="mt-1 mr-2 flex items-center gap-2 rounded-[10px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] px-3 py-2 text-[12.5px] text-[var(--muted)]"
              style={{ marginLeft: depth * 22 + 30 }}
            >
              <LineChart size={15} aria-hidden />
              <p>A diagram or graph answers this card — it will not fit on a line.</p>
            </div>
          )}

          {kids.length > 0 && !node.collapsed && <ul>{render(node.nodeId, depth + 1)}</ul>}
        </li>
      );
    });

  return <ul className="grid gap-px">{render(null, 0)}</ul>;
}
