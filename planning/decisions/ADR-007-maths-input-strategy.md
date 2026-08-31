# ADR-007 — Maths input: build a constrained editor, don't ship MathLive at launch

Status: ACCEPTED. Date: 2026-08-31.
Trigger: lane P1 (`research/P1_practice_player_spec.md`) measured MathLive's real bundle cost.
**Amends the stack decision in `MASTER_PLAN.md` §4 and lane B §2, and pre-empts packet `P0.1b`.**

## Context — a measured fact that breaks a stated budget

Lane P1 did the right thing: rather than cite a bundle size, it fetched MathLive and gzipped it. The
coordinator then verified independently, from a different fetch:

| Library | gzipped | Role |
|---|---|---|
| **MathLive** (maths *input*) | **211 KB** | recommended by lane B |
| **KaTeX** (maths *rendering*) | **73 KB** | required regardless — notes, questions, solutions |
| MathQuill 0.10.1 (older input alternative) | 21 KB (**+ jQuery ≈30 KB**) | — |

`MASTER_PLAN.md` §4 sets a hard budget of **≤200 KB gzipped initial JS**, enforced as a CI gate.
**MathLive alone exceeds the entire application budget.** With KaTeX it is 284 KB before a single line of
React, TipTap, router, or product code.

## Why this was missed, which matters more than the number

Lane B chose MathLive when the launch curriculum was **CBSE Class 9–10** — a band where students really do
enter surds, indices, and rearranged algebraic expressions, and a full WYSIWYG maths editor is defensible.

**ADR-005 then moved the launch to CBSE Class 6–8, and nobody revisited the input decision.** The
curriculum requirement shrank by an order of magnitude; the library did not. This is a general lesson worth
recording: when a scope decision changes, the decisions *downstream* of the old scope need an explicit
re-check, because they will not fail loudly — they will just quietly be wrong.

## What Class 6–8 maths input actually requires

Essentially the whole answer space for CBSE Class 6–8 Mathematics:

integers and negatives (`42`, `-7`) · decimals (`3.75`) · fractions (`3/4`) and mixed numbers (`2 1/3`) ·
ratios (`3:4`) · percentages (`25%`) · simple linear expressions (`2x + 6`, `x = 5`) · small integer
powers (`3²`) · square roots of perfect squares · units (`cm`, `cm²`, `kg`) · a handful of geometry
symbols (`°`, `∠`, `π`).

No calculus. No matrices. No chemistry notation. No arbitrary LaTeX. MathLive is built for a problem we do
not have for at least a year.

Note also that the reference product does the same thing: the Dr Frost keyboard
(`corpus/drfrost-practice-ui-screenshots.md`) is a **purpose-built, layered, constrained** keyboard — not a
general maths editor's default UI.

## Decision

**Build a constrained structured maths input for Class 6–8. Do not ship MathLive at launch.**

1. **Rendering stays KaTeX** (73 KB), which we need anyway for notes, questions and worked solutions.
   Input and rendering are separate problems and only rendering is already solved.
2. **Input is our own component** — a controlled editor over a small, explicit grammar, emitting a
   **constrained LaTeX subset** that KaTeX renders for live preview. Budget it at ≈15–25 KB of our own
   code. It owns: a numeric pad, a fraction template (`☐/☐`) with placeholder navigation, mixed numbers,
   sign toggle, decimal point, the variable keys, `=`, ratio `:`, `%`, small powers, √, and a units layer —
   matching the Dr Frost layer pattern (Main / ABC / Funcs / Symbs) scoped down to this grade band.
3. **The static-prefix pattern is retained** (`x =` rendered outside the field; the student supplies only
   the right-hand side). This removes a class of false-negative grading and shrinks what the input must
   parse.
4. **The emitted LaTeX subset is a defined, versioned grammar** — written down, with a parser/validator,
   because it is the contract between the input, the grading ladder (`GradingMethod`, ADR-002) and the
   answer key. An input that can emit arbitrary LaTeX is an input the grader cannot make promises about.
5. **MathLive is not deleted — it is deferred and isolated.** When Class 9–10 arrives, or if a question
   type genuinely needs free-form maths, MathLive loads **lazily, on the practice route only, behind a
   dynamic import**, and never enters the initial bundle. The input component exposes one interface;
   swapping implementations behind it is an implementation change.

**Rejected: MathQuill.** 21 KB is attractive, but it requires jQuery (~30 KB, a dependency we otherwise
have no use for), is effectively unmaintained, and its accessibility story is materially worse than
building our own with real ARIA — which matters for a product serving children and claiming WCAG 2.2 AA.

**Rejected: ship MathLive lazy-loaded and call it solved.** Lazy loading fixes the *initial* bundle gate
but still lands 211 KB on the practice route — the single most-used screen in the product — on a
₹10–15k Android over 3–8 Mbps. Per lane E's own note, parse/execute on a low-end CPU costs roughly 1s per
170 KB, so this is a multi-second penalty on the core loop, not a download blip. Passing the CI gate while
making the main screen slow would be gaming our own metric.

## Consequences

1. `MASTER_PLAN.md` §4's stack line and lane B §2's maths-input recommendation are **superseded** by this
   ADR. Lane P1's spec is adopted *except* that its `MathAnswerField` wraps our component rather than
   MathLive; **its keyboard layout work stands and is directly reusable**, since it was already scoped to
   Class 6–8 and to the Dr Frost layer pattern.
2. New Phase-0 packet **`P0.7` — the constrained maths input**, with its grammar written down first.
   It is on the critical path for Tranche B and should start early.
3. `P0.1b` (bundle spike) is **partly pre-empted**: the maths numbers are now measured and recorded here.
   The spike still runs, for TipTap + `motion` + the router + product code, and still has authority to
   stop the build if the remainder breaches.
4. **Accessibility is now ours to get right**, not inherited from a library. The grammar being small is
   what makes this tractable: every key gets a real label, and the whole input is keyboard-operable.
5. **A real risk, stated plainly:** we are building a text-entry component for children, and input
   components are deceptively hard (IME behaviour, mobile carets, selection, undo). The mitigation is the
   deliberately tiny grammar and the escape hatch in §5 — if the constrained input proves worse than
   MathLive in real use, we lazy-load MathLive behind the same interface and accept the cost. **Revisit
   this ADR if `P0.7` overruns, rather than expanding the grammar to rescue it.**

## Open questions
1. Exact grammar for mixed numbers and units — needs one pass over real CBSE 6–8 answer keys once `P0.6`
   has seeded the curriculum. Do not guess it in advance.
2. Does handwriting/photo input (lane D's OCR path) become the better answer for younger students than any
   keyboard? Plausible, and worth a look after v1 — not a launch dependency.
