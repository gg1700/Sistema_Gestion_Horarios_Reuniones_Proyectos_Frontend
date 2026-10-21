
import RepositoryCard from "../components/ui/RepositoryCard";
import { repositoriesMock } from "../mocks/repositoriesMock";

function RepositoriesPreview() {
  return (
    <main className="min-h-screen bg-orbita-background text-orbita-text">
      <header className="border-b border-orbita-outline px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center">
          <span className="font-heading text-xl font-bold tracking-widest text-orbita-accent">
            ÓRBITA
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <section aria-labelledby="repositories-title">
          <h1
            id="repositories-title"
            className="font-heading text-3xl font-semibold md:text-4xl"
          >
            Mis repositorios
          </h1>

          <p className="font-body mt-3 text-sm text-orbita-muted md:text-base">
            Tus repositorios de GitHub vinculados
          </p>

          {repositoriesMock.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {repositoriesMock.map((repository) => (
                <RepositoryCard
                  key={repository.id}
                  repository={repository}
                />
              ))}
            </div>
          ) : (
            <p className="font-body mt-8 text-orbita-muted">
              No hay repositorios disponibles.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default RepositoriesPreview;
