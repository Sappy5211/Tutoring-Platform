export const STITCH_MATERIALS = [
  {
    id: "moving-beyond-thousands",
    docId: "material-moving-beyond-thousands",
    title: "Moving Beyond Thousands",
    source: "/materials/we-the-travellers/01-moving-beyond-thousands/code.html",
  },
  {
    id: "which-city-has-more-explorers",
    docId: "material-which-city-has-more-explorers",
    title: "Which City Has More Explorers?",
    source: "/materials/we-the-travellers/02-which-city-has-more-explorers/code.html",
  },
  {
    id: "building-the-ultimate-destination",
    docId: "material-building-the-ultimate-destination",
    title: "Building the Ultimate Destination",
    source: "/materials/we-the-travellers/03-building-the-ultimate-destination/code.html",
  },
  {
    id: "the-journey-ahead",
    docId: "material-the-journey-ahead",
    title: "The Journey Ahead",
    source: "/materials/we-the-travellers/04-the-journey-ahead/code.html",
  },
  {
    id: "practice-and-revision",
    docId: "material-practice-and-revision",
    title: "Practice & Revision",
    source: "/materials/we-the-travellers/05-practice-and-revision/code.html",
  },
] as const;

export function materialRoute(docId: string) {
  const material = STITCH_MATERIALS.find((item) => item.docId === docId);
  return material ? `/app/materials/${material.id}` : `/app/notebook/${docId}`;
}
