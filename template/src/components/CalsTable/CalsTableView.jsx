/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import docusaurusData from "../../../config/docusaurus/index.json";
import { cellAlign } from "./cellAlign.js";

const SECTION_TAGS = { thead: "thead", tbody: "tbody", tfoot: "tfoot" };
const BORDER_COLOR = "var(--ifm-table-border-color, #dadde1)";

// Deliberately inline styles, not CSS Modules: this component is rendered
// both by the published Docusaurus site (webpack) and by CalsTableEditor.jsx
// inside Tina's admin (a separate Vite-bundled app that does not process this
// project's CSS Modules) - a class name that resolves in one bundler and not
// the other would defeat the whole point of sharing one renderer.
const FRAME_BORDERS = {
  all: { border: `1px solid ${BORDER_COLOR}` },
  sides: {
    borderLeft: `1px solid ${BORDER_COLOR}`,
    borderRight: `1px solid ${BORDER_COLOR}`,
  },
  top: { borderTop: `1px solid ${BORDER_COLOR}` },
  bottom: { borderBottom: `1px solid ${BORDER_COLOR}` },
  topbot: {
    borderTop: `1px solid ${BORDER_COLOR}`,
    borderBottom: `1px solid ${BORDER_COLOR}`,
  },
  none: {},
};

const tableBaseStyle = {
  borderCollapse: "collapse",
  // Fixed layout is what makes the proportional ("N*") and absolute colwidths
  // resolved in calsLayout.js actually hold - in auto layout, <col> width
  // hints are only ever a suggestion the browser is free to override based
  // on content. table-layout only has any effect when display computes to
  // table/inline-table, though, and Docusaurus's Infima theme forces plain
  // `table` elements to `display: block` (for responsive scrolling on
  // narrow viewports) - which silently disables table-layout:fixed
  // altogether, leaving every column sized to its own content instead of
  // the resolved percentages. Reclaiming `display: table` here, and
  // providing our own scroll wrapper below instead of relying on Infima's,
  // is what keeps this rendering identically on the published site and
  // inside Tina's admin (which has no such rule to fight in the first place).
  display: "table",
  tableLayout: "fixed",
  width: "100%",
};

// pgwide means "span the full available width," CALS's equivalent of a
// print table breaking out to the full page width. Without it, a table caps
// at a reading-friendly measure instead of stretching to fill whatever
// container it's in - table-layout:fixed still resolves column proportions
// against that capped width, so colwidth ratios hold either way.
function wrapperStyle(pgwide) {
  return {
    overflowX: "auto",
    margin: "1.5rem 0",
    ...(pgwide ? {} : { maxWidth: "40rem" }),
  };
}

const captionStyle = {
  captionSide: "top",
  textAlign: "left",
  fontWeight: 600,
  paddingBottom: "0.5rem",
};

/**
 * The site-wide cell alignment from Settings, used only where CALS itself
 * resolved nothing.
 *
 * It belongs here rather than in calsLayout.js because it is not part of the
 * table model: CALS decides alignment from the entry, then its spanspec, then
 * its colspec, and an undefined result means "no instruction" - which is the
 * seam this fills. Threading a site setting through the resolver would put a
 * preference inside the thing that answers what the markup says.
 *
 * Blank means what it always meant: leave it to the browser, which centres a
 * header cell and left-aligns a body cell. That keeps a site that never opens
 * the setting rendering exactly as it did before it existed.
 */
const SITE_DEFAULT_ALIGN = docusaurusData?.calsTables?.align || undefined;

// CALS colsep/rowsep are a single shared rule between two adjacent cells, so
// this only ever draws the right/bottom edge of a cell - never left/top -
// which keeps two cells from disagreeing about their shared border.
function cellStyle(cell, defaultAlign) {
  return {
    textAlign: cellAlign(cell, defaultAlign),
    verticalAlign: cell.valign,
    borderRight: cell.colsep ? `1px solid ${BORDER_COLOR}` : "none",
    borderBottom: cell.rowsep ? `1px solid ${BORDER_COLOR}` : "none",
    padding: "0.5rem 0.75rem",
  };
}

/**
 * Renders a resolved CALS layout (see calsLayout.js) into an HTML table.
 * Shared by the live-site component (index.jsx) and the Tina grid editor
 * (CalsTableEditor.jsx) so the two can never visually drift apart - the
 * editor's preview and the published output run through the exact same
 * markup and styling.
 *
 * `defaultAlign` overrides the site-wide alignment setting for one table;
 * it is the fallback used only where CALS resolved no alignment of its own.
 * `cellRenderer(cell, sectionName)` renders a cell's content, and
 * `titleRenderer(title)` the caption - both optional for the title, which
 * falls back to plain text so the component still renders something sensible
 * without one.
 * `getCellProps(cell, sectionName)` optionally returns extra props (a
 * `style` object merged on top of the cell's base style, plus onClick,
 * onDoubleClick, ...) - used by the editor for selection and click-to-edit;
 * the live site doesn't need it.
 */
const CalsTableView = ({
  layout,
  cellRenderer,
  titleRenderer,
  getCellProps,
  style,
  defaultAlign = SITE_DEFAULT_ALIGN,
}) => {
  return (
    <div
      style={wrapperStyle(layout.pgwide)}
      data-pgwide={layout.pgwide || undefined}
    >
      <table
        style={{
          ...tableBaseStyle,
          ...FRAME_BORDERS[layout.frame],
          ...style,
        }}
        data-frame={layout.frame}
      >
        {layout.title && (
          <caption style={captionStyle}>
            {titleRenderer ? titleRenderer(layout.title) : layout.title}
          </caption>
        )}
        <colgroup>
          {layout.columns.map((col, index) => (
            <col
              key={col.colname}
              style={{ width: layout.columnWidths[index] }}
            />
          ))}
        </colgroup>
        {layout.sections.map((section) => {
          const SectionTag = SECTION_TAGS[section.name];
          const CellTag = section.name === "thead" ? "th" : "td";
          return (
            <SectionTag key={section.name}>
              {section.rows.map((row) => (
                <tr key={row.rowIndex}>
                  {row.cells.map((cell) => {
                    const { style: extraStyle, ...extraProps } = getCellProps
                      ? getCellProps(cell, section.name)
                      : {};
                    return (
                      <CellTag
                        key={`${cell.rowIndex}-${cell.colStart}`}
                        colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                        rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                        style={{
                          ...cellStyle(cell, defaultAlign),
                          ...extraStyle,
                        }}
                        {...extraProps}
                      >
                        {cellRenderer(cell, section.name)}
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </SectionTag>
          );
        })}
      </table>
    </div>
  );
};

export default CalsTableView;
