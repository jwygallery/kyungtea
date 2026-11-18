import React, { useEffect, useState } from 'react';
import { ArchiveSpecimen, MenuTab } from '../types/cms';
import { getArchiveImageUrls } from '../utils/cmsLogic';
import { EditorialPostCard } from './EditorialPostCard';
import { HerbariumImage } from './HerbariumImage';

interface ArchiveViewProps {
  archives: ArchiveSpecimen[];
  onNavigateTab: (tab: MenuTab) => void;
  selectedSpecimenId?: string | null;
  onSelectSpecimenId?: (id: string | null) => void;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  fallbackDate?: string;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  archives,
  onNavigateTab,
  selectedSpecimenId,
  onSelectSpecimenId,
  onBack,
  searchQuery: externalQuery,
  onSearchChange,
  fallbackDate,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [internalQuery, setInternalQuery] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };
  const activeId = selectedSpecimenId !== undefined ? selectedSpecimenId : internalSelectedId;
  const selectedSpecimen = archives.find((a) => a.id === activeId) || null;

  useEffect(() => {
    setActiveImageIdx(0);
  }, [activeId]);

  const handleSelectSpecimen = (item: ArchiveSpecimen | null) => {
    const nextId = item ? item.id : null;
    if (onSelectSpecimenId) {
      onSelectSpecimenId(nextId);
    } else {
      setInternalSelectedId(nextId);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      handleSelectSpecimen(null);
    }
  };

  const getSubtitle = (item: ArchiveSpecimen) =>
    item.subtitle?.trim() ||
    item.harvestSeason?.trim() ||
    (item.originCoords
      ? `${item.originCoords}${item.scientificName ? ` · ${item.scientificName}` : ''}`
      : '');

  const getDate = (item: ArchiveSpecimen) => item.date?.trim() || fallbackDate || '';

  // Product Detail View when an Archive item is clicked
  if (selectedSpecimen) {
    const displayTitle = selectedSpecimen.title || selectedSpecimen.nameKo;
    const displaySubtitle = getSubtitle(selectedSpecimen);
    const displayDate = getDate(selectedSpecimen);
    const specimenImages = getArchiveImageUrls(selectedSpecimen);
    const safeIdx =
      activeImageIdx >= 0 && activeImageIdx < specimenImages.length ? activeImageIdx : 0;
    const activeImageSrc = specimenImages[safeIdx];

    return (
      <article className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
        {/* Top-Left Back Button with Section Indicator */}
        <div className="flex items-center justify-start pb-8">
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Back to archive list"
            className="inline-flex items-center gap-2.5 py-1 text-[#141413] transition-opacity duration-150 hover:opacity-60 cursor-pointer"
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
            <span className="text-sm font-medium tracking-tight">Archive</span>
          </button>
        </div>

        {/* 2-Column Botanical Product Layout */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start md:gap-12">
          {/* Left: Vertical 3:4 Product Image + Thumbnail Selector */}
          <div className="md:col-span-4">
            <div className="w-full max-w-[260px]">
              <HerbariumImage
                src={activeImageSrc}
                alt={
                  specimenImages.length > 1
                    ? `${displayTitle} (${safeIdx + 1})`
                    : displayTitle
                }
                aspectClass="aspect-[3/4]"
              />

              {specimenImages.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {specimenImages.map((imgSrc, imgIdx) => {
                    const isSelected = imgIdx === safeIdx;
                    return (
                      <button
                        key={`${selectedSpecimen.id}-thumb-${imgIdx}`}
                        type="button"
                        onClick={() => setActiveImageIdx(imgIdx)}
                        aria-label={`View image ${imgIdx + 1}`}
                        aria-pressed={isSelected}
                        className={`aspect-[3/4] w-full overflow-hidden border bg-[#EAE8E1] transition-opacity cursor-pointer ${
                          isSelected
                            ? 'border-[#141413] opacity-100'
                            : 'border-[#141413]/30 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${displayTitle} thumbnail ${imgIdx + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-center"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info & Specifications */}
          <div className="md:col-span-8">
            <header className="border-b border-[#141413] pb-6">
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="mt-2.5 text-sm leading-relaxed text-[#6E706E] sm:text-base">
                  {displaySubtitle}
                </p>
              )}
              {displayDate && (
                <div className="mt-3 text-xs text-[#6E706E] tabular-nums">
                  {displayDate}
                </div>
              )}
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

  const normalizedQuery = query.trim().toLowerCase();
  const filteredArchives = normalizedQuery
    ? archives.filter((item) => {
        const hay = [
          item.title,
          item.subtitle,
          item.date,
          item.nameKo,
          item.scientificName,
          item.originCoords,
          item.altitude,
          item.processingSpec,
          item.flavorComponents,
          item.specimenNotes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(normalizedQuery);
      })
    : archives;

  // Unified Editorial Grid: 2 columns, no dividing lines, Photo Left + Title/Subtitle/Date Right
  return (
    <section className="mx-auto w-full max-w-[1440px]">
      {/* Top Page Title & Search Bar */}
      <div className="flex flex-col gap-4 bg-[#F4F3EF] px-6 pt-6 pb-4 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pt-10">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl">
          Archive
        </h1>
        <div className="flex items-center gap-3 sm:justify-end">
          <div className="flex w-full items-center gap-2.5 border-b border-[#141413]/40 pb-1.5 transition-colors focus-within:border-[#141413] sm:w-64">
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0 text-[#141413]"
            >
              <circle cx="6.8" cy="6.8" r="5.3" stroke="#141413" strokeWidth="1.4" />
              <line x1="10.8" y1="10.8" x2="15" y2="15" stroke="#141413" strokeWidth="1.4" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search archive"
              className="w-full bg-transparent text-xs text-[#141413] placeholder-[#6E706E] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear archive search"
                className="shrink-0 text-xs leading-none text-[#6E706E] hover:text-[#141413] cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
          {normalizedQuery && (
            <span className="shrink-0 text-[11px] text-[#6E706E] tabular-nums">
              {filteredArchives.length}
            </span>
          )}
        </div>
      </div>

      {filteredArchives.length === 0 ? (
        <div className="p-16 text-center text-sm text-[#6E706E]">
          {normalizedQuery ? '검색 결과가 없습니다.' : '등록된 원물 아카이브가 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 px-6 pt-6 pb-12 sm:px-10 sm:pt-8 sm:pb-16 md:grid-cols-2 lg:gap-x-14 lg:gap-y-14">
          {filteredArchives.map((item) => {
            const displayTitle = item.title || item.nameKo;
            return (
              <EditorialPostCard
                key={item.id}
                title={displayTitle}
                subtitle={getSubtitle(item)}
                date={getDate(item)}
                imageUrl={getArchiveImageUrls(item)[0]}
                onClick={() => handleSelectSpecimen(item)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
