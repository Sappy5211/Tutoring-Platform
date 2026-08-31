# P3 — Anki mechanics: extracted, judged, and mapped to VIDYA

Source: Anki's own manual at `docs.ankiweb.net`, scraped to `corpus/anki-*.md` (2026-08-31).
**Behaviour documentation only — no source code was read, copied or ported.** See ADR-009: Anki is
AGPL-3.0, so we take the mechanics and write our own implementation. Features are not copyrightable;
that is the whole basis on which this is safe.

Audience reminder that drives most verdicts below: **VIDYA's students are 11–14 (CBSE Class 6–8)**, not
medical students optimising a 20,000-card deck. Anki exposes ~40 deck options because its users demand
them. Shipping that to a child is a failure of product design, not a feature.

---
## 1. The review loop — ADOPT nearly whole

| Mechanic | Anki's behaviour [observed] | VIDYA |
|---|---|---|
| Three queues | **New**, **Learning**, **Review**, counted separately on a deck overview | **ADOPT** |
| Reveal | Question first; `Show Answer` or `Space` | **ADOPT** |
| Rating | **Again `1` · Hard `2` · Good `3`/`Space`/`Enter` · Easy `4`** | **ADOPT** — same keys |
| **Interval preview on each button** | Every button shows *when the card returns* if you press it | **ADOPT — do not skip this.** It is the mechanic that makes the rating honest: the cost of "Easy" is visible before you press it. Cheap to build, disproportionately valuable. |
| Expected distribution | Again 5–20%, Good 80–95% | **ADOPT as a health signal**, surfaced to the author/teacher, never as a scold to the student |
| Fuzz | Small random jitter on intervals so same-day cards don't clump forever | **ADOPT** — `ts-fsrs` does this for us |
| Guidance | "If you can't recall in ~10s, show the answer" | **ADOPT as onboarding copy** |

Anki's own note that we should heed: repeating a card several times in one day contributes little to
long-term memory, so keep learning steps minimal. That argues for **short learning steps** and against
letting a struggling child grind the same card.

## 2. Card management during review

| Mechanic | Verdict | Reasoning |
|---|---|---|
| **Bury** (hide until tomorrow) | **ADOPT** | The honest "not now" that isn't quitting. |
| **Suspend** (hide until manually restored) | **ADAPT → author/teacher only** | A child suspending cards is just avoidance, and it silently removes syllabus content. Authors need it; students don't. |
| **Flag** (coloured, searchable) | **SIMPLIFY → one "Ask about this"** | Anki's five colour-coded flags are a power-user triage system. For us the useful version is a single flag that **routes the card into the AI tutor and the pre-call teacher context** (ADR-006 §7's escalation seam). One button, real destination. |
| Set due date | **REJECT for students** | Manual scheduling defeats the scheduler. Author-side only, if at all. |
| Mark note (tag) | **REJECT** | Redundant with the flag above. |
| Edit inline | **ADAPT** | Students edit *their own* cards (personal layer); published curriculum cards are read-only, per lane B's two-layer model. |
| Card info / review history | **ADOPT, simplified** | "You've seen this 6 times, last 3 correct" is motivating and legible. The full stats table is not. |
| Audio replay / record own voice | **DEFER** | Interesting for languages, marginal for maths. Revisit with lane H. |

## 3. Siblings and burying — ADOPT, and it matters more for us than for Anki

A note generates several cards (front→back, back→front, each cloze). Those are **siblings**. Anki buries
the siblings of a card you just answered so you don't see the same fact three times in one session.

**This is more important in our product than in Anki's**, because our cards are auto-generated from notes
(ADR-003). A single note block can easily yield a concept card, a reverse card and two clozes covering the
same idea. Without sibling burying, a student's session becomes four near-identical questions about one
fact — which feels like the product is broken and teaches nothing extra.

**ADOPT**, and make it default-on and non-optional for students.

## 4. Leeches — ADOPT, but change the action

Anki: when a card lapses N times (default 8), tag it a **leech** and by default **suspend** it.

