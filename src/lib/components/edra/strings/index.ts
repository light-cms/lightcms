import { commandStrings } from "./commands";
import { dragHandleStrings, editorStrings } from "./editor";
import {
	audioStrings,
	codeStrings,
	iframeStrings,
	imageStrings,
	mediaStrings,
	tableStrings,
	videoStrings,
} from "./extensions";
import { menuStrings, toolbarStrings } from "./menu-toolbar";

const strings = {
	command: commandStrings,
	dragHandle: dragHandleStrings,
	editor: editorStrings,
	extension: {
		audio: audioStrings,
		code: codeStrings,
		iframe: iframeStrings,
		image: imageStrings,
		media: mediaStrings,
		table: tableStrings,
		video: videoStrings,
	},
	menu: menuStrings,
	toolbar: toolbarStrings,
};

export default strings;
