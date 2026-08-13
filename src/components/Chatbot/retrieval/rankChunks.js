/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import lunr from "lunr";

const MAX_CHUNKS = 6;

// Matches docusaurus-lunr-search's own SearchBar query strategy (term boost
// plus a trailing wildcard), so results are consistent with the site's
// built-in search and get lunr's stemming/stopword handling for free —
// far more robust than a hand-rolled keyword scorer.
lunr.tokenizer.separator = /[\s\-/]+/;

/**
 * @param {string} question
 * @param {{ searchDocs: Array, lunrIndex: import("lunr").Index } | null} index
 * @param {number} [limit]
 * @returns {Array}
 */
export function rankChunks(question, index, limit = MAX_CHUNKS) {
  if (!index || !question?.trim()) return [];

  const { searchDocs, lunrIndex } = index;
  const tokens = lunr.tokenizer(question);
  if (tokens.length === 0) return [];

  let results;
  try {
    results = lunrIndex.query((query) => {
      query.term(tokens, { boost: 10 });
      query.term(tokens, { wildcard: lunr.Query.wildcard.TRAILING });
    });
  } catch {
    return [];
  }

  const chunks = [];
  for (const result of results) {
    if (chunks.length >= limit) break;
    const doc = searchDocs[result.ref];
    if (doc) chunks.push(doc);
  }
  return chunks;
}
