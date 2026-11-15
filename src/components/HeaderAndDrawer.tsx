import React, { useEffect, useState } from 'react';
import { ArchiveSpecimen, JournalPost, MenuTab } from '../types/cms';

interface HeaderAndDrawerProps {
  activeTab: MenuTab;
  onSelectTab: (tab: MenuTab) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  archives?: ArchiveSpecimen[];
  journals?: JournalPost[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNavigateItem?: (tab: MenuTab, itemId: string | null) => void;
}

const MENU_ITEMS: { tab: MenuTab }[] = [
  { tab: 'About' },
  { tab: 'Archive' },
  { tab: 'Journal' },
  { tab: 'Contact' },
];

export const HeaderAndDrawer: React.FC<HeaderAndDrawerProps> = ({
  activeTab,
  onSelectTab,
  isDrawerOpen,
  setIsDrawerOpen,
  archives = [],
  journals = [],
  searchQuery: externalQuery,
  onSearchChange,
  onNavigateItem,
}) => {
  const [internalQuery, setInternalQuery] = useState<string>('');
  const query = externalQuery !== undefined ? externalQuery : internalQuery;

  const setQuery = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  const matchedArchives = normalizedQuery
    ? archives.filter((item) => {
        const hay = [
          item.archiveNo,
          item.title,
          item.nameKo,
          item.scientificName,
          item.originCoords,
          item.flavorComponents,
          item.specimenNotes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(normalizedQuery);
      })
    : [];

  const matchedJournals = normalizedQuery
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
    : [];

  const handleDrawerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedQuery) return;
    if (matchedArchives.length > 0) {
      onSelectTab('Archive');
      setIsDrawerOpen(false);
    } else if (matchedJournals.length > 0) {
      onSelectTab('Journal');
      setIsDrawerOpen(false);
    } else {
      onSelectTab('Archive');
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Top Header: 1px solid #141413 bottom border, 3 lines menu button on left, lowercase kyung in center */}
      <header className="sticky top-0 z-30 h-14 w-full border-b border-[#141413] bg-[#F4F3EF]">
        <div className="mx-auto grid h-full max-w-[1440px] grid-cols-3 items-center px-4 sm:px-8">
          {/* Left Zone: 3 horizontal lines only */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              className="flex h-9 w-9 items-center justify-center text-[#141413] transition-opacity duration-150 hover:opacity-60 focus-visible:outline-1 focus-visible:outline-[#141413] cursor-pointer"
            >
              <svg
                width="20"
                height="14"
                viewBox="0 0 20 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line x1="0" y1="1" x2="20" y2="1" stroke="#141413" strokeWidth="1.5" />
                <line x1="0" y1="7" x2="20" y2="7" stroke="#141413" strokeWidth="1.5" />
                <line x1="0" y1="13" x2="20" y2="13" stroke="#141413" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* Center Zone: kyung tea house main logo */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onSelectTab('Home')}
              aria-label="kyung tea house home"
              className="flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-[#141413]"
            >
              <img
                src="./images/logo_header_kyung_teahouse.png"
                alt="kyung tea house"
                className="h-6 sm:h-7 w-auto object-contain select-none"
              />
            </button>
          </div>

          {/* Right Zone: Empty */}
          <div />
        </div>
      </header>

      {/* Left Overlay Menu Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#141413]/40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Slide Drawer Panel */}
          <nav
            aria-label="Primary Navigation"
            className="relative z-10 flex h-full w-full max-w-sm flex-col justify-between border-r border-[#141413] bg-[#F4F3EF]"
          >
            {/* Drawer Header: Simple Search Bar on Left of X, above About */}
            <div className="flex h-14 items-center justify-between gap-3 border-b border-[#141413] px-6">
              <form
                onSubmit={handleDrawerSearchSubmit}
                className="flex flex-1 items-center gap-2.5 border-b border-[#141413]/40 py-1 focus-within:border-[#141413]"
              >
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
                  aria-label="Search archive and journal"
                  className="w-full bg-transparent text-xs text-[#141413] placeholder-[#6E706E] focus:outline-none"
                />
              </form>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-[#141413] transition-opacity duration-150 hover:opacity-60 cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line x1="1" y1="1" x2="15" y2="15" stroke="#141413" strokeWidth="1.5" />
                  <line x1="15" y1="1" x2="1" y2="15" stroke="#141413" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {/* Menu Items + Live Search Results if query is entered */}
            <div className="flex-1 overflow-y-auto border-b border-[#141413]">
              {normalizedQuery && (
                <div className="divide-y divide-[#141413]/30 border-b border-[#141413] bg-[#EAE8E1]/50">
                  {matchedArchives.length === 0 && matchedJournals.length === 0 ? (
                    <div className="px-6 py-3.5 text-xs text-[#6E706E]">
                      검색 결과가 없습니다.
                    </div>
                  ) : (
                    <>
                      {matchedArchives.map((item) => (
                        <button
                          key={`drawer-arch-${item.id}`}
                          type="button"
                          onClick={() => {
                            if (onNavigateItem) {
                              onNavigateItem('Archive', item.id);
                            } else {
                              onSelectTab('Archive');
                            }
                            setIsDrawerOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-6 py-3 text-left text-xs text-[#141413] hover:bg-[#EAE8E1] cursor-pointer"
                        >
                          <span className="truncate font-medium">
                            {item.title || item.nameKo}
                          </span>
                          <span className="ml-3 shrink-0 text-[11px] text-[#6E706E]">
                            Archive
                          </span>
                        </button>
                      ))}
                      {matchedJournals.map((post) => (
                        <button
                          key={`drawer-jour-${post.id}`}
                          type="button"
                          onClick={() => {
                            if (onNavigateItem) {
                              onNavigateItem('Journal', post.id);
                            } else {
                              onSelectTab('Journal');
                            }
                            setIsDrawerOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-6 py-3 text-left text-xs text-[#141413] hover:bg-[#EAE8E1] cursor-pointer"
                        >
                          <span className="truncate font-medium">{post.title}</span>
                          <span className="ml-3 shrink-0 text-[11px] text-[#6E706E]">
                            Journal
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div className="divide-y divide-[#141413] border-b border-[#141413]">
                {MENU_ITEMS.map(({ tab }) => {
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        onSelectTab(tab);
                        setIsDrawerOpen(false);
                      }}
                      className={`group flex w-full items-center px-6 py-5 text-left transition-colors duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#141413] text-[#F4F3EF]'
                          : 'bg-[#F4F3EF] text-[#141413] hover:bg-[#EAE8E1]'
                      }`}
                    >
                      <span className="text-2xl font-medium tracking-tight">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Banner: kyung logo on left, inconspicuous unbolded admin button on right */}
            <div className="flex h-14 items-center justify-between px-6">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('Home');
                  setIsDrawerOpen(false);
                }}
                aria-label="kyung home"
                className="flex items-center shrink-0 cursor-pointer"
              >
                <img
                  src="./images/logo_footer_kyung.png"
                  alt="kyung"
                  className="h-4 sm:h-[18px] w-auto object-contain select-none"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('Admin');
                  setIsDrawerOpen(false);
                }}
                className="text-xs font-normal tracking-tight text-[#141413] lowercase whitespace-nowrap shrink-0 cursor-pointer"
              >
                admin
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
