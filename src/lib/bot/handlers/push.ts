import type { Context } from "probot";
import { COMMIT_STATUS_CONTEXT } from "../constants";
import { isContentPath } from "../content";
import { logBotError } from "./error-handler";

type PushContext = Context<"push">;

const REFS_HEADS_PREFIX = "refs/heads/";
const FRONT_MATTER_DELIMITER = "---";

function collectContentPaths(context: PushContext): string[] {
	const commits = context.payload.commits ?? [];
	const paths = new Set<string>();

	for (const commit of commits) {
		const added = commit.added ?? [];
		const modified = commit.modified ?? [];
		for (const path of [...added, ...modified]) {
			if (isContentPath(path)) {
				paths.add(path);
			}
		}
	}

	return [...paths];
}

function branchFromRef(ref: string): string | undefined {
	if (ref.startsWith(REFS_HEADS_PREFIX) === false) {
		return undefined;
	}
	return ref.slice(REFS_HEADS_PREFIX.length);
}

function hasUnclosedFrontMatter(body: string): boolean {
	if (body.startsWith(FRONT_MATTER_DELIMITER) === false) {
		return false;
	}
	const closingIndex = body.indexOf(
		FRONT_MATTER_DELIMITER,
		FRONT_MATTER_DELIMITER.length,
	);
	return closingIndex === -1;
}

async function validateContentFile(
	context: PushContext,
	owner: string,
	repo: string,
	path: string,
	ref: string,
): Promise<string | undefined> {
	const { data } = await context.octokit.rest.repos.getContent({
		owner,
		repo,
		path,
		ref,
	});

	if (Array.isArray(data)) {
		context.log.warn({ file: path }, "Expected a file but found a directory");
		return `Unexpected directory at ${path}`;
	}

	if ("content" in data === false || typeof data.content !== "string") {
		return undefined;
	}

	const encoding = "base64" as BufferEncoding;
	const decoded = Buffer.from(data.content, encoding).toString("utf-8");

	if (hasUnclosedFrontMatter(decoded)) {
		context.log.warn(
			{ file: path },
			"Unclosed frontmatter delimiter in content file",
		);
		return `Unclosed frontmatter in ${path}`;
	}

	return undefined;
}

async function reportContentStatus(
	context: PushContext,
	owner: string,
	repo: string,
	sha: string,
	processedCount: number,
	problems: string[],
) {
	let state: "success" | "failure" = "success";
	if (problems.length > 0) {
		state = "failure";
	}

	let description = `${processedCount} content file(s) validated`;
	if (problems.length > 0) {
		description = `${problems.length} content file(s) need attention`;
	}

	try {
		await context.octokit.rest.repos.createCommitStatus({
			owner,
			repo,
			sha,
			state,
			context: COMMIT_STATUS_CONTEXT,
			description,
		});
	} catch (error) {
		logBotError(context, "Failed to create content commit status", error);
	}
}

/**
 * Validate CMS content on pushes to the default branch.
 *
 * Only added and modified content files are fetched. Each file is
 * validated independently so one missing file cannot abort the rest,
 * and the final commit status reflects the aggregate result instead of
 * unconditionally reporting success.
 */
export async function handlePush(context: PushContext) {
	const { payload, log } = context;

	const branch = branchFromRef(payload.ref);
	if (branch === undefined) {
		log.debug({ ref: payload.ref }, "Skipping non-branch push");
		return;
	}

	const defaultBranch = payload.repository.default_branch;
	if (branch !== defaultBranch) {
		log.debug({ branch, defaultBranch }, "Skipping non-default branch push");
		return;
	}

	const owner = payload.repository.owner?.login;
	if (owner === undefined || owner === "") {
		log.warn("Skipping push with missing repository owner");
		return;
	}

	const repoName = payload.repository.name;
	if (repoName === undefined || repoName === "") {
		log.warn("Skipping push with missing repository name");
		return;
	}

	const contentPaths = collectContentPaths(context);
	if (contentPaths.length === 0) {
		log.debug("No content changes in this push");
		return;
	}

	log.info(
		{
			files: contentPaths.length,
			sender: payload.sender?.login,
			branch,
		},
		"Content push detected",
	);

	const headSha = payload.head_commit?.id;
	let fetchRef = branch;
	if (typeof headSha === "string" && headSha.length > 0) {
		fetchRef = headSha;
	}

	const problems: string[] = [];
	for (const path of contentPaths) {
		try {
			const problem = await validateContentFile(
				context,
				owner,
				repoName,
				path,
				fetchRef,
			);
			if (problem !== undefined) {
				problems.push(problem);
			}
		} catch (error) {
			logBotError(context, `Failed to validate content file ${path}`, error);
			problems.push(`Could not validate ${path}`);
		}
	}

	if (typeof headSha === "string" && headSha.length > 0) {
		await reportContentStatus(
			context,
			owner,
			repoName,
			headSha,
			contentPaths.length,
			problems,
		);
	}
}
