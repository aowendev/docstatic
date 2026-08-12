/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Pure, framework-free resolution of the CALS table model (as used by DocBook
 * and DITA) into a concrete rendering grid. Deliberately framework-free so
 * every CALS feature can be unit-tested without a DOM/React renderer -
 * CalsTableView.jsx is the only place this output touches JSX.
 *
 * Scope: a single tgroup-equivalent per table (one colspec set, one
 * thead/tbody/tfoot triplet). Multiple CALS <tgroup> elements and nested
 * <entrytbl> are not supported - see docs/guides/markdown-features/tables.mdx.
 *
 * See calsOperations.js for the structural mutations (merge/split/insert/
 * delete) the Tina grid editor performs on this same data shape.
 */

export const SECTION_NAMES = ["thead", "tbody", "tfoot"];
const VALID_FRAMES = ["all", "sides", "top", "bottom", "topbot", "none"];
const CALS_DEFAULT_BORDER = 1;
const CALS_DEFAULT_VALIGN = "top";

function normalizeBorder(value) {
  return value === 0 || value === 1 ? value : undefined;
}

/**
 * Assigns a resolved `colnum` to every colspec (explicit values are kept;
 * missing ones are auto-assigned the next free integer in document order),
 * then returns the colspecs sorted by that resolved number. The array index
 * in the returned list - not the CALS `colnum` value itself - is what the
 * rest of this module treats as the grid column index, so callers never need
 * `colnum` to be contiguous for layout to still work.
 */
function resolveColumns(colspecs, errors) {
  const used = new Set();
  for (const spec of colspecs) {
    if (typeof spec.colnum === "number") {
      if (used.has(spec.colnum)) {
        errors.push({
          code: "duplicate-colnum",
          message: `Multiple colspecs claim colnum ${spec.colnum}`,
          colnum: spec.colnum,
        });
      }
      used.add(spec.colnum);
    }
  }

  let next = 1;
  const numbered = colspecs.map((spec) => {
    let colnum = spec.colnum;
    if (typeof colnum !== "number") {
      while (used.has(next)) next += 1;
      colnum = next;
      used.add(colnum);
    }
    return { ...spec, colnum };
  });

  numbered.sort((a, b) => a.colnum - b.colnum);

  const seenNames = new Set();
  for (const spec of numbered) {
    if (!spec.colname) {
      errors.push({
        code: "missing-colname",
        message: "colspec is missing colname",
      });
      continue;
    }
    if (seenNames.has(spec.colname)) {
      errors.push({
        code: "duplicate-colname",
        message: `Duplicate colname "${spec.colname}"`,
        colname: spec.colname,
      });
    }
    seenNames.add(spec.colname);
  }

  return numbered;
}

function buildColumnIndex(columns) {
  const byName = new Map();
  columns.forEach((col, index) => {
    if (col.colname && !byName.has(col.colname)) {
      byName.set(col.colname, index);
    }
  });
  return byName;
}

/** Resolves spanspecs into { spanname -> { colStart, colSpan, align, char, charoff, colsep, rowsep } }. */
function resolveSpanspecs(spanspecs, byName, errors) {
  const map = new Map();
  for (const spec of spanspecs || []) {
    if (!spec.spanname) {
      errors.push({
        code: "missing-spanname",
        message: "spanspec is missing spanname",
      });
      continue;
    }
    let startIdx = byName.get(spec.namest);
    let endIdx = byName.get(spec.nameend);
    if (startIdx === undefined || endIdx === undefined) {
      errors.push({
        code: "unknown-colname",
        message: `spanspec "${spec.spanname}" references an unknown colname`,
        spanname: spec.spanname,
      });
      continue;
    }
    let swapped = false;
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
      swapped = true;
    }
    map.set(spec.spanname, {
      colStart: startIdx,
      colSpan: endIdx - startIdx + 1,
      align: spec.align,
      char: spec.char,
      charoff: spec.charoff,
      colsep: normalizeBorder(spec.colsep),
      rowsep: normalizeBorder(spec.rowsep),
    });
    if (swapped) {
      errors.push({
        code: "swapped-namest-nameend",
        message: `spanspec "${spec.spanname}" had namest after nameend; auto-swapped`,
        spanname: spec.spanname,
      });
    }
  }
  return map;
}

