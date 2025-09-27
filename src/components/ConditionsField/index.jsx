/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";

const ConditionsTreeField = wrapFieldsWithMeta(({ input, field }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set()); // Start with all categories collapsed
  const selectedConditions = input.value || [];

  // Build tree structure from conditions data
  const conditionsTree = useMemo(() => {
    const tree = {};

    // Get conditions data from the imported conditions file
    if (typeof window !== "undefined" && window.conditionsData) {
      const categories = window.conditionsData.categories || [];
      for (const category of categories) {
        tree[category.name] =
          category.conditions?.map((cond) => ({
            value: cond.condition,
            label: cond.condition,
            description: cond.description,
            active: cond.active !== false,
          })) || [];
      }
    } else {
      // Fallback: parse from field options
      if (field.options && Array.isArray(field.options)) {
        for (const option of field.options) {
          const match = option.label?.match(/^(.+?) \((.+?)\)$/);
          if (match) {
            const [, condition, category] = match;
            if (!tree[category]) {
              tree[category] = [];
            }
            tree[category].push({
              value: option.value,
              label: condition,
              description: `${condition} condition`,
            });
          } else {
            // Simple option without category
            if (!tree.Other) {
              tree.Other = [];
            }
            tree.Other.push({
              value: option.value,
              label: option.label || option.value,
              description: option.description || `${option.value} condition`,
            });
          }
        }
      }
    }

    return tree;
  }, [field.options]);

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleConditionToggle = (conditionValue) => {
    try {
      const newConditions = selectedConditions.includes(conditionValue)
        ? selectedConditions.filter((c) => c !== conditionValue)
        : [...selectedConditions, conditionValue];

      input.onChange(newConditions);
    } catch (error) {
      // Silent error handling for production
    }
  };

  const handleCategoryToggle = (category, conditions) => {
    try {
      const categoryValues = conditions.map((c) => c.value);
      const allSelected = categoryValues.every((value) =>
        selectedConditions.includes(value)
      );

      let newConditions;
      if (allSelected) {
        // Deselect all conditions in this category
        newConditions = selectedConditions.filter(
          (c) => !categoryValues.includes(c)
        );
      } else {
        // Select all conditions in this category
        const toAdd = categoryValues.filter(
          (value) => !selectedConditions.includes(value)
        );
        newConditions = [...selectedConditions, ...toAdd];
      }

      input.onChange(newConditions);
    } catch (error) {
      // Silent error handling for production
    }
  };

  const getCategoryStatus = (conditions) => {
    const categoryValues = conditions.map((c) => c.value);
    const selectedCount = categoryValues.filter((value) =>
      selectedConditions.includes(value)
    ).length;
    const totalCount = categoryValues.length;

    if (selectedCount === 0) return "none";
    if (selectedCount === totalCount) return "all";
    return "some";
  };

  return (
    <div
      style={{
        border: "1px solid #e1e5e9",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e1e5e9",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px 6px 0 0",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Conditions</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "500",
              backgroundColor:
                selectedConditions.length > 0 ? "#0ea5e9" : "#94a3b8",
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              minWidth: "24px",
              textAlign: "center",
            }}
          >
            {selectedConditions.length}
          </span>
        </div>
      </div>

      {/* Tree Content */}
      <div style={{ maxHeight: "400px", overflowY: "auto", padding: "8px" }}>
        {Object.entries(conditionsTree).map(([category, conditions]) => {
          const isExpanded = expandedCategories.has(category);
          const categoryStatus = getCategoryStatus(conditions);
          const selectedInCategory = conditions.filter((c) =>
            selectedConditions.includes(c.value)
          ).length;

          return (
            <div key={category} style={{ marginBottom: "4px" }}>
              {/* Category Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "13px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.15s ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                    padding: "2px",
                  }}
                >
                  ▶
                </button>

                <input
                  type="checkbox"
                  checked={categoryStatus === "all"}
                  ref={(input) => {
                    if (input) input.indeterminate = categoryStatus === "some";
                  }}
                  onChange={() => handleCategoryToggle(category, conditions)}
                  style={{
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                />

                <span
                  onClick={() => toggleCategory(category)}
                  style={{
                    flex: 1,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  📁 {category}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    color: selectedInCategory > 0 ? "#0ea5e9" : "#94a3b8",
                    backgroundColor:
                      selectedInCategory > 0 ? "#e0f2fe" : "#f1f5f9",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    minWidth: "28px",
                    textAlign: "center",
                    border: `1px solid ${selectedInCategory > 0 ? "#0ea5e9" : "#cbd5e1"}`,
                  }}
                >
                  {selectedInCategory}/{conditions.length}
                </span>
              </div>

              {/* Category Conditions */}
              {isExpanded && (
                <div
                  style={{
                    marginLeft: "20px",
                    marginTop: "4px",
                    borderLeft: "2px solid #e2e8f0",
                    paddingLeft: "12px",
                  }}
                >
                  {conditions.map((condition) => (
                    <label
                      key={condition.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "6px 8px",
                        margin: "2px 0",
                        fontSize: "13px",
                        borderRadius: "3px",
                        backgroundColor: selectedConditions.includes(
                          condition.value
                        )
                          ? "#eff6ff"
                          : "transparent",
                        border: selectedConditions.includes(condition.value)
                          ? "1px solid #dbeafe"
                          : "1px solid transparent",
                        transition: "all 0.1s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition.value)}
                        onChange={() => handleConditionToggle(condition.value)}
                        style={{ margin: 0, cursor: "pointer" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: selectedConditions.includes(condition.value)
                              ? "#1e40af"
                              : "#374151",
                            fontWeight: selectedConditions.includes(
                              condition.value
                            )
                              ? "500"
                              : "400",
                          }}
                        >
                          {condition.label}
                        </div>
                        {condition.description && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              marginTop: "1px",
                            }}
                          >
                            {condition.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(conditionsTree).length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
              fontSize: "13px",
            }}
          >
            No conditions available
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {selectedConditions.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e1e5e9",
            backgroundColor: "#f0f9ff",
            borderRadius: "0 0 6px 6px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#0369a1",
              fontWeight: "500",
            }}
          >
            Selected: {selectedConditions.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
});

ConditionsTreeField.displayName = "ConditionsTreeField";

export default ConditionsTreeField;
