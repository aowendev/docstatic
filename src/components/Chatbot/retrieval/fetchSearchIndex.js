/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import the plugin's own generated, locale-aware Lunr client (not the bare
// "lunr" package) — docusaurus-lunr-search's configureWebpack hook writes
// this into Docusaurus's @generated alias on every compilation, pre-wired
// with whatever stemmer/segmenter modules match its `languages` plugin
// option (see docusaurus.config.ts). Querying with a plain, unconfigured
// lunr instance would silently mismatch how the index was actually stemmed.
import lunr from "@generated/lunr.client";

// docusaurus-lunr-search's postBuild hook writes these fixed-name files to the
// build output root. They don't exist during `yarn start`/dev — only after a
// full `docusaurus build` — so this resolves to null there and the chatbot
// simply answers without cited context.

let cached;

/**
 * @param {string} baseUrl - siteConfig.baseUrl, e.g. "/"
 * @returns {Promise<{ searchDocs: Array, lunrIndex: import("lunr").Index } | null>}
 */
export async function fetchSearchIndex(baseUrl = "/") {
  if (cached !== undefined) {
    return cached;
  }

  if (process.env.NODE_ENV !== "production") {
    cached = null;
    return cached;
  }

  try {
    const [docsResponse, indexResponse] = await Promise.all([
      fetch(`${baseUrl}search-doc.json`),
      fetch(`${baseUrl}lunr-index.json`),
    ]);

    if (!docsResponse.ok || !indexResponse.ok) {
      cached = null;
      return cached;
    }

    const [{ searchDocs }, lunrIndexData] = await Promise.all([
      docsResponse.json(),
      indexResponse.json(),
    ]);

    cached = Array.isArray(searchDocs)
      ? { searchDocs, lunrIndex: lunr.Index.load(lunrIndexData) }
      : null;
  } catch {
    cached = null;
  }

  return cached;
}
