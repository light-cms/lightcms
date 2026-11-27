const API = "https://api.github.com";
const PER_PAGE = 100;

export interface Template {
  owner: string;
  name: string;
  description: string;
  fullName: string;
  generateUrl: string;
}

export interface TemplatesResult {
  templates: Template[];
  error: string | null;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  is_template: boolean;
  owner: { login: string };
}

interface FetchTemplatesOptions {
  token?: string;
  org?: boolean;
  fetch?: typeof fetch;
}

export async function fetchTemplates(
  owner: string,
  { token, org = false, fetch: fetchFn = fetch }: FetchTemplatesOptions = {},
): Promise<Template[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = org ? `${API}/orgs/${owner}/repos` : `${API}/users/${owner}/repos`;
  const repos: GitHubRepo[] = [];

  for (let page = 1; ; page++) {
    const res = await fetchFn(`${base}?per_page=${PER_PAGE}&type=public&page=${page}`, {
      headers,
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);

    const batch: GitHubRepo[] = await res.json();
    repos.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return repos
    .filter((repo) => repo.is_template && !repo.private)
    .map((repo) => ({
      owner: repo.owner.login,
      name: repo.name,
      description: repo.description ?? "",
      fullName: repo.full_name,
      generateUrl: `https://github.com/${repo.owner.login}/${repo.name}/generate`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
