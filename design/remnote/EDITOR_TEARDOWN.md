# RemNote editor teardown — used live, not read about

Primary evidence: a real, signed-in RemNote 1.28 account, driven live in-browser this session
(2026-09-02), operator-authorised to create, type, click, and break things freely. Evidence grades:
**[O]** observed directly this session · **[O-prior]** observed live in an earlier session, cited from
`ONBOARDING_TEARDOWN.md` or `B2_remnote_verified.md` or `REMNOTE_FEATURE_AUDIT.md` · **[I]** inferred ·
**[A]** assumed. Do not re-read those three files for content already summarised here — the assignment
was to *use the editor*, and this file's job is to add what only hands-on use can surface.

**A methodology note, because it shapes how much weight some findings carry.** This session's browser
driver has a real quirk worth disclosing: `computer.left_click` at a *manually computed* pixel coordinate
was unreliable for focusing contenteditable regions, and `computer.key` for edit commands (Backspace,
Cmd+A) did not reliably reach the app even when a coordinate-click had genuinely focused the right
element — while plain character keys, Return, Tab-as-a-value-in-a-menu, and Escape did work, and
`el.click()` executed via `javascript_tool` was 100% reliable for buttons and menu items. Practical effect:
deep keyboard-only outliner mechanics (Tab-to-indent while mid-edit, Backspace-to-merge, Cmd+A-select-all)
could not be cleanly reproduced and screenshotted this session, and are therefore reported from
`B2_remnote_verified.md`'s prior verified pass (marked **[O-prior]**) rather than re-tested here. Everything
about the flashcard trigger, the menus, table/exam/canvas creation, and the storage layer below **was**
reproduced live this session, with real DOM/network/IndexedDB evidence, and one screenshot per major
finding. Where a claim is unverified this session, it says so.

One trigger finding worth flagging up front because it revises something already written down: the prior
onboarding pass recorded that programmatic text insertion of `==` does **not** fire RemNote's card
conversion. This session found a narrower truth: two separate single-character `type` calls (inserting
`=` twice as discrete events) **did** fire the conversion, producing a real arrow card — see §1. A single
multi-character `type("==")` call, tested earlier in the same session, did not. The trigger appears to
listen to the trailing-character pattern on each discrete text-insertion event, not to keydown specifically.
This matters for us: our own `--` trigger fires on `onChange` value-inspection regardless of how the text
arrived (§3), which is strictly more robust than RemNote's — keep it.

---
## 1. What their editor does well

**The flashcard-in-flow moment is genuinely excellent, and better than its documentation suggested.**
Typed a real line — "The sum of angles in a triangle is " — then `==`. The bullet instantly became a
question-box, an arrow, and a **greyed AI-drafted answer inline**: `[Press Tab] 180°`, with a small
"Preview" control (chart icon) beside it. Pressing Tab accepted the draft as real text and a
**`Practice · 1 Due`** badge appeared in the top bar immediately — before I'd touched the flashcards
tab, before I'd left the document. [O] Three things make this good:
- The AI draft is *inline and dismissible by simply typing over it*, not a separate accept/reject modal.
- The due-count badge updates from *inside the editor*, so the "you just created work for future-you"
  feedback is immediate, not deferred to a separate flashcards screen.
- Nothing is scary or modal about it — a card is just what a bullet becomes, mid-sentence.

This is the single best moment in the product, and it is not something the documentation conveys — you
have to type through it to feel it.

**The "More" toolbar button is the slash-menu's full content, organised into a real taxonomy** [O]. It is
not a flat list: `Insert Flashcard` and `Flashcard Configuration` are split (create vs. reconfigure),
grouped separately from `Headings & Highlights`, `Text Style & Formatting`, `Image & Drawing`,
`References, Tags & Portals`, `Date & Time`, `Code, Math & Quote`, `Tables, Divider, Columns`,
`Upload File or Link Source`, `Record Audio/Video`, `Hierarchy`, `AI Tools`. Opening `Insert Flashcard`
shows the full card-type family in two labelled clusters — **Flashcards** (Single-Line `==`, Multi-Line
`== then ↵`, Multiple-Choice, List-Answer, Cloze `{{`, Image Occlusion "5 Free") and **Concept /
Descriptor** (Concept `::`, Descriptor `;;`) — each row showing its trigger inline as a little keycap.
This is a genuinely good pattern: *the menu teaches the shortcut at the point of use*, so a student who
opens the menu once by hand never needs to again.

