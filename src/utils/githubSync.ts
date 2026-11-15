import { GitHubSyncConfig, KyungDataset } from '../types/cms';
import {
  decodeBase64ToUtf8,
  encodeUtf8ToBase64,
  GITHUB_CONFIG_KEY,
} from './cmsLogic';

export function detectGitHubRepoFromLocation(): Partial<GitHubSyncConfig> {
  if (typeof window === 'undefined') return {};
  const host = window.location.hostname;
  const pathSegments = window.location.pathname.split('/').filter(Boolean);

  // If hosted on <owner>.github.io/<repo>
  if (host.endsWith('.github.io')) {
    const owner = host.replace('.github.io', '');
    const repo = pathSegments[0] || `${owner}.github.io`;
    return {
      owner,
      repo,
      branch: 'main',
      filePath: 'public/data.json',
    };
  }
  return {};
}

export function loadGitHubSyncConfig(): GitHubSyncConfig {
  const detected = detectGitHubRepoFromLocation();
  const fallback: GitHubSyncConfig = {
    owner: detected.owner || '',
    repo: detected.repo || '',
    branch: detected.branch || 'main',
    filePath: detected.filePath || 'public/data.json',
    token: '',
    autoSyncOnSave: false,
  };

  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GitHubSyncConfig>;
    return {
      owner: parsed.owner ?? fallback.owner,
      repo: parsed.repo ?? fallback.repo,
      branch: parsed.branch || 'main',
      filePath: parsed.filePath || 'public/data.json',
      token: parsed.token || '',
      autoSyncOnSave: Boolean(parsed.autoSyncOnSave),
    };
  } catch {
    return fallback;
  }
}

export function saveGitHubSyncConfig(config: GitHubSyncConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

export async function fetchPublicDataJson(): Promise<KyungDataset | null> {
  try {
    const res = await fetch(`./data.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as KyungDataset;
    if (json && json.about && Array.isArray(json.archives) && Array.isArray(json.journals)) {
      return json;
    }
    return null;
  } catch {
    return null;
  }
}

export async function pullDatasetFromGitHub(
  config: GitHubSyncConfig
): Promise<{ ok: boolean; data?: KyungDataset; message: string }> {
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const filePath = config.filePath.trim().replace(/^\/+/, '') || 'public/data.json';

  if (!owner || !repo) {
    return {
      ok: false,
      message: 'GITHUB OWNER 및 REPOSITORY 이름을 입력해 주세요.',
    };
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (config.token.trim()) {
      headers.Authorization = `Bearer ${config.token.trim()}`;
    }

    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/contents/${filePath}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`;

    const res = await fetch(apiUrl, { headers, cache: 'no-store' });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: `PULL FAILED (${res.status}): ${errBody.message || res.statusText}`,
      };
    }

    const payload = await res.json();
    if (!payload.content) {
      return { ok: false, message: 'PULL FAILED: 파일 본문이 비어 있습니다.' };
    }

    const decoded = decodeBase64ToUtf8(payload.content);
    const parsed = JSON.parse(decoded) as KyungDataset;
    return {
      ok: true,
      data: parsed,
      message: `PULLED FROM ${owner}/${repo}@${branch}:${filePath}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: `PULL ERROR: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function pushDatasetToGitHub(
  config: GitHubSyncConfig,
  dataset: KyungDataset
): Promise<{ ok: boolean; commitUrl?: string; message: string }> {
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const primaryPath = config.filePath.trim().replace(/^\/+/, '') || 'public/data.json';
  const token = config.token.trim();

  if (!owner || !repo || !token) {
    return {
      ok: false,
      message: 'GITHUB OWNER, REPO, PERSONAL ACCESS TOKEN을 모두 입력해 주세요.',
    };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Push to primaryPath (e.g. public/data.json) and if primaryPath is public/data.json, also sync root data.json if it exists
  const pathsToSync =
    primaryPath === 'public/data.json' ? ['public/data.json', 'data.json'] : [primaryPath];

  const jsonString = JSON.stringify(dataset, null, 2);
  const encodedContent = encodeUtf8ToBase64(jsonString);
  let lastCommitUrl = '';

  try {
    for (let i = 0; i < pathsToSync.length; i++) {
      const pathItem = pathsToSync[i];
      const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/contents/${pathItem}`;

      // 1. Check existing file SHA
      let sha: string | undefined;
      const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`, {
        headers,
        cache: 'no-store',
      });

      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha;
      } else if (getRes.status !== 404 && i === 0) {
        const errBody = await getRes.json().catch(() => ({}));
        return {
          ok: false,
          message: `GITHUB AUTH/READ ERROR (${getRes.status}): ${errBody.message || getRes.statusText}`,
        };
      } else if (getRes.status === 404 && i > 0) {
        // Optional secondary path doesn't exist, skip unless primary
        continue;
      }

      // 2. PUT updated content to GitHub repository
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `chore(cms): update kyung archive dataset (${new Date().toISOString()})`,
          content: encodedContent,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putRes.ok) {
        if (i === 0) {
          const errBody = await putRes.json().catch(() => ({}));
          return {
            ok: false,
            message: `GITHUB PUSH FAILED (${putRes.status}): ${errBody.message || putRes.statusText}`,
          };
        }
      } else {
        const putData = await putRes.json();
        lastCommitUrl = putData?.commit?.html_url || '';
      }
    }

    return {
      ok: true,
      commitUrl: lastCommitUrl,
      message: `PUSHED TO GITHUB (${owner}/${repo}@${branch}:${primaryPath}) — 전체 방문자에게 동일하게 반영됩니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: `GITHUB NETWORK ERROR: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export function downloadDataJsonFile(dataset: KyungDataset): void {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
