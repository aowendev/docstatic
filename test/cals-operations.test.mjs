/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Tina grid editor's merge/split/insert/delete buttons are all thin UI
 * wrappers around calsOperations.js - every structural edge case (merging
 * through an existing span, deleting a column that a spanspec references,
 * inserting a row through an in-progress rowspan) needs to be provably
 * correct here, since none of it can be exercised by a rendering test.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveLayout } from "../src/components/CalsTable/calsLayout.js";
import {
  createEmptyTable,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  mergeCells,
  splitCell,
} from "../src/components/CalsTable/calsOperations.js";

function col(colname, extra = {}) {
  return { colname, ...extra };
}
function entry(content, extra = {}) {
  return { content, ...extra };
}
function row(entries, extra = {}) {
  return { entries, ...extra };
}
function grid(cols, rows) {
  const colspecs = [];
  for (let i = 0; i < cols; i += 1) colspecs.push(col(`c${i + 1}`));
  const bodyRows = [];
  for (let r = 0; r < rows; r += 1) {
    const entries = [];
    for (let c = 0; c < cols; c += 1) entries.push(entry(`r${r}c${c}`));
    bodyRows.push(row(entries));
  }
  return { tgroup: { cols, colspecs, tbody: { rows: bodyRows } } };
}
function cellAt(layout, sectionName, rowIndex, colStart) {
  const section = layout.sections.find((s) => s.name === sectionName);
  const r = section.rows.find((rr) => rr.rowIndex === rowIndex);
  return r?.cells.find((c) => c.colStart === colStart);
}
function unwrap(result) {
  assert.equal(result.ok, undefined, result.error);
  return result.table;
}

test("createEmptyTable produces a valid, resolvable table", () => {
  const table = createEmptyTable(3, 4);
  const layout = resolveLayout(table);
  assert.equal(layout.errors.length, 0);
  assert.equal(layout.columns.length, 4);
  assert.equal(layout.sections.find((s) => s.name === "tbody").rows.length, 3);
});

test("mergeCells merges a 2x2 rectangle into one cell and removes the other three entries", () => {
  const table = unwrap(
    mergeCells(grid(3, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
    })
  );
  const layout = resolveLayout(table);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.colSpan, 2);
  assert.equal(anchor.rowSpan, 2);
  assert.equal(layout.sections[0].rows[0].cells.length, 2); // merged block + the untouched (0,2) cell
  assert.equal(layout.sections[0].rows[1].cells.length, 1); // only (1,2) remains
});

test("mergeCells rejects a selection that partially overlaps an existing merge", () => {
  const merged = unwrap(
    mergeCells(grid(3, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
    })
  );
  const result = mergeCells(merged, "tbody", {
    rowStart: 1,
    rowEnd: 2,
    colStart: 1,
    colEnd: 2,
  });
  assert.equal(result.ok, false);
});

test("mergeCells rejects an unknown section (structurally prevents crossing thead/tbody/tfoot)", () => {
  const result = mergeCells(grid(2, 2), "bogus", {
    rowStart: 0,
    rowEnd: 1,
    colStart: 0,
    colEnd: 0,
  });
  assert.equal(result.ok, false);
});

test("mergeCells reports discarded content from subsumed cells so the caller can confirm first", () => {
  const result = mergeCells(grid(2, 2), "tbody", {
    rowStart: 0,
    rowEnd: 0,
    colStart: 0,
    colEnd: 1,
  });
  const table = unwrap(result);
  assert.deepEqual(result.warnings[0].discardedContent, ["r0c1"]);
  const layout = resolveLayout(table);
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "r0c0");
});

test("splitCell restores a merged block into individual entries, content only on the former anchor", () => {
  const merged = unwrap(
    mergeCells(grid(3, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
    })
  );
  const table = unwrap(splitCell(merged, "tbody", 0, 0));
  const layout = resolveLayout(table);
  assert.equal(layout.errors.length, 0);
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "r0c0");
  assert.equal(cellAt(layout, "tbody", 0, 1).content, "");
  assert.equal(cellAt(layout, "tbody", 1, 0).content, "");
  assert.equal(cellAt(layout, "tbody", 1, 1).content, "");
});

