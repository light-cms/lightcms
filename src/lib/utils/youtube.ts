/**
 * YouTube CDN & URL utilities for Markdown and Editor embeds.
 */

const YOUTUBE_REGEX =
  /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const YOUTUBE_ID_EXACT = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts the 11-character YouTube video ID from various URL formats or raw ID.
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (url === null || url === undefined) {
    return null;
  }
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const match = trimmed.match(YOUTUBE_REGEX);
  if (match && match[1]) {
    return match[1];
  }

  if (YOUTUBE_ID_EXACT.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Generates the CDN thumbnail URL for a given YouTube video ID.
 * Defaults to maxresdefault (HD 1280x720) with fallback quality options.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "maxres" | "hq" | "mq" = "maxres",
): string {
  let filename = "maxresdefault.jpg";
  if (quality === "hq") {
    filename = "hqdefault.jpg";
  } else if (quality === "mq") {
    filename = "mqdefault.jpg";
  }
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
}

/**
 * Returns the canonical YouTube watch URL for a video ID.
 */
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Creates a Markdown-friendly linked image embed using the YouTube image CDN.
 * Format: [![Title](https://img.youtube.com/vi/<ID>/maxresdefault.jpg)](https://www.youtube.com/watch?v=<ID>)
 */
export function createYouTubeMarkdownEmbed(videoId: string, title = "YouTube Video"): string {
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, "maxres");
  const watchUrl = getYouTubeWatchUrl(videoId);
  return `[![${title}](${thumbnailUrl})](${watchUrl})`;
}

/**
 * Checks whether a given string is a YouTube link or YouTube image CDN URL.
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (url === null || url === undefined) {
    return false;
  }
  const clean = url.trim().toLowerCase();
  if (clean.length === 0) {
    return false;
  }

  if (clean.includes("youtube.com") || clean.includes("youtu.be")) {
    return true;
  }
  if (clean.includes("ytimg.com")) {
    return true;
  }
  return false;
}
