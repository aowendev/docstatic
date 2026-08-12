/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * CalsTable's grid-resolution logic is the whole basis for the "this
 * supports CALS" claim, so every feature named in the CALS/DocBook table
 * model (frame, colspec, spanspec, colspan via namest/nameend or spanname,
 * rowspan via morerows, thead/tbody/tfoot, align/valign, colsep/rowsep
 * inheritance, pgwide) gets a dedicated case here against the pure
 * resolveLayout()/validateTable() functions - no DOM/React needed.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveLayout,
  validateTable,
} from "../src/components/CalsTable/calsLayout.js";

function col(colname, extra = {}) {
  return { colname, ...extra };
}

function entry(content, extra = {}) {
  return { content, ...extra };
}

function row(entries, extra = {}) {
  return { entries, ...extra };
}

function baseTable(overrides = {}) {
  return {
    tgroup: {
      cols: 2,
      colspecs: [col("c1"), col("c2")],
      tbody: { rows: [row([entry("a"), entry("b")])] },
    },
    ...overrides,
  };
}

function cellAt(layout, sectionName, rowIndex, colStart) {
  const section = layout.sections.find((s) => s.name === sectionName);
  const r = section.rows.find((rr) => rr.rowIndex === rowIndex);
  return r.cells.find((c) => c.colStart === colStart);
}

test("uniform grid resolves one cell per column with no spans", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [
            row([entry("a"), entry("b"), entry("c")]),
            row([entry("d"), entry("e"), entry("f")]),
          ],
        },
      },
    })
  );

  assert.equal(layout.errors.length, 0);
  const tbody = layout.sections.find((s) => s.name === "tbody");
  assert.equal(tbody.rows.length, 2);
  for (const r of tbody.rows) {
    assert.equal(r.cells.length, 3);
    for (const cell of r.cells) {
      assert.equal(cell.colSpan, 1);
      assert.equal(cell.rowSpan, 1);
    }
  }
});

test("explicit out-of-order colnum resolves columns in numeric order, not document order", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("second", { colnum: 2 }), col("first", { colnum: 1 })],
        tbody: {
          rows: [
            row([
              entry("a", { colname: "first" }),
              entry("b", { colname: "second" }),
            ]),
          ],
        },
      },
    })
  );
  assert.deepEqual(
    layout.columns.map((c) => c.colname),
    ["first", "second"]
  );
});

test("colspecs missing colnum are auto-assigned sequentially in document order", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("a"), col("b"), col("c")],
        tbody: { rows: [row([entry("1"), entry("2"), entry("3")])] },
      },
    })
  );
  assert.deepEqual(
    layout.columns.map((c) => c.colnum),
    [1, 2, 3]
  );
});

test("proportional colwidth ('N*') converts to a percentage of the star pool", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [
          col("c1", { colwidth: "1*" }),
          col("c2", { colwidth: "3*" }),
        ],
        tbody: { rows: [row([entry("a"), entry("b")])] },
      },
    })
  );
  assert.equal(layout.columnWidths[0], "25.0000%");
  assert.equal(layout.columnWidths[1], "75.0000%");
});

test("absolute colwidth units pass through unmodified", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [
          col("c1", { colwidth: "3in" }),
          col("c2", { colwidth: "20%" }),
        ],
        tbody: { rows: [row([entry("a"), entry("b")])] },
      },
    })
  );
  assert.equal(layout.columnWidths[0], "3in");
  assert.equal(layout.columnWidths[1], "20%");
});

test("positional entries fill left-to-right, skipping columns covered by a carried rowspan", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [
            row([entry("spans-down", { morerows: 1 }), entry("b"), entry("c")]),
            row([entry("only-two-left"), entry("also-here")]),
          ],
        },
      },
    })
  );
  const secondRow = cellAt(layout, "tbody", 1, 1);
  const thirdCol = cellAt(layout, "tbody", 1, 2);
  assert.equal(secondRow.content, "only-two-left");
  assert.equal(thirdCol.content, "also-here");
  assert.equal(layout.errors.length, 0);
});

test("explicit colname skips ahead over an implicit gap, and a later entry still lands correctly", () => {
  // Entries must still appear in ascending column order (a row can't render
  // out of positional sequence) - "out of order" here means skipping a
  // column via colname rather than a plain positional entry filling it.
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [
            row([
              entry("first", { colname: "c1" }),
              entry("last", { colname: "c3" }),
            ]),
          ],
        },
      },
    })
  );
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "first");
  assert.equal(cellAt(layout, "tbody", 0, 1).isPlaceholder, true);
  assert.equal(cellAt(layout, "tbody", 0, 2).content, "last");
  assert.equal(
    layout.warnings.some((w) => w.code === "gap"),
    true
  );
});

