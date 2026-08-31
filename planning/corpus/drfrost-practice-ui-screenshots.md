# Dr Frost Maths — practice/question UI, observed from operator screenshots (2026-08-31)

PRIMARY evidence: two screenshots of a live Dr Frost practice task, supplied by the operator.
Outranks `drfrostmaths.md` (a marketing-homepage scrape). This is the closest thing in the whole corpus
to the interaction VIDYA's practice player must deliver.

## Screenshot 1 — question state

**Top chrome:** dark navy app bar, `df` logo left, a pencil/annotate icon right (whole-screen scribble —
students work out maths by hand; the tool gives them somewhere to do it).

**Task progress rail:**
- A thin horizontal progress bar with a numeric `40%` label, and `Exit task` as a plain text link.
- **A question navigator: `Q1 … Q10` as discrete tabs.** Completed questions are filled lime-green;
  the current question (`Q5`) is filled dark navy; unattempted ones are plain white/grey.
  So state is encoded by fill colour, and the student can see the whole task shape at a glance.

**Question card** (white, rounded, centred, generous padding):
- **A skill code and title line: `201a Change the subject of a linear formula requiring a single step.`**
  The numeric code is exposed to the student, not hidden. This is the curriculum taxonomy surfacing in
  the UI — it tells the student exactly which micro-skill is being tested, and it is granular
  ("requiring a single step" is its own skill, distinct from multi-step rearrangement).
- **`Watch video ▷`** on the same line, right-aligned — per-skill remediation is one click from the
  question, not buried in a separate notes area.
- Prompt in plain language: "Make x the subject of the formula:", then the formula in rendered maths
  on its own line: `x − 5 = 9y`.
- **The answer row is a maths field, not a text input:** `x = [ 9y| ]` with a small pencil affordance
  inside the field. The `x =` is rendered as static maths *outside* the input, so the student supplies
  only the right-hand side. Input renders as live typeset maths while typing.
- A single prominent lime-green **`Submit Answer`** button.

**On-screen maths keyboard** (docked to the bottom, dark grey, replaces the OS keyboard):
- Left cluster — variables and symbols: `x` `y` `e` `π` · `√☐` `∛☐` `a²` `a^☐` · `<` `>` `≤` `≥` ·
  `(` `)` `!` `θ`
- Middle cluster — numeric pad: `7 8 9` `☐/☐` (fraction) · `4 5 6` `×` · `1 2 3` `−` · `0` `.` `=` `+`
- Right cluster — edit keys: backspace `⌫`, cursor left `←`, cursor right `→`, enter `↵`
- Far-right vertical tab strip switching keyboard layers: **`Main` · `ABC` · `Funcs` · `Symbs`**

The fraction, root and power keys insert *templates with empty boxes* (`☐/☐`, `√☐`, `a^☐`) that the
cursor then moves between — this is MathLive/MathQuill-style structured entry, not string typing.

## Screenshot 2 — post-submission state

- The answer field retains the submitted answer (`9y + 5`) and `Submit Answer` is greyed/disabled —
  the submission is frozen, not cleared.
- **A comment box appears: "You can optionally leave a comment for your teacher about this
  question/your answer. Press Alt+Equals to insert mathematical expressions."** with a `Send` button.
  → **This is a direct student→teacher escalation seam attached to a specific question.** Note it accepts
  maths input too, via a keyboard shortcut.
- **A full-width lime `✔ Correct` banner** — large, unmissable, colour-coded.
- **The worked solution is shown, and it is shown as steps, not just an answer:**
  - `The answer is x = 9y + 5` (bold restatement)
  - `① Add 5 to both sides to isolate x.` — a numbered step with a plain-English *reason*
  - Then the algebra rendered with **visual annotation**: the equation `x − 5 = 9y` with
    `+5 ↓` marked under both the left and right sides, and the result `x = 9y + 5` beneath.
    The transformation is shown *acting on* the equation, not merely restated.
  - A scrollbar on the solution panel indicates further steps/content below.
- Footer actions: **`Continue later`** (plain text link) and **`Next question`** (dark filled button).
- Faint confetti particles are visible around the banner — a brief celebratory moment on correct.

## Transferable decisions for VIDYA

1. **Question navigator as discrete numbered tabs with colour-coded state** — adopt. Cheap, and it makes
   task length and progress legible, which matters for a student deciding whether to start a session.
2. **Expose the skill code and a precise skill title on the question.** Adopt — it is the curriculum
   taxonomy (ADR-002 `Skill`) doing visible work, and it makes "why am I being asked this" answerable.
3. **Per-skill remediation link directly on the question** (`Watch video`). Adopt as "Read the notes" /
   "Ask the tutor about this skill" — our equivalent of the video, wired to `Skill.contentRefs`' derived
   index and the AI tutor's block context.
4. **Structured maths entry with a custom on-screen keyboard, layered (Main/ABC/Funcs/Symbs).** Adopt.
   Confirms lane B's MathLive recommendation, and the layer-tab pattern is the answer to "how do you fit
   a maths keyboard on a phone."
5. **Static `x =` outside the field, student supplies only the RHS.** Adopt — it removes a whole class of
   false-negative grading (student writes the full equation when the key expects an expression).
6. **Frozen submission + persistent worked solution + explicit `Next question`.** Adopt. The student
   controls advancement; the solution does not vanish.
7. **Steps carry a plain-English reason AND an annotated transformation**, not just restated algebra.
   Adopt — this is the difference between showing an answer and teaching a method.
8. **Per-question comment-to-teacher.** Adopt, and note it is a natural, low-friction feed into the
   teacher-call escalation funnel (ADR-001's moat) — a question a student flagged is exactly the context
   a teacher should receive before a call.
9. Whole-screen annotate/scribble affordance — defer past v1, but note it: students do maths on paper,
   and the tablet-scribble path is why Dr Frost puts a pencil in the top bar.
