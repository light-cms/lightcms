import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/** Block-level leaf / atom: should be merged as a whole block into TextSelection during drag-selection */
export function isAcrossSelectableNode(node: ProseMirrorNode): boolean {
	if (node.isText) return false;
	if (node.type.name === "image") return true;
	if (node.type.name === "blockMath" || node.type.name === "inlineMath")
		return true;
	if (
		node.type.name === "video" ||
		node.type.name === "audio" ||
		node.type.name === "iframe"
	) {
		return true;
	}
	return node.isAtom && (node.isLeaf || !node.type.inlineContent);
}
