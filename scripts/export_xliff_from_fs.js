#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

function canonicalize(p) {
  let s = p.replace(/\\\\/g, '/');
  s = s.replace(/\.mdx?$|\.md$/i, '');
  s = s.replace(/\/(index|readme)$/i, '');
  if (s.startsWith('/')) s = s.slice(1);
  return s;
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

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: export_xliff_from_fs.js <lang> [output.xlf]');
    process.exit(2);
  }
  const lang = args[0];
  const outPath = args[1] || `translations-${lang}.xlf`;

  const docsDir = path.resolve(process.cwd(), 'docs');
  const i18nDir = path.resolve(process.cwd(), 'i18n', lang, 'docusaurus-plugin-content-docs', 'current');

  const files = walkDir(docsDir);
  const units = [];
  for (const f of files) {
    const rel = path.relative(docsDir, f).replace(/\\\\/g, '/');
    const id = canonicalize(rel);
    const source = fs.readFileSync(f, 'utf8');
    let target = '';
    const candidate = path.join(i18nDir, rel);
    if (fs.existsSync(candidate)) {
      target = fs.readFileSync(candidate, 'utf8');
    }
    // read title from frontmatter (simple parse)
    let title = '';
    const m = source.match(/^---\n([\s\S]*?)\n---/);
    if (m) {
      const fm = m[1];
      const tm = fm.match(/title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/i);
      if (tm) title = tm[1] || tm[2] || tm[3] || '';
    }
    units.push({ id, title, source, target });
  }

  const xliff = buildXliff(units, lang);
  fs.writeFileSync(outPath, xliff, 'utf8');
  console.log('Wrote', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
