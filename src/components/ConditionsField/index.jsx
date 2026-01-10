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
        backgroundColor: "#f8f9fa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Selected Conditions Display */}
      {selectedConditions.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Selected ({selectedConditions.length})
            </span>
            <button
              type="button"
              onClick={() => input.onChange([])}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedConditions.map((condition) => {
              return (
                <span
                  key={condition}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {condition}
                  <button
                    type="button"
                    onClick={() => {
                      const newConditions = selectedConditions.filter(
                        (c) => c !== condition
                      );
                      input.onChange(newConditions);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tree Content */}
      <div className="border border-gray-300 rounded-md max-h-80 overflow-y-auto bg-white">
        <div className="p-2">
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
                className="flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
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

                <span
                  onClick={() => toggleCategory(category)}
                  className="flex-1 text-left text-sm cursor-pointer select-none"
                >
                  {category}
                </span>

              </div>

              {/* Category Conditions */}
              {isExpanded && (
                <div className="tree-children">
                  {conditions.map((condition) => {
                    const isSelected = selectedConditions.includes(condition.value);
                    return (
                      <div
                        key={condition.value}
                        className={`flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer ${
                          isSelected ? "bg-blue-50 text-blue-700" : ""
                        }`}
                        style={{ paddingLeft: "40px" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleConditionToggle(condition.value)}
                          className="flex-1 text-left text-sm"
                        >
                          <span className={`${isSelected ? "font-medium" : ""}`}>
                            {condition.label}
                          </span>
                          {condition.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {condition.description}
                            </div>
                          )}
                        </button>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => handleConditionToggle(condition.value)}
                            className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
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
      </div>
    </div>
  );
});

ConditionsTreeField.displayName = "ConditionsTreeField";

export default ConditionsTreeField;
