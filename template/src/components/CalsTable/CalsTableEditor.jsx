/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import CalsTableView from "./CalsTableView";
import { resolveLayout } from "./calsLayout.js";
import {
  createEmptyTable,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  mergeCells,
  splitCell,
} from "./calsOperations.js";
import { renderMarkdownCell } from "./markdownCell";

const FRAME_OPTIONS = ["all", "sides", "top", "bottom", "topbot", "none"];

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

  function commitEdit() {
    if (!editingCell) return;
    const { section, rowIndex, colStart, draft } = editingCell;
    const raw = table.tgroup[section]?.rows[rowIndex];
    if (raw) {
      const resolved = resolveLayout(table);
      const resolvedRow = resolved.sections
        .find((s) => s.name === section)
        ?.rows.find((r) => r.rowIndex === rowIndex);
      const cell = resolvedRow?.cells.find((c) => c.colStart === colStart);
      if (cell && cell.entryIndex !== null) {
        const nextTable = JSON.parse(JSON.stringify(table));
        nextTable.tgroup[section].rows[rowIndex].entries[
          cell.entryIndex
        ].content = draft;
        input.onChange(nextTable);
      }
    }
    setEditingCell(null);
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

  const activeSection = selection?.section;

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
        </label>
        <label style={settingLabelStyle}>
          <input
            type="checkbox"
            checked={Boolean(table.pgwide)}
            onChange={(e) => updateTable({ pgwide: e.target.checked })}
          />
          Page-wide
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
