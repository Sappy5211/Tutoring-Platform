# Packet A — Competitive UI teardown, design language, motion system, surface inventory
Output: `research/A_ui_teardown_and_design_language.md`
Primary source: the `corpus/` directory (ignore `corpus/_dead/`). Supplement with WebSearch/WebFetch.

1. Teardown by archetype, with transferable-pattern tables (not adjectives):
   - Indian mass-market: pwlive, unacademy, vedantu, byjus, cuemath, toppr, doubtnut, infinitylearn,
     allendigital, embibe. Identify the shared Indian edtech visual idiom AND the dark patterns to reject.
   - Best-in-class: brilliant, khanacademy, mathacademy, duolingo, seneca, quizlet, sparx, deltamath, ixl.
   - Teacher-facing: drfrostmaths. The operator shared a screenshot of its teacher dashboard —
     left nav (Notifications/Topics/Trophies/Leaderboards/How Tos), school card with points + global rank,
     a donut split "Topics To Work On / Secure / Expert" with watch time and questions answered,
     a quick-action list (browse exam papers, browse questions by topic, set up a class, set homework,
     create a worksheet, start a Live! game), and a reverse-chron feed of "student X practised, achieved N%"
     with colour-coded percentage chips. Treat as a first-class reference.
   - Solver/utility: symbolab, photomath, gauthmath — answer presentation and step-reveal.
   - `corpus/remnote-ui-screenshots.md` — PRIMARY evidence of a shipped dark-first study product.
2. Positioning statement: one paragraph, decisive, naming the 2-3 products we should feel most like.
3. Design system as actual Tailwind v4 `@theme` tokens: full colour scales incl. a shared MASTERY scale
   (to-work-on / developing / secure / expert), light AND dark (dark-first is not enough — students study
   in daylight), type scale with a font that renders Devanagari (Inter vs Noto vs Mukta vs Hind, with
   licensing and self-host size), spacing, radius, elevation, icon set. Compute WCAG 2.2 AA contrast
   ratios with a script and state them. Include a "what we deliberately reject" list.
4. Motion system: catalogue of animated components (answer correct/incorrect feedback, streak and XP
   counters, mastery ring fill, skill-tree reveal, flashcard flip, step-by-step solution reveal, skeletons,
   route transitions, AI streaming cursor, celebration moments, graph node focus, AND the voice
   listening/processing/error states per lane H). Motion tokens with real cubic-bezier values. Library
   decision (`motion` vs CSS vs View Transitions) per use case with bundle cost. Mid-tier Android 60fps
   constraint is binding; state what degrades on low-end and what `prefers-reduced-motion` maps each to.
   Give 3-4 highest-value components as real React + Tailwind + `motion` code.
5. Surface inventory: every screen across student / teacher / admin-author as a tree, each with job,
   primary action, key components, priority (P0/P1/P2). Student flows end-to-end: onboarding + diagnostic
   placement, daily loop, practice, assessment, flashcard review, AI tutor, booking a teacher, progress.
   Mermaid for the nav model and the core student loop. Mobile vs desktop nav pattern with justification.

Coordinator standing judgement to work against (disagree in your file if you think it is wrong):
REJECT RemNote's flat reverse-chronological library as the student's primary view. Students need
syllabus order (Chapter -> Topic) with mastery state; recency is demoted to a "continue" strip.
Constraint: mobile-first, React 18 + Tailwind v4 + `motion`. Cite corpus filenames for competitor claims.
