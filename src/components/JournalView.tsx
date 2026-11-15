import React, { useState } from 'react';
import { JournalPost } from '../types/cms';
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
        {/* Top-Left Back Button */}
        <div className="flex items-center justify-start pb-6">
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Back to journal list"
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

        {/* Article Header: Title and Date right below Title */}
        <header className="border-b border-[#141413] pb-8">
          <h1
            className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {activePost.title}
          </h1>
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
      {/* Simple Top Search Bar */}
      <div className="flex h-12 items-center border-b border-[#141413] bg-[#F4F3EF] px-6 sm:px-10">
        <div className="flex w-full max-w-xs items-center gap-2.5">
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
        </div>
      </div>

      {filteredJournals.length === 0 ? (
        <div className="p-16 text-center text-sm text-[#6E706E]">
          {normalizedQuery ? '검색 결과가 없습니다.' : '등록된 저널 게시물이 없습니다.'}
        </div>
      ) : (
        <div className="divide-y divide-[#141413]">
          {filteredJournals.map((post) => (
            <article
              key={post.id}
              onClick={() => handleSelectPost(post.id)}
              role="button"
              tabIndex={0}
              aria-label={post.title}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectPost(post.id);
                }
              }}
              className="group border-b border-[#141413] bg-[#F4F3EF] px-6 py-8 transition-colors duration-150 hover:bg-[#EAE8E1]/60 sm:px-10 cursor-pointer"
            >
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-2xl">
                {post.title}
              </h2>
              <div className="mt-2.5 text-xs text-[#6E706E] tabular-nums">
                {post.date}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
