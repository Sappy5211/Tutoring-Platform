# RED_TEAM_REVIEW — VIDYA Master Plan

Status: DONE_WITH_CONCERNS. Reviewer: red-team pass over `MASTER_PLAN.md`, `decisions/ADR-001-product-thesis.md`,
`decisions/ADR-002-canonical-data-model.md`, `00_MISSION_BRIEF.md`, and eight lane research files. This
document owns no other file and edits nothing outside itself.

**Reading key**: every finding below is evidence-grounded — a direct quote with file and section/line, not
a vibe. Fixes are concrete enough to hand back to the coordinator as a punch list. Findings are ordered
most severe (structurally blocking or moat-undermining) to least (real but containable).

---

## 1. No lane owns authentication/accounts — yet every entity in ADR-002 and every phase after Phase 0 depends on one existing

**Claim**: the plan has a foundational, load-bearing gap that nobody was ever assigned to close, and the
build sequence hides this by scheduling "signup" as a Phase 6 launch gate rather than a Phase 0 blocker.

**Evidence**: ADR-002's canonical spine (`decisions/ADR-002-canonical-data-model.md`) defines
`StudentSkillState.studentId`, `CardState.studentId`, `AttemptEvent.studentId` — every per-student table keys
off a `studentId` that is never itself defined as an entity anywhere in the document. Lane E's own
`Teacher` interface types the gap explicitly: `userId: string; // FK to base User/auth record`
(`research/E_india_ops_and_market.md` §5.3) — a comment admitting the referenced record doesn't exist yet.
Lane D states outright that consent/signup design "belongs in whichever lane owns account/auth design —
flagging the dependency here" (`research/D_ai_grading_and_tutor.md`, DPDP note, line 470) — "whichever lane"
because none was assigned. Lane E confirms the same orphaning from its side: the guardian-gate signup flow
is "a design input for Lane A/UI, not something this lane builds" (`research/E_india_ops_and_market.md` §4.3).
Grepping all eight lane files for `OAuth`, `password`, or a login/session design returns nothing. The
master plan then schedules "`P6.1` parental-consent signup flow (**gates public launch**)" as the *last*
phase (`MASTER_PLAN.md` §14, Phase 6) — but Phase 2's own demo goal ("a student answers `2x+6`...") and
every phase after it require a real student identity to attach `AttemptEvent`/`StudentSkillState`/`Booking`
rows to. `P0.2` claims to implement "the ADR-002 schema as Postgres migrations + generated TS types.
**Single source of truth**" (§14, Phase 0) — but that schema has no `User`/`Student`/`ParentGuardian` table
to migrate.

**Why it matters**: this isn't a missing nice-to-have, it's a missing foundation. A cheap coding agent
executing `P0.2` literally cannot build "the single source of truth" schema without inventing an
auth/identity model that no lane specified — meaning the first packet in the build either stalls on
`NEEDS_CONTEXT` or invents ad hoc auth that will conflict with whatever DPDP-compliant consent flow Phase 6
eventually needs, forcing a migration exactly where ADR-001 §3 warned "getting it wrong is the one mistake
that forces a rewrite."

**Fix**: add `User`, `Student`, `ParentGuardian`, and `ConsentRecord` entities to ADR-002 now (even a minimal
v1 shape — email/phone, role, `parentUserId`, `consentStatus`, `consentedAt`), and move a bare-bones
auth+consent skeleton into Phase 0. Keep the *full* DPDP verification flow (DigiLocker, Consent Manager
plug-in point) as the Phase 6 gate for *public* launch — but internal builds from Phase 1 onward need
somewhere real to attach data.

---

## 2. The Plus subscription — the plan's own stated "profit centre" — has no build packet anywhere

**Claim**: the ₹299/month subscription that lane E calls the actual profit centre is entirely unbuilt in
the task sequence; only the teacher-call credit purchase is scheduled.