/**
 * Determines where one entry belongs, without regard to whether that slot is
 * actually free right now (the row-walking loop in resolveSection is the one
 * place that reconciles placement against the cursor/occupancy state).
 * Returns null when the entry references something unresolvable, so the
 * caller can fall back to positional placement.
 */
function resolveEntryPlacement(entry, cursor, byName, spanMap, errors, cols) {
  if (entry.spanname) {
    const span = spanMap.get(entry.spanname);
    if (span) {
      return { colStart: span.colStart, colSpan: span.colSpan, span };
    }
    errors.push({
      code: "unknown-spanname",
      message: `entry references unknown spanname "${entry.spanname}"`,
      spanname: entry.spanname,
    });
    return null;
  }

  if (entry.namest || entry.nameend) {
    let startIdx = byName.get(entry.namest);
    let endIdx = byName.get(entry.nameend ?? entry.namest);
    if (startIdx === undefined || endIdx === undefined) {
      errors.push({
        code: "unknown-colname",
        message: `entry references an unknown namest/nameend colname`,
        namest: entry.namest,
        nameend: entry.nameend,
      });
      return null;
    }
    let swapped = false;
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
      swapped = true;
    }
    if (swapped) {
      errors.push({
        code: "swapped-namest-nameend",
        message: `entry had namest after nameend; auto-swapped`,
        namest: entry.namest,
        nameend: entry.nameend,
      });
    }
    return {
      colStart: startIdx,
      colSpan: Math.min(endIdx - startIdx + 1, cols),
    };
  }

  if (entry.colname) {
    const idx = byName.get(entry.colname);
    if (idx === undefined) {
      errors.push({
        code: "unknown-colname",
        message: `entry references unknown colname "${entry.colname}"`,
        colname: entry.colname,
      });
      return null;
    }
    return { colStart: idx, colSpan: 1 };
  }

  // Positional: claims whatever the next free column is.
  return { colStart: cursor, colSpan: 1 };
}

function resolveAlign(entry, placement, column) {
  return entry.align ?? placement?.span?.align ?? column.align;
}

function resolveCharAttrs(entry, placement, column, align) {
  if (align !== "char") return { char: undefined, charoff: undefined };
  return {
    char: entry.char ?? placement?.span?.char ?? column.char,
    charoff: entry.charoff ?? placement?.span?.charoff ?? column.charoff,
  };
}

function resolveValign(entry, row) {
  return entry.valign ?? row.valign ?? CALS_DEFAULT_VALIGN;
}

function resolveColsep(entry, placement, endColumn, table) {
  return (
    normalizeBorder(entry.colsep) ??
    placement?.span?.colsep ??
    normalizeBorder(endColumn.colsep) ??
    normalizeBorder(table.colsep) ??
    CALS_DEFAULT_BORDER
  );
}

function resolveRowsep(entry, row, placement, startColumn, table) {
  return (
    normalizeBorder(entry.rowsep) ??
    normalizeBorder(row.rowsep) ??
    placement?.span?.rowsep ??
    normalizeBorder(startColumn.rowsep) ??
    normalizeBorder(table.rowsep) ??
    CALS_DEFAULT_BORDER
  );
}

function emptyPlaceholderCell(rowIndex, colStart) {
  return {
    rowIndex,
    entryIndex: null,
    colStart,
    colSpan: 1,
    rowSpan: 1,
    align: undefined,
    valign: CALS_DEFAULT_VALIGN,
    char: undefined,
    charoff: undefined,
    colsep: CALS_DEFAULT_BORDER,
    rowsep: CALS_DEFAULT_BORDER,
    content: "",
    isPlaceholder: true,
  };
}

