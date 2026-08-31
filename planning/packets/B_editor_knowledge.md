# Packet B — Notes/knowledge system: editor UX, RemNote translation, flashcards, knowledge graph
Output: `research/B_editor_and_knowledge_system.md`
Sources: `corpus/remnote-ui-screenshots.md` (PRIMARY), `corpus/remnote.md`, `corpus/novel-repo.md`,
`corpus/notion-product.md`, `corpus/anki.md`, `corpus/mochi.md`, any `corpus/rn-*.md` (real RemNote docs),
and the house skill `~/.claude/skills/notion-style-productivity-app/` read in full. Ignore `corpus/_dead/`.

SCOPE BOUNDARY: lane F owns the block JSON schema, PDF export and content pipeline. Lane C owns the SRS
algorithm and mastery engine internals. Lane A owns visual tokens and motion. Lane H owns voice dictation.
Reference them as "per lane X"; do not design their parts.

1. THE CORE TRANSLATION (most important): RemNote/Notion/Obsidian/Novel are PERSONAL knowledge tools —
   the user writes their own notes. Here the OPERATOR authors the curriculum and students consume it.
   Design the TWO-LAYER NOTE MODEL: a published, versioned, authoritative platform layer + a personal
   student layer (highlights, annotations, own notes, own cards) composed over it. Specify composition
   visually and in data, and what happens to the personal layer when the published note is edited.
   Decide whether students may edit canonical notes at all (fork/copy vs annotate-only). Recommend.
2. Editor tech decision: TipTap/ProseMirror (what Novel wraps) vs Lexical vs Plate vs BlockNote vs Slate.
   Judge on block UX, collab headroom, maths node support, Android Chrome IME/virtual-keyboard behaviour
   (be specific — this is where rich-text editors break), bundle size, extension API, maintenance health.
   Answer directly whether to use / fork / merely borrow from Novel, since the operator named it.
   Say whether the student READER and author EDITOR share an implementation.
3. RemNote feature translation table — mechanic / how it works / ADOPT-ADAPT-REJECT / interaction spec:
   the Rem as atomic outline-node + link-target + flashcard; inline card syntax (`::`, `:`, cloze `{{}}`,
   list/cluster, multi-line); image occlusion; the daily Queue and the EXAM SCHEDULER (note: `Exam` is a
   first-class object created inside a folder — see screenshots — and maps to "CBSE Class 10 Boards,
   14 Mar 2027" / JEE dates); references, backlinks, portals; tags and document tree; PDF+slide annotation;
   handwriting; AI-generated cards/quizzes/summaries and per-card AI explanations; mastery tracking;
   tables as blocks. NOTE from screenshots: flashcard TYPE is chosen from the editor's bottom toolbar at
   block level (Single Line / Multi Line / List / Multiple Choice / Cloze) — spec this precisely.
4. Authoring surface: slash-command menu (list the actual commands a maths teacher needs), block-type
   inventory, drag handle and block menu, keyboard-first flow, fast maths entry while authoring, embedding
   a practice question in a note, preview/publish flow, full keyboard-shortcut table. Leave a seam for a
   dictation affordance in the toolbar (per lane H).
5. Reading surface: progressive disclosure of worked examples, inline check-your-understanding, highlight
   and annotate, "ask the AI tutor about THIS block" (specify how block context is passed), reading
   progress, mobile reading. Consider a two-pane study mode (RemNote has `Open in Another Pane`) and the
   study-mode vs reference-mode distinction. Assess adopting a persistent bottom toolbar as mobile chrome.
6. Knowledge graph surface: what it is FOR (prerequisite navigation, mastery visualisation, gap discovery,
   "what must I know before X"), node/edge visual encoding, interaction, mobile fallback (force-directed
   is poor on small screens — recommend the alternative), and a node-count ceiling for
   `react-force-graph-2d` with the strategy above it.
7. Search + Cmd+K: what is searchable, and ranking when the corpus is a curriculum not a personal wiki.
8. Offline/sync for Indian networks: what must work offline, local-first storage (Dexie/IndexedDB vs a sync
   engine), conflict policy for the personal layer, honest complexity cost, v1 vs deferred.

Constraints: mobile-first, low-end Android, React 18 + TS + Tailwind v4. Name packages with versions/licenses.
