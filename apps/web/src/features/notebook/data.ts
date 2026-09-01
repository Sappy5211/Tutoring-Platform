import type { Folder, NotebookDoc, OutlineNode } from "@vidya/contracts";

/** Mock notebook. Shapes are the contract types, so swapping in the repository
 *  at P1.2 is a data change rather than a component rewrite. */
export const FOLDERS: Folder[] = [
  { folderId: "f-class-5-maths", kind: "book", parentId: null, title: "Class 5 Mathematics", owner: "platform", order: 0, colour: "primary" },
  { folderId: "f-large-numbers-place-value", kind: "chapter", parentId: "f-class-5-maths", title: "Large Numbers and Place Value", owner: "platform", order: 0 },
];

/** Dates are relative to today so the date-grouped index never goes stale. */
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
};

export const DOCS: NotebookDoc[] = [
  { docId: "material-moving-beyond-thousands", folderId: "f-large-numbers-place-value", title: "Moving Beyond Thousands", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Class 5 Mathematics", "Large Numbers and Place Value"], tags: ["Class 5", "Large numbers"], cardCount: 1 },
  { docId: "material-which-city-has-more-explorers", folderId: "f-large-numbers-place-value", title: "Which City Has More Explorers?", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Class 5 Mathematics", "Large Numbers and Place Value"], tags: ["Class 5", "Comparing numbers"], cardCount: 1 },
  { docId: "material-building-the-ultimate-destination", folderId: "f-large-numbers-place-value", title: "Building the Ultimate Destination", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Class 5 Mathematics", "Large Numbers and Place Value"], tags: ["Class 5", "Place value"], cardCount: 2 },
  { docId: "material-the-journey-ahead", folderId: "f-large-numbers-place-value", title: "The Journey Ahead", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Class 5 Mathematics", "Large Numbers and Place Value"], tags: ["Class 5", "Rounding", "Division"], cardCount: 2 },
  { docId: "material-practice-and-revision", folderId: "f-large-numbers-place-value", title: "Practice & Revision", owner: "platform", updatedAt: daysAgo(0), kind: "document", path: ["Class 5 Mathematics", "Large Numbers and Place Value"], tags: ["Class 5", "Revision"], cardCount: 6 },
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
  n("n7", null, 2, "Simplifying fractions"),
  n("n8", "n7", 0, "A fraction is in its simplest form when", {
    cardTrigger: "both", answerLayout: "inline",
    answer: "the numerator and denominator share no common factor except 1.",
    answerLatex: "\\frac{18}{24}=\\frac{3}{4}",
  }),
  n("n9", "n7", 1, "Steps to simplify", { cardTrigger: "forward", answerLayout: "children" }),
  n("n9a", "n9", 0, "Find the highest common factor of the top and bottom."),
  n("n9b", "n9", 1, "Divide both by it."),
  n("n9c", "n9", 2, "Check nothing divides them both again."),
  n("n10", "n7", 2, "Common mistake: cancelling across a plus sign.", {}),
  n("n11", null, 3, "Comparing fractions"),
  n("n12", "n11", 0, "To compare two fractions you", {
    cardTrigger: "forward", answerLayout: "inline",
    answer: "put them over a common denominator, then compare numerators.",
    answerLatex: "\\tfrac{2}{3}>\\tfrac{5}{8}",
  }),
  n("n13", "n11", 1, "Where each fraction sits on a number line", {
    cardTrigger: "forward", answerLayout: "block", blockKind: "graph",
  }),
];

/** The student's own notes are a SEPARATE document, not a slice of the course
 *  one. Rendering a filtered subset and writing it back as the whole array was
 *  destroying the document - see the guard comment in Outliner. */
export const MY_NOTES_SEED: OutlineNode[] = [
  { nodeId: "m1", docId: "d-my-fractions", parentId: null, order: 0, text: "My revision — fractions", cardTrigger: null, answerLayout: "inline", collapsed: false, aiDrafted: false },
  { nodeId: "m2", docId: "d-my-fractions", parentId: "m1", order: 0, text: "Common denominator means", cardTrigger: "forward", answerLayout: "inline", answer: "the same bottom number on both fractions.", collapsed: false, aiDrafted: false },
  { nodeId: "m3", docId: "d-my-fractions", parentId: "m1", order: 1, text: "Mistake I keep making: adding the denominators too.", cardTrigger: null, answerLayout: "inline", collapsed: false, aiDrafted: false },
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
