/**
 * Deploy generated pitch HTML to GitHub repo candicesxc/pitch.
 * Path: [company]-[role]/index.html
 * Auth: VITE_GITHUB_TOKEN in .env
 * 
 * Token must be a Fine-Grained Personal Access Token with:
 * - Repository access to candicesxc/pitch
 * - Contents: Read and write permissions
 */
export async function deployPitch(
  companyName: string,
  roleName: string,
  generatedHtml: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) {
    return { ok: false, error: 'Missing VITE_GITHUB_TOKEN in .env' };
  }

  // Clean URL: remove special characters, keep only alphanumeric and hyphens
  const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const cleanRole = roleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const folderPath = `${cleanCompany}-${cleanRole}`;
  const fileName = `${folderPath}/index.html`;
  const url = `https://api.github.com/repos/candicesxc/pitch/contents/${fileName}`;

  const content = btoa(unescape(encodeURIComponent(generatedHtml)));

  // First, check if file exists to get sha (required for updates)
  let sha: string | undefined;
  try {
    const checkResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkResponse.ok) {
      const existingFile = (await checkResponse.json()) as { sha?: string };
      sha = existingFile.sha;
    }
  } catch {
    // File doesn't exist yet, that's fine - we'll create it
  }

  const body: { message: string; content: string; sha?: string } = {
    message: `Deploying pitch for ${companyName} - ${roleName}`,
    content,
  };
  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      message?: string;
      documentation_url?: string;
    };
    let errorMsg = err.message ?? response.statusText;
    
    // Provide helpful error messages
    if (response.status === 401 || response.status === 403) {
      errorMsg = `Token permission error (${response.status}): ${errorMsg}. Ensure your Fine-Grained token has "Contents: Read and write" access to candicesxc/pitch repository.`;
    } else if (response.status === 404) {
      errorMsg = `Repository not found (404): ${errorMsg}. Verify the repository "candicesxc/pitch" exists and your token has access.`;
    }
    
    return { ok: false, error: errorMsg };
  }

  const liveUrl = `https://candiceshen.com/pitch/${folderPath}`;
  
  // Save URL locally for reference (browser localStorage)
  try {
    const storageKey = 'generated-pitches';
    const existing = localStorage.getItem(storageKey);
    const urls: Array<{ company: string; role: string; url: string; date: string }> = existing 
      ? JSON.parse(existing) 
      : [];
    
    urls.push({
      company: companyName,
      role: roleName,
      url: liveUrl,
      date: new Date().toISOString(),
    });
    
    localStorage.setItem(storageKey, JSON.stringify(urls));
  } catch (error) {
    // Silently fail if localStorage not available
    console.warn('Could not save URL locally:', error);
  }
  
  return { ok: true, url: liveUrl };
}
