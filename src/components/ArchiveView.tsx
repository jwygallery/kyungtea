import React, { useState } from 'react';
import { ArchiveSpecimen, MenuTab } from '../types/cms';
import { HerbariumImage } from './HerbariumImage';

interface ArchiveViewProps {
  archives: ArchiveSpecimen[];
  onNavigateTab: (tab: MenuTab) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ archives, onNavigateTab }) => {
  const [selectedSpecimen, setSelectedSpecimen] = useState<ArchiveSpecimen | null>(null);

  // Product Detail View when an Archive item is clicked
  if (selectedSpecimen) {
    const displayTitle = selectedSpecimen.title || selectedSpecimen.nameKo;

    return (
      <article className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
        {/* Top-Left Back Button */}
        <div className="flex items-center justify-start pb-8">
          <button
            type="button"
            onClick={() => setSelectedSpecimen(null)}
            aria-label="Back to archive list"
            className="flex h-9 w-9 items-center justify-center text-[#141413] transition-opacity duration-150 hover:opacity-60 cursor-pointer"
          >
            <svg
              width="20"
              height="16"
              viewBox="0 0 20 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7.5 1L1 8M1 8L7.5 15M1 8H19"
                stroke="#141413"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        {/* 2-Column Botanical Product Layout */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          {/* Left: Vertical 3:4 (세로 4:3) Product Image (60% size) */}
          <div className="md:col-span-4">
            <div className="w-44 sm:w-52">
              <HerbariumImage
                src={selectedSpecimen.imageUrl}
                alt={displayTitle}
                aspectClass="aspect-[3/4]"
                specimenCode={selectedSpecimen.archiveNo}
              />
            </div>
          </div>

          {/* Right: Product Info & Specifications */}
          <div className="md:col-span-8">
            <header className="border-b border-[#141413] pb-6">
              <div className="text-xs font-normal tracking-wide text-[#6E706E] tabular-nums">
                {selectedSpecimen.archiveNo}
              </div>
              <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-[#141413] sm:text-3xl">
                {displayTitle}
              </h1>
            </header>

            {selectedSpecimen.specimenNotes && (
              <p className="mt-6 text-sm leading-relaxed text-[#141413]">
                {selectedSpecimen.specimenNotes}
              </p>
            )}

            <dl className="mt-8 divide-y divide-[#141413]/30 border-t border-b border-[#141413] text-xs">
              <div className="grid grid-cols-12 py-3.5">
                <dt className="col-span-4 text-[#6E706E]">원물 · 학명</dt>
                <dd className="col-span-8 text-[#141413]">
                  {selectedSpecimen.nameKo} ({selectedSpecimen.scientificName})
                </dd>
              </div>

              <div className="grid grid-cols-12 py-3.5">
                <dt className="col-span-4 text-[#6E706E]">산지 · 고도</dt>
                <dd className="col-span-8 text-[#141413]">
                  {selectedSpecimen.originCoords} · {selectedSpecimen.altitude}
                </dd>
              </div>

              <div className="grid grid-cols-12 py-3.5">
                <dt className="col-span-4 text-[#6E706E]">제다 · 가공</dt>
                <dd className="col-span-8 text-[#141413]">
                  {selectedSpecimen.processingSpec}
                </dd>
              </div>

              <div className="grid grid-cols-12 py-3.5">
                <dt className="col-span-4 text-[#6E706E]">추출 가이드</dt>
                <dd className="col-span-8 text-[#141413] tabular-nums">
                  {selectedSpecimen.extractionProtocol}
                </dd>
              </div>

              <div className="grid grid-cols-12 py-3.5">
                <dt className="col-span-4 text-[#6E706E]">향미 · 성분</dt>
                <dd className="col-span-8 text-[#141413]">
                  {selectedSpecimen.flavorComponents}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecimen(null);
                  onNavigateTab('Contact');
                }}
                className="border border-[#141413] bg-[#141413] px-6 py-2.5 text-xs font-medium text-[#F4F3EF] transition-opacity hover:opacity-85 cursor-pointer"
              >
                Sample & B2B Inquiry
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Archive Product List Grid: Left 2 lines (unbolded small Archive No. + Title underneath), Right 60% smaller vertical 3:4 photo
  return (
    <section className="mx-auto w-full max-w-[1440px]">
      {archives.length === 0 ? (
        <div className="p-16 text-center text-sm text-[#6E706E]">
          등록된 원물 아카이브가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {archives.map((item, idx) => {
            const isRightCol = idx % 2 === 1;
            const displayTitle = item.title || item.nameKo;

            return (
              <article
                key={item.id}
                onClick={() => setSelectedSpecimen(item)}
                role="button"
                tabIndex={0}
                aria-label={`${item.archiveNo} ${displayTitle}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSpecimen(item);
                  }
                }}
                className={`group flex items-center justify-between gap-6 border-b border-[#141413] bg-[#F4F3EF] px-6 py-6 transition-colors duration-150 hover:bg-[#EAE8E1]/60 sm:px-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413] ${
                  !isRightCol ? 'md:border-r md:border-[#141413]' : ''
                }`}
              >
                {/* Left: 2 lines — Line 1: Archive No. 001 (small, not bold), Line 2: Single Title */}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-normal tracking-wide text-[#6E706E] tabular-nums">
                    {item.archiveNo}
                  </div>
                  <h2 className="mt-1.5 text-lg font-medium tracking-tight text-[#141413] sm:text-xl">
                    {displayTitle}
                  </h2>
                </div>

                {/* Right: 60% Smaller Vertical 3:4 (세로 4:3) Product Photo */}
                <div className="w-14 shrink-0 sm:w-[76px]">
                  <HerbariumImage
                    src={item.imageUrl}
                    alt={displayTitle}
                    aspectClass="aspect-[3/4]"
                    specimenCode={item.archiveNo}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
