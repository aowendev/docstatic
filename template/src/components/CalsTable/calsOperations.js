/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Pure, framework-free structural mutations on the CALS table data shape
 * defined in calsLayout.js - merge/split/insert/delete, used by
 * CalsTableEditor.jsx. Every function takes a table and returns either
 * `{ table, warnings }` on success or `{ ok: false, error }` on rejection;
 * none of them mutate their input.
 *
 * A key simplification this module leans on throughout: spans are referenced
 * by colname (a string), not by numeric position, so inserting or deleting a
 * column never has to touch any *other* span's namest/nameend - a span's
 * boundaries automatically track the columns they name as the surrounding
 * grid changes shape around them. The one thing colname-references can't
 * protect on their own is a *positional* entry (one with no colname/namest/
 * nameend/spanname at all) - its meaning is purely "whatever column is next",
 * so any operation that inserts/removes an array element or changes the
 * column count could otherwise silently change what an untouched positional
 * entry resolves to. pinPositionalEntries() closes that gap by giving every
 * such entry an explicit colname (matching its current position) before any
 * mutation happens, so the rest of this module never has to reason about it.
 */

import { resolveLayout, SECTION_NAMES } from "./calsLayout.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findCellAt(section, rowIndex, colIndex) {
  for (const row of section.rows) {
    for (const cell of row.cells) {
      if (
        rowIndex >= cell.rowIndex &&
        rowIndex <= cell.rowIndex + cell.rowSpan - 1 &&
        colIndex >= cell.colStart &&
        colIndex <= cell.colStart + cell.colSpan - 1
      ) {
        return cell;
      }
    }
  }
  return null;
}

/** Gives every purely positional entry (no colname/namest/nameend/spanname) an explicit colname matching its current resolved position. Mutates `table` in place - callers pass an already-cloned table. */
function pinPositionalEntries(table) {
  const layout = resolveLayout(table);
  for (const sectionName of SECTION_NAMES) {
    const section = layout.sections.find((s) => s.name === sectionName);
    if (!section) continue;
    const rawSection = table.tgroup[sectionName];
    for (const row of section.rows) {
      const rawRow = rawSection.rows[row.rowIndex];
      for (const cell of row.cells) {
        if (cell.entryIndex === null) continue;
        const rawEntry = rawRow.entries[cell.entryIndex];
        const hasExplicitPlacement =
          rawEntry.colname ||
          rawEntry.namest ||
          rawEntry.nameend ||
          rawEntry.spanname;
        if (!hasExplicitPlacement) {
          rawEntry.colname = layout.columns[cell.colStart].colname;
        }
      }
    }
  }
}

/** Splices `newEntry` into a row's raw entries array at the position that keeps entries in ascending column order. Resolves fresh against `table`'s current state, so callers can invoke this repeatedly in a loop as they mutate. */
function insertEntryAtColumn(table, sectionName, rowIndex, colIndex, newEntry) {
  const layout = resolveLayout(table);
  const sec = layout.sections.find((s) => s.name === sectionName);
  const rawRow = table.tgroup[sectionName].rows[rowIndex];
  const resolvedRow = sec?.rows.find((r) => r.rowIndex === rowIndex);
  const cells = resolvedRow
    ? resolvedRow.cells.filter((c) => c.entryIndex !== null)
    : [];

  let insertAt = rawRow.entries.length;
  for (const cell of cells) {
    if (cell.colStart > colIndex) {
      insertAt = cell.entryIndex;
      break;
    }
  }
  rawRow.entries.splice(insertAt, 0, newEntry);
}

function generateColname(existingNames) {
  let n = existingNames.size + 1;
  let candidate = `col-${n}`;
  while (existingNames.has(candidate)) {
    n += 1;
    candidate = `col-${n}`;
  }
  return candidate;
}

/** A minimal, valid starting table for a brand-new embed. */
export function createEmptyTable(rows = 2, cols = 2) {
  const colspecs = [];
  for (let i = 0; i < cols; i += 1) {
    colspecs.push({ colnum: i + 1, colname: `col-${i + 1}` });
  }
  const bodyRows = [];
  for (let r = 0; r < rows; r += 1) {
    bodyRows.push({
      entries: colspecs.map((c) => ({ colname: c.colname, content: "" })),
    });
  }
  return {
    frame: "all",
    tgroup: { cols, colspecs, tbody: { rows: bodyRows } },
  };
}

