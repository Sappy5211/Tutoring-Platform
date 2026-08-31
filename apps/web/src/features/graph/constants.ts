/** Colour by mastery band, not by arbitrary category: on a curriculum map the
 *  question is always "how solid is this", so the band IS the grouping. Shares
 *  the 4-band mastery scale used by every other progress surface. */
export type Band = "secure" | "developing" | "starting" | "locked";

export const BAND_COLORS: Record<Band, string> = {
  secure: "#2f9e6e",
  developing: "#d9a441",
  starting: "#d1685f",
  locked: "#8b9a94",
};

export const BAND_LABELS: Record<Band, string> = {
  secure: "Secure",
  developing: "Developing",
  starting: "Needs work",
  locked: "Not unlocked",
};

export const BAND_ORDER: Band[] = ["secure", "developing", "starting", "locked"];

export const bandFor = (mastery: number, unlocked: boolean): Band =>
  !unlocked ? "locked" : mastery >= 70 ? "secure" : mastery >= 45 ? "developing" : "starting";

/** Below this zoom, labels are noise. Above it, they are the point. */
export const LABEL_ZOOM_THRESHOLD = 1.15;

export interface GraphForces {
  nodeSize: number;
  linkThickness: number;
  centerForce: number;
  repelForce: number;
  linkDistance: number;
}

export const DEFAULT_FORCES: GraphForces = {
  nodeSize: 6,
  linkThickness: 1,
  centerForce: 0.35,
  repelForce: 140,
  linkDistance: 55,
};
