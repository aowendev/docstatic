/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The plugin's own generated, locale-aware client — see fetchSearchIndex.js
// for why this must match the module the index was built with, not the bare
// "lunr" package.
import lunr from "@generated/lunr.client";

const MAX_CHUNKS = 6;

// Lunr scores aren't comparable across different queries, but within a single
// result set the top score is a reasonable gauge of how good the best match
// actually is. Results scoring far below it are usually just weak keyword
// coincidences (e.g. the product name appearing in an unrelated blog post
// title, which lunr's title-field boost ranks highly regardless of topical
// relevance) rather than a real answer — handing those to the model as
// "documentation excerpts" gives it false grounding to reason from instead of
// no grounding at all, so it's worth dropping them.
const MIN_RELATIVE_SCORE = 0.4;

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

  if (results.length === 0) return [];

  // lunr's query() returns results sorted by score, descending.
  const floor = results[0].score * MIN_RELATIVE_SCORE;

  const chunks = [];
  for (const result of results) {
    if (chunks.length >= limit) break;
    if (result.score < floor) break;
    const doc = searchDocs[result.ref];
    if (doc) chunks.push(doc);
  }
  return chunks;
}