test("splitCell invoked on a covered (non-anchor) slot resolves to the same result as the anchor", () => {
  const merged = unwrap(
    mergeCells(grid(3, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
    })
  );
  const viaAnchor = unwrap(splitCell(merged, "tbody", 0, 0));
  const viaCovered = unwrap(splitCell(merged, "tbody", 1, 1));
  assert.deepEqual(viaAnchor, viaCovered);
});

test("splitCell rejects a plain, unmerged cell", () => {
  const result = splitCell(grid(2, 2), "tbody", 0, 0);
  assert.equal(result.ok, false);
});

test("insertRow above/below/middle places the new row at the right index", () => {
  const table = grid(2, 2);
  const above = unwrap(insertRow(table, "tbody", 0, "before"));
  assert.equal(resolveLayout(above).sections[0].rows.length, 3);
  assert.equal(cellAt(resolveLayout(above), "tbody", 0, 0).content, "");
  assert.equal(cellAt(resolveLayout(above), "tbody", 1, 0).content, "r0c0");

  const below = unwrap(insertRow(table, "tbody", 1, "after"));
  assert.equal(cellAt(resolveLayout(below), "tbody", 2, 0).content, "");
});

test("insertRow through an in-progress rowspan grows morerows instead of creating a new cell there", () => {
  const spanned = unwrap(
    mergeCells(grid(2, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 0,
    })
  );
  const inserted = unwrap(insertRow(spanned, "tbody", 0, "after"));
  const layout = resolveLayout(inserted);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.rowSpan, 3);
  const newRowCells = layout.sections[0].rows[1].cells;
  assert.equal(newRowCells.length, 1);
  assert.equal(newRowCells[0].colStart, 1);
});

test("insertRow creates the section when it doesn't exist yet (e.g. first tfoot row)", () => {
  const table = unwrap(insertRow(grid(2, 2), "tfoot", -1, "after"));
  const layout = resolveLayout(table);
  assert.ok(layout.sections.find((s) => s.name === "tfoot"));
});

test("deleteRow removes a plain row and preserves the order of the rest", () => {
  const table = unwrap(deleteRow(grid(2, 3), "tbody", 1));
  const layout = resolveLayout(table);
  assert.equal(layout.sections[0].rows.length, 2);
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "r0c0");
  assert.equal(cellAt(layout, "tbody", 1, 0).content, "r2c0");
});

test("deleteRow of a rowspan's anchor row moves ownership to the next row, content preserved", () => {
  const spanned = unwrap(
    mergeCells(grid(2, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 0,
    })
  );
  const table = unwrap(deleteRow(spanned, "tbody", 0));
  const layout = resolveLayout(table);
  const newAnchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(newAnchor.content, "r0c0");
  assert.equal(newAnchor.rowSpan, 1); // only one row was left under the original span
});

test("deleteRow of a row merely covered by a rowspan decrements the earlier anchor, no dangling entry", () => {
  const spanned = unwrap(
    mergeCells(grid(2, 3), "tbody", {
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 0,
    })
  );
  const table = unwrap(deleteRow(spanned, "tbody", 1));
  const layout = resolveLayout(table);
  assert.equal(layout.errors.length, 0);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.rowSpan, 1);
});

test("deleteRow rejects removing the last remaining tbody row", () => {
  const result = deleteRow(grid(2, 1), "tbody", 0);
  assert.equal(result.ok, false);
});

test("insertColumn at start/middle/end renumbers colnum and grows tgroup.cols", () => {
  const table = unwrap(insertColumn(grid(2, 1), 0, "before"));
  const layout = resolveLayout(table);
  assert.equal(layout.columns.length, 3);
  assert.deepEqual(
    layout.columns.map((c) => c.colnum),
    [1, 2, 3]
  );
});

