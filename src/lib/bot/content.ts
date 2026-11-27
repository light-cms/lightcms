import { CONTENT_EXTENSIONS } from "./constants";

export function isContentPath(path: string): boolean {
	const normalized = path.toLowerCase();
	for (const extension of CONTENT_EXTENSIONS) {
		if (normalized.endsWith(extension)) {
			return true;
		}
	}
	return false;
}