**Evidence**: lane E: "The profit centre is the Plus subscription, where marginal cost per user... is
close to zero" (`research/E_india_ops_and_market.md` §2.3, line 157) — repeated in `MASTER_PLAN.md` §11's
pricing table. But `MASTER_PLAN.md` §14's only payments packet is `P5.3 Razorpay + credits`, sitting inside
"**Phase 5 — Teacher marketplace**" alongside `P5.1` teacher profiles, `P5.2` booking, `P5.4` 100ms join,
`P5.6` teacher console — every sibling packet is teacher-specific, and "credits" in context means the
teacher-call credit pack, not the subscription. No packet anywhere wires Razorpay Subscriptions/UPI
Autopay, no packet builds entitlement checks that gate "unlimited adaptive practice, unlimited AI tutor,
PDF export" (the Plus feature list, §11) against the free tier's "5 practice questions/day, 10 AI tutor
messages/day" (`research/E_india_ops_and_market.md` §2.2), and lane E's own hard product requirement —
"the subscription cancellation flow must let a user cancel the *mandate*... wired to an in-app 'Cancel
subscription' button" (`research/E_india_ops_and_market.md` §3.2) — has no home in §14 at all. ADR-002 also
defines no `Subscription`/`Entitlement`/`PlanTier` type.

**Why it matters**: this is the revenue mechanism the entire commercial case rests on, and it is the one
pillar with zero implementation packets. A coding agent following §14 literally in order would ship five
phases of product with no way to actually charge for it, and would need to improvise the gating logic
(where? in the practice player? the tutor chat? both, inconsistently?) without a spec.

**Fix**: add an explicit subscription/entitlement packet — ideally in Phase 2 or 3, since that's where
"unlimited adaptive practice" first needs a gate — separate from the Phase 5 teacher-credit work, plus the
matching `Subscription`/`Entitlement` schema in ADR-002.

---

## 3. ADR-002 contradicts itself on `Exam.syllabusSkillIds`, and the master plan tells the coding agent to trust the wrong half

**Claim**: the one document the plan calls "the contract" disagrees with itself on a load-bearing field,
and gives the coding agent no way to know which half is authoritative.

**Evidence**: `decisions/ADR-002-canonical-data-model.md`'s canonical TypeScript spine defines:
`syllabusSkillIds: string[]; // scope, authored once` on `Exam` — a plain, explicitly-authored array. Two
sections later, the same document's "Open questions" says: "Should `Exam` scope be `syllabusSkillIds`
(explicit) or derived from `CurriculumPlacement` (`isCore: true`...)? ... **Leaning derived** with an
explicit exclusion list." The prose recommends derivation; the actual interface it ships implements the
opposite — the authored-array version — with no flag, TODO, or exclusion-list field anywhere near it.
`MASTER_PLAN.md` (front matter) instructs the builder explicitly: "Do not implement from the lane research
files directly... read this file, then `decisions/ADR-002-canonical-data-model.md`" — i.e., ADR-002's code
block *is* the spec to implement literally.

**Why it matters**: this is exactly the kind of ambiguity ADR-002 exists to remove (its own stated purpose:
"Reconciling them is coordinator work... Left unreconciled, a cheap coding agent would pick arbitrarily").
Here the coordinator's own document does the same thing to itself — a coding agent building `P0.2` will
build the literal, duplicative, non-preferred version (an authored `syllabusSkillIds` array that can drift
from `CurriculumPlacement`, reintroducing exactly the write-twice bug pattern collision #3 was resolved to
avoid), while the ADR's own author evidently intended the other one.

**Fix**: the coordinator needs to actually decide (derived-with-exclusions vs. authored-array) and rewrite
the interface to match before handoff — not leave both statements standing.

---

## 4. The frontier-selection algorithm never actually took a curriculum/board parameter — ADR-002's headline fix isn't wired into the one place that needed it

