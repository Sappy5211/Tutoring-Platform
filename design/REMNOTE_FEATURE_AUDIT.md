# RemNote feature audit — RN-DEEP

Status: DONE. Lane RN-DEEP, run independently of lane B2/P3/IA_RESTRUCTURE. **Read those three first** — this
file does not repeat their content and assumes their verdicts stand. In particular:

- Flashcard syntax, the Concept/Descriptor Framework, the Exam Scheduler's five mechanisms, and the basic
  image-occlusion workflow are **covered in `planning/research/B2_remnote_verified.md`** and not re-argued
  here except where this pass found materially more detail.
- Anki-derived review mechanics (queues, leeches, siblings, deck options) are covered in
  `planning/research/P3_anki_mechanics.md`.
- The signed-in product UI (nav, Create menu, editor toolbar) is covered in
  `planning/corpus/remnote-ui-screenshots.md`.

**Audience test applied throughout:** VIDYA's users are 11–14-year-olds (CBSE Class 6–8) working a
**fixed, externally-set syllabus**, mostly on **phones**, mostly **not self-directed**. RemNote's actual
users are self-directed adults (med students, PhD candidates, knowledge-management enthusiasts) building
a **personal, open-ended knowledge base**. That mismatch is the lens for every verdict below: a lot of
RemNote's surface exists to serve a kind of user and a kind of content VIDYA does not have.

Evidence grading: **[O]** = observed directly in a primary source this session · **[I]** = inferred from
observed evidence · **[A]** = assumed, flagged as such. All dates below are **2026-09-02**, the day this
lane's sources were read, unless a source's own byline is quoted.

**Sourcing.** 27 `help.remnote.com` articles were scraped fresh for this lane (domain `map`ped first per
the discipline `planning/corpus/_DEAD_FILES_README.md` already established; none were 404s or stubs) and
read in full. Per this lane's scope — own exactly one file, touch nothing else in the repo — those raw
scrapes were **not** committed to `planning/corpus/`; they live only in this session's scratch space and
are cited below by article title and `help.remnote.com` article ID so a future session can re-fetch any of
them directly. Pre-existing corpus files (`remnote.md`, `remnote-pricing.md`, `remnote-ui-screenshots.md`,
the `rn-*.md` set, scraped 2026-08-31) supply everything already re-used from B2/P3's evidence base. Every
claim below cites its source inline.

---
## 1. PDF / document annotation — the RemNote Reader

[O — `help.remnote.com/en/articles/6690975` (Learning from PDFs and Files with the RemNote Reader),
`6690972` (Uploading PDFs), `7925615` (Supported File Types)]

