/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";

/**
 * Generic collapsible wrapper for TinaCMS fields.
 */
const CollapsibleField = wrapFieldsWithMeta(({ 
  input, 
  field, 
  tinaForm, 
  meta,
  FieldComponent,
  defaultCollapsed = false,
  ...props 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (!FieldComponent) {
    return null;
  }

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const hasValue = input.value && (
    Array.isArray(input.value) ? input.value.length > 0 : 
    typeof input.value === 'string' ? input.value.trim() !== '' : 
    true
  );

  return (
    <>
      {/* Toggle button positioned independently */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="relative float-left -ml-6 flex items-center p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-150 z-20"
        title={isCollapsed ? "Show field" : "Hide field"}
        style={{ marginTop: '-1.625rem' }}
      >
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${
            isCollapsed ? "rotate-0" : "rotate-90"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      
      <div className="relative" style={{ minHeight: isCollapsed && !hasValue ? '0' : '2rem' }}>

      {/* Description if provided */}
      {field.description && !isCollapsed && (
        <p className="text-sm text-gray-500 mb-2">{field.description}</p>
      )}

      {/* Value preview when collapsed */}
      {isCollapsed && hasValue && (
        <div className="mb-2 p-2 bg-gray-50 rounded text-sm text-gray-600 border-l-3 border-blue-400">
          <div className="font-medium text-xs uppercase tracking-wide text-gray-400 mb-1">
            Current Value:
          </div>
          <div className="truncate">
            {Array.isArray(input.value) 
              ? `${input.value.length} item${input.value.length === 1 ? '' : 's'} selected`
              : String(input.value || 'Not set').substring(0, 100)
            }
          </div>
        </div>
      )}

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="transition-all duration-300 ease-in-out" style={{ marginTop: '-1.56rem', backgroundColor: 'rgba(255, 255, 0, 0.3)'}}>
          <FieldComponent
            input={input}
            field={{
              ...field,
              name: field.name
            }}
            tinaForm={tinaForm}
            meta={meta}
            {...props}
          />
        </div>
      )}

      {/* Error display */}
      {meta?.touched && meta?.error && (
        <div className="mt-1 text-sm text-red-600">{meta.error}</div>
      )}
      </div>
    </>
  );
});

export default CollapsibleField;