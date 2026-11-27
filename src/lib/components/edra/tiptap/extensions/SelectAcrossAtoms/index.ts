export {
  atomPenetrationDepth,
  effectivePenetrationThreshold,
  entrySideFromSelection,
  excludeAtomFromDragSelection,
  includeAtomInDragSelection,
  leaveSideFromPoint,
  resolveAtomLeave,
  selectionCoveringNode,
} from "./atom-selection";
export {
  restorePreservedSelection,
  selectAtomOnClick,
  shouldPreserveSelectionOnRightClick,
} from "./click-handlers";
export { hitAtomAtCoords, pointInRect } from "./hit-testing";
export { isAcrossSelectableNode } from "./node-classification";
export { SelectAcrossAtoms } from "./SelectAcrossAtoms";
export type { AtomVerticalSide, AtomVisit, PreservedRange } from "./types";
export { ATOM_SLIGHT_PENETRATION_PX } from "./types";