**Claim**: ADR-002's marquee correction (splitting `Board` from `ExamTrack`, adding `CurriculumPlacement`)
does not reach lane C's actual selection algorithm, which still walks one global, curriculum-blind
prerequisite graph — and the CBSE+JEE case ADR-002 is explicitly built around is not actually resolvable
by the schema as written.

**Evidence**: lane C's pseudocode (`research/C_adaptive_engine.md` §5) defines
`FUNCTION selectNextItem(studentId, subjectContext)`. Step 3: `FOR EACH skill IN SkillNode WHERE subject =
subjectContext` — walking `SkillEdge` prerequisites globally, with `subjectContext` typed only as a
`Subject` ("maths"), never a board or exam track. The *only* place curriculum enters the whole algorithm is
a tie-break comment in step 4: "unless the student has an active exam-date goal, in which case weight
toward skills tagged for that exam/board" — a soft re-ranking of an already-computed candidate pool, not a
change to which skills are gated by which prerequisites.

ADR-002's justification for a single global `Skill` graph is: "the pedagogical prerequisite graph is
board-agnostic (factoring a quadratic is the same skill in CBSE and ICSE)" — but that is a claim about
skill *identity*, not about prerequisite *order*, and the two are silently conflated. `CurriculumPlacement`
does correctly let one `Skill` be placed at different grade levels/chapters per board (mechanically this
part works — see §"What's right" below) — but if CBSE teaches skill B before skill A while a state board
or JEE-track sequencing genuinely requires A before B (a live possibility, not a hypothetical: exam-track
problem-solving depth routinely reorders which sub-skills are prerequisite to which), the single global
`SkillEdge.type = "prerequisite"` graph can only encode one order. `CurriculumPlacement.sequenceInChapter`
is per-curriculum by design, but nothing reconciles it against the (curriculum-blind) `SkillEdge` gate that
actually controls when a skill unlocks in `selectNextItem` step 3.

The concrete failure case ADR-002 itself was written to fix — a CBSE student also prepping for JEE
(`StudentExam` × 2, per ADR-002's `Exam`/`StudentExam` types) — has no specified resolution for how two
simultaneous exam schedules combine: lane B2's five exam-scheduler mechanisms (Final Review Period, Exam
Daily Goal, etc. — `research/B2_remnote_verified.md` §3) are all defined per-`Exam`, and nothing in C, B2,
or ADR-002 says what happens to the daily goal or frontier selection when a student is subscribed to two
`Exam`s with overlapping skills and different dates.

**Why it matters**: this is the single load-bearing decision the master plan calls "the one mistake that
forces a rewrite" (`MASTER_PLAN.md` §3). The schema-level fix (Board/ExamTrack split) is real and correct;
the algorithm-level fix that would make it *usable* was never done, and the plan does not flag this gap
anywhere — it presents the collision as resolved.

**Fix**: pass a `curriculumContext` (a specific `CurriculumPlacement` or board/examTrack pair) into
`selectNextItem`; either scope the `SkillEdge` prerequisite check to edges active within that context, or
add an optional per-edge `curriculumId` override for the cases where order genuinely differs. Separately,
specify explicitly how multiple concurrent `StudentExam` schedules merge into one daily plan — this needs
its own short design note, not silent assumption.

---

## 5. The teacher-call margin (28–37%) is presented as settled; the source calls it a fragile ceiling that goes negative on a named "real risk," and that caveat is dropped

**Claim**: the master plan states the margin correction as a solved fact; lane E explicitly warns it is not
a number to plan around and flags a plausible scenario where it goes negative — none of which survives into
the master plan or its risk table, even though it directly undercuts ADR-001's central strategic claim.