/**
 * Merges every cell fully inside the given rectangle (rows/cols are grid
 * indices scoped to one section - a merge can never cross thead/tbody/tfoot,
 * since the caller must pick a single section up front). The top-left cell
 * becomes the anchor and keeps its own content; other cells' content is
 * discarded and reported back so the editor can confirm before applying.
 */
export function mergeCells(table, section, selection) {
  if (!SECTION_NAMES.includes(section)) {
    return { ok: false, error: `Unknown section "${section}"` };
  }
  const { rowStart, rowEnd, colStart, colEnd } = selection;
  if (rowEnd < rowStart || colEnd < colStart) {
    return { ok: false, error: "Invalid selection" };
  }

  const layout = resolveLayout(table);
  const sec = layout.sections.find((s) => s.name === section);
  if (!sec) return { ok: false, error: `Section "${section}" has no rows` };
  if (colEnd >= layout.columns.length) {
    return { ok: false, error: "Selection extends past the last column" };
  }

  const touched = new Map();
  for (const row of sec.rows) {
    for (const cell of row.cells) {
      const cellRowEnd = cell.rowIndex + cell.rowSpan - 1;
      const cellColEnd = cell.colStart + cell.colSpan - 1;
      const intersects =
        cell.rowIndex <= rowEnd &&
        cellRowEnd >= rowStart &&
        cell.colStart <= colEnd &&
        cellColEnd >= colStart;
      if (!intersects) continue;

      const fullyInside =
        cell.rowIndex >= rowStart &&
        cellRowEnd <= rowEnd &&
        cell.colStart >= colStart &&
        cellColEnd <= colEnd;
      if (!fullyInside) {
        return {
          ok: false,
          error: "Selection partially overlaps an existing merged cell",
        };
      }
      touched.set(`${cell.rowIndex}:${cell.colStart}`, cell);
    }
  }

  const cells = [...touched.values()].sort(
    (a, b) => a.rowIndex - b.rowIndex || a.colStart - b.colStart
  );
  if (cells.length === 0) return { ok: false, error: "Nothing to merge" };

  const [anchor, ...others] = cells;
  const discardedContent = others
    .filter((c) => c.content && c.content.trim() !== "")
    .map((c) => c.content);

  const newTable = deepClone(table);
  pinPositionalEntries(newTable);
  const rows = newTable.tgroup[section].rows;
  const columns = layout.columns;

  const anchorEntry = rows[anchor.rowIndex].entries[anchor.entryIndex];
  anchorEntry.namest = columns[colStart].colname;
  anchorEntry.nameend = columns[colEnd].colname;
  const morerows = rowEnd - rowStart;
  if (morerows > 0) anchorEntry.morerows = morerows;
  else delete anchorEntry.morerows;
  delete anchorEntry.colname;
  delete anchorEntry.spanname;

  const byRow = new Map();
  for (const cell of others) {
    if (!byRow.has(cell.rowIndex)) byRow.set(cell.rowIndex, []);
    byRow.get(cell.rowIndex).push(cell.entryIndex);
  }
  for (const [rowIndex, entryIndexes] of byRow) {
    entryIndexes.sort((a, b) => b - a); // highest index first so earlier splices don't shift later ones
    for (const idx of entryIndexes) {
      rows[rowIndex].entries.splice(idx, 1);
    }
  }

  return {
    table: newTable,
    warnings: discardedContent.length
      ? [{ code: "content-discarded", discardedContent }]
      : [],
  };
}

