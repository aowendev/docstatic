/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import CalsTableView from "./CalsTableView";
import { resolveLayout } from "./calsLayout.js";
import { renderMarkdownCell } from "./markdownCell";

function renderCellContent(cell) {
  return renderMarkdownCell(cell.content);
}

/**
 * Renders a CALS table (see calsLayout.js for the full data model and the
 * v1 scope limitations - a single tgroup, no entrytbl). `table` is the whole
 * CALS structure as authored in Tina; this component only resolves it and
 * hands the result to CalsTableView, the same renderer the Tina grid editor
 * uses for its live preview.
 */
const CalsTable = ({ table }) => {
  const layout = resolveLayout(table);
  return <CalsTableView layout={layout} cellRenderer={renderCellContent} />;
};

export default CalsTable;
