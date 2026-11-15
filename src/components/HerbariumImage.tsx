import React, { useEffect, useState } from 'react';

interface HerbariumImageProps {
  src?: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
  specimenCode?: string;
}

export const HerbariumImage: React.FC<HerbariumImageProps> = ({
  src,
  alt,
  caption,
  aspectClass = 'aspect-[16/10]',
  specimenCode = 'HERBARIUM SPECIMEN PLATE',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showFallback = !src || hasError;

  return (
    <figure className="w-full">
      <div
        className={`relative w-full overflow-hidden border border-[#141413] bg-[#EAE8E1] ${aspectClass}`}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-200"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <svg
              viewBox="0 0 120 120"
              className="mb-4 h-16 w-16 stroke-[#141413] stroke-1 fill-none"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="104" height="104" strokeWidth="1" />
              <path d="M60 95 C60 65, 60 35, 60 22" />
              <path d="M60 75 C42 68, 32 52, 38 36 C50 40, 58 54, 60 75 Z" />
              <path d="M60 62 C78 55, 88 39, 82 24 C70 28, 62 42, 60 62 Z" />
              <line x1="20" y1="100" x2="100" y2="100" strokeDasharray="2 2" />
            </svg>
            <span className="text-[11px] uppercase tracking-widest text-[#6E706E] tabular-nums">
              {specimenCode}
            </span>
            <span className="mt-1 text-sm font-medium text-[#141413]">{alt}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs text-[#6E706E]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
