export class RepositoryFileExistsError extends Error {}

export class GitHubApiError extends Error {
  status?: number;
  operation: string;
  cause: unknown;

  constructor(message: string, status: number | undefined, operation: string, cause: unknown) {
    super(message);
    this.status = status;
    this.operation = operation;
    this.cause = cause;
    this.name = "GitHubApiError";
  }
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return String(error);
}

export function isGitHubStatus(error: unknown, status: number): boolean {
  return getErrorStatus(error) === status;
}

export function isEmptyRepoError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") return false;
  return message.toLowerCase().includes("empty repository");
}

export function isNotFoundError(error: unknown): boolean {
  return isGitHubStatus(error, 404) || isGitHubStatus(error, 409) || isEmptyRepoError(error);
}

export function wrapGitHubError(operation: string, error: unknown): never {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  throw new GitHubApiError(message, status, operation, error);
}