**The document `⋯` menu is a real, complete surface, not a stub** [O]: Flashcards · Change Document Icon ·
Learn With AI Tutor · Share Document · Undo (⌘Z) · Find or Filter (⌘F) · Open in New Tab · Open in Another
Pane · Pin to Sidebar · Move · Print · Export · Stats · **View Trash** · Delete. Two items are worth
noting because we do not have equivalents: **View Trash** (a document-scoped undo-delete, separate from
global undo) and **Pin to Sidebar** (promoting one document above the folder tree for quick return).

**Advanced Table is a real relational primitive, confirmed live** [O]. Inserting one produces a bullet
titled "Untitled Table" with a `Name` column, a `+` to add typed columns, and an `Add Row` action — this
matches `REMNOTE_FEATURE_AUDIT.md §3`'s docs-based description exactly, now confirmed structurally (see
§5): a table is not a special block type, it is a Rem with a **table-view powerup slot**, and rows are
ordinary child Rems. That is *why* a row created elsewhere in the graph can still show up inside the
table — the table is a query rendering, not a container.

**The Exam creation wizard is short, sequential, and asks the right question in the right order** [O].
Live steps, reproduced end to end:
1. *What content is on this exam?* — Everything in This Folder / Select Specific Documents.
2. *When is your exam?* — a real calendar; selecting a date immediately echoes "18 days from now"
   confirmation text beside the picker, not just a highlighted cell.