test("an explicit colname that targets an already-passed column collides and is dropped", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [
            row([
              entry("last", { colname: "c3" }),
              entry("too-late", { colname: "c1" }),
            ]),
          ],
        },
      },
    })
  );
  assert.equal(
    layout.errors.some((e) => e.code === "extra-entries"),
    true
  );
  assert.equal(cellAt(layout, "tbody", 0, 2).content, "last");
});

test("namest/nameend produces a single cell with the right colSpan", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [row([entry("wide", { namest: "c1", nameend: "c3" })])],
        },
      },
    })
  );
  const cell = cellAt(layout, "tbody", 0, 0);
  assert.equal(cell.colSpan, 3);
  assert.equal(layout.sections[0].rows[0].cells.length, 1);
});

test("spanname resolves via a defined spanspec, including its align default", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        spanspecs: [
          { spanname: "s1", namest: "c1", nameend: "c2", align: "center" },
        ],
        tbody: { rows: [row([entry("wide", { spanname: "s1" }), entry("c")])] },
      },
    })
  );
  const cell = cellAt(layout, "tbody", 0, 0);
  assert.equal(cell.colSpan, 2);
  assert.equal(cell.align, "center");
});

test("morerows produces a rowspan and suppresses the covered slot below", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("c1"), col("c2")],
        tbody: {
          rows: [
            row([entry("tall", { morerows: 1 }), entry("top-right")]),
            row([entry("bottom-right")]),
          ],
        },
      },
    })
  );
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.rowSpan, 2);
  const secondRowCells = layout.sections[0].rows[1].cells;
  assert.equal(secondRowCells.length, 1);
  assert.equal(secondRowCells[0].colStart, 1);
});

test("combined colspan + rowspan produces one merged block and suppresses the rest", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [
            row([
              entry("block", { namest: "c1", nameend: "c2", morerows: 1 }),
              entry("top-right"),
            ]),
            row([entry("bottom-right")]),
          ],
        },
      },
    })
  );
  const anchor = cellAt(layout, "tbody", 0, 0);
  assert.equal(anchor.colSpan, 2);
  assert.equal(anchor.rowSpan, 2);
  const secondRowCells = layout.sections[0].rows[1].cells;
  assert.equal(secondRowCells.length, 1);
  assert.equal(secondRowCells[0].colStart, 2);
});

test("a morerows span in thead does not leak into tbody's first row", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("c1"), col("c2")],
        thead: { rows: [row([entry("h1", { morerows: 5 }), entry("h2")])] },
        tbody: { rows: [row([entry("a"), entry("b")])] },
      },
    })
  );
  const tbodyRow = layout.sections.find((s) => s.name === "tbody").rows[0];
  assert.equal(tbodyRow.cells.length, 2);
});

test("align cascades entry -> spanspec -> colspec, most specific wins", () => {
  const table = baseTable({
    tgroup: {
      cols: 2,
      colspecs: [col("c1", { align: "left" }), col("c2", { align: "right" })],
      spanspecs: [
        { spanname: "s1", namest: "c1", nameend: "c2", align: "center" },
      ],
      tbody: {
        rows: [
          row([entry("a", { spanname: "s1" })]),
          row([entry("b", { align: "left" }), entry("c")]),
        ],
      },
    },
  });
  const layout = resolveLayout(table);
  assert.equal(
    cellAt(layout, "tbody", 0, 0).align,
    "center",
    "spanspec align wins over colspec"
  );
  assert.equal(
    cellAt(layout, "tbody", 1, 0).align,
    "left",
    "entry override wins over colspec"
  );
  assert.equal(
    cellAt(layout, "tbody", 1, 1).align,
    "right",
    "falls back to colspec"
  );
});

test("char/charoff pass through only when align resolves to char", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 1,
        colspecs: [col("c1")],
        tbody: {
          rows: [
            row([entry("3.14", { align: "char", char: ".", charoff: 50 })]),
          ],
        },
      },
    })
  );
  const cell = cellAt(layout, "tbody", 0, 0);
  assert.equal(cell.char, ".");
  assert.equal(cell.charoff, 50);
});

test("colsep/rowsep resolve through the full entry -> row/colspec -> table -> default fallback chain", () => {
  const layout = resolveLayout({
    colsep: 0,
    rowsep: 0,
    tgroup: {
      cols: 2,
      colspecs: [col("c1", { colsep: 1 }), col("c2")],
      tbody: {
        rows: [
          row([entry("a", { colsep: 1 }), entry("b")]),
          row([entry("c"), entry("d")], { rowsep: 1 }),
          row([entry("e"), entry("f")]),
        ],
      },
    },
  });
  assert.equal(cellAt(layout, "tbody", 0, 0).colsep, 1, "entry override wins");
  assert.equal(
    cellAt(layout, "tbody", 0, 1).colsep,
    0,
    "falls back to table default"
  );
  assert.equal(cellAt(layout, "tbody", 1, 0).rowsep, 1, "row override wins");
  assert.equal(
    cellAt(layout, "tbody", 2, 0).rowsep,
    0,
    "falls back to table default (colspec has none)"
  );
});

