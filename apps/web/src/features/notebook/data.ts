import type { Folder, NotebookDoc, OutlineNode } from "@vidya/contracts";

/** Mock notebook. Shapes are the contract types, so swapping in the repository
 *  at P1.2 is a data change rather than a component rewrite. */
export const FOLDERS: Folder[] = [
  { folderId: "f-maths", parentId: null, title: "Mathematics", owner: "platform", order: 0, colour: "primary" },
  { folderId: "f-number", parentId: "f-maths", title: "Number", owner: "platform", order: 0 },
  { folderId: "f-algebra", parentId: "f-maths", title: "Algebra", owner: "platform", order: 1 },
  { folderId: "f-geometry", parentId: "f-maths", title: "Geometry", owner: "platform", order: 2 },
  { folderId: "f-mine", parentId: null, title: "My notes", owner: "student", order: 1, colour: "accent" },
  { folderId: "f-mine-revision", parentId: "f-mine", title: "Revision", owner: "student", order: 0 },
];

export const DOCS: NotebookDoc[] = [
  { docId: "d-fractions", folderId: "f-number", title: "Fractions", owner: "platform", updatedAt: "2026-08-28" },
  { docId: "d-percent", folderId: "f-number", title: "Percentages", owner: "platform", updatedAt: "2026-08-26" },
  { docId: "d-ratio", folderId: "f-number", title: "Ratio and proportion", owner: "platform", updatedAt: "2026-08-24" },
  { docId: "d-linear", folderId: "f-algebra", title: "Simple equations", owner: "platform", updatedAt: "2026-08-27" },
  { docId: "d-angles", folderId: "f-geometry", title: "Lines and angles", owner: "platform", updatedAt: "2026-08-29" },
  { docId: "d-my-fractions", folderId: "f-mine-revision", title: "Fractions — my summary", owner: "student", updatedAt: "2026-08-30" },
];

const n = (
  nodeId: string, parentId: string | null, order: number, text: string,
  extra: Partial<OutlineNode> = {},
): OutlineNode => ({
  nodeId, docId: "d-fractions", parentId, order, text,
  cardTrigger: null, answerLayout: "inline", collapsed: false, aiDrafted: false, ...extra,
});

export const SEED_NODES: OutlineNode[] = [
  n("n1", null, 0, "Equivalent fractions"),
  n("n2", "n1", 0, "Two fractions are equivalent when they represent", {
    cardTrigger: "both", answerLayout: "inline",
    answer: "the same value, even though the numerator and denominator differ.",
    answerLatex: "\\frac{1}{2}=\\frac{2}{4}=\\frac{3}{6}",
  }),
  n("n3", "n1", 1, "To find an equivalent fraction you", {
    cardTrigger: "forward", answerLayout: "children",
  }),
  n("n3a", "n3", 0, "Multiply the numerator and denominator by the same number."),
  n("n3b", "n3", 1, "Or divide both by a common factor."),
  n("n4", null, 1, "Adding fractions"),
  n("n5", "n4", 0, "To add fractions with different denominators, first", {
    cardTrigger: "forward", answerLayout: "inline",
    answer: "rewrite them over a common denominator.",
    answerLatex: "\\frac{1}{3}+\\frac{1}{4}=\\frac{4}{12}+\\frac{3}{12}=\\frac{7}{12}",
  }),
  n("n6", "n4", 1, "How the parts combine on a bar model", {
    cardTrigger: "forward", answerLayout: "block", blockKind: "diagram",
  }),
];

/** Stand-in for the DeepSeek call at P4. Deterministic so the UI is testable;
 *  the point here is the accept/reject interaction, not the model. */
export function suggestAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("common denominator") || q.includes("add fraction"))
    return "rewrite both fractions over a common denominator, then add the numerators.";
  if (q.includes("equivalent")) return "the same value written with a different numerator and denominator.";
  if (q.includes("simplify")) return "divide the numerator and denominator by their highest common factor.";
  if (q.includes("percent")) return "a fraction out of one hundred.";
  return "…a short answer drafted from this note. Edit it before accepting.";
}
