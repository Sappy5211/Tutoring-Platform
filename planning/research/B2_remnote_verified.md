# Lane B2 — RemNote mechanics, verified against primary evidence

Status: DONE. Written by the **coordinator**, not a sub-agent (a delegated attempt stalled; the task was
bounded and judgment-dense, so it was pulled in-house).

**Why this file exists.** Lanes B and F both wrote their RemNote sections *before* two pieces of primary
evidence existed on disk: `corpus/remnote-ui-screenshots.md` (operator's own signed-in RemNote 1.28) and
18 genuine `corpus/rn-*.md` help-doc scrapes. Both lanes disclosed the gap honestly rather than bluffing.
This file supersedes their RemNote *mechanics* claims. It does **not** revisit Lane B's other decisions
(TipTap, the two-layer note model, offline strategy, the knowledge graph) — those stand.

Evidence grades: **[O]** read directly this session · **[I]** inferred · **[A]** assumed.

---
## 1. The verified flashcard syntax  [O — `corpus/rn-creating-flashcards.md`]

Every card is created by typing a trigger inside an ordinary bullet. This is the mechanism behind
"notes and flashcards are the same object".

| Trigger | Card type | Default direction |
|---|---|---|
| `>>` or `==` | **Basic** | forward |
| `<<` | Basic | reverse only |
| `<>` | Basic | bidirectional |
| `=-` | Basic | no cards generated (authored but inactive) |
| `::` | **Concept** (name ↔ definition; renders **bold**) | **bidirectional** |
| `:>` / `:<` | Concept | forward / reverse only |
| `;;` | **Descriptor** (property of parent concept; renders *italic*) | forward |
| `;<` / `;<>` | Descriptor | reverse / bidirectional |
| `{{ … }}` | **Cloze** — or select text and press `{` | n/a |
| `A)` after a Basic card | **Multiple-choice** | n/a |
| Ctrl/Cmd+click an image, or `/ioc` | **Image occlusion** | n/a |
| trailing `-` (e.g. `>>-`) | any of the above, created **disabled** | n/a |
| trigger tripled (`>>>`, `:::`, `;;;`) or Enter after the double | **Multi-line** variant | n/a |

Multi-line sub-types: children as a **bulleted** list = *Set* card (all items revealed at once);
children as a **numbered** list (`1.`) = *List* card (revealed one at a time).
Keyboard: `Ctrl+Alt+C` → Concept, `Ctrl+Alt+D` → Descriptor, `Ctrl+Alt+Q` → back to plain bullet,
`Ctrl+Alt+R` → toggle multi-line card item, `Ctrl+K` → omnibar. Slash commands `/tc`, `/turn into concept`,
`/multi-line card item`, `/ioc`. [O]

**Two mechanics nobody in the mission anticipated, both worth stealing:**
- **Ancestor context.** When practising a card, RemNote shows *all ancestor bullets* of the source
  bullet, so the prompt need not restate context. Concept card backs are **deliberately hidden** in that
  ancestor trail so they do not give away a child card's answer. [O]
- **Partial list/set cards.** If a student forgets one item in a Set card, RemNote spawns a *partial*
  card testing only that item, masters it separately, then restores the full list card. This solves the
  real pathology of list cards — that one weak item forces the whole list to be re-reviewed. [O]

---
## 2. RemNote's own pedagogical warnings — the most decision-relevant finding in this lane

RemNote's documentation argues **against** three of its own card types, and the three it warns about are
exactly the three an LLM generates most easily. [O — `rn-creating-flashcards.md`, `rn-multiline-list-set.md`]

- **Cloze:** surrounding wording makes recall "artificially easy"; also degrades searchability and
  cross-referencing. Recommended as "a small part of an overall learning strategy," not the default.
- **Multi-line / list:** "among the most difficult types of things to remember," because memory works by
  connections, not sequences. The docs quote Michael Nielsen arguing that mathematical proofs
  specifically are *not* well learned as linear lists — they are "interconnected networks of simple
  observations." **This is a direct warning for a maths product.**
- **Multiple choice:** "We don't recommend using multiple-choice cards for general-purpose learning" —
  fine for exam rehearsal against a question bank, harmful as the exclusive diet.

**Consequence for VIDYA, and it is a significant one.** Our AI note-to-flashcard generator will, left to
itself, produce a bank dominated by cloze and MCQ because those are the easiest to synthesise. That is
the cheapest thing to build and the worst thing to learn from. The generation prompt and the human
review gate (lane F §3.4) must therefore carry an explicit **card-type mix policy** — bias hard toward
Concept/Descriptor cards, cap cloze as a proportion of a topic's deck, and treat MCQ as exam-rehearsal
material tagged separately from the mastery deck. Lane F's quality gate currently checks correctness,
not pedagogical shape. **This is a gap to close before build.**

---
## 3. The Exam Scheduler — highest-value mechanic for the Indian market
[O — `corpus/rn-exam-scheduler.md`; UI placement from `corpus/remnote-ui-screenshots.md`]

`Exam` is a **first-class object created inside a folder** — the folder's `+` menu offers exactly
`Subfolder` and `Exam`. It is not a setting buried in preferences.

The design problem it solves, in RemNote's own framing: ordinary spaced repetition optimises retention
over an indefinite horizon; exam preparation optimises retention **at one specific moment**. It is
therefore a **complement to FSRS, not a replacement** — the base scheduler does most of the work and the
exam layer adds reviews or adjusts parameters. This reconciles cleanly with Lane C's FSRS choice: we
adopt it as a layer *on top of* `ts-fsrs`, and Lane C's engine does not change.

Five mechanisms [O]:
1. **Final Review Period** — one last review of *every* card immediately before the exam date, to push
   retrievability toward its peak on the day.
2. **Learning Period** — a brand-new card repeats until recalled successfully **twice**, establishing
   stability before the main scheduler starts spacing it.
3. **Ensure Mastery** — a failed card returns sooner and requires **two consecutive** successful recalls
   before being treated as learned again; concentrated practice on shaky material only.
4. **Catch-Up Period** — when the student falls behind, an **explicitly proposed** temporary increase to
   the daily goal, rather than silently rearranging the schedule.
5. **Exam Daily Goal** — a computed daily target derived from upcoming practice plus total remaining
   work, surfaced as its own section of the daily goal.

Useful calibration also stated in that doc: most SRS systems target 85–90% desired retention, and
because a card enters the queue at its *worst* moment, actual retrievability on a random card at a
random time runs higher — roughly 95% actual against a 90% target. [O]

**VIDYA spec.** Adopt all five, and make the Exam object the spine of the student experience rather than
an accessory. An Indian student's whole year is organised around a date: "CBSE Class 10 Boards —
14 Mar 2027", "JEE Main Session 1". The Exam object should carry: the exam date, the syllabus scope
(a set of curriculum nodes, per ADR-002), the derived daily goal, and a readiness estimate per chapter.
The home screen answers one question — *am I on track for the date?* Mechanism 4 (propose, never
silently rearrange) is a trust decision, not a UX detail: keep it.

---
## 4. Image occlusion  [O — `corpus/rn-image-occlusion.md`]

`Ctrl/Cmd+click` an image, or `/ioc` with a URL. Rectangular occlusions by default, plus a freeform
"tape" tool; occlusions can be merged, split, rotated, labelled, and grouped into areas. Options include
*Type in Labels in Queue*, *Hide All / Test One*, *Test In Sequence*, and auto-zoom. Works over images,
**PDFs, and handwritten documents**. AI can generate occlusions over a diagram's labels automatically —
and, notably, **OCRs the text under each occlusion in the same pass**, so typed answers can be checked
against the image's real text even when no back-side label was authored. It is a Pro feature, free for
5 images. [O]

**VIDYA verdict: ADOPT, but sequence it correctly.** Value is modest for Maths at launch (some use in
geometry, coordinate diagrams, graph reading) and very high for the Science subjects that follow —
anatomy, circuits, apparatus, organic structures. Build the data model for it in v1, build the UI when
Biology lands. The AI-occlusion-plus-OCR trick is the part worth copying, because it converts a diagram
into a checkable question with no authoring effort.

---
## 5. References, tags and portals — deferred, honestly

`rn-references.md`, `rn-portals.md` and `rn-refs-tags-portals.md` are in the corpus but were **not read
in full** in this pass. Lane B's ADAPT verdict on backlinks/portals stands unchallenged rather than
re-confirmed. Flagged as the one incomplete item here. **[A]**

Coordinator's position regardless: transclusion and bidirectional linking are *personal-knowledge-tool*
affordances whose value drops sharply when the corpus is an authored curriculum rather than a user's own
wiki. The equivalent need in VIDYA is served by the prerequisite graph (lane C) and "where else is this
taught" links generated from `skillTags` — not by user-authored backlinks. Treat portals as v2 at best.

---
## 6. Corrections to prior lanes

| # | Lane | What was assumed | What is actually true [O] | Impact |
|---|---|---|---|---|
| 1 | F §3.4 | `::` for concept cards, `{{…}}` cloze — written from general knowledge, disclosed as unverified | **Correct.** `::` and `{{…}}` are right. | None. Prior guess confirmed — promote from assumed to observed. |
| 2 | F §3.4, B §4 | Card-type inventory implicitly ≈ basic/cloze/MCQ | Six types with a **full direction-control grammar** (`>>`/`<<`/`<>`/`=-`, `:>`/`:<`, `;;`/`;<`/`;<>`), a disable suffix `-`, and a multi-line variant of each via tripling | Materially richer. The authoring schema needs a `direction` and `enabled` field per card, which neither lane modelled. |
| 3 | B §4 | Descriptor cards not distinguished from basic | **Concept vs Descriptor is a semantic pair** — bold concept, italic descriptor indented beneath it, different default directions, and concept backs hidden in ancestor context | Adopt the Concept/Descriptor Framework explicitly; it is the mechanic that makes cards composable with an outline. |
| 4 | B, F | Auto-generation quality gate framed around factual correctness | RemNote's own docs **warn against** cloze, list and MCQ cards — precisely what an LLM generates most readily | **New requirement:** a card-type mix policy in the generation prompt and the review gate. See §2. |
| 5 | B §4 | Exam scheduler treated as a feature among many | It is a **first-class object** and a **complement to FSRS**, with five named mechanisms | Promote to the spine of the student experience. See §3. |
| 6 | C | FSRS chosen as the scheduler | Compatible — the exam layer sits *on top of* FSRS and does not replace it | No change to lane C. Confirms its choice. |
| 7 | — | Nobody anticipated ancestor-context or partial list/set cards | Both exist and both are good | Add to the card-rendering and review-queue specs. |

---
## 7. Open questions
1. Does our card model need RemNote's full direction grammar at launch, or is
   `direction: "forward" | "reverse" | "both" | "none"` sufficient? (Coordinator: the latter — the
   grammar is *typing shorthand*, not a data requirement.)
2. Where does the Exam object live relative to the curriculum taxonomy — one per student, or a
   platform-published exam (e.g. "CBSE 2027 Boards") that students subscribe to? Coordinator leans
   published-and-subscribed, so syllabus scope is authored once. Needs an ADR.
3. Does the card-type mix policy get enforced at generation time, at review time, or both?

## 8. Could not verify
- References / tags / portals — corpus files present, not read in full this pass (§5).
- Whether RemNote's exam scheduler exposes its parameters to the user or only presets — the doc explains
  the design, not the settings surface.
- The `rn-fsrs.md`, `rn-flashcard-home.md`, `rn-ai-flashcards.md`, `rn-atomic-flashcards.md`,
  `rn-hints.md`, `rn-shortcuts.md`, `rn-latex-equations.md` and `rn-editor-overview.md` files are on disk
  and **unread in this pass** — a future session should mine them before finalising the authoring and
  review-queue specs. They are the cheapest remaining source of product detail in the whole corpus.
