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

---

# The teaching sequence after the first card — the best design in their product

Continued walkthrough, 2026-09-02. This is the part worth copying most, and it is not visible from any
screenshot of a single screen — it only shows up if you walk it.

## Beat 1 — the card lands in a real document
After "Add this flashcard to my notes", the screen shows a document titled **"Class 7 Maths Notes"** —
built from the free-text class name typed several steps earlier — with the card rendered **as a bullet
inside it**: `FRONT OF CARD → BACK OF CARD`. A toast confirms *"We added your flashcard to your notes."*

The student now has a real artifact in a real document named after their real class, before they have
learned anything about the product.

## Beat 2 — name the rule, after they have seen it
The next beat replaces the toast with the rule stated plainly:

> **"Any bullet with → is a flashcard"**

Note the order. The rule is *not* taught first. It is named only once the student has already seen it
happen. The CTA changes to **"Add another flashcard"**.

## Beat 3 — a guided tutorial inside the real editor
The final beat is a numbered checklist floating beside a live, empty bullet in the actual document:

> **Now, type your own flashcard!**
> 1. Type a question   `[ Type it for me ]`
> 2. Type `==` on your keyboard to add an arrow   *(dimmed)*
> 3. Type an answer   *(dimmed)*

Three things make this good:
- **Future steps are dimmed** until the current one is done — the student is never reading instructions
  for something they cannot yet do.
- **Completed steps are removed entirely**, so the checklist shrinks as they go. Progress is felt, not
  reported.
- **"Type it for me" is an escape hatch on the hardest step.** Nobody gets stuck on step one.

And critically it happens **in the real editor on their own document**, not in a simulation. What they
practise on is what they keep.

## What we should build
Our `--` trigger has no equivalent onboarding. A student meets the syntax cold in the outliner. We should
build this sequence against our own trigger: land the onboarding card in a real note, name the rule
(*"any bullet with → is a flashcard"*), then run a dimmed-and-shrinking three-step checklist beside a
live bullet, with a "type it for me" fallback on step one.

## One place our implementation is already better
Typing `==` via programmatic text insertion did **not** convert in RemNote — the literal characters
stayed in the bullet. Their trigger appears to be bound to real keystrokes, so paste, IME composition,
and assistive input would all miss it. **Ours converts on the input's value ending with the trigger**, so
it fires regardless of how the text arrived. Keep that; it is the more robust of the two, and it matters
for students using a phone keyboard or a regional-language IME.
