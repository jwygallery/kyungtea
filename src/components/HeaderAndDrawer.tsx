import React, { useEffect } from 'react';
import { MenuTab } from '../types/cms';

interface HeaderAndDrawerProps {
  activeTab: MenuTab;
  onSelectTab: (tab: MenuTab) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
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
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

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

          {/* Center Zone: single word lowercase kyung alone */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onSelectTab('Home')}
              className="text-xl font-semibold tracking-tight text-[#141413] lowercase whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-[#141413]"
            >
              kyung
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
            {/* Drawer Header: simple X button only */}
            <div className="flex h-14 items-center justify-end border-b border-[#141413] px-5">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center text-[#141413] transition-opacity duration-150 hover:opacity-60 cursor-pointer"
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

            {/* 4 Menu Items */}
            <div className="flex-1 divide-y divide-[#141413] border-b border-[#141413]">
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

            {/* Drawer Bottom Banner: kyung on left, inconspicuous admin button on right in same font/color */}
            <div className="flex h-14 items-center justify-between px-6">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('Home');
                  setIsDrawerOpen(false);
                }}
                className="text-base font-semibold tracking-tight text-[#141413] lowercase whitespace-nowrap shrink-0 cursor-pointer"
              >
                kyung
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('Admin');
                  setIsDrawerOpen(false);
                }}
                className="text-base font-semibold tracking-tight text-[#141413] lowercase whitespace-nowrap shrink-0 cursor-pointer"
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
