import React, { useState } from 'react';
import {
  AdminTab,
  ArchiveSpecimen,
  ContentBlock,
  GitHubSyncConfig,
  HomeSlide,
  JournalPost,
  KyungDataset,
} from '../types/cms';
import {
  addBlock,
  addHomeSlide,
  INITIAL_HOME_SLIDES,
  moveItemDown,
  moveItemUp,
  normalizeArchiveImages,
  removeBlock,
  removeHomeSlide,
  updateBlock,
  updateHomeSlide,
  verifyAdminPasscode,
} from '../utils/cmsLogic';
import {
  loadGitHubSyncConfig,
  pushDatasetToGitHub,
  saveGitHubSyncConfig,
} from '../utils/githubSync';

interface AdminViewProps {
  dataset: KyungDataset;
  onUpdateDataset: (next: KyungDataset) => void;
  onResetToDefault: () => void;
  onRebootApp?: () => void;
}

const ADMIN_TABS: AdminTab[] = [
  'Home',
  'About',
  'Archive',
  'Journal',
  'Contact',
  'GitHub',
];

export const AdminView: React.FC<AdminViewProps> = ({
  dataset,
  onUpdateDataset,
  onRebootApp,
}) => {
  // Passcode Authentication State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<boolean>(false);

  // Active Admin Tab (ordered cleanly like the menu)
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('About');
  const [statusNotice, setStatusNotice] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Unified Draft State across all tabs
  // 1. Home Slides
  const [homeSlidesDraft, setHomeSlidesDraft] = useState<HomeSlide[]>(
    dataset.homeSlides && dataset.homeSlides.length > 0
      ? dataset.homeSlides
      : INITIAL_HOME_SLIDES
  );

  // 2. About
  const [aboutTitle, setAboutTitle] = useState<string>(dataset.about.title);
  const [aboutBlocks, setAboutBlocks] = useState<ContentBlock[]>(dataset.about.blocks);

  // 3. Archive
  const [archivesDraft, setArchivesDraft] = useState<ArchiveSpecimen[]>(dataset.archives);

  // 4. Journal
  const [journalsDraft, setJournalsDraft] = useState<JournalPost[]>(dataset.journals);

  // 5. Contact
  const [contactTitle, setContactTitle] = useState<string>(dataset.contact.title);
  const [contactIntro, setContactIntro] = useState<string>(dataset.contact.introText);
  const [contactEmail, setContactEmail] = useState<string>(dataset.contact.email);
  const [contactAddress, setContactAddress] = useState<string>(dataset.contact.addressHours);
  const [contactSocial, setContactSocial] = useState<string>(dataset.contact.socialHandle);
  const [contactOptionsText, setContactOptionsText] = useState<string>(
    dataset.contact.inquiryTypes.join('\n')
  );

  // 6. GitHub Sync Config
  const [ghConfig, setGhConfig] = useState<GitHubSyncConfig>(() => loadGitHubSyncConfig());

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcodeInput)) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleFileUploadToDataUrl = (
    file: File | undefined,
    onResult: (dataUrl: string) => void
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onResult(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Single Unified Save + GitHub Push + Auto Reboot Handler
  const handleSaveAllAndSyncGitHub = async () => {
    setIsSaving(true);
    setStatusNotice('Saving...');

    const parsedContactTypes = contactOptionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const nextDataset: KyungDataset = {
      version: dataset.version || 1,
      updatedAt: new Date().toISOString(),
      homeSlides: homeSlidesDraft.filter((s) => s.imageUrl.trim() !== ''),
      about: {
        ...dataset.about,
        title: aboutTitle.trim() || dataset.about.title,
        blocks: aboutBlocks,
      },
      archives: archivesDraft.map((a) =>
        normalizeArchiveImages({
          ...a,
          title: (a.title ?? a.nameKo).trim(),
          nameKo: a.nameKo.trim() || (a.title ?? '').trim(),
        })
      ),
      journals: journalsDraft,
      contact: {
        title: contactTitle.trim(),
        introText: contactIntro.trim(),
        email: contactEmail.trim(),
        addressHours: contactAddress.trim(),
        socialHandle: contactSocial.trim(),
        inquiryTypes:
          parsedContactTypes.length > 0
            ? parsedContactTypes
            : dataset.contact.inquiryTypes,
      },
    };

    // 1. Save to localStorage & React state immediately
    onUpdateDataset(nextDataset);
    saveGitHubSyncConfig(ghConfig);

    // 2. Push to GitHub if credentials are provided, then automatically reboot
    if (ghConfig.owner.trim() && ghConfig.repo.trim() && ghConfig.token.trim()) {
      setStatusNotice('Pushing to GitHub...');
      const res = await pushDatasetToGitHub(ghConfig, nextDataset);
      if (res.ok) {
        setStatusNotice('Pushed to GitHub — Rebooting...');
        setIsSaving(false);
        setTimeout(() => {
          if (onRebootApp) {
            onRebootApp();
          } else {
            window.location.reload();
          }
        }, 350);
        return;
      } else {
        setStatusNotice(`Saved locally (${res.message})`);
        setIsSaving(false);
        return;
      }
    }

    setStatusNotice('Saved — Rebooting...');
    setIsSaving(false);
    setTimeout(() => {
      if (onRebootApp) {
        onRebootApp();
      }
    }, 350);
  };

  // Passcode Lock Screen
  if (!isUnlocked) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] items-center justify-center p-6">
        <form
          onSubmit={handlePasscodeSubmit}
          className="w-full max-w-sm border border-[#141413] bg-[#F4F3EF] p-6"
        >
          <div>
            <label
              htmlFor="admin-passcode"
              className="block text-xs uppercase tracking-wider text-[#141413]"
            >
              Passcode
            </label>
            <input
              id="admin-passcode"
              type="password"
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                setPasscodeError(false);
              }}
              placeholder="Passcode"
              autoFocus
              className="mt-2 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2.5 text-sm text-[#141413] focus:outline-none"
            />
            {passcodeError && (
              <div className="mt-2 text-xs text-[#141413]">Invalid passcode</div>
            )}
          </div>

          <button
            type="submit"
            className="mt-5 w-full border border-[#141413] bg-[#141413] py-2.5 text-xs font-medium text-[#F4F3EF] hover:opacity-85 cursor-pointer"
          >
            Enter
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1440px]">
      {/* Top Admin Bar: Menu-ordered tabs on left, SINGLE Save button on right */}
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between border-b border-[#141413] bg-[#EAE8E1]">
        <div className="flex flex-wrap divide-x divide-[#141413] border-r border-[#141413]">
          {ADMIN_TABS.map((tab) => {
            const active = activeAdminTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveAdminTab(tab)}
                className={`px-5 py-3.5 text-xs font-medium tracking-tight transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'bg-[#EAE8E1] text-[#141413] hover:bg-[#F4F3EF]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Single Unified Save Button (saves local state + pushes to GitHub) */}
        <div className="flex items-center gap-3 px-4 py-2 text-xs">
          {statusNotice && (
            <span className="text-[#6E706E]">{statusNotice}</span>
          )}
          <button
            type="button"
            onClick={handleSaveAllAndSyncGitHub}
            disabled={isSaving}
            className="border border-[#141413] bg-[#141413] px-6 py-2 text-xs font-medium text-[#F4F3EF] hover:opacity-85 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* TAB: Home (4:3 Slides) */}
      {activeAdminTab === 'Home' && (
        <div className="p-6 sm:p-10 space-y-6">
          <div>
            <button
              type="button"
              onClick={() =>
                setHomeSlidesDraft((prev) => addHomeSlide(prev, ''))
              }
              className="border border-[#141413] bg-[#F4F3EF] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              + Add Slide
            </button>
          </div>

          <div className="space-y-4">
            {homeSlidesDraft.map((slide, idx) => (
              <div
                key={slide.id}
                className="border border-[#141413] bg-[#EAE8E1]/40 p-4"
              >
                <div className="flex items-center justify-between border-b border-[#141413] pb-2.5 text-xs">
                  <span className="font-medium">
                    Slide {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setHomeSlidesDraft((prev) => moveItemUp(prev, idx))
                      }
                      className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHomeSlidesDraft((prev) => moveItemDown(prev, idx))
                      }
                      className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHomeSlidesDraft((prev) =>
                          removeHomeSlide(prev, slide.id)
                        )
                      }
                      className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <label className="block text-[11px] text-[#6E706E]">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={slide.imageUrl}
                      onChange={(e) =>
                        setHomeSlidesDraft((prev) =>
                          updateHomeSlide(prev, slide.id, e.target.value)
                        )
                      }
                      placeholder="https://... or ./images/..."
                      className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-[#6E706E]">
                      File Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUploadToDataUrl(
                          e.target.files?.[0],
                          (dataUrl) => {
                            setHomeSlidesDraft((prev) =>
                              updateHomeSlide(prev, slide.id, dataUrl)
                            );
                          }
                        )
                      }
                      className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: About */}
      {activeAdminTab === 'About' && (
        <div className="p-6 sm:p-10 space-y-6">
          <div>
            <label className="block text-xs text-[#6E706E]">Title</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-sm text-[#141413]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-b border-[#141413] py-3">
            <button
              type="button"
              onClick={() =>
                setAboutBlocks((prev) => addBlock(prev, 'image', '', ''))
              }
              className="border border-[#141413] bg-[#F4F3EF] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              + Add Image
            </button>
            <button
              type="button"
              onClick={() => setAboutBlocks((prev) => addBlock(prev, 'text', ''))}
              className="border border-[#141413] bg-[#F4F3EF] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              + Add Text
            </button>
          </div>

          <div className="space-y-4">
            {aboutBlocks.map((blk, idx) => (
              <div
                key={blk.id}
                className="border border-[#141413] bg-[#EAE8E1]/40 p-4"
              >
                <div className="flex items-center justify-between border-b border-[#141413] pb-2.5 text-xs">
                  <span className="font-medium">
                    {String(idx + 1).padStart(2, '0')} · {blk.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAboutBlocks((prev) => moveItemUp(prev, idx))}
                      className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => setAboutBlocks((prev) => moveItemDown(prev, idx))}
                      className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setAboutBlocks((prev) => removeBlock(prev, blk.id))}
                      className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {blk.type === 'image' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-[#6E706E]">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={blk.content}
                        onChange={(e) =>
                          setAboutBlocks((prev) =>
                            updateBlock(prev, blk.id, { content: e.target.value })
                          )
                        }
                        placeholder="https://... or ./images/..."
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-[#6E706E]">
                        File Upload
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUploadToDataUrl(e.target.files?.[0], (dataUrl) => {
                            setAboutBlocks((prev) =>
                              updateBlock(prev, blk.id, { content: dataUrl })
                            );
                          })
                        }
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-[#6E706E]">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={blk.caption || ''}
                        onChange={(e) =>
                          setAboutBlocks((prev) =>
                            updateBlock(prev, blk.id, { caption: e.target.value })
                          )
                        }
                        placeholder="Caption"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <textarea
                      rows={5}
                      value={blk.content}
                      onChange={(e) =>
                        setAboutBlocks((prev) =>
                          updateBlock(prev, blk.id, { content: e.target.value })
                        )
                      }
                      placeholder="Text"
                      className="w-full border border-[#141413] bg-[#F4F3EF] p-3 text-sm leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Archive */}
      {activeAdminTab === 'Archive' && (
        <div className="p-6 sm:p-10 space-y-6">
          <div>
            <button
              type="button"
              onClick={() => {
                const nextNum = String(archivesDraft.length + 1).padStart(3, '0');
                setArchivesDraft((prev) => [
                  ...prev,
                  {
                    id: `archive-${Date.now()}`,
                    archiveNo: `Archive No. ${nextNum}`,
                    title: '',
                    nameKo: '',
                    scientificName: '',
                    originCoords: '',
                    altitude: '',
                    processingSpec: '',
                    extractionProtocol: '3.5g / 150ml / 95°C / 20s → 15s → 25s → 40s',
                    flavorComponents: '',
                    imageUrl: '',
                    imageUrls: [],
                    specimenNotes: '',
                  },
                ]);
              }}
              className="border border-[#141413] bg-[#F4F3EF] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              + Add Archive
            </button>
          </div>

          <div className="space-y-6">
            {archivesDraft.map((item, idx) => {
              const updateItem = (patch: Partial<ArchiveSpecimen>) => {
                setArchivesDraft((prev) =>
                  prev.map((a, i) => (i === idx ? { ...a, ...patch } : a))
                );
              };

              const imageList =
                item.imageUrls !== undefined
                  ? item.imageUrls
                  : item.imageUrl
                    ? [item.imageUrl]
                    : [];

              const setImageList = (nextList: string[]) => {
                updateItem({
                  imageUrls: nextList,
                  imageUrl: nextList.find((u) => u.trim() !== '') || '',
                });
              };

              return (
                <div
                  key={item.id}
                  className="border border-[#141413] bg-[#EAE8E1]/40 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#141413] pb-3 text-xs">
                    <span className="font-medium">
                      {item.archiveNo || `Archive ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setArchivesDraft((prev) => moveItemUp(prev, idx))}
                        className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => setArchivesDraft((prev) => moveItemDown(prev, idx))}
                        className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setArchivesDraft((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        Archive No.
                      </label>
                      <input
                        type="text"
                        value={item.archiveNo}
                        onChange={(e) => updateItem({ archiveNo: e.target.value })}
                        placeholder="Archive No. 001"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        Title (제목)
                      </label>
                      <input
                        type="text"
                        value={item.title ?? item.nameKo}
                        onChange={(e) => updateItem({ title: e.target.value })}
                        placeholder="상엽 뽕잎"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        원물명
                      </label>
                      <input
                        type="text"
                        value={item.nameKo}
                        onChange={(e) => updateItem({ nameKo: e.target.value })}
                        placeholder="상엽 뽕잎"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        학명
                      </label>
                      <input
                        type="text"
                        value={item.scientificName}
                        onChange={(e) => updateItem({ scientificName: e.target.value })}
                        placeholder="Morus alba"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        산지 · 좌표
                      </label>
                      <input
                        type="text"
                        value={item.originCoords}
                        onChange={(e) => updateItem({ originCoords: e.target.value })}
                        placeholder="충북 영동 · 36°10'N 127°46'E"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        해발고도
                      </label>
                      <input
                        type="text"
                        value={item.altitude}
                        onChange={(e) => updateItem({ altitude: e.target.value })}
                        placeholder="ALT 480M"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        제다 · 가공 스펙
                      </label>
                      <input
                        type="text"
                        value={item.processingSpec}
                        onChange={(e) => updateItem({ processingSpec: e.target.value })}
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        추출 가이드
                      </label>
                      <input
                        type="text"
                        value={item.extractionProtocol}
                        onChange={(e) => updateItem({ extractionProtocol: e.target.value })}
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E706E]">
                        향미 · 성분
                      </label>
                      <input
                        type="text"
                        value={item.flavorComponents}
                        onChange={(e) => updateItem({ flavorComponents: e.target.value })}
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border border-[#141413]/40 bg-[#F4F3EF]/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#6E706E]">
                        Images ({imageList.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setImageList([...imageList, ''])}
                          className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-1 text-[11px] font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                        >
                          + Add Image
                        </button>
                        <label className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-1 text-[11px] font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer">
                          + Upload Files
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              Promise.all(
                                files.map(
                                  (file) =>
                                    new Promise<string>((resolve) => {
                                      const reader = new FileReader();
                                      reader.onload = () =>
                                        resolve(
                                          typeof reader.result === 'string'
                                            ? reader.result
                                            : ''
                                        );
                                      reader.onerror = () => resolve('');
                                      reader.readAsDataURL(file);
                                    })
                                )
                              ).then((results) => {
                                const valid = results.filter(Boolean);
                                if (valid.length > 0) {
                                  setArchivesDraft((prev) =>
                                    prev.map((a, i) => {
                                      if (i !== idx) return a;
                                      const cur =
                                        a.imageUrls !== undefined
                                          ? a.imageUrls
                                          : a.imageUrl
                                            ? [a.imageUrl]
                                            : [];
                                      const next = [
                                        ...cur.filter((u) => u.trim() !== ''),
                                        ...valid,
                                      ];
                                      return {
                                        ...a,
                                        imageUrls: next,
                                        imageUrl: next[0] || '',
                                      };
                                    })
                                  );
                                }
                              });
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {imageList.length === 0 ? (
                      <div className="border border-dashed border-[#141413]/40 px-3 py-3 text-[11px] text-[#6E706E]">
                        No images added yet. Click &quot;+ Add Image&quot; or &quot;+ Upload Files&quot; to add photos.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {imageList.map((imgUrl, imgIdx) => (
                          <div
                            key={`${item.id}-img-slot-${imgIdx}`}
                            className="border border-[#141413] bg-[#F4F3EF] p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-[#141413]">
                                Image {imgIdx + 1}
                                {imgIdx === 0 ? ' (Cover)' : ''}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageList(moveItemUp(imageList, imgIdx))
                                  }
                                  className="border border-[#141413] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageList(moveItemDown(imageList, imgIdx))
                                  }
                                  className="border border-[#141413] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageList(
                                      imageList.filter((_, j) => j !== imgIdx)
                                    )
                                  }
                                  className="border border-[#141413] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label className="block text-[11px] text-[#6E706E]">
                                  Image URL
                                </label>
                                <input
                                  type="text"
                                  value={imgUrl}
                                  onChange={(e) => {
                                    const next = [...imageList];
                                    next[imgIdx] = e.target.value;
                                    setImageList(next);
                                  }}
                                  placeholder="./images/..."
                                  className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#6E706E]">
                                  File Upload
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUploadToDataUrl(
                                      e.target.files?.[0],
                                      (dataUrl) => {
                                        const next = [...imageList];
                                        next[imgIdx] = dataUrl;
                                        setImageList(next);
                                      }
                                    )
                                  }
                                  className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-2 py-1.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6E706E]">
                      상품 설명
                    </label>
                    <textarea
                      rows={3}
                      value={item.specimenNotes || ''}
                      onChange={(e) => updateItem({ specimenNotes: e.target.value })}
                      className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] p-2.5 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Journal */}
      {activeAdminTab === 'Journal' && (
        <div className="p-6 sm:p-10 space-y-6">
          <div>
            <button
              type="button"
              onClick={() => {
                const nextNum = String(journalsDraft.length + 1).padStart(2, '0');
                setJournalsDraft((prev) => [
                  ...prev,
                  {
                    id: `journal-${Date.now()}`,
                    issueNo: `ISSUE ${nextNum}`,
                    title: '',
                    date: '2026. 11',
                    summary: '',
                    blocks: [],
                  },
                ]);
              }}
              className="border border-[#141413] bg-[#F4F3EF] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              + Add Journal
            </button>
          </div>

          <div className="space-y-6">
            {journalsDraft.map((post, pIdx) => {
              const updatePost = (patch: Partial<JournalPost>) => {
                setJournalsDraft((prev) =>
                  prev.map((j, i) => (i === pIdx ? { ...j, ...patch } : j))
                );
              };

              return (
                <div
                  key={post.id}
                  className="border border-[#141413] bg-[#EAE8E1]/40 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#141413] pb-3 text-xs">
                    <span className="font-medium">
                      Journal {String(pIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setJournalsDraft((prev) => moveItemUp(prev, pIdx))}
                        className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => setJournalsDraft((prev) => moveItemDown(prev, pIdx))}
                        className="border border-[#141413] bg-[#F4F3EF] px-2 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setJournalsDraft((prev) => prev.filter((_, i) => i !== pIdx))
                        }
                        className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-0.5 hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-9">
                      <label className="block text-[11px] text-[#6E706E]">
                        Title
                      </label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => updatePost({ title: e.target.value })}
                        placeholder="저널 제목"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-[#6E706E]">
                        Date
                      </label>
                      <input
                        type="text"
                        value={post.date}
                        onChange={(e) => updatePost({ date: e.target.value })}
                        placeholder="2026. 10"
                        className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-b border-[#141413]/30 py-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        updatePost({ blocks: addBlock(post.blocks, 'image', '', '') })
                      }
                      className="border border-[#141413] bg-[#F4F3EF] px-3 py-1.5 text-xs hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      + Add Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updatePost({ blocks: addBlock(post.blocks, 'text', '') })
                      }
                      className="border border-[#141413] bg-[#F4F3EF] px-3 py-1.5 text-xs hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
                    >
                      + Add Text
                    </button>
                  </div>

                  <div className="space-y-3">
                    {post.blocks.map((blk, bIdx) => (
                      <div
                        key={blk.id}
                        className="border border-[#141413] bg-[#F4F3EF] p-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#141413] pb-2 text-xs">
                          <span>
                            {String(bIdx + 1).padStart(2, '0')} · {blk.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updatePost({ blocks: moveItemUp(post.blocks, bIdx) })
                              }
                              className="border border-[#141413] px-2 py-0.5 cursor-pointer"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updatePost({ blocks: moveItemDown(post.blocks, bIdx) })
                              }
                              className="border border-[#141413] px-2 py-0.5 cursor-pointer"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updatePost({ blocks: removeBlock(post.blocks, blk.id) })
                              }
                              className="border border-[#141413] px-2 py-0.5 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {blk.type === 'image' ? (
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              type="text"
                              value={blk.content}
                              onChange={(e) =>
                                updatePost({
                                  blocks: updateBlock(post.blocks, blk.id, {
                                    content: e.target.value,
                                  }),
                                })
                              }
                              placeholder="Image URL"
                              className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-1.5 text-xs"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUploadToDataUrl(
                                  e.target.files?.[0],
                                  (dataUrl) =>
                                    updatePost({
                                      blocks: updateBlock(post.blocks, blk.id, {
                                        content: dataUrl,
                                      }),
                                    })
                                )
                              }
                              className="border border-[#141413] bg-[#F4F3EF] px-2 py-1 text-xs"
                            />
                            <input
                              type="text"
                              value={blk.caption || ''}
                              onChange={(e) =>
                                updatePost({
                                  blocks: updateBlock(post.blocks, blk.id, {
                                    caption: e.target.value,
                                  }),
                                })
                              }
                              placeholder="Caption"
                              className="border border-[#141413] bg-[#F4F3EF] px-2.5 py-1.5 text-xs"
                            />
                          </div>
                        ) : (
                          <textarea
                            rows={4}
                            value={blk.content}
                            onChange={(e) =>
                              updatePost({
                                blocks: updateBlock(post.blocks, blk.id, {
                                  content: e.target.value,
                                }),
                              })
                            }
                            placeholder="Text"
                            className="mt-2 w-full border border-[#141413] bg-[#F4F3EF] p-2.5 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Contact */}
      {activeAdminTab === 'Contact' && (
        <div className="max-w-3xl p-6 sm:p-10 space-y-4">
          <div>
            <label htmlFor="ce-title" className="block text-xs text-[#6E706E]">
              Title
            </label>
            <input
              id="ce-title"
              type="text"
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="ce-intro" className="block text-xs text-[#6E706E]">
              Description
            </label>
            <textarea
              id="ce-intro"
              rows={4}
              value={contactIntro}
              onChange={(e) => setContactIntro(e.target.value)}
              className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ce-email" className="block text-xs text-[#6E706E]">
                Email
              </label>
              <input
                id="ce-email"
                type="text"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor="ce-addr" className="block text-xs text-[#6E706E]">
                Address
              </label>
              <input
                id="ce-addr"
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor="ce-social" className="block text-xs text-[#6E706E]">
                Social
              </label>
              <input
                id="ce-social"
                type="text"
                value={contactSocial}
                onChange={(e) => setContactSocial(e.target.value)}
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ce-options" className="block text-xs text-[#6E706E]">
              Inquiry Options (One per line)
            </label>
            <textarea
              id="ce-options"
              rows={4}
              value={contactOptionsText}
              onChange={(e) => setContactOptionsText(e.target.value)}
              className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] p-3 text-xs"
            />
          </div>
        </div>
      )}

      {/* TAB: GitHub */}
      {activeAdminTab === 'GitHub' && (
        <div className="max-w-2xl p-6 sm:p-10 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-[#6E706E]">Owner</label>
              <input
                type="text"
                value={ghConfig.owner}
                onChange={(e) =>
                  setGhConfig((prev) => ({ ...prev, owner: e.target.value }))
                }
                placeholder="github-username"
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6E706E]">Repository</label>
              <input
                type="text"
                value={ghConfig.repo}
                onChange={(e) =>
                  setGhConfig((prev) => ({ ...prev, repo: e.target.value }))
                }
                placeholder="repo-name"
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-[#6E706E]">Branch</label>
              <input
                type="text"
                value={ghConfig.branch}
                onChange={(e) =>
                  setGhConfig((prev) => ({ ...prev, branch: e.target.value }))
                }
                placeholder="main"
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6E706E]">File Path</label>
              <input
                type="text"
                value={ghConfig.filePath}
                onChange={(e) =>
                  setGhConfig((prev) => ({ ...prev, filePath: e.target.value }))
                }
                placeholder="public/data.json"
                className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6E706E]">
              Personal Access Token
            </label>
            <input
              type="password"
              value={ghConfig.token}
              onChange={(e) =>
                setGhConfig((prev) => ({ ...prev, token: e.target.value }))
              }
              placeholder="ghp_..."
              className="mt-1 w-full border border-[#141413] bg-[#F4F3EF] px-3 py-2 text-xs"
            />
          </div>
        </div>
      )}
    </section>
  );
};