test("insertColumn inside an existing namest/nameend span auto-extends nameend", () => {
  const merged = unwrap(
    mergeCells(grid(3, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 1,
    })
  );
  const table = unwrap(insertColumn(merged, 0, "after")); // insert between c1 and c2, inside the span
  const layout = resolveLayout(table);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.colSpan, 3); // c1, new column, c2
});

test("insertColumn widens a standalone spanspec the same way it widens a direct namest/nameend span", () => {
  // Both are colname-referenced, so a column inserted between namest and
  // nameend widens either one automatically - no separate code path needed.
  const table = grid(3, 1);
  table.tgroup.spanspecs = [{ spanname: "s1", namest: "c1", nameend: "c2" }];
  const inserted = unwrap(insertColumn(table, 0, "after"));
  const spec = inserted.tgroup.spanspecs.find((s) => s.spanname === "s1");
  assert.equal(spec.namest, "c1");
  assert.equal(spec.nameend, "c2");
  const layout = resolveLayout(inserted);
  assert.equal(
    layout.columns.findIndex((c) => c.colname === "c1"),
    0
  );
  assert.equal(
    layout.columns.findIndex((c) => c.colname === "c2"),
    2
  );
});

test("insertColumn does not widen a span when inserting exactly at its boundary (outside, not inside)", () => {
  const merged = unwrap(
    mergeCells(grid(4, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 1,
      colEnd: 2,
    })
  );
  const beforeSpan = unwrap(insertColumn(merged, 0, "before")); // insert before c1, well outside [c2,c3]
  const anchor = resolveLayout(beforeSpan).sections[0].rows[0].cells.find(
    (c) => c.colSpan > 1
  );
  assert.equal(anchor.colSpan, 2); // unchanged
});

test("insertColumn gives every row an explicit empty entry at the new position", () => {
  const table = unwrap(insertColumn(grid(2, 2), 0, "after"));
  const layout = resolveLayout(table);
  assert.equal(layout.warnings.filter((w) => w.code === "gap").length, 0);
  assert.equal(cellAt(layout, "tbody", 0, 1).content, "");
  assert.equal(cellAt(layout, "tbody", 1, 1).content, "");
});

test("deleteColumn of a plain unspanned column removes its entries and renumbers colspecs", () => {
  const table = unwrap(deleteColumn(grid(3, 2), 1));
  const layout = resolveLayout(table);
  assert.equal(layout.columns.length, 2);
  assert.deepEqual(
    layout.columns.map((c) => c.colname),
    ["c1", "c3"]
  );
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "r0c0");
  assert.equal(cellAt(layout, "tbody", 0, 1).content, "r0c2");
});

test("deleteColumn of an interior span column shrinks colSpan by one, namest/nameend unchanged", () => {
  const merged = unwrap(
    mergeCells(grid(4, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 2,
    })
  );
  const table = unwrap(deleteColumn(merged, 1)); // delete the interior column of a c1..c3 span
  const anchorRawEntry = table.tgroup.tbody.rows[0].entries[0];
  assert.equal(anchorRawEntry.namest, "c1");
  assert.equal(anchorRawEntry.nameend, "c3");
  const layout = resolveLayout(table);
  assert.equal(cellAt(layout, "tbody", 0, 0).colSpan, 2);
});

test("deleteColumn of the namest (left edge) column moves namest inward", () => {
  const merged = unwrap(
    mergeCells(grid(3, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 2,
    })
  );
  const table = unwrap(deleteColumn(merged, 0));
  const layout = resolveLayout(table);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.colSpan, 2);
});

test("deleteColumn of the nameend (right edge) column moves nameend inward", () => {
  const merged = unwrap(
    mergeCells(grid(3, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 2,
    })
  );
  const table = unwrap(deleteColumn(merged, 2));
  const layout = resolveLayout(table);
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.colSpan, 2);
});

