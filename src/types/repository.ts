export type Repository = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
};


export type RepositorySelection = {
  repositoryId: number;
  position: number;
};
