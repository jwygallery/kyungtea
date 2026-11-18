import React, { useState } from 'react';
import { JournalPost } from '../types/cms';
import { EditorialPostCard } from './EditorialPostCard';
import { HerbariumImage } from './HerbariumImage';

interface JournalViewProps {
  journals: JournalPost[];
  selectedPostId?: string | null;
  onSelectPostId?: (id: string | null) => void;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  selectedPostId: controlledPostId,
  onSelectPostId,
  onBack,
  searchQuery: externalQuery,
  onSearchChange,
}) => {
  const [internalPostId, setInternalPostId] = useState<string | null>(null);
  const [internalQuery, setInternalQuery] = useState<string>('');
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };
  const selectedPostId = controlledPostId !== undefined ? controlledPostId : internalPostId;

  const handleSelectPost = (id: string | null) => {
    if (onSelectPostId) {
      onSelectPostId(id);
    } else {
      setInternalPostId(id);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      handleSelectPost(null);
    }
  };

  const activePost = journals.find((j) => j.id === selectedPostId) || null;

  // Full Article Reader View when a post is clicked
  if (activePost) {
    return (
      <article className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
        {/* Top-Left Back Button with Section Indicator */}
        <div className="flex items-center justify-start pb-8">
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Back to journal list"
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
            <span className="text-sm font-medium tracking-tight">Journal</span>
          </button>
        </div>

        {/* Article Header: Title, Subtitle, and Date */}
        <header className="border-b border-[#141413] pb-8">
          <h1
            className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {activePost.title}
          </h1>
          {activePost.summary && (
            <p className="mt-3 text-sm leading-relaxed text-[#6E706E] sm:text-base">
              {activePost.summary}
            </p>
          )}
          <div className="mt-3 text-xs text-[#6E706E] tabular-nums">
            {activePost.date}
          </div>
        </header>

        {/* Continuous Alternating Photo & Text Blocks */}
        <div className="mt-10 space-y-10">
          {activePost.blocks.map((block, idx) => {
            const seq = String(idx + 1).padStart(2, '0');
            if (block.type === 'image') {
              return (
                <div key={block.id}>
                  <HerbariumImage
                    src={block.content}
                    alt={block.caption || `${activePost.title} image ${seq}`}
                    caption={block.caption}
                    aspectClass="aspect-[16/10]"
                    specimenCode={`FIG ${seq}`}
                  />
                </div>
              );
            }

            return (
              <div
                key={block.id}
                className="space-y-5 text-base leading-relaxed text-[#141413]"
              >
                {block.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line leading-[1.85]">
                    {para}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredJournals = normalizedQuery
    ? journals.filter((post) => {
        const blockText = post.blocks
          .map((b) => `${b.content} ${b.caption || ''}`)
          .join(' ');
        const hay = [post.title, post.date, post.issueNo, post.summary, blockText]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(normalizedQuery);
      })
    : journals;

  // Feed List View: Top Search Bar + Title and Date below Title
  return (
    <section className="mx-auto w-full max-w-[1440px]">
      {/* Top Page Title & Search Bar */}
      <div className="flex flex-col gap-4 bg-[#F4F3EF] px-6 pt-6 pb-4 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pt-10">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl">
          Journal
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
              aria-label="Search journal"
              className="w-full bg-transparent text-xs text-[#141413] placeholder-[#6E706E] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear journal search"
                className="shrink-0 text-xs leading-none text-[#6E706E] hover:text-[#141413] cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
          {normalizedQuery && (
            <span className="shrink-0 text-[11px] text-[#6E706E] tabular-nums">
              {filteredJournals.length}
            </span>
          )}
        </div>
      </div>

      {filteredJournals.length === 0 ? (
        <div className="p-16 text-center text-sm text-[#6E706E]">
          {normalizedQuery ? '검색 결과가 없습니다.' : '등록된 저널 게시물이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 px-6 pt-6 pb-12 sm:px-10 sm:pt-8 sm:pb-16 md:grid-cols-2 lg:gap-x-14 lg:gap-y-14">
          {filteredJournals.map((post) => {
            const coverImage =
              post.coverImageUrl?.trim() ||
              post.blocks.find((b) => b.type === 'image')?.content;
            const subtitle =
              post.summary?.trim() ||
              post.blocks.find((b) => b.type === 'text')?.content.split('\n')[0] ||
              '';

            return (
              <EditorialPostCard
                key={post.id}
                title={post.title}
                subtitle={subtitle}
                date={post.date}
                imageUrl={coverImage}
                onClick={() => handleSelectPost(post.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
