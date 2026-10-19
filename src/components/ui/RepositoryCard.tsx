
type RepositoryCardProps = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
};

function RepositoryCard({
  name,
  description,
  language,
  stars,
  url,
}: RepositoryCardProps) {
  return (
    <article className="w-full rounded-xl border border-[#2C312E] bg-[#1B1F1D] p-5 transition-colors hover:border-[#10B981]">
      <h3 className="mb-2 break-words font-['Space_Grotesk'] text-lg font-semibold text-[#E1E4DF]">
        {name}
      </h3>

      <p className="mb-4 font-['Inter'] text-sm text-[#8F968F]">
        {description || "No description available."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-[#252A27] px-3 py-1 font-mono text-xs text-[#E1E4DF]">
          {language || "Unknown"}
        </span>

        <span className="font-mono text-sm text-[#8F968F]">
          ★ {stars}
        </span>
      </div>

      <div className="mt-5 border-t border-[#2C312E] pt-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-['Inter'] text-sm font-medium text-[#4ADEA3] hover:underline"
        >
          View on GitHub ↗
        </a>
      </div>
    </article>
  );
}

export default RepositoryCard;
