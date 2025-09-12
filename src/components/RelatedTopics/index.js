import React, { useMemo } from "react";
import { useLocation } from "@docusaurus/router";
import { documentsMap } from "../../data/documentsMap";

const RelatedTopics = ({ tags = [], maxItems = 5, excludeCurrentPage = false, lang = "en" }) => {
  const location = useLocation();

  // Get current language from URL path or use provided lang
  const getCurrentLanguage = () => {
    // Extract from URL path (e.g., /fr/docs/... -> 'fr')
    const pathParts = location.pathname.split("/").filter(Boolean);
    const possibleLang = pathParts[0];
    
    // Check if first path segment is a valid language code
    if (documentsMap[possibleLang]) {
      return possibleLang;
    }
    
    return lang || "en";
  };

  const currentLang = getCurrentLanguage();

  // Find related documents based on shared tags
  const relatedDocs = useMemo(() => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return [];
    }

    const docs = documentsMap[currentLang] || documentsMap.en || [];
    const related = [];
    const currentPath = location.pathname;

    for (const doc of docs) {
      // Skip the current page if excludeCurrentPage is true
      if (excludeCurrentPage && doc.path === currentPath) {
        continue;
      }

      // Check if this document has any matching tags
      const docTags = Array.isArray(doc.tags) ? doc.tags : [];
      const hasMatchingTag = docTags.some(tag => tags.includes(tag));

      if (hasMatchingTag && doc.title) {
        // Calculate relevance score based on number of matching tags
        const matchingTagsCount = docTags.filter(tag => tags.includes(tag)).length;
        
        related.push({
          ...doc,
          matchingTags: docTags.filter(tag => tags.includes(tag)),
          relevanceScore: matchingTagsCount,
        });
      }
    }

    // Sort by relevance (most matching tags first) and limit results
    return related
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxItems);

  }, [tags, maxItems, excludeCurrentPage, location.pathname, currentLang]);

  // Don't render if no related docs found
  if (!relatedDocs || relatedDocs.length === 0) {
    return null;
  }

  // Styling similar to footnotes component
  const listStyles = {
    borderTop: "2px solid #e0e0e0",
    marginTop: "3rem",
    paddingTop: "1.5rem",
    fontSize: "0.9em",
    lineHeight: "1.6",
  };

  const titleStyles = {
    fontSize: "1.2em",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#333",
    fontFamily: "inherit",
  };

  const itemStyles = {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    borderLeft: "4px solid #1976d2",
  };

  const docTitleStyles = {
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: "0.25rem",
    display: "block",
    textDecoration: "none",
  };

  const descriptionStyles = {
    color: "#555",
    fontSize: "0.95em",
    lineHeight: "1.5",
    marginBottom: "0.5rem",
  };

  const tagsStyles = {
    fontSize: "0.8em",
    color: "#666",
  };

  const tagStyles = {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "2px 6px",
    borderRadius: "3px",
    marginRight: "4px",
    fontSize: "0.75em",
  };

  return (
    <div style={listStyles}>
      <h3 style={titleStyles}>Related Topics</h3>
      <div>
        {relatedDocs.map((doc) => (
          <div key={doc.id} style={itemStyles}>
            <a 
              href={doc.path} 
              style={docTitleStyles}
            >
              {doc.title}
            </a>
            {doc.description && (
              <div style={descriptionStyles}>{doc.description}</div>
            )}
            <div style={tagsStyles}>
              Related tags: {doc.matchingTags.map(tag => (
                <span key={tag} style={tagStyles}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedTopics;