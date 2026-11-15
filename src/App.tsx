/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AboutView } from './components/AboutView';
import { AdminView } from './components/AdminView';
import { ArchiveView } from './components/ArchiveView';
import { ContactView } from './components/ContactView';
import { Footer } from './components/Footer';
import { HeaderAndDrawer } from './components/HeaderAndDrawer';
import { HomeView } from './components/HomeView';
import { JournalView } from './components/JournalView';
import { KyungDataset, MenuTab } from './types/cms';
import {
  INITIAL_DATASET,
  INITIAL_HOME_SLIDES,
  resolveDatasetPriority,
  STORAGE_KEY,
} from './utils/cmsLogic';
import {
  fetchPublicDataJson,
  loadGitHubSyncConfig,
  pullDatasetFromGitHub,
} from './utils/githubSync';

function loadInitialLocalStorageDataset(): KyungDataset {
  if (typeof window === 'undefined') return INITIAL_DATASET;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATASET));
      return INITIAL_DATASET;
    }
    const parsed = JSON.parse(raw) as KyungDataset;
    if (parsed && parsed.about && Array.isArray(parsed.archives) && Array.isArray(parsed.journals)) {
      if (!parsed.homeSlides || parsed.homeSlides.length === 0) {
        parsed.homeSlides = INITIAL_HOME_SLIDES;
      }
      return parsed;
    }
    return INITIAL_DATASET;
  } catch {
    return INITIAL_DATASET;
  }
}

interface RouteState {
  tab: MenuTab;
  itemId: string | null;
}

function parseRouteFromHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) return { tab: 'Home', itemId: null };

  const [seg0, ...rest] = clean.split('/');
  const subId = rest.length > 0 ? decodeURIComponent(rest.join('/')) : null;
  const key = seg0.toLowerCase();

  switch (key) {
    case 'about':
      return { tab: 'About', itemId: null };
    case 'archive':
      return { tab: 'Archive', itemId: subId || null };
    case 'journal':
      return { tab: 'Journal', itemId: subId || null };
    case 'contact':
      return { tab: 'Contact', itemId: null };
    case 'admin':
      return { tab: 'Admin', itemId: null };
    case 'home':
    default:
      return { tab: 'Home', itemId: null };
  }
}

function buildHashFromRoute(tab: MenuTab, itemId?: string | null): string {
  switch (tab) {
    case 'About':
      return '#/about';
    case 'Archive':
      return itemId ? `#/archive/${encodeURIComponent(itemId)}` : '#/archive';
    case 'Journal':
      return itemId ? `#/journal/${encodeURIComponent(itemId)}` : '#/journal';
    case 'Contact':
      return '#/contact';
    case 'Admin':
      return '#/admin';
    case 'Home':
    default:
      return '#/';
  }
}

