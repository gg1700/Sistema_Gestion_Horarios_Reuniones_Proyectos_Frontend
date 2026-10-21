
import { useEffect, useState } from "react";
import RepositorySelectionModal from "../components/modals/RepositorySelectionModal";
import RepositoryCard from "../components/ui/RepositoryCard";
import { repositoriesMock } from "../mocks/repositoriesMock";
import {
  getRepositorySelection,
  saveRepositorySelection,
} from "../api/repositoriesApi";
import type { RepositorySelection } from "../types/repository";

type PreviewState =
  | "normal"
  | "disconnected"
  | "empty"
  | "error"
  | "limit"
  | "saveError";

function RepositorySelectionPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<RepositorySelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("normal");

  useEffect(() => {
    async function loadSelection() {
      try {
        const selection = await getRepositorySelection();
        setSavedSelection(selection);
      } catch {
        setMessage("No se pudo cargar la selección de repositorios.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSelection();
  }, []);

  const selectedRepositories = [...savedSelection]
    .sort((a, b) => a.position - b.position)
    .map((item) =>
      repositoriesMock.find(
        (repository) => repository.id === item.repositoryId
      )
    )
    .filter((repository) => repository !== undefined);

  const previewRepositories =
    previewState === "empty" ? [] : repositoriesMock;

  const isGitHubConnected = previewState !== "disconnected";

  const previewError =
    previewState === "error"
      ? "No se pudieron cargar los repositorios. Inténtalo nuevamente."
      : null;

  const previewMaxSelected =
    previewState === "limit" ? 2 : undefined;

  async function handleSave(selection: RepositorySelection[]) {
    setIsSaving(true);
    setSaveError("");
    setMessage("");

    try {
      await saveRepositorySelection(
        selection,
        previewState === "saveError"
      );

      const updatedSelection = await getRepositorySelection();

      setSavedSelection(updatedSelection);
      setIsOpen(false);
      setMessage("La selección de repositorios se guardó correctamente.");
    } catch {
      setSaveError("No se pudo guardar la selección de repositorios.");
    } finally {
      setIsSaving(false);
    }
  }

  function changePreviewState(state: PreviewState) {
    setPreviewState(state);
    setMessage("");
    setSaveError("");
    setIsOpen(false);
  }

  function openModal() {
    setMessage("");
    setSaveError("");
    setIsOpen(true);
  }

  function closeModal() {
    setSaveError("");
    setIsOpen(false);
  }

  return (
    <main className="min-h-screen bg-orbita-background text-orbita-text">
      <header className="border-b border-orbita-outline px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <span className="font-heading text-xl font-bold tracking-widest text-orbita-accent">
            ÓRBITA
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold md:text-4xl">
              Mis repositorios
            </h1>

            <p className="font-body mt-3 text-sm text-orbita-muted">
              Elige qué repositorios de GitHub se mostrarán en tu perfil.
            </p>
          </div>

          <button
            type="button"
            onClick={openModal}
            disabled={isLoading}
            className="font-body rounded-lg bg-orbita-primary px-5 py-3 text-sm font-semibold text-[#00291A] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Administrar repositorios
          </button>
        </div>

        {message && (
          <p
            role="status"
            className="font-body mb-6 text-sm text-orbita-accent"
          >
            {message}
          </p>
        )}

        <section className="mb-8 rounded-xl border border-orbita-outline bg-orbita-card p-4 sm:p-5">
          <h2 className="font-heading mb-3 text-lg font-semibold">
            Pruebas del modal
          </h2>

          <p className="font-body mb-4 text-sm text-orbita-muted">
            Selecciona un estado para comprobar el comportamiento del modal.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "normal", label: "Normal" },
              { value: "disconnected", label: "GitHub no vinculado" },
              { value: "empty", label: "Sin repositorios" },
              { value: "error", label: "Error de carga" },
              { value: "limit", label: "Límite alcanzado" },
              { value: "saveError", label: "Error de guardado" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  changePreviewState(option.value as PreviewState)
                }
                aria-pressed={previewState === option.value}
                className={`font-body rounded-lg border px-3 py-2 text-sm transition-colors ${
                  previewState === option.value
                    ? "border-orbita-primary bg-orbita-surface text-orbita-accent"
                    : "border-orbita-outline text-orbita-muted hover:border-orbita-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <p className="py-8 text-center text-orbita-muted">
            Cargando repositorios...
          </p>
        ) : selectedRepositories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {selectedRepositories.map((repository) => (
              <RepositoryCard
                key={repository.id}
                repository={repository}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-orbita-outline bg-orbita-card p-8 text-center">
            <p className="font-body text-orbita-muted">
              Todavía no has seleccionado repositorios.
            </p>
          </div>
        )}

        <RepositorySelectionModal
          isOpen={isOpen}
          onClose={closeModal}
          repositories={previewRepositories}
          initialSelection={
            previewState === "limit" ? [] : savedSelection
          }
          onSave={handleSave}
          isSaving={isSaving}
          isGitHubConnected={isGitHubConnected}
          error={previewError}
          saveError={saveError}
          maxSelected={previewMaxSelected}
        />
      </div>
    </main>
  );
}

export default RepositorySelectionPreview;
