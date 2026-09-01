# Stitch reference screens

Generated with Google Stitch against the `VIDYA Study` design system
(`assets/16559847253341850222`, project `13140110546986003262`), which encodes the same principles as
`design/DESIGN_BRIEF.md`.

**These are direction references, not specs.** Do not copy pixel values; the built UI must use the
project's own tokens and primitives.

## `home-mobile.png` — daily study home
What it gets right and we should keep:
- **One dominant "What's next?" card.** A single question answered: topic, one-line reason, minutes,
  and one filled primary button. Everything else on the screen is quieter than it.
- **Colour appears exactly twice** — the Start button and the mastery bars. Nothing else is saturated.
- Three supporting stats sit in a quiet row *below* the primary action, not competing with it.
- Hairline 1px borders, no drop shadows on flat cards.
- Large tight-tracked headings against small muted metadata.

What we do differently: our mastery bars use the shared four-band scale (secure / developing /
needs-work / locked), and the bottom nav is our five-item bar with Practice emphasised centre.

## `home-dashboard-desktop.png` — the widget-grid home (IA restructure)
Generated for the IA restructure in `design/IA_RESTRUCTURE.md`. Corroborates the plan independently.

What it gets right and we should keep:
- **Five-item sidebar only** — Home, Learn, Progress, Schedule, Teachers. Materials/Practice/Flashcards
  and Ask VIDYA are gone from the nav, exactly as the IA doc specifies.
- **"Today's focus" is a wide widget spanning two columns** and is the only place a filled green button
  appears. Everything else on the board is monochrome.
- **Upcoming exams** emphasises the nearest one (a green "2 days left" against a muted "8 days left") —
  urgency conveyed by contrast rather than by shouting.
- **Mastery widget** pairs a ring with three labelled band bars, so the ring is explained rather than
  decorative.
- **Cards due and streak are small.** They are status, not the point of the product.
- Small uppercase muted widget titles against large tight-tracked numbers.

Where we differ: our band bars use the shared four-band scale, our numbers come from the real fixture
repository (widgets with no backing data get an honest empty state rather than a plausible number), and
each widget carries a hover-revealed options menu.
