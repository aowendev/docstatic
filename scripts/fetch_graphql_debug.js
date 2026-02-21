const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outPath = path.join(__dirname, 'graphql_translation_debug.json');

const endpoints = [
  'http://localhost:3000/__tina/graphql',
  'http://localhost:3000/graphql',
  'http://localhost:4000/__tina/graphql',
  'http://localhost:4000/graphql',
  'http://localhost:8080/__tina/graphql',
  'http://localhost:8080/graphql',
  'http://localhost:5173/__tina/graphql',
  'http://localhost:5173/graphql'
];

const docQuery = `query DocConn($first: Int, $after: String) { docConnection(first: $first, after: $after) { edges { node { _sys { relativePath filename } title lastmod } } pageInfo { hasNextPage endCursor } } }`;
const i18nQuery = `query I18nConn($first: Int, $after: String) { i18nConnection(first: $first, after: $after) { edges { node { _sys { relativePath filename } title lastmod } } pageInfo { hasNextPage endCursor } } }`;

(async () => {
  const results = { tried: [], success: null, error: null };
  for (const url of endpoints) {
    try {
      results.tried.push(url);
      // test fetch
      const test = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '{ __typename }' }), timeout: 5000 });
      if (!test.ok) {
        results[url] = { ok: false, status: test.status };
        continue;
      }
      // fetch docs with pagination
      const docs = [];
      let after = null;
      while (true) {
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: docQuery, variables: { first: 100, after } }) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));
        const chunk = (json.data?.docConnection?.edges) || [];
        docs.push(...chunk.map(e => ({ relativePath: e.node._sys?.relativePath || e.node._sys?.filename, title: e.node.title, lastmod: e.node.lastmod })));
        const pageInfo = json.data?.docConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }

      const i18n = [];
      after = null;
      while (true) {
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: i18nQuery, variables: { first: 100, after } }) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));
        const chunk = (json.data?.i18nConnection?.edges) || [];
        i18n.push(...chunk.map(e => ({ relativePath: e.node._sys?.relativePath || e.node._sys?.filename, title: e.node.title, lastmod: e.node.lastmod })));
        const pageInfo = json.data?.i18nConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }

      results.success = { url, docsCount: docs.length, i18nCount: i18n.length, docs, i18n };
      break;
    } catch (e) {
      results.error = results.error || e.message;
      continue;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Wrote', outPath);
})();