**Evidence**: `MASTER_PLAN.md` §11: "Margins were script-verified — the first attempt (₹499/₹1,599) yielded
only 7.1% and was corrected to 28–37%." Lane E's actual document says, in the same breath as the numbers:
"**Contribution margin does not include**: customer acquisition cost, content-authoring cost,
engineering/support overhead, refunds/no-show absorption, or the Consent Manager / compliance operating
cost. Treat 28–37% contribution margin on the call product as **the ceiling, not the number to plan a P&L
around**" (`research/E_india_ops_and_market.md` §2.3, line 157). Immediately after: "if teacher payout must
rise to ₹350–400/call to attract quality subject-matter teachers at scale (**a real risk**...), the 4-pack
margin goes negative at the ₹499.75 effective price point. **This is the single most important number for
the operator to watch**" (same section, line 159). None of "ceiling not P&L number," the excluded cost
categories, or the negative-margin sensitivity appears in `MASTER_PLAN.md` §11 or in the §15 risk table
(which lists "Teacher supply doesn't materialise" as a risk but not "teacher payout rate must rise → margin
goes negative," a distinct and, per lane E, more numerically specific risk).

**Why it matters**: ADR-001 names the teacher call "the moat" (`decisions/ADR-001-product-thesis.md`,
Decision section, row 1). A moat whose unit economics the source itself calls fragile enough to flip
negative under a named, plausible supply-side pressure is a materially weaker moat than "margins were
verified" conveys. An operator reading only the master plan would reasonably believe this line is solid;
lane E's author clearly did not believe that.

**Fix**: carry the sensitivity into §11 and §15 explicitly as a monitorable number ("teacher payout must
stay ≤ ~₹300–320/call or the 4-pack goes negative") rather than a fact buried one lane-file down.

---

## 6. The personal-annotation layer (lane B's whole two-layer model) is invoked by name but never actually schematized, and no phase builds it

**Claim**: `blockId` immutability is promoted to a hard invariant on the theory that "the entire personal
annotation layer anchors to it" — but the personal layer itself (highlights, annotations, own notes, own
flashcards, the fork mechanism) never made it into ADR-002's canonical spine, and no Phase 0–6 packet
builds it.

**Evidence**: `MASTER_PLAN.md` §5: "`blockId` is immutable and never reused. **The entire personal-
annotation layer anchors to it.**" ADR-002 collision #7 resolution: "`blockId` immutability is promoted
from an implementation note to a hard invariant... it is the anchor the entire personal layer depends on."
But lane B fully designed that layer with specific entities — `Highlight (blockId, text offsets, color)`,
`Annotations / sticky notes (blockId, text offsets, note body)`, own flashcards, own supplementary notes,
a fork/"Make your own copy" mechanism, re-anchoring logic on republish (fuzzy match → orphaned tray, never
silently dropped), and concrete Dexie tables `highlights`, `annotations`, `ownNotes`, `ownCards`
(`research/B_editor_and_knowledge_system.md` §2–3, "The two-layer note model"). **None of these appear in
ADR-002's canonical spine** — the document that supersedes "the conflicting model fragments in lanes C, E,
F and B" never actually carries B's data model forward, only the *invariant* that would anchor it. §14
Phase 1 ("the content spine") ships the author editor, publish pipeline, and read-only reader (`P1.1`–
`P1.4`) but no packet builds highlight/annotate/own-note/fork — despite lane A's own P0 surface list
including "topic detail" and "notes reader + PDF" (§12) and lane B specifying the exact interaction
("select text → Highlight / Note / Make Flashcard / Ask AI," `research/B_editor_and_knowledge_system.md`
line 179) as core reading UX, not an add-on.

**Why it matters**: this is not a small gap — it's most of what makes the reading experience a *studying*
experience rather than a PDF viewer, and it's explicitly named as load-bearing by both the master plan and
ADR-002 without ever being specified where a coding agent can build it.

**Fix**: add `Highlight`, `Annotation`, `OwnNote`, `OwnFlashcard` (and the forked-note relation) to
ADR-002's canonical spine, and add an explicit Phase 1 packet for the personal-layer overlay plus its
re-anchoring logic.

---

## 7. `Misconception` is referenced by ID everywhere in ADR-002 but the entity is never defined

**Claim**: `misconceptionId` fields exist on two ADR-002 types with nothing to reference.

**Evidence**: ADR-002's spine: `Question.options[].misconceptionId` and `AttemptEvent.misconceptionId`
both exist, but no `Misconception` table/interface appears anywhere in the document. Lane D fully specified
one: "build a `misconceptions` table keyed by `misconception_id` (e.g. `ALG-DISTRIB-001`), with `label`,
`topic_tags`, `remediation_note_id`" (`research/D_ai_grading_and_tutor.md`, §"Misconception tagging," line
295) — seeded from the Eedi/NeurIPS dataset per `MASTER_PLAN.md` §7. `P0.2` ("implement ADR-002 schema...
single source of truth") would ship a dangling foreign-key-shaped field with no table behind it.

**Fix**: add `Misconception` to ADR-002's canonical spine (id, label, topic tags, remediation note FK) —
it's a small, already-designed addition lane D did the work for.

---

## 8. Phase sequencing: skill-graph seeding is scheduled two phases after the content and questions that need it

**Claim**: `MASTER_PLAN.md` states "phases are not parallelisable" (§14 intro), implying strict 0→1→2→3
completion order — but Phase 1 and Phase 2 both secretly need data that isn't seeded until `P3.1`.

**Evidence**: `Block.attrs.skillTags` is "**Required** on teaching blocks" (ADR-002 spine comment) and is
authored during Phase 1 (`P1.1` editor; demo: "operator authors a Class 10 chapter, publishes it"). `P2.1`
"question bank" likewise requires `Question.skillTags` populated at authoring time. But the actual `Skill`
and `CurriculumPlacement` rows for CBSE Class 10 — the things being tagged against — aren't seeded until
"**`P3.1`** skill graph + `CurriculumPlacement` seeded with CBSE Class 10" (§14, Phase 3), two phases later.
As written, an author in Phase 1 has no real skills to tag blocks with, and Phase 2's question bank has no
real skill taxonomy to tag questions against, unless Phase 3's data-seeding work is quietly pulled forward
— which the phase-gate language explicitly says not to do.

**Why it matters**: this is a genuine dependency-order bug, not a parallelisation nicety — it means the
Phase 1/2 demos as described ("operator authors a Class 10 chapter," "a student answers `2x+6`...") cannot
actually be built to spec in the stated order.

**Fix**: pull the CBSE Class 9–10 skill-graph and `CurriculumPlacement` seed data into Phase 0 (it's a data-
loading task, not an algorithm-building one — it doesn't need BKT/Elo/FSRS code to exist first, only the
ADR-002 tables from `P0.2`).

---

## 9. Content moderation is a headline concern in lane D and disappears entirely from the master plan's synthesis

**Claim**: lane D names moderation as one of its two real unresolved gaps; the master plan's AI-subsystems
section covers everything else from lane D but never mentions it.

**Evidence**: lane D's status line: "DeepSeek moderation product and MyScript/enterprise pricing are the
**two real gaps**" (`research/D_ai_grading_and_tutor.md`, line 3). Its decision table item 12 and §5.5 spell
out why: "I could **not** find a confirmed dedicated DeepSeek moderation endpoint" and a three-layer
fallback (self-moderation LLM pass, keyword/regex safety net, a visible "report" control). `MASTER_PLAN.md`
§7 ("AI subsystems (lane D)") covers the grading ladder, misconception tagging, cost, and tutor guardrails
in detail — moderation, the missing endpoint, and the fallback plan are absent, for a product whose users
are minors typing free text to an LLM chat and to LLM-graded answer fields.

**Fix**: add moderation and its unresolved-endpoint status to §7 and to the §15 risk table — it is exactly
the kind of thing that table exists for.

---

## 10. Disintermediation / off-platform leakage of the teacher relationship is never considered, anywhere

**Claim**: the single best-documented failure mode of tutoring marketplaces — the student/teacher pair
moving off-platform after the first paid call to avoid the platform's cut — is absent from all eight lanes
and from ADR-001's "moat" argument.

**Evidence**: no occurrence of "disintermediation," "off-platform," "WhatsApp," "leakage," or "bypass" as a
risk concept anywhere in `research/E_india_ops_and_market.md` (the booking-design lane) or
`decisions/ADR-001-product-thesis.md`. Lane E's booking flow hands the teacher rich context pre-call
(recent wrong answers, weak skills, AI tutor summary — §5.6) and both parties end a 30-minute call knowing
each other; nothing in the design (contact-info handling, contractual terms with teachers, in-app-only
value like the auto-generated follow-up assignment) addresses why the relationship stays on-platform for a
*second* booking rather than continuing over WhatsApp/UPI directly, which every comparable Indian tutoring
marketplace fights structurally.

**Why it matters**: ADR-001 stakes the whole competitive position on "the teacher call is the moat" without
ever addressing the mechanism by which the platform actually captures repeat value from that relationship.

**Fix**: ADR-001 needs an explicit mitigation (e.g., delayed/never-shared direct contact info, making the
follow-up-assignment/progress-tracking loop meaningfully better in-app than off-platform continuation would
be, or teacher contract terms) — or an honest downgrade of how defensible the moat actually is.

---

## 11. Account sharing / fraud has zero coverage despite being a routine Indian ed-tech revenue leak

**Claim**: one paid account shared across siblings/friends (a well-known pattern against exactly the
competitors — Cuemath, Embibe — the pricing model is benchmarked against) is never mentioned.

**Evidence**: no hits for "account sharing," "fraud" (as a product-design concept, as opposed to payment
e-mandate fraud liability), "concurrent session," or "device limit" anywhere across all eight lane files or
the master plan. DPDP's own child-protection posture (no aggressive device fingerprinting/tracking of
minors, per lane E §4.2) makes the usual anti-sharing tooling (behavioural device tracking) specifically
harder to justify here, which makes this a genuinely harder problem than average for this product, not an
easier one — and it's not on anyone's list.

