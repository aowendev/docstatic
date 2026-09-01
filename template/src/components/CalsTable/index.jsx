/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import docusaurusData from "../../../config/docusaurus/index.json";
import { useCurrentLocale } from "../../utils/useCurrentLocale";
import CalsTableView from "./CalsTableView";
import { resolveLayout } from "./calsLayout.js";
import { renderMarkdownCell } from "./markdownCell";

const DEFAULT_LOCALE = docusaurusData.languages?.default;

/**
 * Renders a CALS table (see calsLayout.js for the full data model and the
 * v1 scope limitations - a single tgroup, no entrytbl). `table` is the whole
 * CALS structure as authored in Tina; this component only resolves it and
 * hands the result to CalsTableView, the same renderer the Tina grid editor
 * uses for its live preview.
 *
 * The locale is read here rather than inside the cell renderer because the
 * renderer is shared with Tina's admin, which has no Docusaurus context to
 * ask. A variable in a cell resolves to the language of the page it is on,
 * exactly as one in a paragraph does.
 */
const CalsTable = ({ table }) => {
  const locale = useCurrentLocale();
  const layout = resolveLayout(table);

  const renderCellContent = (cell) =>
    renderMarkdownCell(cell.content, {
      locale,
      fallbackLocale: DEFAULT_LOCALE,
    });

  // The caption goes through the same renderer as a cell, so a variable
  // resolves the same way wherever it is written in the table. `inline` drops
  // the paragraph wrapper a caption has no use for.
  const renderTitle = (title) =>
    renderMarkdownCell(title, {
      locale,
      fallbackLocale: DEFAULT_LOCALE,
      inline: true,
    });

  return (
    <CalsTableView
      layout={layout}
      cellRenderer={renderCellContent}
      titleRenderer={renderTitle}
    />
  );
};

export default CalsTable;
