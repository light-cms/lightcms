import type { EdraCommand } from "./types";

export type { EdraCommand } from "./types";

import { alignmentCommands } from "./alignment";
import { diagramCommands } from "./diagram";
import { headingCommands } from "./headings";
import { historyCommands } from "./history";
import { listCommands } from "./lists";
import { mathCommands } from "./math";
import { mediaCommands } from "./media";
import { tableCommands } from "./table";
import { textFormattingCommands } from "./text-formatting";

export const commands: Record<string, EdraCommand[]> = {
	"undo-redo": historyCommands,
	headings: headingCommands,
	"text-formatting": textFormattingCommands,
	alignment: alignmentCommands,
	lists: listCommands,
	media: mediaCommands,
	table: tableCommands,
	math: mathCommands,
	diagram: diagramCommands,
};
