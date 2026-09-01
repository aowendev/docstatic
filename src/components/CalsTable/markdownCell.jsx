/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import docusaurusData from "../../../config/docusaurus/index.json";
import variableSetsData from "../../../reuse/variableSets/index.json";
import remarkVariables from "./remarkVariables.js";

const DEFAULT_LOCALE = docusaurusData.languages?.default || "en";

// Deliberately no rehypeRaw here (unlike Passthrough) - cell content is plain
// Markdown, not raw HTML, so there's no reason to accept arbitrary markup
// from every author who can edit a table cell. remarkVariables is what lets
// <VariableSet> through that door and nothing else; see that file.
//
// remarkBreaks makes a newline inside a cell a line break. Markdown's own
// rule - that a single newline is just a space - is a sensible default for
// prose, where a paragraph is reflowed anyway, and the wrong one for a table
// cell, where the author pressing Enter in the grid editor means to start a
// new line and can see they did.
const BASE_PLUGINS = [remarkGfm, remarkBreaks];

/**
 * Drops the paragraph Markdown wraps a lone line in.
 *
 * A table's title is a caption - one line, inside an element that already has
 * its own spacing - so the <p> react-markdown produces would add margins the
 * caption does not want. Cells keep theirs: a cell can hold several paragraphs
 * and needs them separated.
 */
const INLINE_COMPONENTS = {
  p: ({ children }) => <>{children}</>,
};

/**
 * Renders Markdown from a CALS table - a cell's content, or the table's title.
 * Shared by index.jsx (the published site) and CalsTableEditor.jsx (the Tina
 * grid preview) so both can never render the same text differently.
 *
 * `locale`/`fallbackLocale` decide which translation a variable resolves to.
 * Both default to the site's default language, which is what the Tina preview
 * gets: its admin has no Docusaurus context to ask for a current locale, and
 * the default language is the only one it can honestly claim to be showing.
 * The published site passes the locale of the page instead.
 *
 * `inline` renders without the wrapping paragraph, for the title.
 */
export function renderMarkdownCell(
  content,
  {
    locale = DEFAULT_LOCALE,
    fallbackLocale = DEFAULT_LOCALE,
    inline = false,
  } = {}
) {
  if (!content) return null;
  return (
    <Markdown
      components={inline ? INLINE_COMPONENTS : undefined}
      remarkPlugins={[
        ...BASE_PLUGINS,
        [
          remarkVariables,
          {
            variableSets: variableSetsData.variableSets,
            locale,
            fallbackLocale,
          },
        ],
      ]}
    >
      {content}
    </Markdown>
  );
}
