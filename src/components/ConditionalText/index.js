import React from "react";

/**
 * ConditionalText Component (Fully Static)
 *
 * Displays content conditionally based on:
 * 1. Document conditions (from frontmatter/props)
 * 2. Specified language requirements
 * 3. Custom tags with AND/OR logic
 *
 * Pass conditions explicitly through props for now.
 */
const ConditionalText = ({
  tags = [],
  conditions = [], // Pass conditions explicitly as props
  logic = "any",
  languages = [],
  currentLanguage = "en", // Default to English if not provided
  languageLogic = "any",
  text = "",
  fallback = "",
  requireBothConditions = false,
  debug = false,
}) => {
  // Check if tags/conditions are satisfied (static evaluation)
  const checkTagConditions = () => {
    if (tags.length === 0) return true;

    if (logic === "all") {
      return tags.every((tag) => conditions.includes(tag));
    }
    return tags.some((tag) => conditions.includes(tag));
  };

  // Check if language conditions are satisfied (static evaluation)
  const checkLanguageConditions = () => {
    if (languages.length === 0) return true;

    if (languageLogic === "all") {
      // For 'all' logic with languages, current language must match all (usually just one)
      return languages.includes(currentLanguage);
    }
    // For 'any' logic, current language must match at least one
    return languages.includes(currentLanguage);
  };

  const tagConditionsMet = checkTagConditions();
  const languageConditionsMet = checkLanguageConditions();

  // Determine if content should be shown
  let shouldShow;
  if (requireBothConditions) {
    // Both tag conditions AND language conditions must be true
    shouldShow = tagConditionsMet && languageConditionsMet;
  } else {
    // Either tag conditions OR language conditions must be true (if either is specified)
    if (tags.length > 0 && languages.length > 0) {
      // Both types of conditions specified, at least one must pass
      shouldShow = tagConditionsMet || languageConditionsMet;
    } else if (tags.length > 0) {
      // Only tag conditions specified
      shouldShow = tagConditionsMet;
    } else if (languages.length > 0) {
      // Only language conditions specified
      shouldShow = languageConditionsMet;
    } else {
      // No conditions specified, show content
      shouldShow = true;
    }
  }

  const debugInfo = debug
    ? {
        currentLanguage,
        conditions, // Show the conditions being used
        tags,
        languages,
        logic,
        languageLogic,
        requireBothConditions,
        tagConditionsMet,
        languageConditionsMet,
        shouldShow,
        evaluationType: "static", // Indicate this is static evaluation
      }
    : null;

  return (
    <div className="conditional-text">
      {debug && (
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
            🐛 ConditionalText Debug Info (Static)
          </summary>
          <pre style={{ margin: "10px 0 0 0", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}

      {shouldShow ? (
        <div className="conditional-text__content">{text}</div>
      ) : (
        fallback && <div className="conditional-text__fallback">{fallback}</div>
      )}
    </div>
  );
};

export default ConditionalText;