export default function App() {
  const initialRoute =
    typeof window !== 'undefined'
      ? parseRouteFromHash(window.location.hash)
      : { tab: 'Home' as MenuTab, itemId: null };

  const [activeTab, setActiveTab] = useState<MenuTab>(initialRoute.tab);
  const [activeItemId, setActiveItemId] = useState<string | null>(initialRoute.itemId);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [dataset, setDataset] = useState<KyungDataset>(() => loadInitialLocalStorageDataset());
  const [bootCycle, setBootCycle] = useState<number>(0);

  // Navigate to a route and push an entry to browser history so Back returns to the previous page
  const navigateTo = (tab: MenuTab, itemId: string | null = null) => {
    setActiveTab(tab);
    setActiveItemId(itemId);
    if (typeof window !== 'undefined') {
      const nextHash = buildHashFromRoute(tab, itemId);
      if (window.location.hash !== nextHash) {
        window.history.pushState({ tab, itemId, inAppNav: true }, '', nextHash);
      }
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  // Go back to previous route in history (or fallback list view if deep-linked)
  const handleBackNavigation = (fallbackTab: MenuTab) => {
    if (typeof window !== 'undefined' && window.history.state?.inAppNav) {
      window.history.back();
    } else {
      navigateTo(fallbackTab, null);
    }
  };

  // Sync browser Back/Forward buttons (popstate / hashchange) with React route state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.location.hash) {
      window.history.replaceState(
        { tab: initialRoute.tab, itemId: initialRoute.itemId, inAppNav: false },
        '',
        buildHashFromRoute(initialRoute.tab, initialRoute.itemId)
      );
    }

    const syncRouteFromLocation = () => {
      const parsed = parseRouteFromHash(window.location.hash);
      setActiveTab(parsed.tab);
      setActiveItemId(parsed.itemId);
      setIsDrawerOpen(false);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  // Persist dataset to localStorage and update React state immediately
  const handleUpdateDataset = (next: KyungDataset) => {
    setDataset(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  };

  const handleResetToDefault = () => {
    const resetData: KyungDataset = {
      ...INITIAL_DATASET,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateDataset(resetData);
  };

  // Reboot application cleanly to Home and re-sync latest pushed dataset
  const handleRebootApp = () => {
    setIsDrawerOpen(false);
    navigateTo('Home', null);
    setBootCycle((prev) => prev + 1);
  };

  // Sync with GitHub / public data.json on boot and when returning to the tab
  useEffect(() => {
    let cancelled = false;

    async function hydrateFromServerData() {
      const localCurrent = loadInitialLocalStorageDataset();

      // 1. Check if GitHub repo config exists to pull directly from GitHub API / Raw
      const ghConf = loadGitHubSyncConfig();
      if (ghConf.owner && ghConf.repo) {
        const ghRes = await pullDatasetFromGitHub(ghConf);
        if (!cancelled && ghRes.ok && ghRes.data) {
          const merged = resolveDatasetPriority(localCurrent, ghRes.data);
          if (!merged.homeSlides || merged.homeSlides.length === 0) {
            merged.homeSlides = INITIAL_HOME_SLIDES;
          }
          setDataset(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return;
        }
      }

      // 2. Otherwise check static ./data.json served by GitHub Pages / host
      const publicJson = await fetchPublicDataJson();
      if (!cancelled && publicJson) {
        const merged = resolveDatasetPriority(localCurrent, publicJson);
        if (!merged.homeSlides || merged.homeSlides.length === 0) {
          merged.homeSlides = INITIAL_HOME_SLIDES;
        }
        setDataset(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    }

    hydrateFromServerData();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setDataset(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        hydrateFromServerData();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bootCycle]);

  return (
    <div
      key={bootCycle}
      className={`flex flex-col bg-[#F4F3EF] text-[#141413] ${
        activeTab === 'Home' ? '' : 'min-h-screen'
      }`}
    >
      <HeaderAndDrawer
        activeTab={activeTab}
        onSelectTab={(tab) => navigateTo(tab, null)}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main className={activeTab === 'Home' ? '' : 'flex-1'}>
        {activeTab === 'Home' && <HomeView slides={dataset.homeSlides} />}
        {activeTab === 'Archive' && (
          <ArchiveView
            archives={dataset.archives}
            selectedSpecimenId={activeItemId}
            onSelectSpecimenId={(id) => navigateTo('Archive', id)}
            onBack={() => handleBackNavigation('Archive')}
            onNavigateTab={(tab) => navigateTo(tab, null)}
          />
        )}
        {activeTab === 'About' && <AboutView about={dataset.about} />}
        {activeTab === 'Journal' && (
          <JournalView
            journals={dataset.journals}
            selectedPostId={activeItemId}
            onSelectPostId={(id) => navigateTo('Journal', id)}
            onBack={() => handleBackNavigation('Journal')}
          />
        )}
        {activeTab === 'Contact' && <ContactView contact={dataset.contact} />}
        {activeTab === 'Admin' && (
          <AdminView
            dataset={dataset}
            onUpdateDataset={handleUpdateDataset}
            onResetToDefault={handleResetToDefault}
            onRebootApp={handleRebootApp}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
