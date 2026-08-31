# RemNote actual product UI — observed from operator screenshots (2026-08-31)

Source: six screenshots of the operator's own signed-in RemNote 1.28 workspace, supplied directly.
This is PRIMARY evidence of the real product UI — higher grade than the marketing site in `remnote.md`.
Personal document titles are omitted; only structure is recorded.

## 1. Global shell / navigation

**Left sidebar (dark, ~200px, distinct darker panel than the content area):**
- Account row at top: avatar chip + username + up/down switcher caret; sidebar-collapse icon at the right.
- Primary nav, icon + label, single level:
  - `Search`
  - `Documents & Folders` (active state = lighter filled rounded-rect background)
  - `Today's Note`
  - `Flashcards` — **carries a due-count badge** (a pill showing e.g. "30" with a target icon). This is the
    single most important nav element in the product: it is the daily-habit entry point.
  - `Create` (⊕) — bold, acts as the primary create affordance
- Section header `Documents`, then a **document/folder tree**: coloured folder icons (green, blue —
  user-assigned colour), page icons, emoji prefixes on some items, expand chevrons for nesting.
- Sidebar footer: `Tutorials`, `Settings`, `Invite Friends`, `Upgrade To Pro` (diamond icon, violet accent).
- A dismissible product-announcement banner spans the top of the content area (version + tagline + ✕).
- Floating `?` help button, bottom-right.

## 2. Library view — "Documents & Folders"

- H1 page title, left aligned, large and heavy.
- Top-right action pair: **`Upload & Learn PDF`** (secondary/outline, upload icon) and **`+ Create`**
  (primary, filled indigo/violet). Note the *ingest* action is promoted to equal billing with *create*.
- Filter bar below the title:
  - a search input (magnifier, rounded, pill),
  - a horizontally scrollable row of **filter chips with live counts**:
    `All · 167` | `Documents · 144` | `Folders · 23` | `PDFs · 2` | `Tags · 0` | `Daily Notes · 0`,
    each with its own small coloured icon; a `›` chevron indicates more chips off-screen,
  - a `Newest first` sort dropdown (clock icon) at the far right.
- Result list is **grouped under date headings** ("August 28th", "August 27th"…), reverse-chronological.
- Each row: type icon in a rounded square, title (medium weight), **breadcrumb path underneath in muted
  text** (`Folder › Subfolder`), and a `⋯` overflow menu at the far right.
- Thin custom scrollbar on the right edge.

## 3. `Create` menu (popover) and the AI submenu

Primary popover, each item with a distinct coloured circular icon:
- `Folder` · `Document` · `Infinite Canvas` **[Pro badge]** · `Upload File` **[3 Free badge]** ·
  `AI Learning Tools ›`

`AI Learning Tools` flyout submenu — this is RemNote's whole AI surface in one menu:
- `Record Lecture` **[Pro]** (mic icon)
- `Generate AI Flashcards`
- `Generate AI Quiz`
- `Ask AI Tutor`
- `AI Summarize`
- `Upload & Learn`
- `Learn from YouTube`

Observation: monetisation is expressed as **inline badges on menu items** (`Pro`, `3 Free`) rather than
blocking modals — the feature is visible, the gate is stated at the point of intent.

## 4. Document editor

- Large `Untitled` title with caret; the document body is an **outliner** — content starts as a single
  empty bullet.
- **Empty-state action chips sit directly under the title**: `Upload PDF/PPT`, `Tag`, `Record` (mic).
  These disappear once content exists. Cheap, high-value onboarding pattern.
- Top-right document actions: emoji/icon picker, `Share`, star (favourite), `⋯`, `＋`.
- **A persistent bottom toolbar** (mobile-style, but present on desktop too):
  `Flashcard ⌄` · `Heading ⌄` · `Todo` · `Image` · `Table ⌄` · `More ＋` · `Undo` · keyboard-dismiss icon.
  Items with `⌄` open a popup of sub-choices.
- `Flashcard ⌄` popup, header "FLASHCARDS":
  `Single Line` · `Multi Line` · `List` · `Multiple Choice` · `Cloze`
  — i.e. **card type is chosen at the block level from the editor toolbar**, not in a separate card app.

## 5. Document `⋯` menu (full inventory, in order)

`Flashcards ›` · `Change Document Icon ›` · `Learn With AI Tutor` · `Share Document` ·
`Undo ⌘Z` · `Find or Filter ⌘F` · `Change Document Status ›` · `Open in New Tab` ·
`Open in Another Pane` · `Move` · `Print` · `Export` · `Stats` · `View Trash` · `Delete` (red, last).

Notable: `Open in Another Pane` (split view), `Change Document Status` (a lifecycle/workflow state on a
document), and `Stats` (per-document study analytics) are all first-class.

## 6. Folder view + the `Exam` object

- Folder header: emoji + inline-editable `Untitled Folder` title, then actions:
  **`Create Notes`** (primary, filled) · `Upload PDF` · `Record` · `＋`
- The `＋` menu contains: `Subfolder` and **`Exam`**.
  → **An Exam is a first-class object created inside a folder.** This is the container for RemNote's
  exam-date scheduler ("set your exam date and we'll tell you what to study each day").
- Empty state: a soft illustrated graphic (dashed path threading document/folder shapes) inside a large
  rounded panel, with muted copy "Your upcoming documents and sub-folders will be displayed here".
  Illustrated empty states, not blank space.

## 7. Visual language

Dark theme by default. Near-black content ground with a slightly darker sidebar; generous vertical
rhythm; heavy/large page titles against small muted metadata; rounded pill controls throughout
(chips, inputs, buttons); a single violet/indigo accent used for the primary action, the active nav
state, and the Pro upsell; semantic colour used sparingly (green/blue folders, red for Delete).

## 8. Transferable patterns for VIDYA — coordinator's read

1. **Due-count badge on the review entry point** — adopt verbatim. It is the daily-habit hook.
2. **Ingest promoted to equal billing with create** — for us the operator ingests syllabus material, so
   the *author* console needs this; the student console does not.
3. **Filter chips with live counts** — adopt for the topic/question library.
4. **Card type chosen from the editor toolbar at block level** — adopt; it is why RemNote's
   notes-and-flashcards-are-one-object claim actually holds in the UI.
5. **Exam as a first-class object with a date** — adopt and make central: for India this becomes
   "CBSE Class 10 Boards — 14 Mar 2027" or "JEE Main Session 1", driving the whole study schedule.
6. **Inline Pro/quota badges instead of blocking modals** — adopt for the freemium boundary.
7. **Empty-state action chips under the title** — adopt for the authoring editor.
8. **`Open in Another Pane`** — adopt for study mode: notes on one side, practice or AI tutor on the other.
9. **Bottom toolbar** — adopt on mobile; it is the correct answer for one-handed phone editing.
10. **REJECT** the flat 167-item reverse-chronological library as the *student's* primary view. That is
    right for a personal knowledge tool where recency is relevance. Our students need
    **syllabus order** — Chapter → Topic — with mastery state, not "what I touched last".
    Recency belongs in a secondary "Continue where you left off" strip.