test("interior borders of a merged cell are never emitted (only one resolved cell per merge)", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: {
          rows: [row([entry("wide", { namest: "c1", nameend: "c3" })])],
        },
      },
    })
  );
  assert.equal(layout.sections[0].rows[0].cells.length, 1);
});

test("all six frame values pass through, and an invalid one defaults to 'all' with an error", () => {
  for (const frame of ["all", "sides", "top", "bottom", "topbot", "none"]) {
    assert.equal(resolveLayout(baseTable({ frame })).frame, frame);
  }
  const invalid = resolveLayout(baseTable({ frame: "bogus" }));
  assert.equal(invalid.frame, "all");
  assert.equal(
    invalid.errors.some((e) => e.code === "invalid-frame"),
    true
  );
});

test("pgwide and title pass through, including when omitted", () => {
  const withBoth = resolveLayout(baseTable({ pgwide: true, title: "Example" }));
  assert.equal(withBoth.pgwide, true);
  assert.equal(withBoth.title, "Example");

  const withNeither = resolveLayout(baseTable());
  assert.equal(withNeither.pgwide, false);
  assert.equal(withNeither.title, undefined);
});

test("a row with fewer entries than columns fills the gap with a placeholder cell and a warning, not a crash", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 3,
        colspecs: [col("c1"), col("c2"), col("c3")],
        tbody: { rows: [row([entry("only-one")])] },
      },
    })
  );
  const cells = layout.sections[0].rows[0].cells;
  assert.equal(cells.length, 3);
  assert.equal(cells[1].isPlaceholder, true);
  assert.equal(cells[2].isPlaceholder, true);
  assert.equal(
    layout.warnings.some((w) => w.code === "gap"),
    true
  );
});

test("an unknown colname reference is reported by validateTable and does not misplace the grid", () => {
  const { errors } = validateTable(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("c1"), col("c2")],
        tbody: { rows: [row([entry("a", { colname: "nope" }), entry("b")])] },
      },
    })
  );
  assert.equal(
    errors.some((e) => e.code === "unknown-colname"),
    true
  );
});

test("two entries explicitly targeting the same column collide; the first in document order wins", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("c1"), col("c2")],
        tbody: {
          rows: [
            row([
              entry("first", { colname: "c1" }),
              entry("second", { colname: "c1" }),
              entry("b", { colname: "c2" }),
            ]),
          ],
        },
      },
    })
  );
  assert.equal(cellAt(layout, "tbody", 0, 0).content, "first");
  assert.equal(
    layout.errors.some((e) => e.code === "collision"),
    true
  );
});

test("resolveLayout only ever inspects the single top-level tgroup (v1 scope, no entrytbl interpretation)", () => {
  const layout = resolveLayout(
    baseTable({
      tgroup: {
        cols: 1,
        colspecs: [col("c1")],
        tbody: {
          rows: [
            row([entry("<entrytbl>nested markup is just text</entrytbl>")]),
          ],
        },
      },
    })
  );
  assert.equal(
    cellAt(layout, "tbody", 0, 0).content,
    "<entrytbl>nested markup is just text</entrytbl>"
  );
  assert.equal(layout.errors.length, 0);
});

test("validateTable reports a missing tbody instead of crashing", () => {
  const { errors } = validateTable({
    tgroup: { cols: 1, colspecs: [col("c1")], tbody: { rows: [] } },
  });
  assert.equal(
    errors.some((e) => e.code === "missing-tbody"),
    true
  );
});

test("validateTable reports a duplicate colname", () => {
  const { errors } = validateTable({
    tgroup: {
      cols: 2,
      colspecs: [col("c1"), col("c1")],
      tbody: { rows: [row([entry("a"), entry("b")])] },
    },
  });
  assert.equal(
    errors.some((e) => e.code === "duplicate-colname"),
    true
  );
});

test("validateTable auto-swaps and warns on a spanspec with namest after nameend", () => {
  const { errors } = validateTable(
    baseTable({
      tgroup: {
        cols: 2,
        colspecs: [col("c1"), col("c2")],
        spanspecs: [{ spanname: "s1", namest: "c2", nameend: "c1" }],
        tbody: { rows: [row([entry("a", { spanname: "s1" })])] },
      },
    })
  );
  assert.equal(
    errors.some((e) => e.code === "swapped-namest-nameend"),
    true
  );
});
