const fs = require('fs');
const path = require('path');

const docsRoot = path.join(__dirname, '..', 'docs');
const i18nRoot = path.join(__dirname, '..', 'i18n', 'fr', 'docusaurus-plugin-content-docs', 'current');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((ent) => {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results = results.concat(walk(p));
    } else {
      results.push(p);
    }
  });
  return results;
}

function canonicalize(p) {
  if (!p) return p;
  // p is relative path within docs or i18n current
  let s = p.replace(/\.mdx?$|\.md$/i, '');
  s = s.replace(/\/(index|readme)$/i, '');
  if (s.startsWith('/')) s = s.slice(1);
  return s;
}

function relFromDocs(full) {
  return path.relative(docsRoot, full).replace(/\\\\/g, '/');
}

function relFromI18n(full) {
  return path.relative(i18nRoot, full).replace(/\\\\/g, '/');
}

// gather docs
let docsFiles = [];
try {
  docsFiles = walk(docsRoot).filter(f => f.match(/\.mdx?$|\.md$/i));
} catch (e) {
  console.error('Error reading docs:', e.message);
  process.exit(1);
}

// gather i18n
let i18nFiles = [];
try {
  i18nFiles = walk(i18nRoot).filter(f => f.match(/\.mdx?$|\.md$/i));
} catch (e) {
  console.error('Error reading i18n:', e.message);
  process.exit(1);
}

const sourceKeys = new Set(docsFiles
  .map(relFromDocs)
  .filter(r => !r.startsWith('api/'))
  .map(canonicalize)
);

const translationKeys = new Set(i18nFiles
  .map(relFromI18n)
  .filter(r => !r.startsWith('api/') && !r.startsWith('wiki/'))
  .map(canonicalize)
);

const missing = [...sourceKeys].filter(x => !translationKeys.has(x));
const orphan = [...translationKeys].filter(x => !sourceKeys.has(x));

console.log('docsFiles count:', docsFiles.length);
console.log('i18nFiles count:', i18nFiles.length);
console.log('sourceKeys count:', sourceKeys.size);
console.log('translationKeys count:', translationKeys.size);
console.log('missing count:', missing.length);
console.log('orphan count:', orphan.length);
console.log('\nMissing examples (up to 20):');
console.log(missing.slice(0,20).join('\n'));
console.log('\nOrphan examples (up to 20):');
console.log(orphan.slice(0,20).join('\n'));

// show translations that map to directories only (like README)
const translationsWithDirs = i18nFiles.map(relFromI18n).filter(r => r.endsWith('index.mdx') || r.endsWith('readme.mdx'));
if (translationsWithDirs.length) {
  console.log('\nTranslations using index/readme files:');
  console.log(translationsWithDirs.join('\n'));
}
