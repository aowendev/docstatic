/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

const StatusField = wrapFieldsWithMeta(({ input, field, tinaForm }) => {
  // All boolean field names involved in the workflow
  const allBooleans = [
    "draft",
    "review",
    "translate",
    "approved",
    "published",
    "unlisted",
  ];

  // Each workflow status maps to exactly which booleans should be true
  const statusMap = {
    draft:     { draft: true,  review: false, translate: false, approved: false, published: false, unlisted: false },
    review:    { draft: false, review: true,  translate: false, approved: false, published: false, unlisted: true  },
    translate: { draft: false, review: false, translate: true,  approved: false, published: false, unlisted: true  },
    approved:  { draft: false, review: false, translate: false, approved: true,  published: true,  unlisted: false },
    published: { draft: false, review: false, translate: false, approved: false, published: true,  unlisted: false },
    unlisted:  { draft: false, review: false, translate: false, approved: false, published: false, unlisted: true  },
  };

  // The UI options in display order
  const statusOptions = ["draft", "review", "translate", "approved", "published", "unlisted"];

  // Determine which single workflow status is currently active based on the boolean combination
  const getCurrentStatus = () => {
    const vals = {};
    for (const b of allBooleans) {
      vals[b] = tinaForm.values[b] === true;
    }

    // Match against statusMap in reverse-priority order (most specific first)
    // Order matters: approved (published+approved) must be checked before published (published only)
    const checkOrder = ["review", "translate", "approved", "published", "unlisted", "draft"];
    for (const status of checkOrder) {
      const expected = statusMap[status];
      const match = allBooleans.every((b) => !!expected[b] === !!vals[b]);
      if (match) return status;
    }

    // Fallback: if no exact match, use priority-based detection
    if (vals.approved && vals.published) return "approved";
    if (vals.translate && vals.unlisted) return "translate";
    if (vals.review && vals.unlisted) return "review";
    if (vals.published) return "published";
    if (vals.unlisted) return "unlisted";
    return "draft";
  };

  const activeStatus = getCurrentStatus();

  const handleStatusChange = (selectedStatus) => {
    const mapping = statusMap[selectedStatus];
    for (const boolField of allBooleans) {
      tinaForm.change(boolField, mapping[boolField]);
    }
  };

  const statusLabels = {
    draft: "Draft",
    review: "In Review",
    translate: "In Translation",
    approved: "Translation Approved",
    published: "Published",
    unlisted: "Unlisted",
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800 border-gray-300",
    review: "bg-yellow-100 text-yellow-800 border-yellow-300",
    translate: "bg-orange-100 text-orange-800 border-orange-300",
    approved: "bg-blue-100 text-blue-800 border-blue-300",
    published: "bg-green-100 text-green-800 border-green-300",
    unlisted: "bg-purple-100 text-purple-800 border-purple-300",
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statusOptions.map((status) => {
          const isActive = activeStatus === status;
          const baseClasses =
            "relative flex items-center justify-center px-4 py-3 text-sm font-medium border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md";
          const activeClasses = isActive
            ? `${statusColors[status]} border-opacity-100 shadow-sm`
            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300";

          return (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`${baseClasses} ${activeClasses}`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isActive ? "bg-current border-current" : "border-gray-300"
                  }`}
                >
                  {isActive && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <span>{statusLabels[status]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default StatusField;
