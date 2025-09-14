/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

const StatusField = wrapFieldsWithMeta(({ input, field, tinaForm }) => {
  const statusFields = [
    "draft",
    "review",
    "translate",
    "approved",
    "published",
    "unlisted",
  ];

  // Get current status values from the form
  const getCurrentStatus = () => {
    for (const statusField of statusFields) {
      if (tinaForm.values[statusField] === true) {
        return statusField;
      }
    }
    return "draft"; // default
  };

  const activeStatus = getCurrentStatus();

  const handleStatusChange = (selectedStatus) => {
    // Update all status fields
    for (const field of statusFields) {
      const fieldValue = field === selectedStatus;

      // Use the form's change method to update each field
      tinaForm.change(field, fieldValue);
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
        {statusFields.map((status) => {
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
