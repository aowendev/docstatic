const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docsRoot = path.join(root, 'docs');
const i18nRoot = path.join(root, 'i18n');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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
  let s = p.replace(/\.mdx?$|\.md$/i, '');
  s = s.replace(/\/(index|readme)$/i, '');
  if (s.startsWith('/')) s = s.slice(1);
  return s;
}

function relFrom(base, full) {
  return path.relative(base, full).replace(/\\\\/g, '/');
}

const out = {
  generatedAt: new Date().toISOString(),
  fs: {
    docs: [],
    translations: {}
  },
  gql: {
    docs: [],
    i18n: []
  }
};

// filesystem docs
const docFiles = walk(docsRoot).filter(f => f.match(/\.mdx?$|\.md$/i));
out.fs.docs = docFiles.map(f => ({ full: f, rel: relFrom(docsRoot, f), canonical: canonicalize(relFrom(docsRoot, f)) }));

// filesystem i18n (per language)
if (fs.existsSync(i18nRoot)) {
  const langs = fs.readdirSync(i18nRoot, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const lang of langs) {
    const current = path.join(i18nRoot, lang, 'docusaurus-plugin-content-docs', 'current');
    const files = walk(current).filter(f => f.match(/\.mdx?$|\.md$/i));
    out.fs.translations[lang] = files.map(f => ({ full: f, rel: relFrom(current, f), canonical: canonicalize(relFrom(current, f)) }));
  }
}

// attempt to fetch GraphQL lists via Tina generated client
(async () => {
  try {
    const clientPath = path.join(root, 'tina', '__generated__', 'client');
    if (fs.existsSync(clientPath + '.js') || fs.existsSync(clientPath + '.mjs') || fs.existsSync(clientPath + '.cjs')) {
      const { client } = require(clientPath);
      // paginate docConnection
      let docs = [];
      let after = null;
      while (true) {
        // Some generated clients expose queries as functions; try both
        const resp = await client.queries.docConnection({ sort: 'title', first: 100, after });
        const chunk = resp.data?.docConnection?.edges || [];
        docs = docs.concat(chunk.map(e => ({ relativePath: e.node._sys?.relativePath || e.node._sys?.filename, title: e.node.title, lastmod: e.node.lastmod })));
        const pageInfo = resp.data?.docConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }
      out.gql.docs = docs;

      // paginate i18nConnection
      let i18n = [];
      after = null;
      while (true) {
        const resp = await client.queries.i18nConnection({ sort: 'title', first: 100, after });
        const chunk = resp.data?.i18nConnection?.edges || [];
        i18n = i18n.concat(chunk.map(e => ({ relativePath: e.node._sys?.relativePath || e.node._sys?.filename, title: e.node.title, lastmod: e.node.lastmod })));
        const pageInfo = resp.data?.i18nConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }
      out.gql.i18n = i18n;
    } else {
      out.gql.error = 'Tina client not found at ' + clientPath;
    }
  } catch (e) {
    out.gql.error = (e && e.message) || String(e);
  } finally {
    const outPath = path.join(__dirname, 'translation_map_debug.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote debug file to', outPath);
  }
})();
