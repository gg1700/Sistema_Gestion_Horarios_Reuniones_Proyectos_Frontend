
import type { Repository } from "../../types/repository";

type RepositoryCardProps = {
  repository: Repository;
};

function RepositoryCard({ repository }: RepositoryCardProps) {
  const { name, description, language, stars, url } = repository;

  return (
    <article className="flex h-full flex-col rounded-xl border border-orbita-outline bg-orbita-card p-6 transition-colors duration-200 hover:border-orbita-primary">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orbita-surface text-orbita-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m8 17-5-5 5-5" />
            <path d="m16 7 5 5-5 5" />
            <path d="m14 4-4 16" />
          </svg>
        </div>

        <div className="min-w-0">
          <h3 className="font-heading break-words text-lg font-semibold text-orbita-text">
            {name}
          </h3>

          <p className="font-body mt-1 text-xs text-orbita-muted">
            Repositorio público
          </p>
        </div>
      </div>

      <p className="font-body mb-6 min-h-12 flex-1 text-sm leading-6 text-orbita-muted">
        {description || "Sin descripción disponible."}
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <span className="font-code rounded-md bg-orbita-surface px-3 py-1.5 text-xs text-orbita-text">
          {language || "Desconocido"}
        </span>

        <span className="font-code flex items-center gap-2 text-xs text-orbita-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#20D4BF]"
            aria-hidden="true"
          >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
          </svg>

          {stars} estrellas
        </span>
      </div>

      <div className="border-t border-orbita-outline pt-5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body inline-flex items-center gap-2 text-sm font-medium text-orbita-accent hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orbita-primary"
        >
          Ver en GitHub
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default RepositoryCard;