/** One section (thead/tbody/tfoot) gets its own fresh occupancy tracker - a rowspan never crosses a section boundary. */
function resolveSection(
  sectionName,
  rows,
  columns,
  byName,
  spanMap,
  table,
  errors,
  warnings
) {
  const cols = columns.length;
  const occupancy = new Array(cols).fill(null);
  const resolvedRows = [];

  rows.forEach((row, rowIndex) => {
    const cells = [];
    const entries = row.entries || [];
    let cursor = 0;
    let consumed = 0;

    while (cursor < cols) {
      const occupied = occupancy[cursor];
      if (occupied && occupied.remaining > 0) {
        occupied.remaining -= 1;
        if (occupied.remaining <= 0) occupancy[cursor] = null;
        cursor += 1;
        continue;
      }

      if (consumed >= entries.length) {
        cells.push(emptyPlaceholderCell(rowIndex, cursor));
        warnings.push({
          code: "gap",
          message: `${sectionName} row ${rowIndex} has fewer entries than columns; a gap was filled`,
          section: sectionName,
          rowIndex,
          colStart: cursor,
        });
        cursor += 1;
        continue;
      }

      const entry = entries[consumed];
      const placement = resolveEntryPlacement(
        entry,
        cursor,
        byName,
        spanMap,
        errors,
        cols
      ) ?? {
        colStart: cursor,
        colSpan: 1,
      };

      if (placement.colStart < cursor) {
        errors.push({
          code: "collision",
          message: `${sectionName} row ${rowIndex} has an entry colliding with an already-placed cell; it was dropped`,
          section: sectionName,
          rowIndex,
        });
        consumed += 1;
        continue;
      }

      if (placement.colStart > cursor) {
        // Leading gap before this entry's target column - fill it, then retry the same entry next loop.
        cells.push(emptyPlaceholderCell(rowIndex, cursor));
        warnings.push({
          code: "gap",
          message: `${sectionName} row ${rowIndex} has a gap before column ${placement.colStart}`,
          section: sectionName,
          rowIndex,
          colStart: cursor,
        });
        cursor += 1;
        continue;
      }

      let colSpan = Math.max(1, Math.min(placement.colSpan, cols - cursor));
      if (colSpan < placement.colSpan) {
        errors.push({
          code: "span-overflow",
          message: `${sectionName} row ${rowIndex} entry spans past the last column; clamped`,
          section: sectionName,
          rowIndex,
        });
      }
      // Don't let a horizontal span run into a column still covered by a carried rowspan.
      for (let c = cursor + 1; c < cursor + colSpan; c += 1) {
        const blocked = occupancy[c];
        if (blocked && blocked.remaining > 0) {
          errors.push({
            code: "span-overlap",
            message: `${sectionName} row ${rowIndex} entry's colspan overlaps an active rowspan; clamped`,
            section: sectionName,
            rowIndex,
          });
          colSpan = c - cursor;
          break;
        }
      }

      const rowSpan = 1 + Math.max(0, entry.morerows || 0);
      const align = resolveAlign(entry, placement, columns[cursor]);
      const { char, charoff } = resolveCharAttrs(
        entry,
        placement,
        columns[cursor],
        align
      );

      cells.push({
        rowIndex,
        entryIndex: consumed,
        colStart: cursor,
        colSpan,
        rowSpan,
        align,
        valign: resolveValign(entry, row),
        char,
        charoff,
        colsep: resolveColsep(
          entry,
          placement,
          columns[cursor + colSpan - 1],
          table
        ),
        rowsep: resolveRowsep(entry, row, placement, columns[cursor], table),
        content: entry.content ?? "",
      });

      if (rowSpan > 1) {
        for (let c = cursor; c < cursor + colSpan; c += 1) {
          occupancy[c] = { remaining: rowSpan - 1 };
        }
      }

      cursor += colSpan;
      consumed += 1;
    }

    if (consumed < entries.length) {
      errors.push({
        code: "extra-entries",
        message: `${sectionName} row ${rowIndex} has more entries than fit in ${cols} columns; extras were dropped`,
        section: sectionName,
        rowIndex,
      });
    }

    resolvedRows.push({
      rowIndex,
      valign: row.valign,
      rowsep: row.rowsep,
      cells,
    });
  });

  const stillCovered = occupancy.some((slot) => slot && slot.remaining > 0);
  if (stillCovered) {
    warnings.push({
      code: "morerows-overflow",
      message: `${sectionName} has a cell whose morerows extends past the last row`,
      section: sectionName,
    });
  }

  return resolvedRows;
}

