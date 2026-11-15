import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full border-t border-[#141413] bg-[#F4F3EF]">
      <div className="mx-auto flex h-auto max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8 md:h-14 md:py-0">
        {/* Footer Logo: kyung Wordmark Only */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 330 124"
          className="h-5 md:h-6 w-auto text-[#141413] overflow-visible select-none"
          role="img"
          aria-label="kyung"
        >
          <g fill="currentColor">
            {/* k */}
            <path d="M12 14 H23 V88 H12 Z M47 38 H63.5 L23 72 V58.5 Z M29 63 L36 56 L64.5 88 H50 Z" />
            {/* y */}
            <path d="M69 38 H80.8 L96 76 L111.2 38 H123 L93.4 112 H81.6 L90.1 90.75 Z" />
            {/* u */}
            <path d="M135 38 H146 V66 C146 75.5 151.5 80 159.5 80 C167.5 80 174 74.5 174 64 V38 H185 V88 H174.3 V80.5 C170.5 86 164.5 89.2 157 89.2 C143.5 89.2 135 80.5 135 66.5 Z" />
            {/* n */}
            <path d="M201 38 H211.7 V45.5 C215.5 40 221.5 36.8 229 36.8 C242.5 36.8 251 45.5 251 59.5 V88 H240 V60 C240 50.5 234.5 46 226.5 46 C218.5 46 212 51.5 212 62 V88 H201 Z" />
            {/* g */}
            <path
              fillRule="evenodd"
              d="M307.2 38 H318 V88 C318 104.5 307.5 113 291.5 113 C279.5 113 271 107.5 268.5 98.5 H279.8 C281.8 102.5 286 104.5 291.8 104.5 C301.5 104.5 307 98.5 307 88 V80.5 C303 85.8 296.8 88.8 289.2 88.8 C275.5 88.8 266 78.2 266 62.8 C266 47.4 275.5 36.8 289.2 36.8 C297 36.8 303.2 40 307.2 45.5 Z M291.8 45.8 C282.5 45.8 277 52.5 277 62.8 C277 73.1 282.5 79.8 291.8 79.8 C301 79.8 307 73.1 307 62.8 C307 52.5 301 45.8 291.8 45.8 Z"
            />
          </g>
        </svg>
        <div className="flex flex-col items-end gap-y-0.5 text-right md:flex-row md:items-center md:gap-x-3 md:gap-y-0">
          <span className="flex items-center gap-x-2 whitespace-nowrap">
            <span className="text-[11px] md:text-xs font-normal tracking-wide text-[#141413] whitespace-nowrap">
              Seoul, Korea
            </span>
            <span className="text-[11px] md:text-xs text-[#6E706E] whitespace-nowrap">·</span>
            <a
              href="https://instagram.com/teahousekyung"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] md:text-xs font-normal tracking-wide text-[#141413] hover:underline whitespace-nowrap"
            >
              @teahousekyung
            </a>
          </span>
          <span className="hidden text-[11px] md:text-xs text-[#6E706E] md:inline whitespace-nowrap">·</span>
          <span className="whitespace-nowrap text-[11px] md:text-xs font-normal tracking-wide text-[#141413] tabular-nums">
            © 2024 tea house kyung
          </span>
        </div>
      </div>
    </footer>
  );
};
