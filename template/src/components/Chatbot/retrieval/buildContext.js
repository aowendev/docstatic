/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MAX_CONTEXT_CHARS = 2000;

/**
 * Formats ranked doc chunks into a context block for the system prompt,
 * capped in total length so it stays reasonable for small WebLLM models.
 * @param {Array<{title: string, content: string, url: string}>} chunks
 * @returns {string}
 */
export function buildContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return "No documentation excerpts matched this question closely enough to be useful.";
  }

  let remaining = MAX_CONTEXT_CHARS;
  const parts = [];

  for (const chunk of chunks) {
    if (remaining <= 0) break;
    const body = (chunk.content || "").slice(0, remaining);
    parts.push(`### ${chunk.title || "Untitled"} (${chunk.url})\n${body}`);
    remaining -= body.length;
  }

  return parts.join("\n\n");
}