Suspending is right for a self-directed adult curating their own deck. For a child on a **required
syllabus** it is exactly wrong — it silently deletes a piece of the curriculum precisely where they are
struggling most, which is the one place a teacher should be involved.

**VIDYA's leech action:**
1. Stop re-showing the card in the normal queue (it isn't working).
2. Mark the underlying **skill** as needing help.
3. **Surface it as a teacher-call prompt** with the lapse history attached (ADR-001's moat; ADR-006 §7's
   context handoff).
4. Tell the student something true and non-punitive: *"This one keeps slipping — worth 10 minutes with a
   teacher."*

A leech is our single best-qualified signal that a human is needed. Anki throws it away; we should sell it.

## 5. Deck options — REJECT almost entirely

Anki exposes: daily limits, learning steps, graduating interval, easy interval, insertion order,
relearning steps, minimum interval, leech threshold/action, five display-order controls, burying, audio,
timers, auto-advance, easy days, FSRS retention and parameters, maximum interval, historical retention,
starting ease, easy bonus, interval modifier, hard interval, new interval, custom scheduling.

**A Class 7 student must see none of this.** Every one of these is a way to make your own scheduling
worse, and the research (lane C) says the defaults are good.

| Setting | Who sets it |
|---|---|
| New cards/day, max reviews/day | **Derived**, not chosen — from the Exam Scheduler's daily goal (ADR-006 / B2 §3) |
| Desired retention | **Fixed at 0.90**, the documented default. Exposed only in an author/admin console. |
| Learning + relearning steps | **Fixed**, deliberately short (Anki's own advice) |
| Leech threshold | **Fixed at 8**, tunable by an author |
| Everything else | **Not exposed at all** |

The one student-facing control worth keeping: **"How much time do you have today?"** — which adjusts the
session length. That is the question a student can actually answer.

## 6. Notes → cards, and templates

Anki's model: a **Note** holds fields; **templates** generate one or more **Cards** from it. This is the
right abstraction and we already have it — a note block with `::` / `;;` / `{{cloze}}` generates cards
(B2 §1), and `Flashcard.sourceBlockId` links back.

**ADOPT the concept, REJECT the template editor.** Anki's HTML/CSS card-template system is a power-user
surface with its own error-reporting page. Our card *types* are fixed and rendered by our own components
with KaTeX maths.

## 7. Filtered decks / custom study — ADAPT

Anki's "filtered decks" build a temporary deck from a search ("all cards tagged trigonometry, due or
not"). Powerful, and its UI is a search-query language no child will use.

**The useful 10%:** a **"Cram this topic"** button on a Topic page — build a temporary session from one
skill's cards regardless of due date, without disturbing the real schedule. Same mechanic, no query
language.

## 8. What we take that Anki does not have

- Cards carry **`skillTags`** and feed the prerequisite graph — Anki's cards know nothing about curriculum.
- The **mastery / exam-rehearsal / personal-import deck split** (ADR-003, ADR-009).
- **Leech → human teacher**, not leech → suspend.
- Limits **derived from an exam date**, not typed in by the user.

## 9. Build order
1. `Flashcard` + `CardState` + `ReviewLog` in contracts (ADR-002 already specifies `CardState`).
2. `ts-fsrs` (MIT) as the scheduler — Anki's own algorithm, licence-clean.
3. Review session UI: queue counts → question → reveal → 4 ratings **with interval previews**.
4. Bury, flag-to-tutor, sibling burying, leech detection.
5. `.apkg` import into `personal_import` (ADR-009). Later.

## 10. Verification notes
- **Leech threshold verified after writing**: `corpus/anki-leeches.md` confirms the default is **8
  lapses**, and that Anki's action is tag-as-leech **and suspend** — exactly as §4 assumed. Additional
  detail worth having, learned on the re-read: **Anki re-warns at half the threshold** (so every 4 lapses
  after the first warning), and it names *interference* — two similar items confusing each other — as a
  common cause. That applies directly to maths: area vs perimeter, mean vs median, factor vs multiple.
  Worth using when we choose which leeches to route to a teacher.
- Everything else here was read from the harvested pages listed in `corpus/_harvest_anki.log`.
