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
