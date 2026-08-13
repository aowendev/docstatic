/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Mirrors src/pages/index.jsx's getPageData(locale) — a relative path (not
// the @site alias) is required for webpack's context-module resolution to
// pick up this dynamic require correctly.
export function getChatbotCopy(locale) {
  try {
    return require(`../../../config/chatbot-copy/index.${locale}.json`);
  } catch {
    return require("../../../config/chatbot-copy/index.json");
  }
}