/** Reverses a merge: the anchor keeps its content and becomes a plain 1x1 cell; every other cell it used to cover gets a fresh empty entry. */
export function splitCell(table, section, rowIndex, colIndex) {
  if (!SECTION_NAMES.includes(section)) {
    return { ok: false, error: `Unknown section "${section}"` };
  }
  const layout = resolveLayout(table);
  const sec = layout.sections.find((s) => s.name === section);
  if (!sec) return { ok: false, error: `Section "${section}" has no rows` };

  const cell = findCellAt(sec, rowIndex, colIndex);
  if (!cell || cell.entryIndex === null)
    return { ok: false, error: "No cell at that position" };
  if (cell.colSpan === 1 && cell.rowSpan === 1) {
    return { ok: false, error: "Cell is not merged" };
  }

  const newTable = deepClone(table);
  pinPositionalEntries(newTable);
  const columns = layout.columns;
  const anchorEntry =
    newTable.tgroup[section].rows[cell.rowIndex].entries[cell.entryIndex];
  anchorEntry.colname = columns[cell.colStart].colname;
  delete anchorEntry.namest;
  delete anchorEntry.nameend;
  delete anchorEntry.spanname;
  delete anchorEntry.morerows;

  for (let r = cell.rowIndex; r < cell.rowIndex + cell.rowSpan; r += 1) {
    if (!newTable.tgroup[section].rows[r]) continue;
    for (let c = cell.colStart; c < cell.colStart + cell.colSpan; c += 1) {
      if (r === cell.rowIndex && c === cell.colStart) continue;
      insertEntryAtColumn(newTable, section, r, c, {
        colname: columns[c].colname,
        content: "",
      });
    }
  }

  return { table: newTable, warnings: [] };
}

/**
 * Inserts a new row of empty entries. If the insertion point falls inside an
 * active rowspan, that span's `morerows` grows by one and the new row gets
 * no entry at the spanned column(s) - a spreadsheet-style "insert through a
 * merged range" behavior, rather than requiring the author to fix it up.
 */
export function insertRow(table, section, afterRowIndex, position = "after") {
  if (!SECTION_NAMES.includes(section)) {
    return { ok: false, error: `Unknown section "${section}"` };
  }
  const layout = resolveLayout(table);
  const columns = layout.columns;

  const newTable = deepClone(table);
  pinPositionalEntries(newTable);
  if (!newTable.tgroup[section]) newTable.tgroup[section] = { rows: [] };
  const rows = newTable.tgroup[section].rows;

  const insertIndex = position === "before" ? afterRowIndex : afterRowIndex + 1;
  const clampedIndex = Math.max(0, Math.min(insertIndex, rows.length));

  const sec = layout.sections.find((s) => s.name === section);
  const coveredCols = new Set();
  if (sec) {
    for (const row of sec.rows) {
      for (const cell of row.cells) {
        if (cell.entryIndex === null) continue;
        const cellRowEnd = cell.rowIndex + cell.rowSpan - 1;
        if (cell.rowIndex < clampedIndex && cellRowEnd >= clampedIndex) {
          for (
            let c = cell.colStart;
            c < cell.colStart + cell.colSpan;
            c += 1
          ) {
            coveredCols.add(c);
          }
          const rawEntry = rows[cell.rowIndex].entries[cell.entryIndex];
          rawEntry.morerows = (rawEntry.morerows || 0) + 1;
        }
      }
    }
  }

  const newEntries = [];
  columns.forEach((colSpec, colIndex) => {
    if (!coveredCols.has(colIndex)) {
      newEntries.push({ colname: colSpec.colname, content: "" });
    }
  });

  rows.splice(clampedIndex, 0, { entries: newEntries });
  return { table: newTable, warnings: [] };
}

/**
 * Deletes a row. A rowspan anchored in this row hands its remaining span off
 * to the next row (content preserved); a rowspan merely passing through this
 * row (anchored earlier) shrinks by one. tbody may never drop to zero rows.
 */
