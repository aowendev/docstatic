#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// simple frontmatter extractor (same semantics as xliff util)
function extractFrontmatter(text) {
  if (!text) return { metadata: {}, body: text || '' };
  const m = String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { metadata: {}, body: text };
  const fmRaw = m[1];
  const body = text.slice(m[0].length);
  const metadata = {};
  fmRaw.split(/\n/).forEach((line) => {
    const kv = line.match(/^([A-Za-z0-9_\-]+):\s*(?:"([^"]+)"|'([^']+)'|(.+))?$/);
    if (kv) {
      metadata[kv[1]] = (kv[2] || kv[3] || (kv[4] || '')).trim();
    }
  });
  return { metadata, body };
}

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(res, cb);
    else cb(res);
  }
}

async function main() {
  const language = process.argv[2] || 'fr';
  const outFile = process.argv[3] || `translations-${language}.xlf`;
  const docsRoot = path.join(process.cwd(), 'docs');

  if (!fs.existsSync(docsRoot)) {
    console.error('docs/ directory not found in', process.cwd());
    process.exit(1);
  }

  const docNodes = [];
  walkDir(docsRoot, (file) => {
    if (!/\.mdx?$|\.md$/i.test(file)) return;
    const rel = path.relative(process.cwd(), file).replace(/\\\\/g, '/');
    const raw = fs.readFileSync(file, 'utf8');
    const stat = fs.statSync(file);
    const parsed = extractFrontmatter(raw);
    const title = parsed.metadata && parsed.metadata.title ? parsed.metadata.title : path.basename(file);
    docNodes.push({ node: { raw, title, lastmod: stat.mtime.toISOString(), _sys: { relativePath: rel } } });
  });

  // Build fake translations that exist but are older, so exportOutOfDateAsXliff
  // will consider them out-of-date and include units.
  const i18nNodes = docNodes.map((edge) => {
    const rel = `${language}/docusaurus-plugin-content-docs/current/${edge.node._sys.relativePath.replace(/^docs\//, '')}`;
    // translation body can be empty; we just need an older lastmod
    return { node: { raw: edge.node.raw, title: edge.node.title, lastmod: new Date(2000,0,1).toISOString(), _sys: { relativePath: rel } } };
  });

  // Minimal fake client matching the shape expected by xliff util
  const client = {
    queries: {
      docConnection: async () => ({ data: { docConnection: { edges: docNodes } } }),
      i18nConnection: async () => ({ data: { i18nConnection: { edges: i18nNodes } } }),
    },
  };

  // Require the xliff util and call exportOutOfDateAsXliff
  const xliff = require('../src/utils/xliff');
  try {
    const xml = await xliff.exportOutOfDateAsXliff(client, language);
    fs.writeFileSync(path.join(process.cwd(), outFile), xml, 'utf8');
    console.error('Wrote', outFile);
  } catch (e) {
    console.error('Error running export:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
}

main();
