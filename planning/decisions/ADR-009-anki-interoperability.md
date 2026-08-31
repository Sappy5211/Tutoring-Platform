# ADR-009 — Anki: interoperate, do not integrate

Status: ACCEPTED. Date: 2026-08-31. Requested by the operator ("integrate Anki").
Relates to ADR-002 (`Flashcard`, `CardState`), ADR-003 (deck split), lane C (FSRS).

## Context

The operator asked to integrate `github.com/ankitects/anki` — the open-source
flashcard system — into VIDYA.

## The blocker, verified before anything else

**Anki is licensed AGPL-3.0** (confirmed by reading `LICENSE` on `main`,
2026-08-31; GitHub reports `NOASSERTION` only because a handful of vendored files
carry other licences, all more permissive).

AGPL-3.0 §13 is the operative clause: if you modify the program and let users
interact with it **over a network**, you must offer those users the complete
corresponding source of your whole work. VIDYA is exactly that — a network-served
application. Linking, vendoring, or porting Anki's code would oblige us to
release VIDYA itself under AGPL.

For a commercial, bootstrapped platform that is not a trade-off to weigh; it is
disqualifying. **We do not take Anki's code.**

This is not a criticism of the licence — it is Anki's deliberate choice and a
reasonable one. It simply means the integration has to take a different shape.

## The distinction that actually matters (and it is not visual)

Worth stating plainly, because the intuition here is usually wrong in one specific way:

- **Features and ideas are free.** Spaced repetition, cloze deletion, image
  occlusion, a due-count badge, deck options, a review queue with Again/Hard/
  Good/Easy — none of that is protected. Anki did not invent spaced repetition,
  and functionality is not copyrightable. **We can build every one of these, and
  we are going to.**
- **Restyling does not launder code.** Changing the palette, the icon set, the
  spacing and the component names does not affect AGPL at all — the licence
  attaches to the source, not the appearance. A recoloured copy of AGPL code is
  still AGPL code. So "it will look different" is true and irrelevant to this
  question.

Which lands exactly where the operator's instinct pointed: **take the features,
write our own implementation.** That is not a compromise forced by the licence —
it is also the better build, because our cards must carry `skillTags`, feed the
prerequisite graph, respect the ADR-003 mix policy, and render maths through
KaTeX. Anki's internals assume none of that. Porting it would mean fighting a
desktop-first, Rust-and-Qt architecture into a curriculum-bound React app.

## What we actually wanted from Anki, and where each part really comes from

Usefully, almost everything valuable is available without touching AGPL code.

| What | Source | Licence | Status |
|---|---|---|---|
| **The scheduling algorithm** — the thing that makes Anki good | **FSRS**, via `ts-fsrs` | **MIT** (v5.4.1, verified on npm 2026-08-31) | Already the plan of record (lane C, ADR-002 `CardState`). **Not yet built — `P3.5`.** |
| Reference implementation of FSRS | `fsrs-rs` | BSD-3-Clause | Available if we ever need a native/server port. |
| **Deck interoperability** (`.apkg`) | The file format, not Anki's code | Formats are not the program | See below. |
| Card-type design, queue UX, deck options | Ideas | — | Already captured via `research/B2_remnote_verified.md` — RemNote's model is itself Anki-derived. |

**FSRS is the point.** It is Anki's own scheduler, developed by the
open-spaced-repetition project, and it is separately available under MIT. We get
the substance of "integrate Anki" without the licence. Nothing about lane C's
design changes.

## Decision

**0. Build the flashcard features ourselves** — spaced repetition, cloze,
image occlusion, the review queue, deck options. All of it is in scope and none
of it is blocked. Design them to our own palette, icons and component kit, and to
our data model (`skillTags`, the mastery/exam-rehearsal deck split, KaTeX maths).

**1. Never link, vendor, port, or copy Anki source.** Not into the app, not into
a build step, not into a server-side worker. Record this so nobody "helpfully"
adds it later: an AGPL dependency arriving unnoticed is a real risk in a codebase
where an agent installs packages.

**2. Build `.apkg` import and export** — interoperability at the file-format
layer, which is not derivation of the program. Permissive tooling exists
(`anki-apkg-export`, MIT; `anki-apkg-parser`, ISC), and the format is
well-documented (a zip of a SQLite database plus media). Verify the licence of
any such dependency at install time regardless.

- **Import** is a genuine acquisition hook in India. Anki use is widespread in
  NEET and competitive-exam preparation; a student arriving with an existing deck
  can bring it rather than abandon it.
- **Export** matters for trust and for DPDP data-portability posture. A student's
  own cards should never be trapped in our product.

**3. Imported decks live in the personal layer and never touch mastery.**

This is the part that would be got wrong by default, and it follows directly from
decisions already made:

- VIDYA's published cards pass a human approval gate and an authored card-type
  mix policy (ADR-003). An imported deck passes neither.
- Imported cards carry no `skillTags`, so they cannot be attributed to the
  curriculum graph (ADR-002).
- Therefore imported cards **must not** update `pMastery` or `abilityRating`.
  Letting them would corrupt the mastery estimate with content of unknown
  quality and unknown alignment — the same failure ADR-006 §4 guards against
  from a different direction.

Mechanically this is the deck split we already have. `Flashcard.deck` gains a
third value:

```ts
deck: "mastery" | "exam_rehearsal" | "personal_import"
```

`personal_import` cards are scheduled by FSRS like any other card (the student
gets real spaced repetition on them — that is the whole point), appear in the
review queue, and are **excluded from mastery estimation**, exactly as
`exam_rehearsal` is.

**4. Import is student-scoped, never a content-authoring path.** An imported deck
belongs to the importing student. It is never promoted into published curriculum
content, because published content requires the human gate.

## Consequences

1. `Flashcard.deck` gains `"personal_import"`. ADR-002 amended.
2. `P3.5` (FSRS queue) gains the import/export surface. It is **not** Milestone 1
   work — Codex should not build it now.
3. A **licence check belongs in CI.** With agents installing packages, an AGPL or
   otherwise copyleft dependency can arrive without anyone reading a LICENSE file.
   Add a dependency-licence allowlist gate (MIT / ISC / BSD / Apache-2.0) that
   fails the build on anything else. This is cheap now and very expensive to
   retrofit after a release.
4. Media in `.apkg` files (images, audio) needs the same handling as any
   user upload: size limits, type allowlist, and scanning. An imported deck is
   untrusted input.

## Open questions
1. Should imported decks be *convertible* into curriculum cards by an author —
   i.e. an author reviews an imported deck, tags it, and publishes it? Possible,
   but it must go through the normal review gate, and copyright in third-party
   decks is not ours to republish. Leaning **no** for v1.
2. Do we support Anki's cloze and image-occlusion note types on import, or
   flatten to basic? Flattening loses value; supporting them is real work.
   Recommend supporting cloze at minimum, since it is the most common.
3. Is `.apkg` export enough for portability, or do we also want plain CSV?
   CSV is trivial and universally useful — probably both.