**What it does.** A three-pane split view: Notes pane (student's own notes/flashcards) + PDF in the
centre + a right sidebar with four tools — **Learn PDF** (Guided Learn Mode: breaks the document into
sections, generates a summary, flashcards and a quiz per section, sequenced by how well the student
already claims to know it), **AI Tutor** (chat scoped to the PDF, can see the document and cite page
numbers), **Summary** (an AI-written outline of the whole document with per-point flashcard buttons), and
**Highlights** (a flat list of every highlight made). Annotation itself: click-drag text highlights or
Ctrl-drag area highlights (area highlights copy an *image* of the region, useful for tables/diagrams);
pasting a highlight into notes offers **Reference** (live link, text unhideable), **Pin** (icon only, no
text), **Text with Pin** (editable copy + link), plain **Text**, or **Source**. A highlight's own toolbar
offers **AI Cards** (suggests flashcards from that passage), **Explain** (one-shot AI gloss), and colour
tagging. **Run OCR with AI** repairs PDFs with no text layer so they become highlightable/searchable.
RemNote auto-converts 60+ non-PDF formats (docx, pptx, epub, even `.tex` and `.svg`) to a PDF on upload,
so "PDF annotation" is really "annotate almost any document type." **Text Reader mode** reflows a PDF into
a clean, centred, font-adjustable reading view with **text-to-speech** (English only [O]) that highlights
words as it reads and lets a student tap any sentence to start audio from there.

**Usefulness for 11–14-year-olds on a fixed syllabus — sceptical read.** The annotation UI (drag-select,
colour-code, area-highlight, pin-vs-reference) is built for someone annotating a *dense, information-rich
source they chose* — a 40-page research paper or lecture slide deck — and deciding which fragments matter.
A CBSE Class 6–8 maths student's primary material is **not** an unstructured PDF they're mining for
insight; it's the platform's own authored, already-atomised curriculum content (notes/practice/flashcards
per ADR-002/003). Full annotation tooling would be solving a problem VIDYA's content model has already
solved upstream. Two pieces are genuinely valuable regardless: (1) **Guided Learn Mode as a pattern** —
break-into-sections, sequence by prior familiarity, generate summary+cards+quiz per section — is close to
what a "chapter walkthrough" mode should feel like, and (2) **OCR-into-flashcard on a photographed
textbook page or worksheet**, because Indian students frequently work from a physical NCERT textbook or a
teacher's printed worksheet, not a platform-authored PDF.

**Verdict: ADAPT, narrowly.** Reject full PDF annotation as a *core* student-facing feature — it recreates
tooling built for the wrong content shape and adds real UI weight per §7 (RemNote's own reader has a
three-pane layout, a persistent toolbar, and a `...` menu with a dozen sub-options; that is far past what
a Class 7 student should have to learn). Adopt the narrow slice: a **"Scan a page" → OCR → suggested
flashcards** pipeline for content students bring in themselves (a worksheet photo, a textbook page their
school is using that isn't yet in VIDYA's authored corpus), reusing the same photo-capture affordance
already scoped for the mobile app.

**Interaction sketch.** From the Learn hub, a `+ Add from a photo` action (camera icon, mobile-first) →
device camera opens → capture → RemNote-style auto-crop/align → server-side OCR → the extracted text is
shown with a single **"Generate practice questions from this"** button that routes into the existing
AI-flashcard-generation pipeline (lane F), tagged `source: student_upload` and kept in a personal layer
per the two-layer model (B2 §5) — never mixed into the authored mastery deck without a review gate.

---
## 2. Image occlusion — beyond the basics B2 already covered

[O — `help.remnote.com/en/articles/6511625` (Image Occlusion Cards) — this is a fuller read than B2 §4,
which was based on `corpus/rn-image-occlusion.md`'s summary; this pass read the full 211-line article.]

Beyond the "rectangular box, AI-generate, OCR the hidden text" basics B2 already recorded, the mechanism
has real depth:

- **Occlusion tape** — freeform stroke instead of a preset shape, for irregular regions (works on images,
  PDFs, *and* handwritten documents identically). [O]
- **Occlusion areas** — each individual occlusion can define its own cropped viewport shown during
  practice, so ten cards generated from one large diagram each zoom to just their relevant region rather
  than showing the whole (possibly answer-leaking) image every time. [O]
- **Merge / split** — multiple occluded regions can be merged into one card (tested together) or split
  back apart, with lettered groups shown in the editor. [O]
- **Test In Sequence** — a diagram's occlusions can additionally (or instead of individual cards) become
  one ordered "name each part in sequence" card, a genuine list-answer variant scoped to a single image. [O]
- **Hide All / Test One vs. show-only-the-tested-box** — a real pedagogical choice: hiding every label
  simultaneously (only the target shown in blue) is harder and closer to a real labelling task; leaving
  the rest visible is closer to a targeted recall prompt. A hint affordance (eye icon) reveals the other
  labels on demand mid-review. [O]
- **PDF/handwritten-native occlusion** — occluding a diagram *inside* a PDF or handwritten note (not just
  a standalone uploaded image) loads the source document alongside the card in the review queue, so a
  student who forgets can scroll back to the page it came from without leaving practice. [O]
- **Type in Labels in Queue** — combines with the AI+OCR trick from B2: even with no manually authored
  back-label, the OCR'd text under the box becomes the answer key for a type-in-answer card. [O]

**Usefulness for VIDYA, sceptical.** For Class 6–8 CBSE maths specifically the diagram surface is real but
narrower than in Biology/Chemistry: labelled geometric figures (parts of a circle, angles in a triangle,
coordinate-plane axes), number-line diagrams, and bar/pie charts in the statistics chapters. It is a
smaller slice of the curriculum than B2 already implied, but the *mechanics* that matter most for that
slice are specific: **occlusion area** (so a card about "what is the radius" doesn't also show the diagram
labelled "diameter" three pixels away) and **PDF-native occlusion** (so a scanned NCERT diagram doesn't
need re-uploading as a bare image first).

**Verdict: ADOPT the mechanics named above, on the timeline B2 already set** (data model in v1, UI when a
visual-heavy subject — likely Science — lands; geometry gets partial use at launch). Reject "Test In
Sequence" and "Hide All/Test One" as user-facing *toggles* — bake in one sensible default (show only the
tested region, occlusion-area-cropped) rather than exposing a settings menu to a 12-year-old.

**Interaction sketch.** A geometry diagram block carries an `occlusions: [{ id, shape, area: {crop-box},
label, cardId }]` array. Authoring is teacher/content-team-only (per B2's author/student split): draw a
box, the system auto-crops to a sensible padding around it as the default occlusion area, auto-generate
the card, human reviews before it enters the mastery deck.

---
## 3. Tables and databases as blocks

[O — `help.remnote.com/en/articles/8070716` (Tags, Properties, Templates & Tables in 5 Minutes), `13867819`
(Simple Tables), `13869521` (Advanced Tables), `8126585` (Properties), `13869879` (Generating Flashcards
from Tables)]

**What it does.** Two table types. **Simple Tables** are standalone grids (paste from Excel/Sheets, paste
a screenshot and AI-convert it to a table, or build by hand) — pure layout, no cross-document linking.
**Advanced Tables** are the real mechanism: under the hood, a table is a **tag** — each row is a bullet
carrying that tag (a Concept), each column is a **property** of the tag (a Descriptor), and rows that live
*outside* the table (tagged the same way elsewhere in the knowledge base) still appear in it, so a table
can function as a live, aggregating dashboard over content authored anywhere. Properties are typed (Text,
Number, Checkbox, Date, Single/Multi-select, Image, URL), and AI can **autofill a column** for every row
from the row's name, or **suggest an entire table's columns and rows** from just a title. Flashcards
generate directly from table columns: **each row's Name is a Concept, each other column a Descriptor**,
with per-column direction control (forward/backward/both/none — e.g. "phase at STP" makes sense to ask
forward-only, since knowing an element's phase doesn't help you recall its name), extra columns can be
shown as a front-of-card hint or a back-of-card "extra detail," and a **Show Entire Table** review mode
tests one cell at a time while the whole table stays visible for context, with each cell scheduled
independently by the spaced-repetition engine.

**Usefulness for VIDYA — this is a genuinely strong fit, more than the brief's scepticism anticipated.**
CBSE Class 6–8 maths has a real, recurring content shape that is exactly what an Advanced Table models:
**multiplication tables, unit conversion tables, formula sheets (area/perimeter/volume by shape), squares
and square roots, HCF/LCM worked reference tables, the properties-of-quadrilaterals summary table**. Each
of these is naturally "one row per item, a fixed set of typed columns," and the per-cell independent
scheduling is the correct pedagogy: a student who knows 7×8 cold but not 7×9 should not have the whole
times-table card re-shown, exactly the sibling-burying/atomicity principle P3 and B2 already established,
here applied to structured reference data instead of prose notes.

**Verdict: ADOPT**, and treat it as a first-class authoring primitive for VIDYA's content team, not a
power-user curiosity. Reject the general-purpose "build any table with AI-suggested columns" authoring UI
for students — that's an authoring-time tool, and per the two-layer model students should consume
pre-built tables, not construct their own schema. Reject exposing raw property-type configuration
(Single-select vs Multi-select vs URL) to anyone but the content team.

**Interaction sketch.** A `ReferenceTable` content block type: `{ name, columns: [{key, type, cardable,
direction}], rows: [...] }`, rendered in the Learn hub as a normal table with a "Practice this table"
button that pulls each cardable cell into the existing review queue, tagged with `skillTags` from the
parent topic (so a "Squares 1–20" table's cards feed the same prerequisite graph as everything else, per
B2 §3's VIDYA spec). Per-cell FSRS state, not per-table.

---
## 4. Templates and Powerups — the reusable-structure mechanism

[O — `help.remnote.com/en/articles/8117687` (Templates), `7897630` (Powerups)]

RemNote actually has **two** distinct mechanisms the brief bundled as one:

- **Templates** are boilerplate content attached to a tag: a set of bullets (which can include
  properties) that get pasted under any bullet when the tag is applied, either by searching the template
  by name in `##` tag search, by an **auto-apply** default (one template per tag can be marked to insert
  automatically the moment the tag is added), or from a top-of-document template selector. A tag can carry
  several templates for different sub-cases (e.g. a "Fiction Author" vs. "Scientific Author" template
  under one "Author" tag, each adding different properties). [O]
- **Powerups** are smaller, built-in behaviours attached to a *single bullet* — highlight colour, todo
  state, heading level, "Extra Card Detail" — each storing hidden **slots** (e.g. Todo has a
  Finished/Unfinished slot) that can be searched on. Plugin-defined powerups are implemented as tags under
  the hood, which is why they interoperate with the tag/table system. [O]

**Usefulness for VIDYA.** Templates-as-authoring-scaffolding is exactly the mechanism a curriculum team
needs and doesn't yet have named: a "Worked Example" template (Problem / Steps / Answer / Common Mistake
headings, auto-applied), a "Theorem" template (Statement / Proof outline / Example / Practice Qs), a
"Chapter Topic" template. This is an authoring-side win, not a student-facing feature — a Class 7 student
should never see a "create template" affordance. Powerups are lower-value for VIDYA specifically because
our card types and states (direction, enabled, leech-flagged) are a fixed, small, already-decided schema
(B2 §7's open question 1) rather than an open-ended extensibility surface; we don't need a general
slot-and-powerup system to express five known fields.

**Verdict: ADOPT templates (author-side only). REJECT powerups as a generalised mechanism** — implement
the handful of bullet-level states VIDYA actually needs (todo-like "flagged for teacher," disabled,
leeched) as fixed fields on the content model, not as a pluggable powerup system; building the general
mechanism would be solving for an extensibility need VIDYA's fixed CBSE syllabus doesn't have.

**Interaction sketch.** Content-authoring console: a `ContentTemplate` entity (`{name, appliesToTopicType,
blocks: [...], autoApply: bool}`) that a curriculum author selects when creating a new topic page, one per
recognised pedagogical pattern (Worked Example, Theorem, Definition, Practice Set). No runtime UI for
students.

---
## 5. Search, filtering, and the omnibar

[O — `help.remnote.com/en/articles/6964961` (RemNote Query Language), `7852647` (Using the Omnibar)]

**What it does.** Three layered search surfaces. **Ctrl+P global search** navigates to documents/bullets
by name (and understands natural-language dates for daily documents — "yesterday," "1 year ago"). **Ctrl+K
omnibar** is a command palette: type a description or a learned "shortcode" and it runs any RemNote
function, contextually scoped to selected bullet(s) if any are selected first; the `/`-menu is its subset
restricted to single-bullet, current-position actions. **The query language** (used to define **search
portals** — live, saved, auto-updating views) is a real small query language: connection operators
(`Has Reference To`, `Is Tagged With` with tag-inheritance, `In Document`, `Descendant Of`, `Any Connection
To`), powerup/slot predicates (`hasPowerup "t"`, `hasPowerupSlotValue "t" "s" "Unfinished"`), text-contains
search, bullet-type filters, and full boolean composition (`and`/`or`/`not`, grouping) — available either
as raw syntax or through a visual query builder aimed at non-technical users.

**Usefulness for VIDYA, sceptical.** A query language with reference/tag/portal/boolean operators is
solving the problem of **finding things in an open-ended, self-authored knowledge base** — exactly the
problem VIDYA's fixed-syllabus, platform-authored content structure doesn't have. A Class 7 student is not
going to write `#Geometry and not hasPowerup "leech"` — nor should they ever need to. The **omnibar
pattern**, though, generalises well beyond search: a fast, typeable command palette scoped to "what am I
looking at right now" is a genuinely good power-user affordance, and RemNote's framing of it as a subset
relationship (`/`-menu ⊂ omnibar ⊂ all actions) is a clean design worth copying for VIDYA's own eventual
teacher/author console.

**Verdict: REJECT the query language as student-facing** — it is a self-directed-knowledge-worker tool.
**ADOPT the omnibar concept, but retarget it**: not general search, but a fast "jump to" and "do a thing"
palette for **teachers and content authors** (jump to a topic, open a student's progress, flag a card),
where the query-builder's boolean predicates over `skillTags`/mastery-state genuinely earn their keep
("show me all students below 70% mastery on Fractions who haven't practiced in 5 days" is a real teacher
need, unlike a student-facing query language). **REJECT** building any of this for the student surface at
launch; student search should be syllabus-tree navigation (Chapter → Topic) plus a simple text box, per
the IA_RESTRUCTURE verdict on rejecting flat recency-ordered libraries.

**Interaction sketch.** Teacher console: `Cmd+K` opens a palette pre-populated with recent students/topics;
typing a partial boolean expression against a small fixed vocabulary (`mastery<`, `topic:`, `inactive>`)
resolves through the same visual-builder-first, raw-syntax-optional pattern RemNote uses, but the
vocabulary is VIDYA's own five or six teacher-relevant predicates, not a general-purpose query grammar.

---
## 6. The daily note / journal

[O — `help.remnote.com/en/articles/6752031` (Daily Documents)]

**What it does.** An automatically-created, date-stamped document, one per calendar day, reachable via a
sidebar "Today's Note" entry or `Alt+D`. It's positioned explicitly as a catch-all ("start here if you're
not sure where something goes") and a scheduling surface (a template can turn it into a daily
class-schedule tracker; typing `!!` inserts a reference to any date, past or future, with backlinks so
"everywhere I mentioned this date" is visible from the date's own page). RemNote's own suggested-uses
section is telling: for students, it's a scratch pad for in-the-moment notes and a place to jot down
assignments as todos; for researchers, a place for stray ideas to land before being organised; in the
workplace, a meeting/deadline tracker. [O]

**Usefulness for VIDYA — reject, and for a specific reason.** The daily note solves the "I don't know
where to put this yet, and I need a home for open-ended, self-generated content that arrives in an
unpredictable stream" problem. VIDYA's content stream runs the other way: the platform pushes structured,
pre-organised work at the student (today's review queue, this week's topic) rather than the student
generating loose notes that need a temporary home. A blank date-stamped page is an *empty-canvas* pattern,
and B2/IA_RESTRUCTURE have already converged on the opposite: a **dashboard of specific widgets** (today's
task, review queue, streak, exam countdown), not a page the student has to decide what to do with. Adding
a daily note would reintroduce exactly the "too much faff, too many places to look" problem the IA
restructure was written to fix.

**Verdict: REJECT.** The one mechanism worth salvaging isn't the daily *note* — it's the **date-as-anchor
backlink pattern** (`!!` referencing a date, with "everywhere this date was mentioned" surfaced on the
date's own page), and VIDYA already has a stronger, purpose-built version of that idea: the **Exam object**
from B2 §3, which is a date with a syllabus scope and a derived daily goal, not an empty page.

---
## 7. Sharing, publishing, and collaboration

[O — `help.remnote.com/en/articles/6030805` (Sharing Your Notes), `6689499` (Collaboration and Shared
Knowledge Bases), `7727218` (How to Publish a Great RemNote Document)]

**What it does.** Three sharing modes from any document/folder's Share button: publish to the public
**Community** (anyone can find it), **share with a link** (unlisted, link-holders only), or **share to a
Group** (members only). Sharing snapshots the document at that moment; re-sharing updates the same link
rather than creating a new one, so authors can edit privately and push updates deliberately. Separately,
**Collaboration** lets a Pro-plan owner invite others (who can be on the Free plan) into a **shared,
synced knowledge base** with real-time simultaneous multi-user editing, Admin vs. Member roles (Admins can
delete/rename the KB and manage membership; both roles can otherwise edit anything — no view-only role
exists yet [O]). RemNote's own guide on writing a *good* shared document pushes authors toward
atomic/Concept-Descriptor cards for the same reasons B2 §2 already documents — evidence the pedagogical
principles are treated as a publishing-quality bar, not just internal advice.

**Usefulness for VIDYA, sceptical.** This entire surface assumes **peer-to-peer, opt-in content sharing
between independent users** — a classmate sharing a flashcard deck, a study group co-editing a knowledge
base. VIDYA is a top-down authored-content platform: students consume a curriculum the platform (or their
school's licensed teacher) publishes, not content their peers author. Real-time collaborative editing
between 12-year-olds sharing a "knowledge base" is not a shape this product has, and building it invites
exactly the moderation/safety surface (open sharing, group invites, real-time multi-user documents between
minors) a children's education product should actively avoid rather than adopt.

**Verdict: REJECT peer sharing and student-to-student collaboration entirely.** There is one legitimate,
narrow analogue: a **teacher publishing/updating a class-specific note or worksheet** to their assigned
students — closer to RemNote's "share a snapshot, re-share to push an update" link model than to open
Community publishing or peer collaboration. Even that should be scoped to the existing teacher-student
relationship (ADR-001's moat), never open sharing.

**Interaction sketch, for the one salvaged case.** A teacher's "Assign to my students" action on a
content block snapshots it and pushes to the specific students in that teacher's roster; re-assigning
updates in place (same mechanism as RemNote's re-share). No public link, no group invites, no student-side
share button.

---
## 8. Import / export, and what an Anki `.apkg` round-trip actually preserves

[O — `help.remnote.com/en/articles/7898005` (Importing Notes), `7898019` (Exporting Notes), `6751471`
(Importing from Anki), `8664083` (Switching from Anki to RemNote)]

**Import.** RemNote imports its own `.rem`/`.db` backups, and has named importers for many external note
and flashcard apps (clicking an import type shows app-specific instructions). Anki import specifically:
export an `.apkg` from Anki with scheduling info, deck presets, and media included; RemNote's importer
successfully brings across **basic, cloze, and both native and Image-Occlusion-Enhanced image-occlusion
note types, and most custom note types**, and **preserves the review-history/scheduling data**, converting
it to RemNote's own scheduler state. **Named limitations** [O]: heavy custom CSS on a note type is
dropped; custom JavaScript-driven note types (some TTS-on-the-fly cards) don't render; image-occlusion
note types must keep their original field names to import correctly; the importer's tag picker caps at
2,000 tags shown (workaround: pre-filter in the Anki browser and export just the filtered selection).
Critically, **imported cards never flood the daily queue** — they land in a separate "Need to Learn" queue
the student advances into at their own pace, the same mechanism used for AI-generated cards (§ below).

**Export.** A document or the whole knowledge base can export to: RemNote's own complete format (lossless
round-trip, but excludes locally-hosted images/PDFs), OPML, **Anki `.apkg` (flashcards only)** — bullets
with no cards are dropped, hierarchy is flattened into the card's visible context to preserve meaning
outside RemNote, and multiple-choice cards bold the correct answer inline since Anki has no native
equivalent — HTML, Markdown, or plain text.

**Usefulness for VIDYA.** Import/export in the RemNote sense (personal knowledge base portability between
competing PKM tools) is not VIDYA's problem — students aren't migrating a personal Anki deck into VIDYA,
and VIDYA is not competing on "own your knowledge base" portability. But the **specific `.apkg` import
path is a real, near-term acquisition lever**: a meaningful fraction of Indian CBSE students already using
Anki (via popular shared decks, or a tutor's deck) is a plausible bootstrap audience, and the "never floods
the queue, lands in a separate onboarding lane" mechanic is exactly the right answer to the real onboarding
problem this creates — a student with 3,000 existing Anki cards must not be punished with a 3,000-card
first day.

**Verdict: ADOPT the `.apkg` import path (already flagged in P3 §9 build order as a later-stage item —
this pass confirms it's worth prioritising higher than "later"), with the same named limitations expected
(no custom templating fidelity, and VIDYA would need its own tag-volume ceiling). REJECT general export
and REJECT non-Anki importers** — VIDYA's business model depends on students staying inside the platform's
mastery/exam-tracking loop; friction-free export undermines that, and the long tail of "import from
Notion/Obsidian/Roam" apps has zero relevance to a CBSE Class 6–8 audience.

**Interaction sketch.** Onboarding step: "Already use Anki? Import your deck" → `.apkg` upload → server-side
parse maps recognised note types (Basic, Cloze, Image Occlusion) into VIDYA's fixed card schema, drops
unsupported custom types with a clear count shown to the student ("142 of 150 cards imported"), routes all
imported cards into a `personal_import` layer (per ADR-009, already named in P3) separate from the
authored mastery deck, surfaced as its own "Learn imported cards" lane rather than mixed into the syllabus
queue.

---
## 9. Mobile app differences

[O — `help.remnote.com/en/articles/7000505` (Mobile App)]

**Finding that cuts against the brief's premise.** The task brief assumed mobile "cuts" features relative
to desktop — worth stating plainly: RemNote's own documentation claims **near feature parity**: "The
mobile app includes almost all features of the desktop app, with very few exceptions" [O, verbatim]. The
concrete differences observed are about *interaction surface*, not missing capability: insert-actions live
behind a `+` button and modify-actions behind a `/` button (rather than a unified toolbar), the toolbar is
horizontally scrollable rather than fully visible, and subscribing to Pro from the mobile app may miss
discounts/options only available on web. Mobile-*additive* features exist too: a camera **Scan** tool that
turns a photographed physical page into an editable handwritten document (with an AI "detect the text and
convert to editable text" step, and a direct route to flashcard generation from the scan) [O], iOS
long-press quick actions (jump straight to Practice Flashcards / Quick Add / Today's Document), and three
home-screen widgets — **Streak** (with a recent-days grid), **Quick Add** (keyboard-up capture with zero
navigation), and **Shortcuts** (a small launcher for Practice/Daily Doc/Search/etc.).

**Usefulness for VIDYA.** Since our students are phone-first (stated in the brief itself), this section
matters more than most. The near-parity finding is itself the useful takeaway: **don't pre-emptively cut
features "because mobile,"** design one interaction model that scales down, the way RemNote's `+`/`/`
button split does rather than hiding functionality. The **Scan-to-flashcard** pipeline is the same
mechanism recommended in §1's interaction sketch — this confirms it as a mobile-native pattern, not a
desktop afterthought. The **home-screen widget set is a genuinely strong, cheap habit-loop mechanic**: a
Streak widget with zero app-open required to check it, and a Quick-Add-style zero-friction capture, are
exactly the kind of low-cost daily-habit reinforcement the Exam Scheduler's daily-goal mechanic (B2 §3)
needs on the home screen to actually get looked at.

**Verdict: ADOPT the Scan pipeline (mobile-first) and the Streak/Quick-Access widget pattern. ADAPT** the
`+`/`/` split as a general lesson (favour a scalable interaction split over feature-cutting) rather than
copying the exact mechanism. **REJECT** worrying about mobile parity as a separate design track — build
one responsive model.

**Interaction sketch.** An iOS/Android home-screen widget showing the mastery-ring/streak (small size:
number + flame; large size: 7-day grid, mirroring RemNote's exact two-size pattern) plus a one-tap deep
link straight into today's review queue — no app-open-then-navigate step.

---
## 10. Offline behaviour and sync

[O — `help.remnote.com/en/articles/6752029` (Offline Mode)]

**What it does.** Edits made offline sync automatically on reconnect, with multi-device offline edits
merged rather than conflicting. The **desktop app** is the strongest offline experience because it caches
a complete local copy of all images/PDFs; the **web app** can continue in an already-open tab but cannot
be *started* offline and loses everything on refresh (changes already made are safe, just inaccessible
until reconnect); the **mobile app** caches a configurable number of recently-used images locally (default
shown: 100) but not a full media copy. Named offline limitations: most AI features unavailable, images not
cached/local are invisible (flashcards needing such an image are **automatically pushed to the end of the
queue** rather than blocking review — a small but real UX kindness), plugins unavailable, and no page-title
resolution or link-opening for pasted web URLs.

**Usefulness for VIDYA.** Directly relevant: Indian mobile connectivity is inconsistent, and a student
should be able to do their daily review on a train or in a low-signal area. The **"can't answer this card
right now → push to the end of the queue rather than block" behaviour** is the single most important
mechanic here, and it generalises: any offline gap in cached content (an image, a diagram, a video
explanation) should degrade the same way — skip and requeue, never a hard stop. The **desktop-caches-
everything, mobile-caches-a-configurable-recent-window** split is the right default shape for VIDYA too,
scaled to mobile-first: cache the current exam's active-review-window content aggressively, cache
everything else lazily.

**Verdict: ADOPT** the sync-and-merge model (this is largely already implied by lane B's offline strategy,
per B2's framing note that offline architecture is B's decision and stands) and the **skip-and-requeue
degradation pattern** specifically — it is cheap to build and meaningfully better than either blocking or
silently failing. **ADOPT** a bounded local media cache on mobile sized to "this week's active review
content," not the whole curriculum.

---
## 11. AI features — the full set, and how they're commercially gated

[O — `help.remnote.com/en/articles/10103884` (AI Tutor Chat), `9416169` (AI Credits), `14498332` (Recording
and Transcribing Lectures), `16424066` (Connecting AI Agents to RemNote with MCP), plus `remnote-pricing.md`
(scraped 2026-08-31) and `rn-ai-flashcards.md`/`rn-image-occlusion.md` already in B2's evidence base]

**The full inventory, consolidated** (B2 only covered AI-flashcard-generation and the occlusion-OCR trick):

1. **AI Tutor Chat** — a chat surface accessible from four different entry points (top-right icon,
   dedicated sidebar button, in-queue floating window while reviewing a card, and "ask follow-up" from a
   card's own Insights panel) that can: explain any on-screen content ("Explain this" reads whatever
   you're currently looking at, including a PDF page with page-cited answers); search the entire knowledge
   base with clickable citations; generate a scoped **practice quiz** on a document or a whole folder,
   configurable for MC vs. free-response; **create new documents, notes, or tables** from a natural-
   language request; and turn any of its own chat responses into a flashcard with one click. Model choice
   spans a default "Smart Balanced" tier up to named frontier models (GPT/Claude/Gemini), the latter
   billed at the provider's own rate with no markup. [O]
2. **AI flashcard/quiz generation** from pasted text, PDFs, or PPTs — already in B2, with the
   "Learn New"/"Need to Learn" separate-queue mechanic confirmed again here for lecture-recording-derived
   cards specifically. [O]
3. **Guided Learn Mode** ("Learn PDF") — per §1. [O]
4. **AI-assisted image occlusion + OCR** — already in B2, expanded in §2. [O]
5. **AI column autofill and AI-generated table structure** — per §3. [O]
6. **AI OCR on scanned handwriting/photos** — per §9's Scan tool. [O]
7. **Lecture recording + live transcription** — record audio, get a live, auto-cleaned, word-timestamped
   transcript navigable during playback, then generate flashcards/quizzes straight from the transcript;
   works from desktop, in-document, or the mobile `+` menu. [O]
8. **AI LaTeX authoring** — describe an equation in plain language or let autocomplete finish a partial
   formula (from B2's corpus, not re-verified this pass, but consistent with the rest of the AI surface).
9. **Text-to-speech** — per §1, English-only, tied to Text Reader mode.
10. **MCP server for external AI agents** — the desktop app can expose a local MCP server so a *separate*
    AI agent (Claude Desktop, Cursor, ChatGPT Desktop) can read/search/write the user's notes directly,
    read-only or read-write. This is a distinctly power-user, developer-adjacent feature aimed at people
    who already run their own AI tooling. [O]

**Commercial gating** [O, `remnote-pricing.md` + `9416169`]: AI usage is metered by a monthly **AI credit**
pool consumed proportionally to tokens used — **Free: 250 credits/month** (per the credits article read
this session — note this differs from the 100-credit figure on the public pricing page scraped
2026-08-31; the discrepancy is flagged rather than resolved, since it may reflect a genuine plan change
between scrape dates), **Pro: 1,000/month, Pro+AI: 20,000/month**, with a $10/20,000-credit top-up for
Pro+AI users that never expires (unlike the monthly allotment). Frontier-model AI Tutor usage is billed at
the provider's real cost on top of the same credit pool, so a student "shopping" for the smartest model
burns credits fastest — a real design lesson: **metering by raw LLM cost, not by feature, teaches users to
avoid your best AI feature.**

**Usefulness for VIDYA, sceptical throughout.** Most of this list is either already decided by other
lanes (flashcard/quiz generation, LaTeX authoring) or explicitly out of scope for children (the MCP
developer-agent feature has zero relevance to a CBSE student and should not even be evaluated for VIDYA).
The two AI Tutor capabilities *not* yet covered elsewhere and genuinely relevant: **"explain what's on my
screen right now"** — directly the same context-aware behaviour IA_RESTRUCTURE already specified for the
`.ai-fab` floating tutor bubble, confirming that design choice against a real precedent — and
**folder-scoped practice-quiz generation on demand** ("quiz me on Chapters 3–4"), which is a good
just-in-time complement to the scheduled review queue for a student cramming before a specific test.
Lecture recording is irrelevant (VIDYA's students don't sit through their own recorded lectures; content
is platform-authored) except as a distant future teacher-tooling idea (a teacher recording a live
doubt-clearing session). Credit-metering-by-token is the correct general lesson for VIDYA's own AI cost
control regardless of RemNote specifics.

**Verdict:**
- **ADOPT** "explain what I'm looking at" as the `.ai-fab`'s core behaviour (already specified; this
  confirms and cites it — see IA_RESTRUCTURE's "context-aware" requirement).
- **ADOPT** on-demand scoped quiz generation ("quiz me on X") as a Learn-hub action, separate from and
  additive to the scheduled review queue.
- **ADAPT** the credit-metering lesson: meter VIDYA's own AI features by actual inference cost internally
  for margin control, but **never expose a credit counter to a child** — students should never see "you
  have 40 credits left," which is an adult-SaaS mental model with no place in a school product. Gate
  invisibly (e.g., soft per-day AI-tutor-question caps enforced server-side, with a friendly "ask your
  teacher" fallback rather than a paywall prompt) if cost control is needed.
- **REJECT** lecture recording, MCP agent access, and AI-authored tables/LaTeX-from-description as
  features to build now — none serve an 11–14-year-old on a fixed syllabus; each is either an adult
  power-user surface or already-decided territory in lane F.

**Interaction sketch, for the one net-new item (scoped quiz-on-demand).** From a Topic page in the Learn
hub, a "Quiz me on this" button opens a config sheet with exactly two choices — "Just this topic" or "This
whole chapter" — and a question-count slider capped low (5/10/15, not RemNote's open-ended range), then
generates from the existing question bank (not fresh LLM generation per B2 §2's card-type-mix policy
concerns) wherever possible, falling back to generation only for chapters with a thin bank.

---
## 12. Pricing and the free/paid boundary

[O — `remnote-pricing.md` (scraped 2026-08-31) + `9416169` (AI Credits, read this session)]

**The structure.** Three tiers: **Free** ($0 — unlimited notes/flashcards/devices, but hard caps of 3
annotated PDFs, 5 image-occlusion cards, 1 handwritten document, 1 exam, 2 knowledge bases, 2 search
portals, 10 LaTeX-cloze cards, 3 tables, 100–250 AI credits depending on source), **Pro** ($8/mo or $96/yr
— removes those content-volume caps, adds Exam Scheduler without limit, adds handwritten notes without
limit, 1,000 AI credits), **Pro+AI** ($18/mo or $216/yr — adds Guided-Learn-from-PDF, unlimited flashcard
explanations, lecture recorder, AI grading, image-to-text, 20,000 AI credits). The free/paid line is drawn
almost entirely on **content volume** (how many PDFs, images, exams, tables) rather than on **core
mechanics** (spaced repetition, the Concept/Descriptor framework, and basic card creation are unlimited
even on Free) — and separately on **AI depth** (Pro+AI gates the most expensive-to-run AI calls, not
lighter ones). Monetisation is surfaced as **inline badges** on menu items (`Pro`, `3 Free`) at the point
of intent rather than blocking modals, a UI pattern already flagged as worth copying in
`remnote-ui-screenshots.md` §8.

**Usefulness for VIDYA as a product-strategy input.** VIDYA is not a freemium personal-productivity tool
being sold to self-directed adults who'll hit a content-volume ceiling and decide to pay to remove it —
it's sold to parents/schools for a child following a syllabus, most plausibly via a subscription or a
school licence, not a metered free tier a 12-year-old manages themselves. RemNote's volume-cap gating
model (3 PDFs, 5 occlusion cards) doesn't map onto VIDYA's context at all: a child cannot be expected to
understand or manage a personal quota. What **does** transfer is the *principle*, not the mechanism: gate
on **cost-heavy, optional-depth features** (AI tutor generation depth, teacher-call minutes) rather than
on **core learning mechanics** (spaced repetition, review queue, mastery tracking must never be paywalled
mid-syllabus — a family paying for term 1 cannot be blocked from reviewing what their child already
learned).

**Verdict: ADAPT the principle (gate cost-heavy AI depth, never gate core mechanics or already-learned
content), REJECT the mechanism (visible per-feature volume caps and an exposed credit counter)** — for the
reasons given in §11. This is primarily an input to lane E (India ops/market) and lane A's pricing
decision, not a UI feature; flagging it here because it was asked for and because the "gate depth, not the
learning loop" framing is a real constraint worth writing into whatever pricing ADR VIDYA eventually
drafts.

---
## 13. The five things to build next — ranked, with argument

The brief asked for opinion, not an inventory. Ranked by (a) how directly it serves a Class 6–8 student
grinding a fixed CBSE syllabus on a phone, and (b) how cheap it is relative to its leverage. Several
strong candidates from the audit above (image occlusion, `.apkg` import, templates) are deliberately
**not** in the top five — they're real, but B2/P3 already sequenced them, and this ranking is about what
this specific lane surfaced that isn't yet on a roadmap.

**1. Reference Tables as a first-class content block (§3).** Highest-leverage single finding in this
audit. Multiplication tables, formula sheets, unit conversions, and properties-of-shapes tables are a
*constant* of the Class 6–8 syllabus that VIDYA's current content model (notes/practice/flashcards per
IA_RESTRUCTURE) doesn't yet name as its own shape. Building it is cheap — a typed-column table renderer
plus per-cell FSRS state, both of which VIDYA needs anyway — and it directly fixes a real pedagogical gap
(right now, "learn your 7-times-table" has no natural home in the current content model). Rank #1 because
it is simultaneously new territory, cheap, and squarely inside the syllabus.

**2. Scan-to-flashcard from a physical page, mobile-first (§1 + §9).** The single mechanism that shows up
independently in three different sections of this audit (PDF reader, image occlusion, mobile app) — that
convergence is itself the evidence it matters. Indian CBSE students work from physical NCERT textbooks and
teacher-printed worksheets far more than from platform-native digital content at this age band; a
camera-to-editable-text-to-flashcard pipeline meets them where they actually are, on the device they
actually have (a phone, not a laptop). Rank #2 over reference tables only because it's a larger build
(OCR pipeline, mobile camera UX, review-gate for imported content) for comparably high but slightly less
certain leverage — not every student will use it daily, but every student who does will use it a lot.

**3. Home-screen widget: streak + one-tap-to-queue (§9).** The cheapest item on this list by a wide margin
— a platform-native widget wrapping data VIDYA already computes (streak, due-count) — and it attacks the
single hardest problem in a habit-forming product: getting opened at all. RemNote's own UI teardown
(`remnote-ui-screenshots.md` §8, item 1) already flagged the due-count badge as "the daily-habit hook";
this generalises that insight past the in-app nav bar to the phone's home screen itself, which is strictly
more valuable for a mobile-first product. Rank #3 because its ceiling is lower than #1 or #2 (it drives
opens, not learning depth) but its cost is close to zero and it compounds with everything else.

**4. Teacher-side omnibar over student mastery data (§5).** Reframes RemNote's query language — rejected
outright for students — into the one place it's a genuine unlock: a teacher fielding thirty students needs
"who's falling behind on Fractions" answered in five seconds, not a dashboard they have to click through.
This is the only recommendation on this list aimed at the teacher side of ADR-001's moat rather than the
student experience, and it's here because good teacher tooling is what makes the "real teacher" moat
actually defensible in daily use, not just in marketing. Rank #4 — real leverage, but scoped to the
teacher console, which is a smaller and later-priority surface than the student-facing top three.

**5. `.apkg` import as an onboarding acquisition lever (§8).** Already named in P3's build order as a
later-stage item; this audit's contribution is arguing it should move **up**, not adding it fresh. The
"never floods the queue, lands in a separate onboarding lane" mechanic is a solved, copyable design, and
Anki's existing footprint among Indian exam-prep-focused students (JEE/NEET-adjacent families, the same
demographic VIDYA is positioned near) makes it a plausible zero-cost-acquisition channel: a student who
already has an Anki deck for some subject can bring it in on day one instead of starting from a blank
product. Rank #5 — real but narrower audience than the top four, and the underlying mechanic (a segregated
"needs review before it counts" import lane) is mostly a smaller version of what #1 and #2 already need to
build anyway.

**What's deliberately excluded from the top five and why:** the daily note (§6, rejected outright — wrong
shape for a pushed-content product), peer sharing/collaboration (§7, rejected — safety surface with no
upside for this audience), the query language for students (§5, rejected), and the full PDF-annotation
suite (§1, rejected as core — the scan pipeline in #2 captures the useful 10% of it). Being opinionated
here means some of RemNote's real engineering effort is simply the wrong shape for an assigned-syllabus
children's product, not a gap VIDYA needs to close.

---
## Could not verify / open questions

- The **free-tier AI credit figure discrepancy** (250 vs. 100 credits/month) between `9416169-ai-credits`
  (read 2026-09-02) and `remnote-pricing.md` (scraped 2026-08-31) is noted in §11 but not resolved — could
  be a genuine recent plan change, a regional variant, or one page being stale. Immaterial to any verdict
  here, flagged for completeness only.
- The **Community publishing** surface (`15530615-community`) was referenced by several sources but not
  scraped directly this pass — the sharing/collaboration verdict in §7 does not depend on its detail, but
  a future pass mining lane-F's content-marketplace ideas (if any) should read it directly rather than
  relying on this file's secondhand references to it.
- **RemNote Groups** (`8119315-groups`) — referenced as the mechanism behind Group-scoped sharing, not
  read directly; §7's verdict (reject peer/group sharing) does not turn on its specifics.
- This lane did not attempt the **changelog/blog** research explicitly invited by the brief — `map`ping
  `help.remnote.com` surfaced no changelog/blog collection distinct from the help centre's own "Updated
  <date>" article timestamps, which is what dates like "July 16, 2026" throughout this file's citations
  actually reflect. If a true blog/changelog exists at a different subdomain, it was not found.
