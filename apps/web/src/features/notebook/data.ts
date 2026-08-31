import type { Folder, NotebookDoc, OutlineNode } from "@vidya/contracts";

/** Mock notebook. Shapes are the contract types, so swapping in the repository
 *  at P1.2 is a data change rather than a component rewrite. */
export const FOLDERS: Folder[] = [
  { folderId: "f-maths", kind: "book", parentId: null, title: "Mathematics", owner: "platform", order: 0, colour: "primary" },
  { folderId: "f-number", kind: "chapter", parentId: "f-maths", title: "Number", owner: "platform", order: 0 },
  { folderId: "f-algebra", kind: "chapter", parentId: "f-maths", title: "Algebra", owner: "platform", order: 1 },
  { folderId: "f-geometry", kind: "chapter", parentId: "f-maths", title: "Geometry", owner: "platform", order: 2 },
  { folderId: "f-mine", kind: "book", parentId: null, title: "My notes", owner: "student", order: 1, colour: "accent" },
  { folderId: "f-mine-revision", kind: "chapter", parentId: "f-mine", title: "Revision", owner: "student", order: 0 },
];

/** Dates are relative to today so the date-grouped index never goes stale. */
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
};

export const DOCS: NotebookDoc[] = [
  { docId: "d-fractions", folderId: "f-number", title: "Fractions", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Mathematics", "Number"], tags: ["Class 7"], cardCount: 12 },
  { docId: "d-ratio", folderId: "f-number", title: "Ratio and proportion", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Mathematics", "Number"], tags: ["Class 7"], cardCount: 9 },
  { docId: "d-percent", folderId: "f-number", title: "Percentages", owner: "platform", updatedAt: daysAgo(1), kind: "document", path: ["Mathematics", "Number"], tags: ["Class 7", "Exam"], cardCount: 14 },
  { docId: "d-linear", folderId: "f-algebra", title: "Simple equations", owner: "platform", updatedAt: daysAgo(1), kind: "document", path: ["Mathematics", "Algebra"], tags: ["Class 7"], cardCount: 11 },
  { docId: "d-angles", folderId: "f-geometry", title: "Lines and angles", owner: "platform", updatedAt: daysAgo(2), kind: "document", path: ["Mathematics", "Geometry"], tags: ["Class 7"], cardCount: 8 },
  { docId: "d-integers", folderId: "f-number", title: "Integers", owner: "platform", updatedAt: daysAgo(3), kind: "document", path: ["Mathematics", "Number"], tags: [], cardCount: 10 },
  { docId: "d-my-fractions", folderId: "f-mine-revision", title: "Fractions — my summary", owner: "student", updatedAt: daysAgo(3), kind: "document", path: ["My notes", "Revision"], tags: ["Mine"], cardCount: 4 },
  { docId: "d-mensuration", folderId: "f-geometry", title: "Perimeter and area", owner: "platform", updatedAt: daysAgo(6), kind: "document", path: ["Mathematics", "Geometry"], tags: ["Exam"], cardCount: 7 },
  { docId: "d-worksheet", folderId: "f-number", title: "Half-yearly worksheet.pdf", owner: "platform", updatedAt: daysAgo(9), kind: "pdf", path: ["Mathematics", "Number"], tags: ["Exam"], cardCount: 0 },
  { docId: "d-formula", folderId: "f-mine", title: "Formula sheet.pdf", owner: "student", updatedAt: daysAgo(14), kind: "pdf", path: ["My notes"], tags: ["Mine"], cardCount: 0 },
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
