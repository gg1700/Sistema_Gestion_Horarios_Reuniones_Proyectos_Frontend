
import type { RepositorySelection } from "../types/repository";

const storageKey = "orbita-repository-selection-preview";

export async function getRepositorySelection(): Promise<RepositorySelection[]> {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is RepositorySelection =>
        typeof item === "object" &&
        item !== null &&
        typeof item.repositoryId === "number" &&
        typeof item.position === "number"
    );
  } catch {
    return [];
  }
}

export async function saveRepositorySelection(
  selection: RepositorySelection[],
  simulateError = false
): Promise<void> {
  if (simulateError) {
    throw new Error("No se pudo guardar la selección de repositorios.");
  }

  localStorage.setItem(storageKey, JSON.stringify(selection));
}