**Fix**: at minimum, flag it as an open question in §16, and consider it in Phase 6 alongside DPDP work
(session-limit or soft nudges rather than aggressive tracking, given the constraint above).

---

## 12. The 200KB/2.5s performance budget gets full-confidence treatment with no verification against its own mandatory dependency stack

**Claim**: the plan treats the bundle budget as "a gate in CI, not an aspiration" (`MASTER_PLAN.md` §4)
without anyone checking whether the *mandatory* math/editor stack for the very first meaningful route
(MathLive + KaTeX + TipTap, needed on notes reader and practice player alike) plausibly fits inside it —
in contrast to `motion`, where an actual Bundlephobia-verified figure was produced (~4.6KB via
`LazyMotion`+`m`, `research/A_ui_teardown_and_design_language.md` line 467).

**Evidence**: lane E's budget derivation: "≤200KB gzipped for the first meaningful route (below the ~170KB
threshold **commonly cited**..." (`research/E_india_ops_and_market.md` §6) — a generic industry heuristic,
not a number computed against this app's actual component weights. No lane runs the equivalent of the
`motion` bundle-size check for MathLive (a large web component shipping its own math engine and virtual
keyboard) or KaTeX+TipTap together, even though both are unavoidable on the earliest, highest-traffic
routes. This reviewer has not independently verified current gzip sizes either — flagging this as
**unverified by any lane**, not asserting the budget will fail.

