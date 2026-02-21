// Client-side exporter that fetches repository contents via GitHub API
// Usage: call exportFromGithubRepo({ repo: 'owner/repo', branch: 'main', lang: 'fr', token?: '...' })

function escapeXmlWithLineBreaks(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  let s = String(unsafe).replace(/\r\n?/g, '\n');
  const LB = '___XLIFF_LB___';
  s = s.replace(/\n/g, LB);
  s = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  return s.replace(new RegExp(LB, 'g'), '<lb/>');
}

async function githubListFiles(repo, path = 'docs', branch = 'main', token) {
  const api = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const headers = { 'User-Agent': 'docstatic-exporter' };
  if (token) headers.Authorization = `token ${token}`;
  const res = await fetch(api, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  let results = [];
  for (const e of data) {
    if (e.type === 'file') results.push(e.path);
    else if (e.type === 'dir') {
      const sub = await githubListFiles(repo, e.path, branch, token);
      results = results.concat(sub);
    }
  }
  return results;
}

async function githubFetchFile(repo, filePath, branch = 'main', token) {
  const api = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
  const headers = { 'User-Agent': 'docstatic-exporter' };
  if (token) headers.Authorization = `token ${token}`;
  const res = await fetch(api, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.content) {
    const buf = atob(data.content.replace(/\n/g, ''));
    try { return decodeURIComponent(escape(buf)); } catch (e) { return buf; }
  }
  return null;
}

function buildXliff(units, lang) {
  const header = `<?xml version="1.0" encoding="utf-8"?>\n<xliff version="2.2" xmlns="urn:oasis:names:tc:xliff:document:2.2">\n`;
  let body = `  <file id="${escapeXmlWithLineBreaks(lang)}" original="docstatic-export">\n`;
  for (const u of units) {
    body += `    <unit id="${escapeXmlWithLineBreaks(u.id)}">\n`;
    body += `      <notes><note>title:${escapeXmlWithLineBreaks(u.title || '')}</note></notes>\n`;
    body += `      <segment>\n`;
    body += `        <source>${escapeXmlWithLineBreaks(u.source || '')}</source>\n`;
    body += `        <target>${escapeXmlWithLineBreaks(u.target || '')}</target>\n`;
    body += `      </segment>\n`;
    body += `    </unit>\n`;
  }
  body += `  </file>\n`;
  const footer = `</xliff>\n`;
  return header + body + footer;
}

export async function exportFromGithubRepo({ repo, branch = 'main', lang = 'fr', token } = {}) {
  if (!repo) throw new Error('repo required (owner/repo)');
  const files = await githubListFiles(repo, 'docs', branch, token);
  const units = [];
  for (const p of files) {
    if (!p.match(/\.mdx?$|\.md$/i)) continue;
    const rel = p.replace(/^docs\//i, '');
    const id = rel.replace(/\.mdx?$|\.md$/i, '').replace(/\/(index|readme)$/i, '');
    const source = await githubFetchFile(repo, p, branch, token) || '';
    const targetPath = `i18n/${lang}/docusaurus-plugin-content-docs/current/${rel}`;
    const target = await githubFetchFile(repo, targetPath, branch, token) || '';
    // title from frontmatter
    let title = '';
    const m = source.match(/^---\n([\s\S]*?)\n---/);
    if (m) {
      const fm = m[1];
      const tm = fm.match(/title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/i);
      if (tm) title = tm[1] || tm[2] || tm[3] || '';
    }
    units.push({ id, title, source, target });
  }
  return buildXliff(units, lang);
}

export default { exportFromGithubRepo };
