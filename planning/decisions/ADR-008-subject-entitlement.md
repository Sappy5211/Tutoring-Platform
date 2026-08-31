# ADR-008 — Subject switching and entitlement gating

Status: ACCEPTED. Date: 2026-08-31. Requested by the operator.
Amends `ADR-002` (`Subject`, `Entitlement`) and touches lane E's pricing model.

## Context

The operator asked for a subject dropdown beside the VIDYA wordmark — Maths plus
Physics, Chemistry, Biology and Science — where subjects outside the student's
pricing plan show a lock and cannot be opened.

Two things had to be resolved before building it.

### 1. Codex had narrowed `Subject` to a single literal

`packages/contracts/src/model.ts` shipped `subject: "maths"` on both `Skill` and
`Chapter` — a hard literal, not ADR-002's union. Reasonable while only Maths
existed; it makes a subject switcher impossible. Widened back to the union.

### 2. CBSE Class 6–8 does not have Physics, Chemistry and Biology

This is the substantive finding. At Class 6–8 — our launch band per ADR-005 —
CBSE teaches **Mathematics** and **Science** as two subjects. Science does not
split into Physics, Chemistry and Biology until Class 11.

So a flat list of five peers would misrepresent the curriculum, and worse, would
try to *sell* a Class 7 parent three subjects that do not exist at their child's
grade. That is the kind of thing that destroys trust in a product whose whole
promise is being properly curriculum-bound.

## Decision

**Two distinct lock states, which look different and behave differently.**

```ts
type SubjectAccess =
  | { state: "unlocked" }
  | { state: "locked_plan"; requiredTier: PlanTier }        // available here, not in your plan
  | { state: "locked_grade"; availableFromGrade: number };  // not taught at your grade yet
```

| State | Shown as | Clickable? | Why |
|---|---|---|---|
| `unlocked` | subject + tick when active | yes | — |
| `locked_plan` | lock + **"Upgrade"** in accent | **yes → `/app/upgrade`** | This is the offer. Disabling it would hide the thing we want them to click. |
| `locked_grade` | lock + **"Class 11+"**, dimmed, `disabled` | **no** | It is not for sale at this grade. Presenting it as an upsell would be selling something we cannot deliver. |

At launch: Maths `unlocked`, Science `locked_plan` on the single-subject tier,
and Physics/Chemistry/Biology `locked_grade` from Class 11.

**Gating is enforced in the store, not only in the dropdown.** `setSubject()`
re-checks `accessFor()` and refuses a locked subject regardless of caller. UI
state is a presentation concern; entitlement is not.

**And it is a mock of a server decision, not the decision.** `Entitlement` is
marked server-evaluated in the contract. Nothing that costs money or exposes paid
content may be gated on the client copy alone — that is `P3.7`'s job.

## Consequence for pricing — needs the operator

Lane E priced a single **₹299/month "Plus"** tier. A per-subject lock implies a
different shape. `PlanTier` is provisionally `free | single_subject |
all_subjects`, which is a **placeholder, not a pricing recommendation**. Two
options, and the operator should pick before `P3.7`:

- **Per-subject** (₹299 Maths, ₹299 Science, ₹449 both) — higher ARPU ceiling,
  more decisions for the buyer, and at Class 6–8 there are only two real subjects
  so the "bundle" is thin.
- **Tiered bundle** (Free / ₹299 all subjects at your grade) — simpler to explain,
  and lane E's finding that the subscription is the profit centre argues for
  removing friction from it rather than adding a second purchase decision.

Coordinator's lean: **tiered bundle.** Two subjects is not a catalogue, and
splitting them mostly buys a worse checkout.

## Files changed (Claude, on explicit hand-over, per `MASTER_PLAN.md` §15b)
- `packages/contracts/src/model.ts` — `Subject` union restored; `SubjectAccess`,
  `PlanTier`, `SubjectEntitlement`, `Entitlement` added.
- `apps/web/src/lib/store.ts` — subject + entitlement state, guarded `setSubject`.
- `apps/web/src/app/SubjectSwitcher.tsx` — new.
- `apps/web/src/app/Shell.tsx` — mounts the switcher, replacing the hardcoded
  `<small>Maths</small>`.
- `apps/web/src/features/auth/SignInPage.tsx` — new.
- `apps/web/src/router.tsx` — `/signin` route.
- `apps/web/src/styles.css` — styles for both.

Verified: `pnpm typecheck` clean, `pnpm test` 17/17 pass, `pnpm build` succeeds
at **132 kB gzip** main bundle (budget 200 kB), and both surfaces were rendered
and interacted with in a browser.

## Open questions
1. Pricing shape (above). Blocks `P3.7`.
2. When Science ships, does a Class 6–8 student see one "Science" or three
   strands? One subject, matching CBSE. Revisit at Class 9.
3. Should a locked subject's *syllabus* be browsable (a preview that sells) while
   practice stays locked? Probably yes — worth testing.
