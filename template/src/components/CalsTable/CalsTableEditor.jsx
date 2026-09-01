/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import variableSetsData from "../../../reuse/variableSets/index.json";
import CalsTableView from "./CalsTableView";
import { resolveLayout } from "./calsLayout.js";
import {
  createEmptyTable,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  mergeCells,
  setColumnAttributes,
  setEntryAttributes,
  splitCell,
} from "./calsOperations.js";
import { renderMarkdownCell } from "./markdownCell";

const FRAME_OPTIONS = ["all", "sides", "top", "bottom", "topbot", "none"];

/**
 * CALS carries alignment at three levels - the entry, its spanspec and its
 * colspec - and the grid has to be able to write the two an author picks cells
 * and columns for. Without them the only alignment control in the CMS would be
 * the site-wide default in Settings, which would flatten a per-cell model into
 * one switch and leave the rest reachable only by hand-editing MDX.
 *
 * "Inherit" writes nothing, which is what lets a cell fall through to its
 * column, and a column to the site setting. `char` - CALS decimal alignment -
 * is deliberately absent: it is meaningless without the `char`/`charoff`
 * attributes that say what to align on, and remains settable in MDX.
 */
const ALIGN_OPTIONS = [
  { value: "", label: "Inherit" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

const VALIGN_OPTIONS = [
  { value: "", label: "Inherit" },
  { value: "top", label: "Top" },
  { value: "middle", label: "Middle" },
  { value: "bottom", label: "Bottom" },
];

/**
 * Every variable an author can drop into a cell, read the same way
 * VariableSet's own template reads it - a static import, because a Tina
 * template is bundled for the browser and cannot reach the filesystem. The
 * "Excluded" set is the one VariableSet's picker hides too.
 */
const VARIABLE_OPTIONS = (
  Array.isArray(variableSetsData?.variableSets)
    ? variableSetsData.variableSets
    : []
)
  .filter((set) => set.name !== "Excluded")
  .flatMap((set) =>
    (set.variables ?? []).map((variable) => ({
      value: `${set.name}_${variable.key}`,
      label: `${variable.key} (${set.name})`,
    }))
  );

/**
 * A cell holds Markdown, so a variable goes in as the same element the CMS
 * writes into a paragraph - see remarkVariables.js for why the syntax is
 * shared rather than shortened for tables.
 */
function variableElement(variableSelection) {
  return `<VariableSet variableSelection="${variableSelection}" />`;
}

/**
 * Appends a variable to text that may already have some, keeping one space
 * between them so two variables in a row do not run together as one word.
 */
function appendVariable(existing, variableSelection) {
  const text = existing ?? "";
  const separator = text && !text.endsWith(" ") ? " " : "";
  return `${text}${separator}${variableElement(variableSelection)}`;
}

/**
 * The picker itself, used once for the title and once for the selected cells.
 *
 * Controlled at "" so it returns to its prompt after each choice: it performs
 * an action rather than holding a value, and a select left showing the last
 * variable would suggest the field now *is* that variable.
 */
function VariablePicker({ onPick, disabled, label }) {
  return (
    <select
      aria-label={label}
      value=""
      disabled={disabled}
      onChange={(event) => onPick(event.target.value)}
    >
      <option value="">Insert…</option>
      {VARIABLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Deliberately inline styles, not CSS Modules: Tina's admin runs as a
// separate Vite-bundled app that doesn't process this project's CSS Modules,
// so a `styles.module.css` class name here would silently resolve to
// nothing and every control would render unstyled (this happened - see the
// git history for this file).
const containerStyle = {
  border: "1px solid #e1ddec",
  borderRadius: "4px",
  padding: "1rem",
  background: "#fff",
};

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "0.75rem",
};

const settingLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.85rem",
};

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
};

const buttonStyle = {
  fontSize: "0.8rem",
  padding: "0.35rem 0.65rem",
  cursor: "pointer",
  border: "1px solid #c9c5d6",
  borderRadius: "4px",
  background: "#f4f2f9",
  color: "#241748",
};

const buttonDisabledStyle = {
  ...buttonStyle,
  cursor: "not-allowed",
  opacity: 0.45,
};

const confirmBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.85rem",
  padding: "0.5rem 0.75rem",
  marginBottom: "0.75rem",
  background: "#fff4e5",
  border: "1px solid #f0c36d",
  borderRadius: "4px",
};

const columnHeaderRowStyle = {
  display: "flex",
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "0.25rem",
};

const columnHeaderCellStyle = { flex: 1, padding: "0 0.75rem" };

const selectedCellStyle = {
  outline: "2px solid #2296fe",
  outlineOffset: "-2px",
};

const cellButtonStyle = {
  cursor: "pointer",
  userSelect: "none",
};

const cellEditorStyle = {
  width: "100%",
  minHeight: "2.5rem",
  font: "inherit",
  border: "none",
  resize: "vertical",
};

function ToolbarButton({ disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={disabled ? buttonDisabledStyle : buttonStyle}
    >
      {children}
    </button>
  );
}

function cellRect(cell) {
  return {
    rowStart: cell.rowIndex,
    rowEnd: cell.rowIndex + cell.rowSpan - 1,
    colStart: cell.colStart,
    colEnd: cell.colStart + cell.colSpan - 1,
  };
}

function unionRect(a, b) {
  return {
    rowStart: Math.min(a.rowStart, b.rowStart),
    rowEnd: Math.max(a.rowEnd, b.rowEnd),
    colStart: Math.min(a.colStart, b.colStart),
    colEnd: Math.max(a.colEnd, b.colEnd),
  };
}

function isWithin(rect, rowIndex, colStart) {
  return (
    rowIndex >= rect.rowStart &&
    rowIndex <= rect.rowEnd &&
    colStart >= rect.colStart &&
    colStart <= rect.colEnd
  );
}

/** Applies `mutator(table, ...)` and commits the result via `input.onChange`, ignoring rejected operations. */
function applyOperation(input, mutator, ...args) {
  const result = mutator(input.value, ...args);
  if (result.ok === false) return result;
  input.onChange(result.table);
  return result;
}

const CalsTableEditor = wrapFieldsWithMeta(({ input }) => {
  const [selection, setSelection] = useState(null); // { section, ...rect }
  const [dragging, setDragging] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { section, rowIndex, colStart, draft }
  const [pendingMerge, setPendingMerge] = useState(null); // { discardedCount } - awaiting inline confirmation

  // Only ever runs once per mount to seed a brand-new embed - input.value
  // changing afterwards should not re-trigger this.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-once seed effect, see comment above
  useEffect(() => {
    if (!input.value) {
      input.onChange(createEmptyTable());
    }
  }, []);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMouseUp = () => setDragging(false);
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [dragging]);

  const table = input.value;
  if (!table) return null; // waiting for the seed effect above to run

  const layout = resolveLayout(table);

  function updateTable(patch) {
    input.onChange({ ...table, ...patch });
  }

  function pickCell(section, cell, extend) {
    const rect = cellRect(cell);
    setPendingMerge(null);
    if (extend && selection && selection.section === section) {
      setSelection({ section, ...unionRect(selection, rect) });
    } else {
      setSelection({ section, ...rect });
    }
  }

  /**
   * Writes one cell's content back. A resolved cell knows which entry in the
   * raw row it came from (`entryIndex`), which is the only reliable way back:
   * a row's entries do not line up with columns once anything spans, and a
   * gap-filling placeholder cell has no entry at all.
   */
  function writeCellContent(section, rowIndex, entryIndex, content) {
    if (entryIndex === null || entryIndex === undefined) return;
    if (!table.tgroup[section]?.rows[rowIndex]) return;
    const nextTable = JSON.parse(JSON.stringify(table));
    nextTable.tgroup[section].rows[rowIndex].entries[entryIndex].content =
      content;
    input.onChange(nextTable);
  }

  function commitEdit() {
    if (!editingCell) return;
    const { section, rowIndex, colStart, draft } = editingCell;
    const cell = resolveLayout(table)
      .sections.find((s) => s.name === section)
      ?.rows.find((r) => r.rowIndex === rowIndex)
      ?.cells.find((c) => c.colStart === colStart);
    if (cell) {
      writeCellContent(section, rowIndex, cell.entryIndex, draft);
    }
    setEditingCell(null);
  }

  /**
   * Appends a variable to the selected cell rather than inserting at a caret:
   * the picker lives in the toolbar, and clicking it would take focus out of
   * the cell editor and commit the edit before the choice was made. Every
   * other toolbar control acts on the selection too, so this is the behaviour
   * the rest of the editor has already taught.
   */
  function insertVariable(variableSelection) {
    if (!variableSelection || !selectedSingleCell) return;
    writeCellContent(
      activeSection,
      selectedSingleCell.rowIndex,
      selectedSingleCell.entryIndex,
      appendVariable(selectedSingleCell.content, variableSelection)
    );
  }

  /**
   * The title's picker appends rather than inserting at the caret, for the
   * same reason the cell one does: choosing from a select takes focus out of
   * the text field, so there is no caret left to insert at by the time the
   * choice arrives.
   */
  function insertTitleVariable(variableSelection) {
    if (!variableSelection) return;
    updateTable({ title: appendVariable(table.title, variableSelection) });
  }

  function getCellProps(cell, section) {
    const isSelected =
      selection?.section === section &&
      isWithin(selection, cell.rowIndex, cell.colStart);
    return {
      style: isSelected ? selectedCellStyle : cellButtonStyle,
      onMouseDown: (event) => {
        setDragging(true);
        pickCell(section, cell, event.shiftKey);
      },
      onMouseEnter: () => {
        if (dragging) pickCell(section, cell, true);
      },
      onDoubleClick: () => {
        setEditingCell({
          section,
          rowIndex: cell.rowIndex,
          colStart: cell.colStart,
          draft: cell.content,
        });
      },
    };
  }

  function renderCell(cell, section) {
    const isEditing =
      editingCell?.section === section &&
      editingCell.rowIndex === cell.rowIndex &&
      editingCell.colStart === cell.colStart;
    if (isEditing) {
      return (
        <textarea
          // biome-ignore lint/a11y/noAutofocus: opening the editor for this exact cell is the user's just-taken action
          autoFocus
          style={cellEditorStyle}
          value={editingCell.draft}
          onChange={(e) =>
            setEditingCell({ ...editingCell, draft: e.target.value })
          }
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditingCell(null);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit();
          }}
        />
      );
    }
    return renderMarkdownCell(cell.content);
  }

  // The caption resolves variables the same way a cell does, so the preview
  // shows what the page will. `inline` drops the paragraph a caption has no
  // use for; the locale is the site default, which is all Tina's admin can
  // honestly claim to be showing.
  function renderTitle(title) {
    return renderMarkdownCell(title, { inline: true });
  }

  const activeSection = selection?.section;

  // Read off the resolved columns rather than the raw colspecs: a column the
  // author never declared has no colspec to read, and resolveLayout has
  // already invented one for it.
  const columnAlignValue = (() => {
    if (!selection) return "";
    const covered = layout.columns.slice(
      selection.colStart,
      selection.colEnd + 1
    );
    const first = covered[0]?.align ?? "";
    return covered.every((column) => (column.align ?? "") === first)
      ? first
      : "";
  })();

  // A merged cell's own rect already spans multiple rows/cols, so "is the
  // selection exactly one existing cell" can't be tested with
  // rowStart===rowEnd - it has to be matched against every cell's actual
  // rect instead. This same lookup answers both Merge (disabled when the
  // selection is just a single cell, merged or not - there's nothing new to
  // combine) and Split (enabled only when that single cell is itself merged).
  const selectedSingleCell =
    selection &&
    (() => {
      const sec = layout.sections.find((s) => s.name === activeSection);
      for (const row of sec?.rows || []) {
        for (const cell of row.cells) {
          const rect = cellRect(cell);
          if (
            rect.rowStart === selection.rowStart &&
            rect.rowEnd === selection.rowEnd &&
            rect.colStart === selection.colStart &&
            rect.colEnd === selection.colEnd
          ) {
            return cell;
          }
        }
      }
      return null;
    })();
  const canMerge =
    selection &&
    !selectedSingleCell &&
    mergeCells(table, activeSection, selection).ok !== false;
  const canSplit = Boolean(
    selectedSingleCell &&
      (selectedSingleCell.colSpan > 1 || selectedSingleCell.rowSpan > 1)
  );

  function runRowRange(mutator) {
    if (!selection) return;
    for (let r = selection.rowEnd; r >= selection.rowStart; r -= 1) {
      const result = mutator(input.value, activeSection, r);
      if (result.ok === false) return;
      input.onChange(result.table);
    }
    setSelection(null);
  }

  function runColRange(mutator) {
    if (!selection) return;
    for (let c = selection.colEnd; c >= selection.colStart; c -= 1) {
      const result = mutator(input.value, c);
      if (result.ok === false) return;
      input.onChange(result.table);
    }
    setSelection(null);
  }

  function commitMerge(sel) {
    const result = mergeCells(input.value, sel.section, sel);
    if (result.ok === false) return;
    input.onChange(result.table);
    setPendingMerge(null);
    setSelection({ ...sel });
  }

  /**
   * The value to show in a selection-wide picker: what every covered cell
   * agrees on, or blank when they differ. Blank therefore reads as "no single
   * answer" as well as "inherit" - picking a value still applies it to all of
   * them, which is the behaviour a multi-cell selection needs either way.
   */
  function sharedCellValue(attribute) {
    if (!selection) return "";
    const section = layout.sections.find((s) => s.name === activeSection);
    const covered = (section?.rows ?? [])
      .flatMap((row) => row.cells)
      .filter((cell) => isWithin(selection, cell.rowIndex, cell.colStart));
    if (covered.length === 0) return "";
    const first = covered[0][attribute] ?? "";
    return covered.every((cell) => (cell[attribute] ?? "") === first)
      ? first
      : "";
  }

  function setCellAttribute(attribute, value) {
    if (!selection) return;
    const result = setEntryAttributes(input.value, activeSection, selection, {
      [attribute]: value,
    });
    if (result.ok === false) return;
    input.onChange(result.table);
  }

  function setColumnAlign(value) {
    if (!selection) return;
    const result = setColumnAttributes(
      input.value,
      selection.colStart,
      selection.colEnd,
      { align: value }
    );
    if (result.ok === false) return;
    input.onChange(result.table);
  }

  function handleMerge() {
    if (!selection) return;
    const dryRun = mergeCells(table, activeSection, selection);
    if (dryRun.ok === false) return;
    const discarded = dryRun.warnings?.[0]?.discardedContent;
    if (discarded?.length) {
      // Native confirm() dialogs are jarring and, worse, block the whole
      // page (including automated testing) until dismissed - an inline
      // confirmation bar in the toolbar avoids both problems.
      setPendingMerge({ discardedCount: discarded.length });
      return;
    }
    commitMerge(selection);
  }

  function handleSplit() {
    if (!selection) return;
    applyOperation(
      input,
      splitCell,
      activeSection,
      selection.rowStart,
      selection.colStart
    );
    setSelection(null);
  }

  const sectionsPresent = new Set(layout.sections.map((s) => s.name));

  return (
    <div style={containerStyle}>
      <div style={toolbarStyle}>
        <label style={settingLabelStyle}>
          Frame
          <select
            value={table.frame || "all"}
            onChange={(e) => updateTable({ frame: e.target.value })}
          >
            {FRAME_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label style={settingLabelStyle}>
          Title
          <input
            type="text"
            value={table.title || ""}
            onChange={(e) => updateTable({ title: e.target.value })}
          />
          <VariablePicker
            label="Insert a variable into the title"
            onPick={insertTitleVariable}
          />
        </label>
        <label style={settingLabelStyle}>
          <input
            type="checkbox"
            checked={Boolean(table.pgwide)}
            onChange={(e) => updateTable({ pgwide: e.target.checked })}
          />
          Page-wide
        </label>
        <label style={settingLabelStyle}>
          Cell align
          <select
            value={sharedCellValue("align")}
            disabled={!selection}
            onChange={(e) => setCellAttribute("align", e.target.value)}
          >
            {ALIGN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={settingLabelStyle}>
          Cell vertical
          <select
            value={sharedCellValue("valign")}
            disabled={!selection}
            onChange={(e) => setCellAttribute("valign", e.target.value)}
          >
            {VALIGN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={settingLabelStyle}>
          Column align
          <select
            value={columnAlignValue}
            disabled={!selection}
            onChange={(e) => setColumnAlign(e.target.value)}
          >
            {ALIGN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={settingLabelStyle}>
          Cell variable
          <VariablePicker
            label="Insert a variable into the selected cell"
            disabled={!selectedSingleCell}
            onPick={insertVariable}
          />
        </label>
        <div style={buttonRowStyle}>
          <ToolbarButton disabled={!canMerge} onClick={handleMerge}>
            Merge
          </ToolbarButton>
          <ToolbarButton disabled={!canSplit} onClick={handleSplit}>
            Split
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() =>
              runRowRange((t, s, r) => insertRow(t, s, r, "before"))
            }
          >
            Insert Row Above
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() =>
              runRowRange((t, s, r) => insertRow(t, s, r, "after"))
            }
          >
            Insert Row Below
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() => runRowRange((t, s, r) => deleteRow(t, s, r))}
          >
            Delete Row
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() => runColRange((t, c) => insertColumn(t, c, "before"))}
          >
            Insert Column Left
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() => runColRange((t, c) => insertColumn(t, c, "after"))}
          >
            Insert Column Right
          </ToolbarButton>
          <ToolbarButton
            disabled={!selection}
            onClick={() => runColRange((t, c) => deleteColumn(t, c))}
          >
            Delete Column
          </ToolbarButton>
        </div>
      </div>

      {pendingMerge && (
        <div style={confirmBarStyle}>
          <span>
            Merging will discard the content of {pendingMerge.discardedCount}{" "}
            cell{pendingMerge.discardedCount === 1 ? "" : "s"}.
          </span>
          <ToolbarButton onClick={() => commitMerge(selection)}>
            Merge anyway
          </ToolbarButton>
          <ToolbarButton onClick={() => setPendingMerge(null)}>
            Cancel
          </ToolbarButton>
        </div>
      )}

      <div style={columnHeaderRowStyle}>
        {layout.columns.map((col) => (
          <span key={col.colname} style={columnHeaderCellStyle}>
            {col.colname}
          </span>
        ))}
      </div>

      {!sectionsPresent.has("thead") && (
        <ToolbarButton
          onClick={() => applyOperation(input, insertRow, "thead", -1, "after")}
        >
          + Add header row
        </ToolbarButton>
      )}

      <CalsTableView
        layout={layout}
        cellRenderer={renderCell}
        titleRenderer={renderTitle}
        getCellProps={getCellProps}
      />

      <div style={buttonRowStyle}>
        <ToolbarButton
          onClick={() =>
            applyOperation(
              input,
              insertRow,
              "tbody",
              layout.sections.find((s) => s.name === "tbody").rows.length - 1,
              "after"
            )
          }
        >
          + Add row
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            applyOperation(
              input,
              insertColumn,
              layout.columns.length - 1,
              "after"
            )
          }
        >
          + Add column
        </ToolbarButton>
        {!sectionsPresent.has("tfoot") && (
          <ToolbarButton
            onClick={() =>
              applyOperation(input, insertRow, "tfoot", -1, "after")
            }
          >
            + Add footer row
          </ToolbarButton>
        )}
      </div>
    </div>
  );
});

CalsTableEditor.displayName = "CalsTableEditor";

export default CalsTableEditor;
