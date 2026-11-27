export function withFolder(query: string, folder: string): string {
	const params = new URLSearchParams(query);
	if (folder) params.set("folder", folder);
	else params.delete("folder");
	return params.toString();
}

export function buildFolderUrl(
	collectionName: string,
	query: string,
	folderPath: string,
): string {
	const params = new URLSearchParams(query);
	if (folderPath) params.set("folder", folderPath);
	return `/cms/${encodeURIComponent(collectionName)}?${params}`;
}

export function buildEntryUrl(
	collectionName: string,
	query: string,
	slug: string,
	folder: string,
): string {
	const params = new URLSearchParams(query);
	if (folder) params.set("folder", folder);
	return `/cms/${encodeURIComponent(collectionName)}/${encodeURIComponent(slug)}?${params}`;
}

export function buildPayloadQuery(query: string, folder: string): string {
	if (!query) return folder ? `folder=${encodeURIComponent(folder)}` : "";
	return folder ? `${query}&folder=${encodeURIComponent(folder)}` : query;
}
