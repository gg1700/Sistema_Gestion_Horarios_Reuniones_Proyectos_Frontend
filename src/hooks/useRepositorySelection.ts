
import { useCallback, useState } from "react";
import type { Repository, RepositorySelection } from "../types/repository";
import { DEFAULT_MAX_SELECTED_REPOSITORIES } from "../constants/repositories";

type UseRepositorySelectionProps = {
  repositories: Repository[];
  initialSelection?: RepositorySelection[];
  maxSelected?: number;
};

function useRepositorySelection({
  repositories,
  initialSelection = [],
  maxSelected = DEFAULT_MAX_SELECTED_REPOSITORIES,
}: UseRepositorySelectionProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    [...initialSelection]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.repositoryId)
  );

  const [search, setSearch] = useState("");

  const selectedRepositories = selectedIds
    .map((id) => repositories.find((repository) => repository.id === id))
    .filter((repository): repository is Repository => repository !== undefined);

  const filteredRepositories = repositories.filter((repository) =>
    repository.name.toLowerCase().includes(search.toLowerCase())
  );

  const limitReached = selectedIds.length >= maxSelected;

  function toggleRepository(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds((current) =>
        current.filter((selectedId) => selectedId !== id)
      );
      return;
    }

    if (selectedIds.length >= maxSelected) {
      return;
    }

    setSelectedIds((current) => [...current, id]);
  }

  function moveRepository(id: number, direction: "up" | "down") {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (index === -1 || newIndex < 0 || newIndex >= current.length) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      return updated;
    });
  }

function getSelection(): RepositorySelection[] {
  return selectedIds.map((repositoryId, index) => ({
    repositoryId,
    position: index + 1,
  }));
}


const resetSelection = useCallback((selection: RepositorySelection[]) => {
  setSelectedIds(
    [...selection]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.repositoryId)
  );
}, []);


  return {
    search,
    setSearch,
    selectedIds,
    selectedRepositories,
    filteredRepositories,
    limitReached,
    maxSelected,
    toggleRepository,
    moveRepository,
    getSelection,
    resetSelection,
  };
}

export default useRepositorySelection;