export function deleteRow(table, section, rowIndex) {
  if (!SECTION_NAMES.includes(section)) {
    return { ok: false, error: `Unknown section "${section}"` };
  }
  const layout = resolveLayout(table);
  const sec = layout.sections.find((s) => s.name === section);
  if (!sec) return { ok: false, error: `Section "${section}" has no rows` };

  const rawRows = table.tgroup[section].rows;
  if (rowIndex < 0 || rowIndex >= rawRows.length) {
    return { ok: false, error: "Row index out of range" };
  }
  if (section === "tbody" && rawRows.length <= 1) {
    return { ok: false, error: "Cannot delete the last remaining tbody row" };
  }

  const newTable = deepClone(table);
  pinPositionalEntries(newTable);
  const rows = newTable.tgroup[section].rows;
  const warnings = [];

  const resolvedRow = sec.rows.find((r) => r.rowIndex === rowIndex);
  const rowCells = resolvedRow ? resolvedRow.cells : [];

  for (const cell of rowCells) {
    if (cell.rowSpan <= 1 || cell.entryIndex === null) continue;
    if (rowIndex + 1 >= rows.length) {
      warnings.push({
        code: "content-discarded",
        message:
          "A spanning cell in the deleted row had no later row to hand off to",
      });
      continue;
    }
    const anchorEntry = rows[rowIndex].entries[cell.entryIndex];
    const movedEntry = { ...anchorEntry };
    const remaining = cell.rowSpan - 2;
    if (remaining > 0) movedEntry.morerows = remaining;
    else delete movedEntry.morerows;
    insertEntryAtColumn(
      newTable,
      section,
      rowIndex + 1,
      cell.colStart,
      movedEntry
    );
  }

  for (const row of sec.rows) {
    if (row.rowIndex >= rowIndex) continue;
    for (const cell of row.cells) {
      if (cell.entryIndex === null) continue;
      const cellRowEnd = cell.rowIndex + cell.rowSpan - 1;
      if (cell.rowIndex < rowIndex && cellRowEnd >= rowIndex) {
        const anchorEntry = rows[cell.rowIndex].entries[cell.entryIndex];
        const shrunk = (anchorEntry.morerows || 0) - 1;
        if (shrunk > 0) anchorEntry.morerows = shrunk;
        else delete anchorEntry.morerows;
      }
    }
  }

  rows.splice(rowIndex, 1);
  return { table: newTable, warnings };
}

/**
 * Inserts a new column. Every entry and spanspec is colname-referenced, so a
 * span that visually crosses the insertion point widens *automatically*: its
 * nameend colname simply ends up at a higher index once the new column
 * shifts everything after it to the right, with no attribute rewrite needed.
 * The only entries that need active work are purely positional ones, which
 * pinPositionalEntries() locks to their current column before the column
 * count changes - otherwise "whatever's next" would silently start meaning
 * something else. Note this makes spanspecs auto-widen exactly like direct
 * namest/nameend does (the same colname-reference mechanism covers both),
 * which is a deliberate simplification over treating them differently.
 */
export function insertColumn(table, afterColIndex, position = "after") {
  const layout = resolveLayout(table);
  const columns = layout.columns;
  const insertIndex = position === "before" ? afterColIndex : afterColIndex + 1;
  const clampedIndex = Math.max(0, Math.min(insertIndex, columns.length));

  const newColname = generateColname(new Set(columns.map((c) => c.colname)));
  const newTable = deepClone(table);
  pinPositionalEntries(newTable); // must happen before the column count changes below

  const newColspecs = columns.map((c) => ({ ...c }));
  newColspecs.splice(clampedIndex, 0, { colname: newColname });
  newColspecs.forEach((c, i) => {
    c.colnum = i + 1;
  });
  newTable.tgroup.colspecs = newColspecs;
  newTable.tgroup.cols = newColspecs.length;

  for (const sectionName of SECTION_NAMES) {
    const section = newTable.tgroup[sectionName];
    if (!section || !Array.isArray(section.rows)) continue;
    section.rows.forEach((_row, rowIndex) => {
      const freshLayout = resolveLayout(newTable);
      const freshSec = freshLayout.sections.find((s) => s.name === sectionName);
      const resolvedRow = freshSec?.rows.find((r) => r.rowIndex === rowIndex);
      const cell = resolvedRow?.cells.find(
        (c) =>
          clampedIndex >= c.colStart &&
          clampedIndex <= c.colStart + c.colSpan - 1
      );
      if (cell?.isPlaceholder && cell.rowIndex === rowIndex) {
        insertEntryAtColumn(newTable, sectionName, rowIndex, clampedIndex, {
          colname: newColname,
          content: "",
        });
      }
    });
  }

  return { table: newTable, warnings: [] };
}

/**
 * Deletes a column. Works from the *resolved* grid (not raw entry
 * attributes) so positional entries are handled identically to explicit
 * ones: whichever cell's resolved colStart equals the deleted column is
 * dropped/shrunk, regardless of how that cell was originally addressed. An
 * entry/spanspec whose span starts or ends exactly at the deleted column
 * moves that boundary inward by one; a span strictly interior to the deleted
 * column needs no change (its namest/nameend colnames are untouched - the
 * span simply covers one fewer column). A span that collapses to a single
 * surviving column is rewritten to a plain `colname` rather than left as a
 * degenerate namest===nameend pair, and any `spanname` reference to a
 * collapsed spanspec is rewritten the same way so it never dangles.
 */
