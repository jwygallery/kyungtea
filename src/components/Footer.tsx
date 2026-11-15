import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full border-t border-[#141413] bg-[#F4F3EF]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8">
        <span className="text-base font-semibold tracking-tight text-[#141413] lowercase whitespace-nowrap shrink-0">
          kyung
        </span>
        <span className="text-xs font-normal tracking-tight text-[#141413] whitespace-nowrap shrink-0">
          Seoul, Korea
        </span>
      </div>
    </footer>
  );
};