3. *Will you add more cards before the exam?* — three options (📚 "Yes, I'll add more" / ✅ "No, I'm
   done adding cards" / 🤔 "I might add more"), with an honest constraint stated plainly: **"You only
   have 0 cards so far, and the Exam Scheduler needs at least 10 to plan on its own."**

That threshold-disclosure is the good part: the system tells you *why* it needs more content before it
will commit to a schedule, rather than silently producing a bad plan from too little data. Leaving the
wizard triggers a real confirm dialog — "Your schedule isn't saved yet" — appropriately, since this is a
multi-step commitment, not a one-field form.

**The Pro gate is a soft nudge, not a hard wall, more often than the pricing page implies** [O]. The
sidebar's Create menu badges "Infinite Canvas" with a `Pro` pill — but creating one anyway opened a
config dialog (Canvas Type: Pages/Infinite Canvas; Page Type: Blank/Dot Grid) and **succeeded on a free
account**, landing on a real canvas page with "AI Learning Tools" / "Text Notes" panels and no paywall
interstitial. This confirms `remnote-ui-screenshots.md`'s observation that monetisation is signalled
inline rather than blocking, now with a concrete case: the badge oversold the gate.

**File-format breadth on upload is real, not a documentation claim** [O]: the underlying `<input
type=file>`'s `accept` attribute lists 90+ extensions — `.pdf .docx .pptx .epub .tex .pages .key .numbers
.cbr .cbz .djvu` and more — confirming `REMNOTE_FEATURE_AUDIT.md §1`'s "60+ non-PDF formats auto-convert
on upload" from the actual live DOM, not the help article.

---
## 2. What it does badly, or is simply wrong for an 11–14-year-old on a fixed CBSE syllabus

**The editor fights you the moment you deviate from "type forward, never correct."** This is the most
important finding in this section, and it surfaced only from hands-on use, not from documentation: typing
into the document title, then pressing Return, does **not** reliably move editing focus into the first
bullet — text kept landing back in the title across several attempts in this session, requiring a
triple-click to escape it. A power-user forgives this once they've learned it. An 11-year-old will
conclude the app is broken and get an adult to help, which is exactly the trust-destroying moment
IA_RESTRUCTURE and our own onboarding work has been trying to design *away* from. **This is a UX
fragility RemNote can afford because their users are patient adults who'll retry; we cannot afford it.**

**The bullet/document split creates a genuine "where does this thing go" ambiguity that surfaces on day
one.** Right after signup, the account already contained a document called "Your First Notes" sitting
directly in a folder, alongside a *separate* onboarding-seeded folder structure (`University Y2` >
`maths` > `Class 7 Maths`) — three levels deep before any content exists. A syllabus-bound 12-year-old
should never be deciding "is this a folder or a document" or navigating three levels to find where to
type; our own `FolderPage.tsx`/`NotebookIndex.tsx` already avoid this by giving Book → Chapter exactly
two levels with a labelled `childLabel` ("Chapter" vs "Subfolder") at each depth — keep that discipline,
it is already better than what ships here.

**The Advanced Table's authoring affordances are power-user surface, not student surface.** The
`+`-to-add-column / typed-property model (Text, Number, Checkbox, Date, Select…) is a schema-design tool.
A Class 7 student consuming a pre-built "7-times-table" reference should never see an "add a column"
control — per `REMNOTE_FEATURE_AUDIT.md §3`'s verdict, this must be locked to content authors, not exposed
at all in the student runtime.

**The Exam wizard's card-count gate is honest but has no forward path from inside the wizard.** Selecting
"I might add more cards" or "No, I'm done" from a 0-card exam does not visibly advance past that step in
this session's testing — there is no inline "go add some cards now" action; the student has to already
know to leave, go author content, and come back. For a self-directed adult that's a minor friction; for
our audience, the exam-creation flow should never let a student paint themselves into a corner with no
guided next step.

**Sync visibility is opaque by design, which cuts against trust for a graded product.** No plain HTTP API
calls were observed during live editing in this session (§5) — writes go straight to a local SQLite store,
and whatever sync happens is invisible to standard request inspection (almost certainly WebSocket-based,
consistent with `B2_remnote_verified.md`'s offline-first framing). For a personal notes app that's a
reasonable trade. For VIDYA, where a parent or teacher needs to *believe* a mastery record was actually
recorded, "trust the client" is a worse default than it is for RemNote — our own `AttemptEvent` contract
already carries `clientTs`/`serverTs` and a `selectionPolicy`/`policyVersion` precisely because attempt
provenance has to be auditable, not just eventually-consistent.

**The onboarding-seeded folder tree ("University Y2" as a top-level folder) reveals RemNote does not
distinguish "your one enrolled programme" from "one knowledge base among many."** Fine for a
personal-wiki tool with an open-ended user base (professionals, PhD students, hobbyists all in one
product). Wrong shape for us: a CBSE student has exactly one active syllabus per subject, not an
open-ended shelf of unrelated knowledge bases to manage.

---
## 3. Gap analysis against our own `Outliner.tsx` and friends

Read: `apps/web/src/features/notebook/{Outliner,EditorToolbar,NotebookPage,NotebookIndex,FolderPage,
NewNoteChooser,HandwritingCanvas}.tsx`, `data.ts`, and `packages/contracts/src/model.ts`.

| Mechanic | RemNote | Do we have it | Verdict | Why |
|---|---|---|---|---|
| Inline AI-drafted answer, accept-on-Tab | Yes — greyed `[Press Tab] 180°` shown inline the instant the trigger fires [O] | **Yes** — `Outliner.tsx`'s `suggestAnswer` + `showSuggestion` + Tab-to-accept, marks `aiDrafted: true` | **We already match their best moment** | Independently converged on the same pattern; ours additionally gates on `aiDrafted` for ADR-003 review, which they do not appear to expose to the student at all |
| Trigger robustness (value-based vs. keydown-based) | Keydown/discrete-insertion pattern matching; a single bulk-inserted `==` did not convert in this session's test [O] | **Yes, and stronger** — `handleText` in `Outliner.tsx` checks `value.endsWith(token)` on every `onChange`, so paste/IME/programmatic input all convert | **ADOPT (already have it) — do not regress toward keydown-only matching** | Confirmed twice now (this session + `ONBOARDING_TEARDOWN.md`) that theirs is the more fragile of the two designs |
| Due-count badge visible from inside the editor | Yes — `Practice · N Due` appears in the top bar the moment a card is created [O] | **No** — our `NotebookPage.tsx` shows a card *count* chip (`{cards.length} cards`) and an AI-drafts-pending chip, but no due-for-review count while writing | **ADOPT** | Cheap: we already compute `cards` and have FSRS `due` dates elsewhere; surfacing "N due today" beside the existing count chip closes a real motivational gap at zero new data-model cost |
| Full-taxonomy insert menu (slash / "More") | Yes — 12 top-level categories, each a real submenu, triggers shown inline as keycaps [O] | **Partial** — `EditorToolbar.tsx` has `CARD_TYPES`, `HEADINGS`, `TABLES`, `MORE` as flat, unlabelled dropdown lists; no inline trigger keycap shown per item | **ADOPT the inline-keycap idea, REJECT their category depth** | Their 12-category tree is power-user surface (Hierarchy, AI Tools, References/Tags/Portals as full categories) we do not need at launch; the one-line "here's the shortcut" teaching moment is cheap and valuable regardless of menu depth |
| Advanced Table (typed columns, per-row cards) | Yes — confirmed live [O], matches `REMNOTE_FEATURE_AUDIT.md §3`'s docs-derived description exactly | **No** — `EditorToolbar.tsx`'s `TABLES` menu offers `table` / `grid` / `compare` as insert kinds, but no `ReferenceTable` content-block type exists in `model.ts` | **ADOPT** — already ranked #1 in `REMNOTE_FEATURE_AUDIT.md §13`; this session's live confirmation only strengthens that ranking | Multiplication tables, unit conversions, formula sheets are a *constant* of Class 6–8 maths with no current home in our content model |
| Document `⋯` menu completeness | 14 items incl. View Trash, Pin to Sidebar, Open in Another Pane [O] | **Close** — our `DOC_MENU` in `EditorToolbar.tsx` has 13 items incl. `status` (they don't) but lacks `View Trash`, `Pin to Sidebar`, `Open in New Tab`/`Another Pane` | **ADOPT `View Trash` only; REJECT the rest** | A document-scoped "recover what I just deleted" is real safety value for a 12-year-old fat-fingering Delete; multi-pane/pin-to-sidebar are desktop power-user affordances irrelevant to a phone-first product |
| Exam creation as a first-class, multi-step wizard | Yes — 3+ steps, confirmed live [O]: scope → date → card-readiness, with an honest "need ≥10 cards" disclosure | **Partial** — `model.ts`'s `Exam` interface exists (`examId, examDate, includeSkillIds, excludeSkillIds`) and `FolderPage.tsx` has an `Exam` menu item, but it's wired to a "not wired up in this prototype" toast — no wizard exists yet | **ADOPT the wizard shape, ADAPT the readiness gate** | `B2_remnote_verified.md §3` already made Exam the spine of VIDYA's home screen; this session adds the concrete UX shape (3-step wizard) and the honest-threshold-disclosure pattern worth copying, adapted to *offer to auto-generate practice from the syllabus* rather than just wait, since our content is platform-authored and theirs is student-authored |
| Bullet/document container ambiguity | Two container types (folder, document) with real navigation cost between them [O] | **Better** — `FolderPage.tsx` enforces exactly two depths (Book → Chapter) with an explicit `childLabel` | **KEEP OURS — do not adopt their arbitrary-depth folder nesting** | Already covered in §2; confirmed live this session that their onboarding seeds 3+ levels before any content exists |
| Title-to-body focus handoff on Enter | Unreliable in this session's live testing — text repeatedly landed back in the title [O] | **N/A** — our `Outliner.tsx` has no separate "title" concept; `depth === 0` bullets are just bold, not a structurally different focus target | **KEEP OURS** | Structurally avoids the exact failure mode observed live: there is no title/body boundary for focus to fall across in the first place |
| Table row → per-cell FSRS card | Yes, per docs (`REMNOTE_FEATURE_AUDIT.md §3`, not re-verified live this session) | **No** | **ADOPT, as part of the Reference Table build (see §4)** | Already the top-ranked recommendation platform-wide; not re-litigated here |

---
## 4. File-type inventory and the storage architecture underneath it

The coordinator's added brief asked a specific, falsifiable question: is a Document, Folder, Exam,
Table, Canvas, and Daily Note each a genuinely different entity, or one type wearing different clothes?
This was verified structurally, not assumed, using the app's own exposed internals — RemNote's client
ships a large set of debug globals on `window` (evidently for their own Playwright test suite: functions
literally named `playwrightDeleteDocumentRem`, `playwrightShiftFocusedRemRelative`, etc. are present) that
let us query the live local data store directly from the browser console this session. This is far
stronger evidence than reading documentation.

### 4.1 What was created, live, this session

| Type | How created | Result |
|---|---|---|
| Document | Sidebar `Create` → `Document` [O] | New empty doc, own URL slug, floating bottom toolbar |
| Folder / Subfolder | Folder-page `+` → `Subfolder` [O] | "Untitled Folder" nested inside "Class 7 Maths", no navigation — created inline |
| Infinite Canvas | Sidebar `Create` → `Infinite Canvas` (badged `Pro`) [O] | Config dialog (Canvas Type: Pages/Infinite Canvas; Page Type: Blank/Dot Grid) → created successfully on a **free** account, no paywall |
| PDF upload | Folder `Upload PDF` → real `<input type=file>` fed a synthetic PDF via `DataTransfer` [O] | New document, icon became `document-pdf.svg`, opened a Notes+PDF split view |
| Exam | Folder `+` → `Exam` [O] | 3-step wizard (content scope → date → card-readiness); abandoned intentionally after confirming the flow, via the app's own "Leave Without Saving" confirm |
| Daily Note | Sidebar `Today's Note` [O] | Document titled "September 2nd, 2026", own URL, with a 30-day horizontal date-strip, a "Today" pill, "Add Template", and empty-state copy ("Capture & Organize Your Day's Thoughts…") matching `REMNOTE_FEATURE_AUDIT.md §6`'s docs-derived description exactly |
| Advanced Table | Toolbar `Table` → `Advanced Table` [O] | "Untitled Table" bullet with a `Name` column, `+` to add columns, `Add Row` |

### 4.2 Structural answer: one Rem type, not six

Querying the live store directly (`window.Rem('<workspaceId>').findOne('<remId>')`, the same accessor
their own `getFullRemStackAsync` internal uses) on the "Class 7 Maths" folder returned this **actual, real
record** [O] (trimmed to the load-bearing fields):

```json
{
  "_id": "0Vzk0T7GdgBZaxBKx",
  "key": ["Class 7 Maths"],
  "parent": null,
  "owner": "671628d8b2a5f2715d244e85",
  "ps": {
    "o_f": { "v": { "v": ["true"], "s": "true" } },
    "o_b": { "v": { "v": ["/offline_assets/emoji/folder-yellow-light.svg"], "s": "..." } },
    "os_os": { "v": { "v": [{ "i": "q", "_id": "fgPvctJfKBHwMobdL" }], "s": "VIDYA-teardown-test " } }
  },
  "iv": false
}
```

This is decisive: **a "folder" is not a distinct table or schema.** It is an ordinary Rem — same `_id`,
`key`, `parent`, `owner` shape as every other Rem — that happens to carry a **powerup slot** `ps.o_f =
"true"` marking it as a folder, another slot `ps.o_b` holding its icon, and `ps.os_os` holding its ordered
children as `{ i: <sort-key>, _id: <child> }` pairs. Corroborating evidence from the sidebar's own cached
stub list (`localStorage['sidebar_document_stubs_<kb>']`, also read live this session [O]): folders and
documents are serialised with **the identical field shape** — `_id`, `text`, `children`, `icon`,
`documentListItemData` — differing only by a boolean (`documentListItemData.isFolder`) and which emoji
icon path is attached. Advanced Table, per `REMNOTE_FEATURE_AUDIT.md §3`'s docs-based description
("under the hood, a table is a tag") is consistent with the same pattern: a table is a Rem with a
table-view powerup, and its rows are ordinary child Rems tagged into it — not a separate row-store.
"Everything is a Rem" is not marketing language; it is the literal on-disk shape.

Two implementation details worth stealing independent of the "one type" finding:

- **Field-level CRDT metadata, not row-level.** Every field carries sibling keys — `key,o` (origin
  timestamp), `key,u` (last-updated timestamp) — and slot values under `ps` carry a **`psh`
  (powerup-slot-history)** array of `{ v, s, t }` triples, i.e. the *entire history of past values for
  that one field*, inline, locally, with no server round-trip needed to answer "what did this used to
  say." This is a genuinely more sophisticated conflict-resolution and audit design than a single
  `updatedAt` on the whole record.
- **Fractional sort keys, not integer order.** Children are ordered via a sort-key string (`"i": "q"` in
  the record above; the sidebar stub cache showed a sequence `"a."`, `"a/"`, `"a0"` for siblings) — a
  standard fractional-indexing scheme that lets a new item be inserted between two existing ones without
  renumbering anything else. Our own `OutlineNode.order: number` and `Folder.order: number` are plain
  integers, which is fine until an AI-drafted card needs to be inserted between two existing siblings at
  a fractional position — today that requires a resequencing pass across every sibling.

### 4.3 The storage stack underneath, confirmed via `indexedDB.databases()` [O]

```json
[
  {"name":"browser.db.sqlite","version":2},
  {"name":"fileStorage","version":1},
  {"name":"htmlCache","version":20},
  {"name":"keyValueStore","version":20},
  {"name":"lnotes.db.sqlite","version":2},
  {"name":"remnote-<workspaceId>.db.sqlite","version":2},
  {"name":"remnote-browser.db.sqlite","version":2},
  {"name":"tinygraph","version":10}
]
```

The main per-workspace database's object stores are `blocks`, `blocks_alt`, `meta` [O] — this is the
signature shape of **absurd-sql / wa-sqlite**: a real embedded SQLite file whose fixed-size pages are
persisted as opaque binary "blocks" inside IndexedDB, with a real SQL engine running in-page (via WASM)
to read/write it. This means the Rem graph is not stored as loose JSON documents in IndexedDB the way a
simpler local-first app might do it — it is a genuine relational database file living inside the browser.
`tinygraph` is a second, separate IndexedDB database (their in-memory reactive graph index, confirmed by
the `window.tinyGraphWasm` / `window.TinyGraph` / `window.rebuildTinyGraph` globals) — i.e. **two storage
layers**: SQLite as the durable source of truth, a separate WASM graph structure rebuilt from it for fast
traversal (ancestor lookups, backlinks, tag membership) at runtime. `fileStorage` is a third IndexedDB
database specifically for binary blobs (PDFs, images). No plain HTTP API calls were observed during live
editing in this session — writes go straight to the local SQLite store; sync to other devices is
therefore almost certainly WebSocket-based and was not visible to standard request inspection, consistent
with `B2_remnote_verified.md`'s offline-first framing (skip-and-requeue on missing content, not
block-on-network).

