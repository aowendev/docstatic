/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The site-wide cell alignment setting is only allowed to decide what CALS
 * itself left undecided. These cases pin that ordering from both ends: the
 * fallback never overrules an entry, a spanspec or a colspec, and the editor's
 * alignment operations write the levels that outrank it - which is what keeps
 * one global switch from flattening a per-cell model.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveLayout } from "../src/components/CalsTable/calsLayout.js";
import {
  setColumnAttributes,
  setEntryAttributes,
} from "../src/components/CalsTable/calsOperations.js";
import { cellAlign } from "../src/components/CalsTable/cellAlign.js";

function col(colname, extra = {}) {
  return { colname, ...extra };
}

function table(overrides = {}) {
  return {
    tgroup: {
      cols: 2,
      colspecs: [col("c1"), col("c2")],
      tbody: {
        rows: [
          { entries: [{ content: "a" }, { content: "b" }] },
          { entries: [{ content: "c" }, { content: "d" }] },
        ],
      },
      ...overrides,
    },
  };
}

function cellAt(layout, section, rowIndex, colStart) {
  return layout.sections
    .find((s) => s.name === section)
    ?.rows.find((r) => r.rowIndex === rowIndex)
    ?.cells.find((c) => c.colStart === colStart);
}

const ALL = { rowStart: 0, rowEnd: 1, colStart: 0, colEnd: 1 };

test("the site default applies only where CALS resolved no alignment", () => {
  assert.equal(cellAlign({ align: undefined }, "center"), "center");
  assert.equal(cellAlign({ align: "left" }, "center"), "left");
});

test("the site default never overrules an entry's own alignment", () => {
  const layout = resolveLayout(
    table({
      tbody: {
        rows: [{ entries: [{ content: "a", align: "right" }] }],
      },
    })
  );
  assert.equal(cellAlign(cellAt(layout, "tbody", 0, 0), "center"), "right");
});

test("the site default never overrules a colspec's alignment", () => {
  const layout = resolveLayout(
    table({ colspecs: [col("c1", { align: "right" }), col("c2")] })
  );
  assert.equal(cellAlign(cellAt(layout, "tbody", 0, 0), "center"), "right");
  // ...and the column that said nothing still takes the site default.
  assert.equal(cellAlign(cellAt(layout, "tbody", 0, 1), "center"), "center");
});

test("the site default never overrules a spanspec's alignment", () => {
  const layout = resolveLayout({
    tgroup: {
      cols: 2,
      colspecs: [col("c1"), col("c2")],
      spanspecs: [
        { spanname: "wide", namest: "c1", nameend: "c2", align: "right" },
      ],
      tbody: { rows: [{ entries: [{ content: "a", spanname: "wide" }] }] },
    },
  });
  assert.equal(cellAlign(cellAt(layout, "tbody", 0, 0), "center"), "right");
});

test("char alignment outranks the site default and degrades to right", () => {
  assert.equal(cellAlign({ align: "char" }, "center"), "right");
});

test("a cell that resolved nothing and has no site default is left to the browser", () => {
  assert.equal(cellAlign({ align: undefined }, undefined), undefined);
});

test("setEntryAttributes aligns every cell the selection covers", () => {
  const { table: next } = setEntryAttributes(table(), "tbody", ALL, {
    align: "center",
  });
  const layout = resolveLayout(next);
  for (const rowIndex of [0, 1]) {
    for (const colStart of [0, 1]) {
      assert.equal(cellAt(layout, "tbody", rowIndex, colStart).align, "center");
    }
  }
});

test("setEntryAttributes leaves cells outside the selection alone", () => {
  const { table: next } = setEntryAttributes(
    table(),
    "tbody",
    { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 },
    { align: "center" }
  );
  const layout = resolveLayout(next);
  assert.equal(cellAt(layout, "tbody", 0, 0).align, "center");
  assert.equal(cellAt(layout, "tbody", 0, 1).align, undefined);
  assert.equal(cellAt(layout, "tbody", 1, 0).align, undefined);
});

test("an empty value clears the attribute so the cell inherits again", () => {
  const aligned = setEntryAttributes(table(), "tbody", ALL, {
    align: "center",
  }).table;
  const cleared = setEntryAttributes(aligned, "tbody", ALL, {
    align: "",
  }).table;

  assert.equal(
    Object.hasOwn(cleared.tgroup.tbody.rows[0].entries[0], "align"),
    false
  );
  const cell = cellAt(resolveLayout(cleared), "tbody", 0, 0);
  assert.equal(cell.align, undefined);
  assert.equal(cellAlign(cell, "right"), "right");
});

test("setEntryAttributes writes valign too", () => {
  const { table: next } = setEntryAttributes(table(), "tbody", ALL, {
    valign: "middle",
  });
  assert.equal(cellAt(resolveLayout(next), "tbody", 0, 0).valign, "middle");
});

test("setEntryAttributes does not mutate its input", () => {
  const original = table();
  const snapshot = JSON.stringify(original);
  setEntryAttributes(original, "tbody", ALL, { align: "center" });
  assert.equal(JSON.stringify(original), snapshot);
});

test("setEntryAttributes rejects an unknown section", () => {
  const result = setEntryAttributes(table(), "nope", ALL, { align: "center" });
  assert.equal(result.ok, false);
});

test("setColumnAttributes aligns a whole column, and an entry still wins", () => {
  const source = table({
    tbody: {
      rows: [{ entries: [{ content: "a", align: "right" }, { content: "b" }] }],
    },
  });
  const { table: next } = setColumnAttributes(source, 0, 1, {
    align: "center",
  });
  const layout = resolveLayout(next);

  assert.equal(cellAt(layout, "tbody", 0, 0).align, "right");
  assert.equal(cellAt(layout, "tbody", 0, 1).align, "center");
});

test("setColumnAttributes rejects a range outside the table", () => {
  assert.equal(setColumnAttributes(table(), 0, 5, { align: "left" }).ok, false);
  assert.equal(setColumnAttributes(table(), 1, 0, { align: "left" }).ok, false);
});
