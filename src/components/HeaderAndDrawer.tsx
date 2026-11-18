import React, { useEffect, useState } from 'react';
import { ArchiveSpecimen, JournalPost, MenuTab } from '../types/cms';

interface HeaderAndDrawerProps {
  activeTab: MenuTab;
  onSelectTab: (tab: MenuTab, preserveSearch?: boolean) => void;
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
  const [shouldRenderDrawer, setShouldRenderDrawer] = useState<boolean>(isDrawerOpen);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(isDrawerOpen);
  const query = externalQuery !== undefined ? externalQuery : internalQuery;

  const setQuery = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      setShouldRenderDrawer(true);
      let raf2 = 0;
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setIsDrawerVisible(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
      };
    }
    setIsDrawerVisible(false);
    const timer = window.setTimeout(() => {
      setShouldRenderDrawer(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [isDrawerOpen]);

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
      onSelectTab('Archive', true);
      setIsDrawerOpen(false);
    } else if (matchedJournals.length > 0) {
      onSelectTab('Journal', true);
      setIsDrawerOpen(false);
    } else {
      onSelectTab('Archive', true);
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Top Header: 1px solid #141413 bottom border, kyung tea house logo on left, 3 lines menu button on right */}
      <header className="sticky top-0 z-30 h-14 w-full border-b border-[#141413] bg-[#F4F3EF]">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-8">
          {/* Left Zone: kyung tea house main logo */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => onSelectTab('Home')}
              aria-label="kyung tea house home"
              className="flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-[#141413]"
            >
              {/* Header Logo: kyung + tea house (No Stamp) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 330 124"
                className="h-9 md:h-10 w-auto text-[#141413] overflow-visible select-none"
                role="img"
                aria-label="kyung tea house"
              >
                {/* Wordmark: kyung (Geometric Swiss Grotesk) */}
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

                {/* Sub-text: tea house (Larger & well-proportioned between y and g descenders) */}
                <text
                  x="183"
                  y="112"
                  textAnchor="middle"
                  fill="currentColor"
                  fontFamily="'Inter', 'Noto Sans KR', sans-serif"
                  fontSize="23.5"
                  fontWeight="500"
                  letterSpacing="0.15em"
                >
                  tea house
                </text>
              </svg>
            </button>
          </div>

          {/* Right Zone: 3 horizontal lines menu button */}
          <div className="flex items-center justify-end">
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
        </div>
      </header>

      {/* Right Overlay Menu Drawer */}
      {shouldRenderDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-[#141413]/40 transition-opacity duration-300 ease-out ${
              isDrawerVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Right Slide Drawer Panel */}
          <nav
            aria-label="Primary Navigation"
            className={`relative z-10 flex h-full w-[70%] max-w-sm flex-col justify-between border-l border-[#141413] bg-[#F4F3EF] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isDrawerVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header: Simple Search Bar on Left of X, above About */}
            <div className="flex h-14 items-center justify-between gap-3 border-b border-[#141413] px-5 sm:px-6">
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
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="shrink-0 text-xs leading-none text-[#6E706E] hover:text-[#141413] cursor-pointer"
                  >
                    ×
                  </button>
                )}
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

              <div className="py-2">
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
                      className={`group flex w-full items-center px-5 py-4 text-left transition-colors duration-150 sm:px-6 cursor-pointer ${
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
            <div className="flex h-14 items-center justify-between px-5 sm:px-6">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('Home');
                  setIsDrawerOpen(false);
                }}
                aria-label="kyung home"
                className="flex items-center shrink-0 cursor-pointer"
              >
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