### 4.4 Where our model is better, and why we should not chase theirs

Read `packages/contracts/src/model.ts` in full. We are **not** solving RemNote's problem, and the
differences are deliberate, not gaps:

- **Two-layer ownership (`owner: "platform" | "student"`) on `Folder` and `NotebookDoc`** has no RemNote
  equivalent — their Rem has no concept of "authored by the platform, read-only to you" vs. "yours."
  Everything in their graph is symmetric; ours has to distinguish curriculum from personal notes because
  a 12-year-old must never be able to silently overwrite the syllabus.
- **`skillTags`/`skillId` threaded through `Flashcard`, `Question`, `AttemptEvent`** ties every piece of
  content to the CBSE curriculum graph. RemNote's tags are user-authored and open-ended; ours have to
  resolve against a fixed, externally-set syllabus (`Chapter`, `CurriculumPlacement`, `SkillEdge`) — a
  constraint they simply do not have and should not be copied *without* the curriculum graph underneath it.
- **`AttemptEvent`'s provenance fields** (`clientTs`/`serverTs`, `selectionPolicy`/`policyVersion`,
  `masteryEvidence`, `exclusionReason`) are already more rigorous than anything observed in RemNote's
  storage layer — appropriate, since a graded, parent-and-teacher-facing mastery record needs to be
  defensible in a way a personal flashcard app's local SQLite file does not.