test("deleteColumn of a span's last remaining column collapses the entry to a plain colname, no dangling reference", () => {
  const merged = unwrap(
    mergeCells(grid(2, 1), "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 1,
    })
  );
  const table = unwrap(deleteColumn(merged, 1));
  const rawEntry = table.tgroup.tbody.rows[0].entries[0];
  assert.equal(rawEntry.namest, undefined);
  assert.equal(rawEntry.nameend, undefined);
  assert.equal(rawEntry.colname, "c1");
  const layout = resolveLayout(table);
  assert.equal(layout.errors.length, 0);
});

test("deleteColumn referenced by a spanspec shrinks or removes it and rewrites spanname references", () => {
  const table = grid(2, 1);
  table.tgroup.spanspecs = [{ spanname: "s1", namest: "c1", nameend: "c2" }];
  table.tgroup.tbody.rows[0].entries = [{ content: "wide", spanname: "s1" }];
  const result = deleteColumn(table, 1);
  const newTable = unwrap(result);
  assert.equal(newTable.tgroup.spanspecs.length, 0);
  assert.equal(
    result.warnings.some((w) => w.code === "spanspec-collapsed"),
    true
  );
  const rawEntry = newTable.tgroup.tbody.rows[0].entries[0];
  assert.equal(rawEntry.spanname, undefined);
  assert.equal(rawEntry.colname, "c1");
  assert.equal(rawEntry.content, "wide");
});

test("deleteColumn rejects removing the only remaining column", () => {
  const result = deleteColumn(grid(1, 1), 0);
  assert.equal(result.ok, false);
});

test("golden table: every CALS feature combined resolves to the hand-computed grid", () => {
  const table = {
    frame: "sides",
    title: "Golden Table",
    pgwide: true,
    tgroup: {
      cols: 3,
      colspecs: [
        col("c1", { colwidth: "1*", align: "left" }),
        col("c2", { colwidth: "2*" }),
        col("c3", { colwidth: "1*", align: "right" }),
      ],
      spanspecs: [
        { spanname: "full", namest: "c1", nameend: "c3", align: "center" },
      ],
      thead: { rows: [row([entry("A", { spanname: "full" })])] },
      tbody: {
        rows: [
          row([
            entry("tall", { morerows: 1 }),
            entry("b1"),
            entry("c1", { align: "right", rowsep: 1 }),
          ]),
          row([entry("b2"), entry("c2")]),
        ],
      },
      tfoot: {
        rows: [
          row([entry("footer", { namest: "c1", nameend: "c2" }), entry("f3")]),
        ],
      },
    },
  };

  const layout = resolveLayout(table);
  assert.equal(layout.errors.length, 0);
  assert.equal(layout.frame, "sides");
  assert.equal(layout.pgwide, true);
  assert.equal(layout.title, "Golden Table");

  const head = cellAt(layout, "thead", 0, 0);
  assert.equal(head.colSpan, 3);
  assert.equal(head.align, "center");

  const tallCell = cellAt(layout, "tbody", 0, 0);
  assert.equal(tallCell.rowSpan, 2);
  assert.equal(layout.sections[1].rows[1].cells.length, 2); // b2, c2 - column 0 covered by the tall cell

  const c1Cell = cellAt(layout, "tbody", 0, 2);
  assert.equal(c1Cell.align, "right");
  assert.equal(c1Cell.rowsep, 1);

  const footer = cellAt(layout, "tfoot", 0, 0);
  assert.equal(footer.colSpan, 2);

  // Now merge b1/c1 (the top-right two cells not already covered), then delete the middle column.
  const merged = unwrap(
    mergeCells(table, "tbody", {
      rowStart: 0,
      rowEnd: 0,
      colStart: 1,
      colEnd: 2,
    })
  );
  const mergedLayout = resolveLayout(merged);
  assert.equal(cellAt(mergedLayout, "tbody", 0, 1).colSpan, 2);

  const afterDelete = unwrap(deleteColumn(merged, 1));
  const finalLayout = resolveLayout(afterDelete);
  assert.equal(finalLayout.errors.length, 0);
  assert.equal(finalLayout.columns.length, 2);
});
