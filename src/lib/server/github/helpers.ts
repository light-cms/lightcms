import type { Repository } from "./types";

export function parseRepository(repository: Repository): {
	owner: string;
	repo: string;
} {
	const parts = repository.split("/");
	if (parts.length !== 2) {
		throw new Error('Repository must be in "owner/name" format.');
	}
	return { owner: parts[0], repo: parts[1] };
}

export function assertRepositoryPath(
	path: string,
	options?: { allowEmpty?: boolean },
): void {
	if (!path) {
		if (options?.allowEmpty) {
			return;
		}
		throw new Error("Repository path cannot be empty.");
	}
	if (path.startsWith("/"))
		throw new Error("Repository path must not start with '/'.");
	if (path.split("/").some((part) => part === "..")) {
		throw new Error("Repository path must not contain '..'.");
	}
}

export function encodeContent(content: string): string {
	return Buffer.from(content, "utf8").toString("base64");
}

export function decodeContent(content: string): string {
	return Buffer.from(content, "base64").toString("utf8");
}
