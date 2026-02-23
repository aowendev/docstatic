#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const xliff = require('../src/utils/xliff');
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4001/graphql';

async function gql(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json;
}

// Use inline literals to avoid variable type declarations that some local
// GraphQL setups may not accept in this environment.
const DOC_CONN_QUERY = `query { docConnection(sort: "title", first: 1000) { edges { node { _sys { relativePath filename } title lastmod body _values } } } }`;
const I18N_CONN_QUERY = `query { i18nConnection(sort: "title", first: 1000) { edges { node { _sys { relativePath filename } title lastmod _values body } } } }`;

const client = {
  queries: {
    docConnection: async (vars) => {
      const r = await gql(DOC_CONN_QUERY, vars);
      return { data: { docConnection: r.data.docConnection } };
    },
    i18nConnection: async (vars) => {
      const r = await gql(I18N_CONN_QUERY, vars);
      return { data: { i18nConnection: r.data.i18nConnection } };
    },
  },
};

(async () => {
  try {
    console.error('Calling exporter using GraphQL at', GRAPHQL_URL);
    const xml = await xliff.exportOutOfDateAsXliff(client, process.argv[2] || 'fr');
    const out = path.join(process.cwd(), process.argv[3] || 'fr-translations.generated.xlf');
    fs.writeFileSync(out, xml, 'utf8');
    console.error('Wrote', out);
    console.log(xml.slice(0, 2000));
  } catch (e) {
    console.error('Export failed:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
