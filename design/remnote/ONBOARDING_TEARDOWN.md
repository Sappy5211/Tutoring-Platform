# RemNote onboarding — walked live, 2026-09-02

Primary evidence: the operator's own signed-in RemNote account, walked end to end in the browser with
their explicit permission. Higher grade than any scrape.

## The flow, in order
1. **Who are you?** — Professional · High School Student · Graduate Student · College/University ·
   Med Student · Other
2. **How did you first hear about RemNote?** — ChatGPT/AI · Social media · Friends/Class/School ·
   Google · YouTube · Other. **Carries a justifying helper line**: *"This helps us create a personalized
   experience with the RemNote app."*
3. **What do you want to achieve?** — bold key phrase in each option ("higher grades for my **classes**",
   "a specific **exam**", "a **personal learning goal**", "a **note-taking workspace**")
4. **Branches on the answer.** Choosing "specific exam" asks **What's this exam for?** — a class
   quiz/midterm/final vs a standardized exam/certification.
5. **A free-text step that seeds real content**: *"What's a class you're taking now?"*
   (placeholder "Type a single class name — e.g. Biology 101"). This becomes an actual document.
6. **What do you want to do first?** — "Generate flashcards and quiz **(recommended)**" with the
   sub-label *"From an uploaded PDF"*, versus "Make notes and flashcards".
7. **Make your first flashcard** — see below.
8. Quickstart video gate.

## Mechanics worth stealing
- **Number-key shortcuts (1–6) on every option.** Press the number to select.
- **A contextual `Continue ↵` appears beside the selected row** — not fixed at the bottom of the card.
  Enter confirms. The whole flow is operable without a mouse.
- **Icon tile per option**, each with its own tinted background colour.
- **Bold the key phrase** in the option label so the choice is scannable.
- **A helper line justifying the question** where the question is for the company's benefit rather than
  the user's (the attribution question). Asking why-are-you-asking-me is answered before it is asked.
- **Branching questions** — the flow adapts rather than asking everyone everything.

## The single best pattern: "Make your first flashcard"
The last step before the app shows a **pre-filled sample card built from the class you just typed**.
Having typed "Class 7 Maths", it offered:

> **FRONT OF CARD** (blue label) — "What is the sum of interior angles of a triangle?"
> **→**
> **BACK OF CARD** (green label) — "180°"
> `Add this flashcard to my notes`

Three things at once, which is why it is good:
1. It **teaches the arrow metaphor** — front → back — before the student ever meets the `--` syntax.
2. The content is **relevant to their own subject**, so it does not feel like a demo.
3. It **produces a real artifact** in their workspace. Onboarding ends with something made, not with a
   settings object saved.

**Our onboarding currently ends by dumping the student on the home screen.** It should end here instead:
a pre-filled first card for the class they chose, which they add and then immediately see in their
notebook. Strong candidate for the next build.

## Anti-pattern — do NOT copy
Skipping the quickstart video triggers a confirm dialog: *"Are you sure? It's better to take 3 minutes
now to save yourself hours of confusion later!"* That is a guilt-trip retention gate. On an adult
power-user tool it is merely irritating; aimed at an 11-year-old it is manipulative, and it sits badly
next to a product whose promise is trustworthy marking. Let students skip without an argument.
