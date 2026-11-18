import React, { useEffect, useState } from 'react';

interface EditorialPostCardProps {
  title: string;
  subtitle?: string;
  date?: string;
  imageUrl?: string;
  onClick: () => void;
}

export const EditorialPostCard: React.FC<EditorialPostCardProps> = ({
  title,
  subtitle,
  date,
  imageUrl,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl && !hasError);

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group grid grid-cols-12 items-start gap-5 sm:gap-6 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413]"
    >
      {/* Left: Portrait Photo */}
      <div className="col-span-5 sm:col-span-4 aspect-[3/4] w-full overflow-hidden bg-[#EAE8E1]">
        {showImage ? (
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
            <svg
              viewBox="0 0 120 120"
              className="h-12 w-12 stroke-[#141413]/40 stroke-1 fill-none"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="104" height="104" strokeWidth="1" />
              <path d="M60 95 C60 65, 60 35, 60 22" />
              <path d="M60 75 C42 68, 32 52, 38 36 C50 40, 58 54, 60 75 Z" />
              <path d="M60 62 C78 55, 88 39, 82 24 C70 28, 62 42, 60 62 Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Right: Title -> Subtitle -> Date */}
      <div className="col-span-7 sm:col-span-8 min-w-0 pt-0.5">
        <h2
          className="text-lg font-semibold leading-snug tracking-tight text-[#141413] transition-opacity duration-150 group-hover:opacity-65 sm:text-xl"
          style={{ textWrap: 'balance' }}
        >
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#6E706E]">
            {subtitle}
          </p>
        )}

        {date && (
          <div className="mt-4 text-xs font-normal tracking-wide text-[#6E706E] tabular-nums">
            {date}
          </div>
        )}
      </div>
    </article>
  );
};
