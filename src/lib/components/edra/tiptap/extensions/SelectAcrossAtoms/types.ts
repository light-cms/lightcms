/** Penetration depth below this threshold is treated as a "slight graze" and won't be merged into the selection */
export const ATOM_SLIGHT_PENETRATION_PX = 12;

export type AtomVerticalSide = "above" | "below";

export type AtomVisit = {
  nodeStart: number;
  nodeEnd: number;
  maxPenetration: number;
  included: boolean;
  entrySide: AtomVerticalSide;
  savedAnchor: number;
  dom: Element;
};

export type PreservedRange = { anchor: number; head: number };
