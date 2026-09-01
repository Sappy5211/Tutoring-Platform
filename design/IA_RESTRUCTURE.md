# IA restructure — fewer tabs, one hub, a dashboard home

Operator's verdict on the current build: *"too much faff, too many tabs and buttons around that may not
be too practical."* They are right. The student nav currently carries **ten** destinations:

`Home · Learn · Materials · Practice · Ask VIDYA · Progress · Flashcards · Schedule · Teachers · Settings`

That is a menu, not a product. A 12-year-old should not have to choose between ten doors to start work.

## The new shape — five destinations

| Nav item | What it holds |
|---|---|
| **Home** | A **progress dashboard of widgets** — today's task, upcoming exams, a week calendar strip, mastery ring, review queue, streak. Not a feed; a status board you can read in five seconds. |
| **Learn** | **The hub.** Materials (notes), Practice, and Flashcards all live here as sections of one place, because they are three ways of doing the same thing: working through a topic. |
| **Progress** | Mastery over time, the knowledge map, weak-skill drilldown. |
| **Schedule** | Calendar and study plan. |
| **Teachers** | Booking a real teacher. **Kept as its own destination on purpose** — ADR-001 names it the moat, and burying the one thing no competitor has would be strategically wrong even though it is technically a scheduling action. |

Settings moves out of the main nav into the account menu.

## Ask VIDYA stops being a tab
It becomes a **floating bubble available on every screen**. Reasoning: a tutor is not a place you go, it
is help you summon *where you already are*. Making it a destination forced students to leave the thing
they were stuck on in order to ask about it — which is exactly backwards, and it also broke the
block-level context handoff ("ask about *this* step").

The `.ai-fab` bubble already exists. The change is to remove the nav entry and make the bubble
context-aware: it should carry whatever the student is looking at into the conversation.

## Why merging Practice + Materials + Flashcards into Learn is right
They are not three features. They are one loop:

> read the note → try questions on it → review the cards it generated

Splitting them across three tabs made the student assemble that loop themselves. Inside Learn, a topic
page can offer all three as modes of the same topic, which is how the curriculum actually works — and it
is already how `TopicPage` is structured, so the IA was contradicting the content model.

## Onboarding — adopt RemNote's question pattern
Observed live in RemNote (screenshots in `design/remnote/`). The pattern:
- One question per screen, centred card, large heading.
- Options as rows: a **tinted icon tile** on the left, label with the **key phrase in bold**, and a
  **number-key shortcut badge** on the right.
- Pressing the number selects; a **contextual `Continue ↵` appears beside the selected row**; Enter confirms.
- A muted helper line under the question justifying why it is being asked
  ("This helps us create a personalised experience").

Our questions, adapted to an Indian Class 6–8 audience:
1. **Who is studying?** — Student · Parent setting up for my child · Teacher
2. **Which class?** — Class 6 / 7 / 8
3. **What are you working towards?** — School exams · A specific test · Just getting stronger at maths
4. **How did you hear about us?** — attribution, with the justifying helper line
5. Guardian consent (DPDP — already built, keep it as the gate it is)

Keep the number-key shortcuts. They cost nothing and make the flow feel fast and considered.

## What this means for the code
- `Shell.tsx` nav arrays shrink to five; Ask VIDYA leaves the nav; Settings moves to the account menu.
- `Home` is rebuilt as a widget grid.
- A new `LearnHub` surface hosts Materials / Practice / Flashcards as sections.
- Routes are kept working — `/app/practice`, `/app/flashcards`, `/app/notebook` should still resolve so
  nothing breaks, but they are reached through Learn rather than from the nav.
- Onboarding gains the question pattern above.