**Fix**: before treating this as a CI gate (`P0.1`), run an actual bundle-size check of the notes-reader and
practice-player routes with the real dependency set, the same way `motion` was checked.

---

## 13. `P3.5`'s card-type-mix policy is scheduled as part of the build, while the risk table says it must be "closed before build"

**Claim**: an internal contradiction — the risk table treats the card-quality-trap fix as a precondition to
building, while §14 schedules it as a line item *inside* the packet that builds card types.

**Evidence**: `MASTER_PLAN.md` §15 risk table: "AI generates pedagogically poor cards | Card-type mix
policy — **still an open gap, close before build**." §14: "`P3.5` FSRS queue via `ts-fsrs` + card types +
**the card-type mix policy**" — i.e., the policy is written *during* `P3.5`, not before it. Lane B2 (the
source of the finding) only identifies the *need* for a policy ("bias hard toward Concept/Descriptor cards,
cap cloze as a proportion of a topic's deck, treat MCQ as exam-rehearsal"), not concrete numeric ratios or
enforcement rules — B2 §7 leaves this as an explicit open question ("Does the card-type mix policy get
enforced at generation time, at review time, or both?").

**Why it matters**: a cheap coding agent hitting `P3.5` has no numeric policy to implement (what cloze cap?
what concept:cloze ratio? enforced at generation, review, or both?) and no lane supplies one — it would
have to invent a pedagogical judgment call it isn't positioned to make.

**Fix**: the coordinator (not the coding agent) should write the actual numeric policy — e.g., "≤20% of a
topic's cards may be cloze; every topic needs ≥1 Concept card per 3 cloze cards; MCQ always tagged
`examRehearsal`, never counted toward mastery-deck completion" — before `P3.5` is dispatched.

---

## 14. Minor: lane E's `Teacher` schema was never reconciled to ADR-002's canonical types

**Evidence**: `Teacher.subjects: string[]` and `Teacher.boardsQualifiedFor: string[]`
(`research/E_india_ops_and_market.md` §5.3) use raw strings, predating ADR-002's `Subject`/`Board` enums.
ADR-002 claims to supersede "conflicting model fragments in lanes C, E, F and B," but Teacher/Booking
(lane E §5) was left untouched, referenced only as "Teacher / AvailabilitySlot / Booking models are in lane
E §5" (`MASTER_PLAN.md` §10) — a reasonable deferral in principle (it wasn't in conflict with the other
lanes), but it does mean Phase 5 will hand-roll a second, string-typed representation of exactly the
taxonomy ADR-002 exists to make canonical.

**Fix**: retype `Teacher.subjects`/`boardsQualifiedFor` against ADR-002's `Subject[]`/`Board[]` before `P5.1`.

---

## 15. Minor: CBSE-vs-92%-state-boards tension is disclosed but not actually argued through

**Evidence**: `MASTER_PLAN.md` §11 acknowledges "the honest tension the research surfaced: ~92% of
higher-secondary exam-takers are on state boards... but CBSE families are the ones targeting
engineering/medical entrance, with correspondingly higher willingness to pay" — this is a fair one-sentence
summary of lane E §1.1's finding, and unlike most findings above, it *is* surfaced. But it stops short of
actually weighing the tradeoff (what's the absolute addressable CBSE population, what does lane E's own
fragmentation-cost argument for staying single-board actually save in engineering time) before recommending
"confirm or override" in §16. Not a misrepresentation — a shallow synthesis of a correctly-flagged tension.

**Fix**: no schema change needed; §16's operator decision would be better served by one paragraph of actual
arithmetic (addressable population × willingness-to-pay proxy) rather than a one-line tension statement.

---

## What the plan gets right — keep these

- **Board/`ExamTrack` split as a concept** is a genuine, correct fix to a real dead-end (lane C's original
  `Board = "CBSE" | ... | "JEE" | "NEET"` enum could not represent a CBSE-and-JEE student at all). The
  *schema* half of this fix is sound; only the algorithm wiring (finding 4) was left undone.
- **`skillTags` on the block as single source of truth**, with skill→content as a derived, publish-time
  index — correctly kills a real two-write-path drift bug (collision #3) and is workable at request time
  (a rebuilt join table is a normal, fast read path; no concern here).
- **`eloDifficulty` on the item, `seedDifficulty` on the skill, `irtParams` deferred to v2** — correctly
  keeps lane C's own IRT rejection internally consistent rather than letting lane F's premature `irtParams`
  field contradict it.
- **One `GradingMethod` enum** matching lane D's actually-verified four-rung ladder — a clean, correct
  reconciliation of three incompatible prior versions.
- **`blockId` immutability as a hard invariant** is the right call even though the schema it's meant to
  anchor (finding 6) didn't get carried through — the invariant itself, and the orphaning-not-deleting
  policy for annotations lane B specified, is sound design.
- **`AttemptEvent` shipped in Phase 1 with `selectionPropensity`/`policyVersion`** — correctly identified as
  an irreversible, launch-blocking decision (you cannot retrofit history you never logged); good foresight,
  faithfully carried from ADR-002 into the build sequence.
- **The SymPy grading verification** (`2(x+3)==2x+6`, `1/2==0.5`, `sin²+cos²==1`, the hang case + timeout)
  is genuinely run in-session by lane D, not asserted, and the master plan carries this forward accurately
  without inflating it.
- **The ~800-node knowledge-graph ceiling is correctly flagged as unverified** in both its source
  (`research/B_editor_and_knowledge_system.md` §7, "a conservative inference... not a number benchmarked")
  and the master plan's own risk table ("run the spike, it is unverified") — this is the right way to
  carry an uncertain number forward, and stands in useful contrast to finding 5's margin figure, which was
  not carried forward with the same honesty.
- **The exam-scheduler adoption from lane B2** (Final Review Period, Learning Period, Ensure Mastery,
  proposed Catch-Up Period, Exam Daily Goal) is a well-verified, concrete, high-value mechanic faithfully
  represented in `MASTER_PLAN.md` §6 and scheduled sensibly in `P3.6`.
- **The card-quality-trap finding itself** (RemNote's own docs warn against exactly the card types an LLM
  generates most easily) is correctly attributed to B2, correctly flagged as an open gap in the risk table
  — only its *operationalization* in `P3.5` (finding 13) is incomplete, not the finding's representation.
- **DPDP/parental-consent-first framing and the DeepSeek China-hosting risk** are both correctly surfaced as
  unresolved operator decisions (§16) rather than silently defaulted — this is the plan behaving exactly as
  it should when a decision genuinely isn't the coordinator's to make.
- **The iterate-and-fail-first margin methodology** (first price point failed at 7.1%, was corrected) shows
  real, script-verified iteration rather than a first-guess number — the process is sound even though its
  output was carried forward with the caveats stripped (finding 5).

---

## Overall verdict

This plan is not safe to hand to a cheap coding agent as-is. The individual lane research is unusually
rigorous — script-verified costs, an actually-run SymPy grading test, honestly-flagged unverified numbers,
primary-source RemNote mechanics — and ADR-002's reconciliation work on the five real schema contradictions
(Board/ExamTrack, contentRefs direction, the difficulty scale, the grading enum, Flashcard/CardState) is
genuinely good, load-bearing architecture that should not be unwound. But the plan has three classes of
problem that will each independently derail a cheap agent: a foundational entity (accounts/auth) that no
lane was ever assigned to design and that the build sequence defers past the point where it's needed
(finding 1); at least two internal contradictions inside the documents explicitly called "the contract"
(findings 3 and 8, plus the incomplete personal-layer and misconception carry-through in findings 6–7) that
leave a cheap agent no way to resolve ambiguity the way ADR-002 exists to remove; and one strategic claim —
the teacher call as "the moat" — whose supporting economics were carried into the master plan with the
load-bearing caveats stripped out, which matters because the entire five-pillar ranking in ADR-001 is
argued from that claim's strength. None of these require re-doing the research; they require the
coordinator to close four or five concrete gaps in ADR-002 and re-sequence one phase before this goes to a
builder who won't think to ask the questions this review just answered.
