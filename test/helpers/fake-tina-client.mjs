/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Minimal stand-in for the generated Tina client, matching the shape
 * src/utils/xliff.js consumes: client.queries.docConnection() and
 * client.queries.i18nConnection().
 */

const OUT_OF_DATE = "2000-01-01T00:00:00.000Z";
const CURRENT = "2026-01-01T00:00:00.000Z";

function edge(raw, relativePath, lastmod, title) {
  return { node: { raw, title, lastmod, _sys: { relativePath } } };
}

/**
 * Build a client from `docs`, each { name, raw, title?, translationLastmod? }.
 * A translation defaults to being older than its source, so the document is
 * treated as out of date and included in the export.
 */
export function makeClient(docs, language = "fr") {
  const docEdges = [];
  const i18nEdges = [];

  for (const doc of docs) {
    const title = doc.title ?? doc.name;
    const rel = `${doc.name}.mdx`;
    docEdges.push(edge(doc.raw, rel, doc.sourceLastmod ?? CURRENT, title));
    i18nEdges.push(
      edge(
        doc.translationRaw ?? doc.raw,
        `${language}/docusaurus-plugin-content-docs/current/${rel}`,
        doc.translationLastmod ?? OUT_OF_DATE,
        title
      )
    );
  }

  return {
    queries: {
      docConnection: async () => ({
        data: { docConnection: { edges: docEdges } },
      }),
      i18nConnection: async () => ({
        data: { i18nConnection: { edges: i18nEdges } },
      }),
    },
  };
}

export { CURRENT, OUT_OF_DATE };