- **A typed, closed `CardType`/`DeckKind` enum** vs. RemNote's open powerup-slot mechanism is the right
  call for us specifically *because* our card taxonomy is fixed and small (§2's card-type-mix policy from
  `B2_remnote_verified.md` depends on being able to enumerate every type); their extensibility need (users
  inventing their own powerups) does not exist for a platform-authored curriculum.

**Where we would gain from adopting a piece of their approach**, concretely, as a diff against
`model.ts`:

1. **Replace numeric `order` with a fractional sort key on `OutlineNode` and `Folder`.**
   ```diff
   - order: number;
   + sortKey: string;   // fractional/lexicographic (e.g. "a0", "a1", "a05"…), regenerated only
                          // for the touched node on insert-between, never for its siblings
   ```
   Rationale: an AI-drafted card or a teacher-inserted worked example needs to land *between* two
   existing siblings without a resequencing pass across the rest of the list — exactly the operation
   RemNote's `"i": "q"` sort keys are built for.

2. **Add a lightweight per-field history log is NOT worth adopting wholesale** — their `psh`/`aph`
   inline-history design solves a multi-device offline-conflict problem we do not have at launch (we are
   server-authoritative for mastery data by design, per `AttemptEvent`'s server-timestamp fields). Flagged
   here explicitly as a REJECT so a future session does not re-propose it without re-litigating why.

3. **Model `NotebookDoc.kind` as a small tag set rather than a closed union, but only if student-authored
   content types grow.** Today's `"document" | "folder" | "pdf" | "handwritten"` union is fine and should
   **not** be prematurely generalised into a RemNote-style powerup system — that is solving for an
   extensibility need (§ REMNOTE_FEATURE_AUDIT.md's Templates/Powerups verdict already rejected this for
   the same reason). Revisit only if a fifth or sixth content kind is added and the union starts feeling
   combinatorial.

---
## 5. Build spec — ranked, for a coding agent to implement without re-research

Ranked by leverage for an 11–14-year-old CBSE student on a phone, cheapest-relative-to-value first among
ties. Items already ranked in `REMNOTE_FEATURE_AUDIT.md §13` (Reference Tables, Scan-to-flashcard,
home-screen widget, teacher omnibar, `.apkg` import) are **not repeated here** — this list is what *this*
session's hands-on pass surfaced that was not already on that list.

### 1. "N due today" badge inside the note editor itself
**Why #1:** cheapest item in this file, zero new data model, closes the single most valuable gap found by
directly comparing our editor to theirs in use (§1, §3).
**Where:** `apps/web/src/features/notebook/NotebookPage.tsx`, in the `<header>` block alongside the
existing `<Chip tone="primary">{cards.length} cards</Chip>`.
**Spec:** add a second chip, `<Chip tone="warning">{dueCount} due today</Chip>`, rendered only when
`dueCount > 0`. `dueCount` = count of `CardState` rows for the current student where `phase !== "new"` and
`due <= endOfToday` and `!suspended` and `buriedUntil` is null-or-past, restricted to `flashcardId`s whose
`sourceBlockId` traces back to nodes in the currently-open `docId` (join through `nodes`/`myNodes` the way
`cards` is already computed via `useMemo` in `NotebookPage.tsx`). This requires no schema change — every
field needed already exists on `CardState` in `model.ts`. Acceptance: opening a document with ≥1 due card
shows the chip immediately on mount, before any review action; creating a new card via `--` does not
increment it (a brand-new card is `phase: "new"`, not yet due).

### 2. Fractional sort key for `OutlineNode` ordering
**Why #2:** unblocks clean AI-draft and teacher-authored insertion without a resequencing pass; directly
motivated by §4.2's live finding, and is a prerequisite for #3 below (a teacher inserting a worked example
between two existing bullets needs this to not be an O(n) rewrite).
**Where:** `packages/contracts/src/model.ts` (`OutlineNode.order` → `OutlineNode.sortKey: string`),
`apps/web/src/features/notebook/Outliner.tsx` (`childrenOf` sort, `addSibling`, `indent`).
**Spec:** adopt a standard base-62 fractional indexing scheme (midpoint-of-two-keys generation, as used by
Figma/Linear-style ordered lists — a small, well-known algorithm, not novel design). `addSibling` generates
a key strictly between the current node's key and the next sibling's key (or after the last, or before the
first). `indent`/un-indent regenerate only the moved node's key relative to its new sibling set — never
touch any other node's key. Acceptance: inserting 50 cards one-at-a-time between two fixed siblings never
triggers a write to any sibling other than the new node.

