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
      
      <div className={`relative ${isCollapsed ? 'h-0 overflow-hidden' : ''}`} style={{ 
        minHeight: isCollapsed ? '0' : '2rem',
        margin: isCollapsed ? '0' : undefined,
        padding: isCollapsed ? '0' : undefined
      }}>

        {/* Collapsible content */}
        {!isCollapsed && (
          <div className="transition-all duration-300 ease-in-out" style={{ marginTop: '-1.56rem' }}>
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