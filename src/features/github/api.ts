export const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
export class RepositoryApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}
export interface RepositoryItem {
  id: number; name: string; description: string | null; language: string | null;
  stars: number; url: string; private: boolean; visibility: 'public' | 'private' | 'internal';
  selected: boolean; selectionId: string | null; visible: boolean;
}
export interface RepositoryCatalogue {
  repositories: RepositoryItem[]; selectedIds: number[]; maxSelected: number; username: string; warnings: string[];
}

export async function githubApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}/api/v1${path}`, { ...init, credentials: 'include' });
  const result = await response.json();
  if (!response.ok || !result.success) throw new RepositoryApiError(result.message ?? 'No se pudo completar la operación.', response.status, result.code);
  return result.data as T;
}
export const getRepositories = (signal?: AbortSignal) => githubApi<RepositoryCatalogue>('/integrations/github/repositories', { signal });
export const saveRepositories = (repositoryIds: number[]) => githubApi<{ selectedIds: number[] }>('/integrations/github/repositories/selected', {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repositoryIds }),
});
export const saveRepositoryVisibility = (changes: { id: string; visible: boolean; type: string }[]) => githubApi('/profile/visibility', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }),
});

export type GithubActivityType = 'list' | 'grid';

export interface GithubActivityPayload {
  action?: string;
  size?: number;
  commits?: {
    message?: string;
  }[];
  pull_request?: {
    title?: string;
  };
  issue?: {
    title?: string;
  };
  release?: {
    name?: string;
    tag_name?: string;
  };
}

export interface GithubActivityEvent {
  type: string | null;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  date: string | null;
  payload: GithubActivityPayload;
}

export interface GithubContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface GithubContributionGrid {
  totalContributions: number;
  weeks: {
    contributionDays: GithubContributionDay[];
  }[];
}

export function getGithubActivity(
  type: GithubActivityType,
  signal?: AbortSignal
) {
  return githubApi<GithubActivityEvent[] | GithubContributionGrid>(
    `/integrations/github/activity/${type}`,
    { signal }
  );
}