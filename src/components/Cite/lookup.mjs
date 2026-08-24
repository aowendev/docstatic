/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Citation lookup, kept apart from the React component so it can be tested
 * without a bundler - the same reason mapToCslJson.js sits beside it.
 *
 * Tokens rather than a markdown string, because the alternative is bundling a
 * markdown parser into every page to render one sentence. See cslHtmlToTokens
 * in scripts/lib/csl.mjs.
 *
 *   Token = string | { i: Token[] } | { b: Token[] } | { a: href, c: Token[] }
 */

/**
 * The tokens for a citation id, or null when the id is not in the data.
 *
 * A miss is normal, not an error: a citation added to a page since the last
 * generation has an id nothing has rendered yet. The caller shows nothing
 * rather than throwing, and the next generation fills it in.
 */
export function lookupCitation(data, id) {
  if (!id || !data) return null;
  const entry = data[id];
  if (Array.isArray(entry)) return { tokens: entry };
  if (entry && typeof entry.problem === "string") {
    return { problem: entry.problem };
  }
  return null;
}
