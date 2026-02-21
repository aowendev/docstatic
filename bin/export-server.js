#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

async function listFilesFromGithub(ownerRepo, dir, token, ref = 'main') {
  const [owner, repo] = ownerRepo.split('/');
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}?ref=${ref}`;
  const res = await fetch(api, { headers: { Authorization: `token ${token}`, 'User-Agent': 'docstatic-exporter' } });
  if (!res.ok) return [];
  const data = await res.json();
  const results = [];
  for (const entry of data) {
    if (entry.type === 'file') results.push(entry.path);
    else if (entry.type === 'dir') {
      const sub = await listFilesFromGithub(ownerRepo, entry.path, token, ref);
      results.push(...sub);
    }
  }
  return results;
}

async function fetchFileFromGithub(ownerRepo, filePath, token, ref = 'main') {
  const [owner, repo] = ownerRepo.split('/');
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`;
  const res = await fetch(api, { headers: { Authorization: `token ${token}`, 'User-Agent': 'docstatic-exporter' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.content) {
    const buf = Buffer.from(data.content, data.encoding || 'base64');
    return buf.toString('utf8');
  }
  return null;
}

function walkDir(dir, extensions = ['.md', '.mdx']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walkDir(full, extensions));
    } else {
      if (extensions.includes(path.extname(full).toLowerCase())) results.push(full);
    }
  });
  return results;
}

function canonicalizeRel(rel, docsDir) {
  let r = rel.replace(/\\\\/g, '/');
  if (r.startsWith(docsDir)) r = r.slice(docsDir.length);
  r = r.replace(/^\//, '');
  r = r.replace(/\.mdx?$|\.md$/i, '');
  r = r.replace(/\/(index|readme)$/i, '');
  return r;
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

async function createUnitsFromFs(lang) {
  const docsDir = path.resolve(process.cwd(), 'docs');
  const i18nDir = path.resolve(process.cwd(), 'i18n', lang, 'docusaurus-plugin-content-docs', 'current');
  const files = walkDir(docsDir);
  const units = [];
  for (const f of files) {
    const rel = path.relative(docsDir, f).replace(/\\\\/g, '/');
    const id = rel.replace(/\.mdx?$|\.md$/i, '').replace(/\/(index|readme)$/i, '');
    const source = fs.readFileSync(f, 'utf8');
    let target = '';
    const candidate = path.join(i18nDir, rel);
    if (fs.existsSync(candidate)) target = fs.readFileSync(candidate, 'utf8');
    // extract title from frontmatter
    let title = '';
    const m = source.match(/^---\n([\s\S]*?)\n---/);
    if (m) {
      const fm = m[1];
      const tm = fm.match(/title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/i);
      if (tm) title = tm[1] || tm[2] || tm[3] || '';
    }
    units.push({ id, title, source, target });
  }
  return units;
}

async function createUnitsFromGithub(lang) {
  const ownerRepo = process.env.GITHUB_REPO; // owner/repo
  const token = process.env.GITHUB_TOKEN;
  const docsPath = 'docs';
  const files = await listFilesFromGithub(ownerRepo, docsPath, token);
  const units = [];
  for (const p of files) {
    if (!p.match(/\.mdx?$|\.md$/i)) continue;
    const id = p.replace(/^docs\//i, '').replace(/\.mdx?$|\.md$/i, '').replace(/\/(index|readme)$/i, '');
    const source = await fetchFileFromGithub(ownerRepo, p, token);
    // try to fetch translation under i18n/<lang>/docusaurus-plugin-content-docs/current/<rel>
    const targetPath = `i18n/${lang}/docusaurus-plugin-content-docs/current/${p.replace(/^docs\//i, '')}`;
    let target = '';
    try { target = await fetchFileFromGithub(ownerRepo, targetPath, token); } catch (e) { /* ignore */ }
    let title = '';
    if (source) {
      const m = source.match(/^---\n([\s\S]*?)\n---/);
      if (m) {
        const fm = m[1];
        const tm = fm.match(/title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/i);
        if (tm) title = tm[1] || tm[2] || tm[3] || '';
      }
    }
    units.push({ id, title, source: source || '', target: target || '' });
  }
  return units;
}

async function main() {
  const app = express();
  app.use((req, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });

  app.get('/export-xliff', async (req, res) => {
    const lang = req.query.lang || 'fr';
    try {
      let units = [];
      if (process.env.GITHUB_REPO && process.env.GITHUB_TOKEN) {
        units = await createUnitsFromGithub(lang);
      } else {
        units = await createUnitsFromFs(lang);
      }
      const xliff = buildXliff(units, lang);
      res.setHeader('Content-Type', 'application/xml');
      res.send(xliff);
    } catch (err) {
      console.error('export-xliff error', err);
      res.status(500).send(String(err.message || err));
    }
  });

  const port = process.env.EXPORT_SERVER_PORT ? Number(process.env.EXPORT_SERVER_PORT) : 3001;
  app.listen(port, () => console.log(`Export server running on http://localhost:${port}`));
}

main().catch(err => { console.error(err); process.exit(1); });