export function deleteColumn(table, colIndex) {
  const layout = resolveLayout(table);
  const columns = layout.columns;
  if (columns.length <= 1)
    return { ok: false, error: "Cannot delete the only remaining column" };
  if (colIndex < 0 || colIndex >= columns.length)
    return { ok: false, error: "Column index out of range" };

  const deletedName = columns[colIndex].colname;
  const newTable = deepClone(table);
  const warnings = [];

  function shrinkBoundary(lo, hi) {
    let newLo = lo;
    let newHi = hi;
    if (colIndex === lo) newLo = lo + 1;
    if (colIndex === hi) newHi = hi - 1;
    return { newLo, newHi, collapsed: newLo === newHi };
  }

  const collapsedSpanReplacements = new Map();
  const remainingSpanspecs = [];
  for (const spec of newTable.tgroup.spanspecs || []) {
    const startIdx = columns.findIndex((c) => c.colname === spec.namest);
    const endIdx = columns.findIndex((c) => c.colname === spec.nameend);
    if (startIdx === -1 || endIdx === -1) {
      remainingSpanspecs.push(spec);
      continue;
    }
    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    if (colIndex < lo || colIndex > hi) {
      remainingSpanspecs.push(spec);
      continue;
    }
    if (colIndex > lo && colIndex < hi) {
      remainingSpanspecs.push(spec); // interior deletion - namest/nameend still valid, span just shrinks
      continue;
    }
    const { newLo, newHi, collapsed } = shrinkBoundary(lo, hi);
    if (collapsed) {
      collapsedSpanReplacements.set(spec.spanname, columns[newLo].colname);
      warnings.push({
        code: "spanspec-collapsed",
        message: `spanspec "${spec.spanname}" collapsed to a single column and was removed`,
        spanname: spec.spanname,
        colname: columns[newLo].colname,
      });
      continue;
    }
    remainingSpanspecs.push({
      ...spec,
      namest: columns[newLo].colname,
      nameend: columns[newHi].colname,
    });
  }
  newTable.tgroup.spanspecs = remainingSpanspecs;

  for (const sectionName of SECTION_NAMES) {
    const resolvedSection = layout.sections.find((s) => s.name === sectionName);
    if (!resolvedSection) continue;
    const rawSection = newTable.tgroup[sectionName];
    for (const resolvedRow of resolvedSection.rows) {
      const rawRow = rawSection.rows[resolvedRow.rowIndex];
      const kept = [];
      for (const cell of resolvedRow.cells) {
        if (cell.entryIndex === null) continue; // placeholder, no backing raw entry
        const rawEntry = rawRow.entries[cell.entryIndex];
        const cellColEnd = cell.colStart + cell.colSpan - 1;

        if (cell.colSpan === 1) {
          if (cell.colStart === colIndex) continue; // drop entirely, positional or explicit alike
          kept.push(rawEntry);
          continue;
        }

        if (colIndex < cell.colStart || colIndex > cellColEnd) {
          kept.push(rawEntry);
          continue;
        }
        if (colIndex > cell.colStart && colIndex < cellColEnd) {
          kept.push(rawEntry); // interior - unaffected
          continue;
        }

        if (rawEntry.spanname) {
          const replacement = collapsedSpanReplacements.get(rawEntry.spanname);
          if (replacement) {
            const { spanname, ...rest } = rawEntry;
            kept.push({ ...rest, colname: replacement });
          } else {
            kept.push(rawEntry); // spanspec itself already shrunk without collapsing
          }
          continue;
        }

        const { newLo, newHi, collapsed } = shrinkBoundary(
          cell.colStart,
          cellColEnd
        );
        if (collapsed) {
          const { namest, nameend, ...rest } = rawEntry;
          kept.push({ ...rest, colname: columns[newLo].colname });
        } else {
          kept.push({
            ...rawEntry,
            namest: columns[newLo].colname,
            nameend: columns[newHi].colname,
          });
        }
      }
      rawRow.entries = kept;
    }
  }

  const newColspecs = newTable.tgroup.colspecs.filter(
    (c) => c.colname !== deletedName
  );
  newColspecs.forEach((c, i) => {
    c.colnum = i + 1;
  });
  newTable.tgroup.colspecs = newColspecs;
  newTable.tgroup.cols = newColspecs.length;

  return { table: newTable, warnings };
}
