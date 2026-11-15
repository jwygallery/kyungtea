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

export default function App() {
  // Default landing screen is Home (horizontal 4:3 photo slideshow)
  const [activeTab, setActiveTab] = useState<MenuTab>('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [dataset, setDataset] = useState<KyungDataset>(() => loadInitialLocalStorageDataset());

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

  // Sync with GitHub / public data.json on mount so all visitors see the latest pushed content
  useEffect(() => {
    let cancelled = false;

    async function hydrateFromServerData() {
      const localCurrent = loadInitialLocalStorageDataset();

      // 1. Check if GitHub repo config exists to pull directly from GitHub API
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
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return (
    <div
      className={`flex flex-col bg-[#F4F3EF] text-[#141413] ${
        activeTab === 'Home' ? '' : 'min-h-screen'
      }`}
    >
      <HeaderAndDrawer
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main className={activeTab === 'Home' ? '' : 'flex-1'}>
        {activeTab === 'Home' && <HomeView slides={dataset.homeSlides} />}
        {activeTab === 'Archive' && (
          <ArchiveView
            archives={dataset.archives}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'About' && <AboutView about={dataset.about} />}
        {activeTab === 'Journal' && <JournalView journals={dataset.journals} />}
        {activeTab === 'Contact' && <ContactView contact={dataset.contact} />}
        {activeTab === 'Admin' && (
          <AdminView
            dataset={dataset}
            onUpdateDataset={handleUpdateDataset}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
