import { describe, expect, it, vi } from "vite-plus/test";
import {
	filterSlashGroups,
	SLASH_GROUPS,
} from "../tiptap/extensions/slash/catalog";
import { mediaCommands } from "./media";

describe("mediaCommands", () => {
	it("includes video placeholder command alongside image, audio, iframe, and youtube", () => {
		const names = mediaCommands.map((cmd) => cmd.name);
		expect(names).toEqual([
			"image-placeholder",
			"video-placeholder",
			"audio-placeholder",
			"iframe-placeholder",
			"youtube-placeholder",
		]);
	});

	it("triggers insertMediaPlaceholder with video mediaType when video command is clicked", () => {
		const videoCmd = mediaCommands.find(
			(cmd) => cmd.name === "video-placeholder",
		);
		expect(videoCmd).toBeDefined();
		if (!videoCmd || !videoCmd.onClick) {
			throw new Error("video-placeholder command or onClick not found");
		}

		const insertMediaPlaceholder = vi.fn().mockReturnValue({ run: vi.fn() });
		const focus = vi.fn().mockReturnValue({ insertMediaPlaceholder });
		const chain = vi.fn().mockReturnValue({ focus });
		const mockEditor = {
			chain,
			isActive: vi.fn().mockReturnValue(true),
		};

		videoCmd.onClick(mockEditor as never);

		expect(chain).toHaveBeenCalled();
		expect(focus).toHaveBeenCalled();
		expect(insertMediaPlaceholder).toHaveBeenCalledWith({ mediaType: "video" });
		expect(videoCmd.isActive?.(mockEditor as never)).toBe(true);
		expect(mockEditor.isActive).toHaveBeenCalledWith("mediaPlaceholder", {
			mediaType: "video",
		});
	});

	it("triggers insertMediaPlaceholder with youtube mediaType when youtube command is clicked", () => {
		const ytCmd = mediaCommands.find(
			(cmd) => cmd.name === "youtube-placeholder",
		);
		expect(ytCmd).toBeDefined();
		if (!ytCmd || !ytCmd.onClick) {
			throw new Error("youtube-placeholder command or onClick not found");
		}

		const insertMediaPlaceholder = vi.fn().mockReturnValue({ run: vi.fn() });
		const focus = vi.fn().mockReturnValue({ insertMediaPlaceholder });
		const chain = vi.fn().mockReturnValue({ focus });
		const mockEditor = {
			chain,
			isActive: vi.fn().mockReturnValue(true),
		};

		ytCmd.onClick(mockEditor as never);

		expect(chain).toHaveBeenCalled();
		expect(focus).toHaveBeenCalled();
		expect(insertMediaPlaceholder).toHaveBeenCalledWith({
			mediaType: "youtube",
		});
		expect(ytCmd.isActive?.(mockEditor as never)).toBe(true);
		expect(mockEditor.isActive).toHaveBeenCalledWith("mediaPlaceholder", {
			mediaType: "youtube",
		});
	});

	it("registers video in slash command upload group and matches filter", () => {
		const uploadGroup = SLASH_GROUPS.find((group) => group.name === "upload");
		expect(uploadGroup).toBeDefined();

		const actionNames = uploadGroup?.actions.map((act) => act.name);
		expect(actionNames).toContain("video");

		const filtered = filterSlashGroups("video");
		const matchedUpload = filtered.find((g) => g.name === "upload");
		expect(matchedUpload).toBeDefined();
		expect(matchedUpload?.commands.some((c) => c.name === "video")).toBe(true);
	});

	it("registers youtube in slash command upload group and matches filter", () => {
		const uploadGroup = SLASH_GROUPS.find((group) => group.name === "upload");
		expect(uploadGroup).toBeDefined();

		const actionNames = uploadGroup?.actions.map((act) => act.name);
		expect(actionNames).toContain("youtube");

		const filtered = filterSlashGroups("youtube");
		const matchedUpload = filtered.find((g) => g.name === "upload");
		expect(matchedUpload).toBeDefined();
		expect(matchedUpload?.commands.some((c) => c.name === "youtube")).toBe(
			true,
		);
	});
});