const STAR_WIDTH = /^(\d+(?:\.\d+)?)\*$/;

/** Best-effort CALS colwidth -> CSS width. Proportional ("N*") widths are converted to percentages of the star-column pool; fixed units pass through as-is. Combined "N*+Munit" forms are not supported. */
function resolveColumnWidths(columns) {
  const stars = columns.map((col) => {
    const match =
      typeof col.colwidth === "string" ? col.colwidth.match(STAR_WIDTH) : null;
    return match ? Number.parseFloat(match[1]) : null;
  });
  const starTotal = stars.reduce((sum, n) => sum + (n || 0), 0);

  return columns.map((col, index) => {
    const star = stars[index];
    if (star !== null) {
      return starTotal > 0
        ? `${((star / starTotal) * 100).toFixed(4)}%`
        : undefined;
    }
    if (typeof col.colwidth === "string" && col.colwidth.length > 0) {
      return col.colwidth;
    }
    return undefined;
  });
}

/**
 * Resolves a CALS table object into a rendering-ready grid. Never throws -
 * anomalies are collected into `errors` (data problems that were worked
 * around) and `warnings` (expected/recoverable situations like a gap cell).
 */
export function resolveLayout(table) {
  const errors = [];
  const warnings = [];

  const safeTable = table && typeof table === "object" ? table : {};
  const tgroup =
    safeTable.tgroup && typeof safeTable.tgroup === "object"
      ? safeTable.tgroup
      : {};
  const colspecs = Array.isArray(tgroup.colspecs) ? tgroup.colspecs : [];

  const columns = resolveColumns(colspecs, errors);
  const cols = columns.length;

  if (typeof tgroup.cols === "number" && tgroup.cols !== cols) {
    errors.push({
      code: "cols-mismatch",
      message: `tgroup.cols (${tgroup.cols}) does not match the number of colspecs (${cols})`,
    });
  }

  const byName = buildColumnIndex(columns);
  const spanMap = resolveSpanspecs(tgroup.spanspecs, byName, errors);

  const frame = VALID_FRAMES.includes(safeTable.frame)
    ? safeTable.frame
    : "all";
  if (safeTable.frame && !VALID_FRAMES.includes(safeTable.frame)) {
    errors.push({
      code: "invalid-frame",
      message: `Unknown frame value "${safeTable.frame}"; defaulted to "all"`,
    });
  }

  const sections = [];
  for (const name of SECTION_NAMES) {
    const section = tgroup[name];
    const rows = section && Array.isArray(section.rows) ? section.rows : [];
    if (name === "tbody" && rows.length === 0) {
      errors.push({
        code: "missing-tbody",
        message: "tgroup.tbody must have at least one row",
      });
    }
    if (rows.length === 0) continue;
    sections.push({
      name,
      rows: resolveSection(
        name,
        rows,
        columns,
        byName,
        spanMap,
        safeTable,
        errors,
        warnings
      ),
    });
  }

  return {
    frame,
    title: safeTable.title,
    pgwide: Boolean(safeTable.pgwide),
    columns,
    columnWidths: resolveColumnWidths(columns),
    sections,
    errors,
    warnings,
  };
}

/** Convenience wrapper for callers that only want the diagnostics, e.g. an editor "check my table" affordance. */
export function validateTable(table) {
  const { errors, warnings } = resolveLayout(table);
  return { errors, warnings };
}
