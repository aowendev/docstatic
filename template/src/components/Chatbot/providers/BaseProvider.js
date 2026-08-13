/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @typedef {"idle"|"downloading"|"loading"|"ready"|"error"} ProviderStatus
 *
 * @typedef {Object} ProviderProgress
 * @property {ProviderStatus} status
 * @property {number} [progress] - 0..1
 * @property {string} [text]
 *
 * @typedef {Object} ChatMessage
 * @property {"system"|"user"|"assistant"} role
 * @property {string} content
 *
 * @typedef {Object} ChatArgs
 * @property {ChatMessage[]} messages
 * @property {string} [context] - retrieved doc context, injected as a system message
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} ChatChunk
 * @property {string} delta
 * @property {boolean} done
 */

/**
 * Every provider implements this shape:
 *
 *   init(onProgress: (p: ProviderProgress) => void) => Promise<void>
 *   chat(args: ChatArgs) => AsyncIterable<ChatChunk>
 *   dispose() => Promise<void>
 *   isLoaded: boolean
 *
 * Providers are plain objects/classes, not subclasses of anything here —
 * this file only documents the contract and offers a shared helper.
 */

/**
 * Prepends a system message built from the retrieved doc context, when present.
 * @param {ChatMessage[]} messages
 * @param {string} [context]
 * @param {string} [systemPrompt]
 * @returns {ChatMessage[]}
 */
export function withContext(messages, context, systemPrompt) {
  const systemParts = [];
  if (systemPrompt) {
    systemParts.push(systemPrompt);
  }
  if (context) {
    systemParts.push(
      `Use the following documentation excerpts to answer the question. Cite the relevant page(s) by URL when helpful. If the excerpts don't contain the answer, say so rather than guessing.\n\n${context}`
    );
  }
  if (systemParts.length === 0) {
    return messages;
  }
  return [{ role: "system", content: systemParts.join("\n\n") }, ...messages];
}
