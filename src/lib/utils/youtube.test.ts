import { describe, expect, it } from "vite-plus/test";
import {
	createYouTubeMarkdownEmbed,
	extractYouTubeId,
	getYouTubeThumbnailUrl,
	getYouTubeWatchUrl,
	isYouTubeUrl,
} from "./youtube";

describe("youtube utilities", () => {
	describe("extractYouTubeId", () => {
		it("extracts ID from standard watch URL", () => {
			const id = extractYouTubeId(
				"https://www.youtube.com/watch?v=JLMbpiywVxQ",
			);
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("extracts ID from watch URL with extra query parameters", () => {
			const id = extractYouTubeId(
				"https://www.youtube.com/watch?feature=shared&v=JLMbpiywVxQ&t=42",
			);
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("extracts ID from short youtu.be URL", () => {
			const id = extractYouTubeId("https://youtu.be/JLMbpiywVxQ");
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("extracts ID from embed URL", () => {
			const id = extractYouTubeId("https://www.youtube.com/embed/JLMbpiywVxQ");
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("extracts ID from shorts URL", () => {
			const id = extractYouTubeId("https://www.youtube.com/shorts/JLMbpiywVxQ");
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("accepts an exact 11-character video ID directly", () => {
			const id = extractYouTubeId("JLMbpiywVxQ");
			expect(id).toBe("JLMbpiywVxQ");
		});

		it("returns null for invalid or empty inputs", () => {
			expect(extractYouTubeId("")).toBeNull();
			expect(extractYouTubeId(null)).toBeNull();
			expect(extractYouTubeId(undefined)).toBeNull();
			expect(extractYouTubeId("https://example.com/not-a-video")).toBeNull();
		});
	});

	describe("getYouTubeThumbnailUrl", () => {
		it("returns maxresdefault CDN URL by default", () => {
			const url = getYouTubeThumbnailUrl("JLMbpiywVxQ");
			expect(url).toBe(
				"https://img.youtube.com/vi/JLMbpiywVxQ/maxresdefault.jpg",
			);
		});

		it("returns hqdefault when requested", () => {
			const url = getYouTubeThumbnailUrl("JLMbpiywVxQ", "hq");
			expect(url).toBe("https://img.youtube.com/vi/JLMbpiywVxQ/hqdefault.jpg");
		});
	});

	describe("getYouTubeWatchUrl", () => {
		it("returns canonical watch URL", () => {
			const url = getYouTubeWatchUrl("JLMbpiywVxQ");
			expect(url).toBe("https://www.youtube.com/watch?v=JLMbpiywVxQ");
		});
	});

	describe("createYouTubeMarkdownEmbed", () => {
		it("creates standard linked image markdown using YouTube image CDN", () => {
			const embed = createYouTubeMarkdownEmbed(
				"JLMbpiywVxQ",
				"Final video of fixing issues in your code in VS Code",
			);
			expect(embed).toBe(
				"[![Final video of fixing issues in your code in VS Code](https://img.youtube.com/vi/JLMbpiywVxQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=JLMbpiywVxQ)",
			);
		});
	});

	describe("isYouTubeUrl", () => {
		it("identifies youtube watch links and cdn image links", () => {
			expect(isYouTubeUrl("https://www.youtube.com/watch?v=JLMbpiywVxQ")).toBe(
				true,
			);
			expect(isYouTubeUrl("https://youtu.be/JLMbpiywVxQ")).toBe(true);
			expect(
				isYouTubeUrl(
					"https://img.youtube.com/vi/JLMbpiywVxQ/maxresdefault.jpg",
				),
			).toBe(true);
			expect(isYouTubeUrl("https://example.com/image.png")).toBe(false);
			expect(isYouTubeUrl(null)).toBe(false);
		});
	});
});
