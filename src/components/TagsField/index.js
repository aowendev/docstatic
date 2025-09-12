import React, { useState, useMemo } from "react";
import { wrapFieldsWithMeta } from "tinacms";

const TagsField = wrapFieldsWithMeta(({ input, field, tinaForm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [viewMode, setViewMode] = useState("search"); // 'tree' or 'search'

  const allTags = field.options || [];
  const selectedTags = input.value || [];

  // Build tree structure from tags
  const tagTree = useMemo(() => {
    const tree = {};

    for (const tag of allTags) {
      const parts = tag.split("_");
      let currentLevel = tree;
      let path = "";

      for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        path = path ? `${path}_${part}` : part;

        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            fullPath: path,
            children: {},
            isLeaf: index === parts.length - 1,
            level: index,
          };
        }

        currentLevel = currentLevel[part].children;
      }
    }

    return tree;
  }, [allTags]);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    return allTags.filter(
      (tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTags.includes(tag)
    );
  }, [allTags, searchTerm, selectedTags]);

  // Group tags by category (for search mode)
  const groupedTags = useMemo(() => {
    const groups = {};
    for (const tag of filteredTags) {
      const category = tag.split("_")[0] || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(tag);
    }
    return groups;
  }, [filteredTags]);

  // Get all parent paths for a given tag
  const getParentPaths = (tagPath) => {
    const parts = tagPath.split("_");
    const parents = [];
    for (let i = 1; i <= parts.length; i++) {
      parents.push(parts.slice(0, i).join("_"));
    }
    return parents;
  };

  const addTag = (tag) => {
    const parentPaths = getParentPaths(tag);
    const newTags = [...new Set([...selectedTags, ...parentPaths])];
    input.onChange(newTags);
    setSearchTerm("");
  };

  const removeTag = (tagToRemove) => {
    // Remove the tag and any children
    const newTags = selectedTags.filter(
      (tag) => tag !== tagToRemove && !tag.startsWith(`${tagToRemove}_`)
    );
    input.onChange(newTags);
  };

  const clearAllTags = () => {
    input.onChange([]);
  };

  const toggleExpanded = (nodePath) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isExpanded = expandedNodes.has(node.fullPath);
    const isSelected = selectedTags.includes(node.fullPath);
    const hasSelectedChildren = selectedTags.some((tag) =>
      tag.startsWith(`${node.fullPath}_`)
    );

    return (
      <div key={node.fullPath} className="tree-node">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer ${
            isSelected ? "bg-blue-50 text-blue-700" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(node.fullPath)}
              className="mr-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <button
            type="button"
            onClick={() =>
              isSelected ? removeTag(node.fullPath) : addTag(node.fullPath)
            }
            className="flex-1 text-left text-sm"
          >
            <span className={`${isSelected ? "font-medium" : ""}`}>
              {node.name}
            </span>
            {hasSelectedChildren && !isSelected && (
              <span className="ml-2 text-xs text-blue-600">•</span>
            )}
          </button>

          {isSelected && (
            <button
              type="button"
              onClick={() => removeTag(node.fullPath)}
              className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children">
            {Object.values(node.children).map((child) =>
              renderTreeNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* View Mode Toggle */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode("search")}
          className={`px-3 py-1 text-xs rounded ${
            viewMode === "search"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}
        >
          Search Mode
        </button>
        <button
          type="button"
          onClick={() => setViewMode("tree")}
          className={`px-3 py-1 text-xs rounded ${
            viewMode === "tree"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}
        >
          Tree View
        </button>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Selected ({selectedTags.length})
            </span>
            <button
              type="button"
              onClick={clearAllTags}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => {
              const parts = tag.split("_");
              const level = parts.length;

              // Determine color based on hierarchy level
              let colorClass;
              if (level === 1) {
                colorClass = "bg-blue-100 text-blue-800"; // Top level
              } else if (level === 2) {
                colorClass = "bg-purple-100 text-purple-800"; // Mid level
              } else {
                colorClass = "bg-green-100 text-green-800"; // Leaf level (3+)
              }

              return (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className={`ml-1 ${
                      level === 1
                        ? "text-blue-600 hover:text-blue-800"
                        : level === 2
                          ? "text-purple-600 hover:text-purple-800"
                          : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {viewMode === "tree" ? (
        // Tree View
        <div className="border border-gray-300 rounded-md max-h-80 overflow-y-auto bg-white">
          <div className="p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                Tag Hierarchy
              </span>
              <button
                type="button"
                onClick={() => {
                  const allPaths = allTags
                    .map((tag) => {
                      const parts = tag.split("_");
                      return parts.slice(0, -1).join("_");
                    })
                    .filter(Boolean);
                  setExpandedNodes(new Set(allPaths));
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Expand All
              </button>
            </div>

            <div className="tree-container">
              {Object.values(tagTree).map((node) => renderTreeNode(node))}
            </div>
          </div>
        </div>
      ) : (
        // Search Mode
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search tags..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Search Dropdown */}
          {isOpen && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {Object.keys(groupedTags).length > 0 ? (
                Object.entries(groupedTags).map(([category, tags]) => (
                  <div key={category}>
                    <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide border-b">
                      {category.replace("_", " ")}
                    </div>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                      >
                        <span className="font-medium">{tag}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Includes: {getParentPaths(tag).join(" → ")}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No tags found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popular Tags Quick Select (only in search mode) */}
      {viewMode === "search" &&
        searchTerm === "" &&
        selectedTags.length === 0 && (
          <div className="mt-3">
            <span className="text-xs font-semibold text-gray-700 mb-2 block">
              Popular Tags
            </span>
            <div className="flex flex-wrap gap-1">
              {["customers", "teams", "a3-features", "components", "regions"]
                .filter((tag) => allTags.some((t) => t.startsWith(tag)))
                .map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSearchTerm(category)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>
        )}

      {/* Click outside handler for search mode */}
      {viewMode === "search" && isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
});

export default TagsField;
