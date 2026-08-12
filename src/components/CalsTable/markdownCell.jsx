/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Deliberately no rehypeRaw here (unlike Passthrough) - cell content is plain
// Markdown, not raw HTML, so there's no reason to accept arbitrary markup
// from every author who can edit a table cell.
const remarkPlugins = [remarkGfm];

/**
 * Renders one cell's Markdown content. Shared by index.jsx (the published
 * site) and CalsTableEditor.jsx (the Tina grid preview) so both can never
 * render a cell's content differently from each other.
 */
export function renderMarkdownCell(content) {
  if (!content) return null;
  return <Markdown remarkPlugins={remarkPlugins}>{content}</Markdown>;
}