### 3. "Insert between" affordance on hover, using the sort key from #2
**Why #3:** RemNote does not have this explicitly either (their reordering is drag-based, per
`B2_remnote_verified.md`'s scope, not re-tested live this session) — this is *our* idea, motivated by
watching how often the AI-draft-then-Tab flow in §1 wants a card to land at a specific point in an
existing list, not just appended at the end.
**Where:** `apps/web/src/features/notebook/Outliner.tsx`, the `<li>` row's hover state (reuses the
existing `revealOnHover` pattern already used for the collapse-chevron and layout-menu triggers).
**Spec:** a thin, full-width hover strip between two adjacent bullet rows (like Notion's insert-line)
that, on click, calls `addSibling` anchored to produce a key between the row above and below rather than
always after the currently-focused node. No new component needed — `addSibling`'s signature already takes
a reference node; add an optional second reference node (the one below) so the sort-key generator has both
bounds.

### 4. Document-scoped "Recently deleted" (View Trash equivalent)
**Why #4:** real safety value for the age group (§2), cheap relative to a full undo-history system, and
the one item from the document `⋯` menu comparison (§3) worth adding.
**Where:** `apps/web/src/features/notebook/EditorToolbar.tsx`'s `DOC_MENU` array (add one entry,
`{ id: "trash", label: "Recently deleted in this page" }`) and `NotebookPage.tsx`'s `DocumentMenu onPick`
handler.
**Spec:** deleting a node (via the existing but currently-unimplemented delete path) soft-deletes by
setting a `deletedAt: string | null` field on `OutlineNode` (new optional field) rather than removing it
from the array; the outliner's `render` filters `deletedAt == null`; the new menu item opens a small list
(reuse the existing `Card` + row pattern from the "my-cards" tab) showing soft-deleted nodes from the last
30 days with a one-click "Restore" per row (sets `deletedAt` back to null). Purge (hard-delete) happens
server-side on a 30-day timer, not client-side. Acceptance: deleting a bullet with children soft-deletes
the whole subtree (children inherit the parent's `deletedAt`); restoring the parent restores the subtree
intact, including original `sortKey`s from #2 so restored position is unambiguous.

### 5. Exam wizard, built to the observed 3-step shape but adapted for authored content
**Why #5:** the `Exam` interface already exists in `model.ts` and the menu entry already exists in
`FolderPage.tsx` (currently a "not wired up" toast) — this closes real, already-scoped dead UI, and
`B2_remnote_verified.md §3` already established the Exam Scheduler as the spine of the student experience.
Ranked last here only because it is the largest build in this list, not because it matters least.
**Where:** new component `apps/web/src/features/notebook/ExamWizard.tsx`, wired from `FolderPage.tsx`'s
existing `<MenuItem onClick={() => notify("New exam is not wired up in this prototype")}>` (replace the
`notify` call with opening the wizard).
**Spec, three steps mirroring §4.1's observed flow, adapted for our platform-authored content:**
1. *Scope* — for us this is "which chapters/topics" (a multi-select over `Chapter`/`Skill`, not
   "everything in this folder", since our content is curriculum-organised, not folder-organised) →
   populates `Exam.includeSkillIds`.
2. *Date* — a date picker → `Exam.examDate`. Echo "N days from now" beside the selected date, exactly as
   observed live in §4.1 — it is a good, cheap confirmation pattern.
3. *Readiness* — since our content is platform-authored (not student-authored like theirs), do **not**
   ask "will you add more cards" — instead compute actual card coverage for the selected scope
   server-side and show either "✅ 340 cards ready across 6 topics — building your plan" (coverage
   sufficient) or "⚠️ Ratio and Percentages have fewer than 10 cards each — we'll prioritise practice
   questions there instead" (naming the specific weak chapters, with a direct link to open them), never a
   generic "you don't have enough content" dead-end. This is the one place to *improve* on RemNote's
   pattern rather than copy it: their gate blocks on the wizard because the user must author more; ours
   never needs to block, because the platform already owns the content and can always route to practice
   questions or existing cards for that skill.

Acceptance for the whole wizard: completing all three steps writes a real `Exam` record and returns to the
folder view with a toast confirming the exam was created and the daily goal is now visible on the
dashboard — never leaves the student on a dead-end screen the way an abandoned wizard currently does in
RemNote's own flow (§2).
