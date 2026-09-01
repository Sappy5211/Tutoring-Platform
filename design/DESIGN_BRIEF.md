# VIDYA redesign — shared brief

**Every redesign agent reads this file. Do not restate it back; act on it.**
Repo: `~/Tutoring-Platform`. App: `apps/web`. Shared kit: `packages/ui`.

## The mandate
Make the product **simpler, quieter and unrecognisable from its current self**, with every control
actually working. It currently looks like generic SaaS: mid-green everywhere, uniform cards, no
hierarchy. Fix that.

## Design thesis — Notion-influenced, semantically coloured
Load `~/.claude/skills/awesome-design-systems` and use its **Notion** entry as the reference language.
Then apply these, which are the parts that matter here:

1. **Near-monochrome.** Colour carries meaning or it does not appear. On any screen the only saturated
   things should be (a) the single primary action and (b) mastery bands. Everything else is ink, muted
   ink, and a 1px border. The current build's green-on-green is the main thing to kill.
2. **Content leads.** Large confident page titles with tight negative letter-spacing, small muted
   metadata, generous whitespace. No drop shadows except on floating layers (menus, dialogs, peeked
   panels, toasts).
3. **Hover reveals.** Row actions, drag handles and overflow menus appear on hover/focus, not at rest.
   They must still be reachable by keyboard — `:focus-visible` shows them too.
4. **Radii:** controls 10px, containers 16px, pills/avatars full. Never a fully-rounded button.
5. **One accent.** `--primary` is the only brand colour. Mastery bands are semantic, not brand.

## Tokens — the contract
`apps/web/src/styles.css` already has a `@theme` block and CSS custom properties. **Extend the token
set there; never hard-code a hex outside it.** The mastery scale is shared by every progress surface:

| band | light | meaning |
|---|---|---|
| secure | `#2F9E6E` | ≥70% |
| developing | `#D9A441` | 45–69% |
| needs-work | `#D1685F` | <45% |
| locked | `#8B9A94` | not unlocked |

Typography: headings **Plus Jakarta Sans**, body **Inter**. Both must render Devanagari acceptably for
later Hindi support — do not pick a Latin-only display face.

## Styling approach — READ THIS, it prevents merge conflicts
The project has **Tailwind v4** installed and a large hand-written `styles.css`.
**Write new UI as Tailwind utility classes in the TSX you own.** Do not add rules to `styles.css` —
several agents are working at once and that file is a shared contract you do not own. If you genuinely
need a token, add it to the `@theme` block only if you are the design-system agent; otherwise use what
is there and note the gap in your report.

## Hard constraints
- **React 18 + TypeScript + Tailwind v4.** Load `~/.claude/skills/ultimate-react` and follow it.
- **Load `~/.claude/skills/ultimate-design`** and comply with it: focus states, form labelling, reduced
  motion, dark mode, hydration-safe, contrast. This is a compliance rulebook — treat it as binding.
- **Mobile-first.** Mid-range Android, 360px up. Test 360 / 768 / 1280.
- **Both themes.** Light and dark must both work. The app toggles `data-theme` on `<html>`.
- **`prefers-reduced-motion`** honoured on every animation, with a stated fallback.
- **Bundle budget: ≤200KB gzipped initial JS.** Currently ~151KB. Do not add a dependency without
  saying so in your report. `motion` is available; prefer CSS for simple transitions.
- **Every button must do something.** No dead controls. If the real behaviour is a later phase, wire it
  to visible local state, a toast, or navigation — and say which in your report.
- **Honest empty states.** Never fake data that could be mistaken for real.

## What the product is (so you design for the right person)
India-first learning platform, **CBSE Class 6–8 Maths**. Students are 11–14, on phones, often at night,
often on shared networks. Parents look over their shoulder. The competitive position is
"curriculum-bound practice that escalates to a real teacher" — so the UI should feel calm, precise and
school-serious, never a gamified toy and never a corporate dashboard.

## Verification before you report DONE
- `pnpm typecheck` passes (run it).
- Render what you changed and look at it. Do not report visual work you have not seen.
- State the routes you changed so the coordinator can spot-check.

## Ownership
Your packet names the files you own. **Touch nothing else.** If a change seems to require a file outside
your list, stop and say so in your report rather than editing it.
