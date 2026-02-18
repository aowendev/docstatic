/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";

const ConditionalText = ({
  action = "show", // "show" or "hide" when conditions are met
  conditions = [], // Required conditions to check (from template)
  logic = "any",
  languages = [], // Required languages to check
  languageLogic = "any",
  children = null,
  fallback = "",
  requireBothConditions = false,
  // debug = false,
}) => {
  // Get page conditions from document frontmatter
  let pageConditions = [];
  let currentLanguage = "en";

  try {
    // Get document metadata (conditions from frontmatter)
    const doc = useDoc();
    pageConditions = doc?.frontMatter?.conditions || [];
  } catch {
    // Not in a doc context, pageConditions stays empty
  }

  try {
    // Get current language from Docusaurus context
    const { i18n } = useDocusaurusContext();
    currentLanguage = i18n?.currentLocale || "en";
  } catch {
    // Context not available, use default
  }

  // Check if required conditions are met against page metadata conditions
  const checkConditionsMet = () => {
    if (conditions.length === 0) return true;

    if (logic === "all") {
      // All required conditions must be present in page metadata
      return conditions.every((condition) => pageConditions.includes(condition));
    }
    // Any required condition must be present in page metadata
    return conditions.some((condition) => pageConditions.includes(condition));
  };

  // Check if language conditions are satisfied
  const checkLanguageConditions = () => {
    if (languages.length === 0) return true;

    if (languageLogic === "all") {
      // For 'all' logic, current language must be in the list
      return languages.includes(currentLanguage);
    }
    // For 'any' logic, current language must match at least one
    return languages.includes(currentLanguage);
  };

  const conditionsMet = checkConditionsMet();
  const languageConditionsMet = checkLanguageConditions();

  // Determine if conditions are satisfied based on logic
  let conditionsSatisfied;
  if (requireBothConditions) {
    // Both conditions AND language conditions must be true
    conditionsSatisfied = conditionsMet && languageConditionsMet;
  } else {
    // Either conditions OR language conditions must be true (if either is specified)
    if (conditions.length > 0 && languages.length > 0) {
      // Both types of conditions specified, at least one must pass
      conditionsSatisfied = conditionsMet || languageConditionsMet;
    } else if (conditions.length > 0) {
      // Only conditions specified
      conditionsSatisfied = conditionsMet;
    } else if (languages.length > 0) {
      // Only language conditions specified
      conditionsSatisfied = languageConditionsMet;
    } else {
      // No conditions specified, conditions are satisfied
      conditionsSatisfied = true;
    }
  }

  // Apply action logic: show or hide based on whether conditions are met
  const shouldShow = action === "hide" ? !conditionsSatisfied : conditionsSatisfied;

  // const debugInfo = debug
  //   ? {
  //       action,
  //       currentLanguage,
  //       pageConditions,
  //       conditions,
  //       languages,
  //       logic,
  //       languageLogic,
  //       requireBothConditions,
  //       conditionsMet,
  //       languageConditionsMet,
  //       conditionsSatisfied,
  //       shouldShow,
  //     }
  //   : null;

  return (
    <>
      {/* {debug && (
        <details
          style={{
            background: "#f5f5f5",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
            🐛 ConditionalText Debug Info
          </summary>
          <pre style={{ margin: "10px 0 0 0", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )} */}

      {shouldShow ? (
        children
      ) : (
        fallback && <span className="conditional-text__fallback">{fallback}</span>
      )}
    </>
  );
};

export default ConditionalText;
