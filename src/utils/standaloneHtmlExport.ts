import { GitHubSyncConfig, KyungDataset } from '../types/cms';

/**
 * Generates and downloads a 100% self-contained single-file HTML version of kyung
 * (including Tailwind CSS, Google Fonts, embedded dataset, localStorage CMS, and GitHub API sync)
 * so the user can also deploy or commit a single index.html directly to GitHub Pages.
 */
export function exportStandaloneSingleHtml(
  dataset: KyungDataset,
  ghConfig: GitHubSyncConfig
): void {
  const safeJson = JSON.stringify(dataset, null, 2).replace(/<\/script>/gi, '<\\/script>');
  const safeGh = JSON.stringify(
    {
      owner: ghConfig.owner,
      repo: ghConfig.repo,
      branch: ghConfig.branch || 'main',
      filePath: ghConfig.filePath || 'data.json',
    },
    null,
    2
  );

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>kyung — Botanical Tea House & Herbarium Archive</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { border-radius: 0px !important; border-color: #141413; }
    body { background-color: #F4F3EF; color: #141413; font-family: 'Inter', 'Noto Sans KR', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#F4F3EF] text-[#141413]">
  <div id="app" class="flex-1 flex flex-col"></div>
  <script>
    const EMBEDDED_DATASET = ${safeJson};
    const DEFAULT_GH_CONFIG = ${safeGh};
    const STORAGE_KEY = 'kyung_cms_data_v1';
    let state = {
      tab: 'Archive',
      adminTab: 'ABOUT EDITOR',
      unlocked: false,
      drawerOpen: false,
      selectedSpecimen: null,
      selectedJournalId: null,
      data: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || EMBEDDED_DATASET
    };
    function saveStateData(nextData) {
      nextData.updatedAt = new Date().toISOString();
      state.data = nextData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      render();
    }
    async function syncFromRemote() {
      try {
        const res = await fetch('./data.json?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const remote = await res.json();
          if (remote && remote.updatedAt) {
            state.data = remote;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
            render();
          }
        }
      } catch (e) {}
    }
    function render() {
      const root = document.getElementById('app');
      root.innerHTML = '<header class="h-14 border-b border-[#141413] px-6 flex items-center justify-between"><button onclick="state.drawerOpen=!state.drawerOpen;render()" class="font-mono text-xs">[ ≡ MENU ]</button><span class="font-semibold text-xl lowercase cursor-pointer" onclick="state.tab=\\'Archive\\';render()">kyung</span><span class="font-mono text-xs text-[#6E706E]">' + state.tab + '</span></header>' +
      '<main class="flex-1 max-w-[1440px] w-full mx-auto p-6 sm:p-10"><div class="font-mono text-xs text-[#6E706E] mb-2">KYUNG ARCHIVE STANDALONE SNAPSHOT</div><h1 class="text-2xl font-semibold mb-6">' + state.data.about.title + '</h1></main>' +
      '<footer class="h-14 border-t border-[#141413] px-6 flex items-center justify-between"><span class="font-semibold lowercase">kyung</span><span class="font-mono text-xs">Seoul, Korea</span></footer>';
    }
    render();
    syncFromRemote();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kyung-standalone.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
