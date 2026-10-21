
import { useEffect } from "react";
import type { Repository, RepositorySelection } from "../../types/repository";
import useRepositorySelection from "../../hooks/useRepositorySelection";

type RepositorySelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  initialSelection: RepositorySelection[];
  onSave: (selection: RepositorySelection[]) => void | Promise<void>;
  maxSelected?: number;
  isLoading?: boolean;
  isSaving?: boolean;
  isGitHubConnected?: boolean;
  error?: string | null;
  saveError?: string | null;
};

function RepositorySelectionModal({
  isOpen,
  onClose,
  repositories,
  initialSelection,
  onSave,
  maxSelected,
  isLoading = false,
  isSaving = false,
  isGitHubConnected = true,
  error = null,
  saveError = null,
}: RepositorySelectionModalProps) {
  const {
    search,
    setSearch,
    selectedIds,
    selectedRepositories,
    filteredRepositories,
    limitReached,
    maxSelected: selectionLimit,
    toggleRepository,
    moveRepository,
    getSelection,
    resetSelection,
  } = useRepositorySelection({
    repositories,
    initialSelection,
    maxSelected,
  });

  useEffect(() => {
    if (isOpen) {
      resetSelection(initialSelection);
      setSearch("");
    }
  }, [isOpen, initialSelection, resetSelection, setSearch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) {
    return null;
  }

  const canEdit =
    !isLoading && !isSaving && isGitHubConnected && !error;

  async function handleSave() {
    if (!canEdit) {
      return;
    }

    await onSave(getSelection());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="repository-modal-title"
        className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-orbita-outline bg-[#2A2F2C] text-orbita-text shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-orbita-outline p-4 sm:p-5">
          <div>
            <h2
              id="repository-modal-title"
              className="font-heading text-xl font-semibold"
            >
              Seleccionar repositorios
            </h2>

            <p className="font-body mt-2 text-sm text-orbita-muted">
              Elige y organiza los repositorios que aparecerán en tu perfil.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar ventana"
            className="rounded-md px-2 py-1 text-xl text-orbita-muted hover:bg-orbita-surface hover:text-orbita-text disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="orbita-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {!isGitHubConnected ? (
            <p className="rounded-lg bg-orbita-surface p-4 text-sm text-orbita-muted">
              Tu cuenta de GitHub no está vinculada. Vincúlala para seleccionar repositorios.
            </p>
          ) : isLoading ? (
            <p className="py-8 text-center text-sm text-orbita-muted">
              Cargando repositorios...
            </p>
          ) : error ? (
            <p
              role="alert"
              className="rounded-lg bg-[#3B2422] p-4 text-sm text-[#FFB4AB]"
            >
              {error}
            </p>
          ) : repositories.length === 0 ? (
            <p className="py-8 text-center text-sm text-orbita-muted">
              No hay repositorios disponibles.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="repository-search"
                  className="font-body text-sm font-medium"
                >
                  Buscar repositorios
                </label>

                <input
                  id="repository-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre..."
                  disabled={!canEdit}
                  className="font-body w-full rounded-lg border border-orbita-outline bg-orbita-card px-4 py-3 text-sm text-orbita-text outline-none placeholder:text-orbita-muted focus:border-orbita-primary"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading font-medium">
                  Repositorios disponibles
                </h3>

                <span className="font-code text-xs text-orbita-muted">
                  {selectedIds.length} de {selectionLimit} seleccionados
                </span>
              </div>

              {limitReached && (
                <p role="status" className="text-xs text-orbita-accent">
                  Alcanzaste el límite permitido. Deselecciona un repositorio para elegir otro.
                </p>
              )}

              <div className="space-y-2">
                {filteredRepositories.length === 0 ? (
                  <p className="py-5 text-center text-sm text-orbita-muted">
                    No se encontraron repositorios con ese nombre.
                  </p>
                ) : (
                  filteredRepositories.map((repository) => {
                    const isSelected = selectedIds.includes(repository.id);

                    const isDisabled =
                      !canEdit || (!isSelected && limitReached);

                    return (
                      <label
                        key={repository.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-orbita-card p-3 ${
                          isSelected
                            ? "border-orbita-primary"
                            : "border-orbita-outline"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => toggleRepository(repository.id)}
                          className="h-4 w-4 accent-[#10B981]"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="font-heading break-words text-sm font-medium">
                            {repository.name}
                          </p>

                          <p className="font-code mt-1 text-xs text-orbita-muted">
                            {repository.language || "Desconocido"}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="border-t border-orbita-outline pt-4">
                <h3 className="font-heading mb-3 font-medium">
                  Repositorios seleccionados
                </h3>

                {selectedRepositories.length === 0 ? (
                  <p className="text-sm text-orbita-muted">
                    No hay repositorios seleccionados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedRepositories.map((repository, index) => (
                      <div
                        key={repository.id}
                        className="flex items-center gap-3 rounded-lg border border-orbita-outline bg-orbita-card p-3"
                      >
                        <span className="font-code text-xs text-orbita-muted">
                          {index + 1}
                        </span>

                        <span className="font-heading min-w-0 flex-1 break-words text-sm">
                          {repository.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => moveRepository(repository.id, "up")}
                          disabled={!canEdit || index === 0}
                          aria-label={`Subir ${repository.name}`}
                          className="rounded-md bg-orbita-surface px-3 py-2 text-orbita-text hover:text-orbita-accent disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => moveRepository(repository.id, "down")}
                          disabled={
                            !canEdit ||
                            index === selectedRepositories.length - 1
                          }
                          aria-label={`Bajar ${repository.name}`}
                          className="rounded-md bg-orbita-surface px-3 py-2 text-orbita-text hover:text-orbita-accent disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {saveError && (
          <p
            role="alert"
            className="shrink-0 px-4 pt-3 text-sm text-[#FFB4AB] sm:px-5"
          >
            {saveError}
          </p>
        )}

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-orbita-outline p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="font-body rounded-lg bg-orbita-surface px-5 py-2.5 text-sm text-orbita-text disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit || repositories.length === 0}
            className="font-body rounded-lg bg-orbita-primary px-5 py-2.5 text-sm font-semibold text-[#00291A] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar selección"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RepositorySelectionModal;
