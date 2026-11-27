import {
	isGitHubStatus,
	isNotFoundError,
	RepositoryFileExistsError,
	wrapGitHubError,
} from "./errors";
import {
	assertRepositoryPath,
	encodeContent,
	parseRepository,
} from "./helpers";
import { getFileContent } from "./read";
import type { GitHubClient, Repository } from "./types";

async function createOrUpdateContents(
	path: string,
	content: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch: string | undefined,
	sha: string | undefined,
) {
	const { owner, repo } = parseRepository(repository);
	return client.rest.repos.createOrUpdateFileContents({
		owner,
		repo,
		path,
		message,
		content: encodeContent(content),
		...(branch ? { branch } : {}),
		...(sha ? { sha } : {}),
	});
}

/**
 * Internal helper to attempt creation with a branch, falling back to default branch if needed.
 */
async function createOrUpdateWithBranchFallback(
	path: string,
	content: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch: string | undefined,
	existingSha: string | undefined,
) {
	try {
		const response = await createOrUpdateContents(
			path,
			content,
			message,
			client,
			repository,
			branch,
			existingSha,
		);
		return {
			commitSha: response.data.commit.sha,
			path: response.data.content?.path ?? path,
		};
	} catch (error) {
		// If the branch is invalid or missing, retry without specifying a branch (uses default).
		if (
			branch &&
			(isGitHubStatus(error, 404) ||
				isGitHubStatus(error, 409) ||
				isGitHubStatus(error, 422))
		) {
			const response = await createOrUpdateContents(
				path,
				content,
				message,
				client,
				repository,
				undefined,
				existingSha,
			);
			return {
				commitSha: response.data.commit.sha,
				path: response.data.content?.path ?? path,
			};
		}
		wrapGitHubError(`create or update file: ${path}`, error);
	}
}

/**
 * Creates a new file or updates an existing one. If the file exists, its SHA is used to avoid conflicts.
 */
export async function createOrUpdateFile(
	path: string,
	content: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch?: string,
) {
	const normalizedPath = path.replace(/^\/+/, "");
	assertRepositoryPath(normalizedPath);
	let sha: string | undefined;
	try {
		sha = (await getFileContent(normalizedPath, client, repository, branch))
			.sha;
	} catch (error) {
		if (!isNotFoundError(error)) throw error;
		// File does not exist, so sha remains undefined.
	}
	return createOrUpdateWithBranchFallback(
		normalizedPath,
		content,
		message,
		client,
		repository,
		branch,
		sha,
	);
}

/**
 * Creates a new file. Throws `RepositoryFileExistsError` if the file already exists.
 */
export async function createFile(
	path: string,
	content: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch?: string,
) {
	const normalizedPath = path.replace(/^\/+/, "");
	assertRepositoryPath(normalizedPath);
	// Ensure the file does not already exist.
	try {
		await getFileContent(normalizedPath, client, repository, branch);
		throw new RepositoryFileExistsError(
			`File "${normalizedPath}" already exists.`,
		);
	} catch (error) {
		if (error instanceof RepositoryFileExistsError) throw error;
		if (!isNotFoundError(error)) throw error;
		// File does not exist, proceed.
	}
	return createOrUpdateWithBranchFallback(
		normalizedPath,
		content,
		message,
		client,
		repository,
		branch,
		undefined,
	);
}

/**
 * Deletes a file.
 */
export async function deleteFile(
	path: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch?: string,
) {
	const normalizedPath = path.replace(/^\/+/, "");
	assertRepositoryPath(normalizedPath);
	const { owner, repo } = parseRepository(repository);
	const { sha } = await getFileContent(
		normalizedPath,
		client,
		repository,
		branch,
	);
	try {
		await client.rest.repos.deleteFile({
			owner,
			repo,
			path: normalizedPath,
			message,
			sha,
			...(branch ? { branch } : {}),
		});
	} catch (error) {
		wrapGitHubError(`delete file: ${normalizedPath}`, error);
	}
}

/**
 * Moves a file from source path to destination path.
 */
export async function moveFile(
	fromPath: string,
	toPath: string,
	message: string,
	client: GitHubClient,
	repository: Repository,
	branch?: string,
) {
	const normalizedFrom = fromPath.replace(/^\/+/, "");
	const normalizedTo = toPath.replace(/^\/+/, "");
	assertRepositoryPath(normalizedFrom);
	assertRepositoryPath(normalizedTo);

	if (normalizedFrom === normalizedTo) {
		return;
	}

	const source = await getFileContent(
		normalizedFrom,
		client,
		repository,
		branch,
	);
	const result = await createFile(
		normalizedTo,
		source.content,
		message,
		client,
		repository,
		branch,
	);

	try {
		await deleteFile(
			normalizedFrom,
			`Remove ${normalizedFrom} after moving to ${normalizedTo}`,
			client,
			repository,
			branch,
		);
	} catch (cause) {
		try {
			await deleteFile(
				normalizedTo,
				`Rollback moved file at ${normalizedTo}`,
				client,
				repository,
				branch,
			);
		} catch (rollbackCause) {
			throw new AggregateError(
				[cause, rollbackCause],
				`The file move from ${normalizedFrom} to ${normalizedTo} could not be completed.`,
			);
		}
		throw cause;
	}

	return result;
}
