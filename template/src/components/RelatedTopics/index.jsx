/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import React from "react";
// Import the generated static metadata
import docsMetadata from "@site/src/data/docs-metadata.json";

/**
 * RelatedTopics component for Tina CMS
 * Displays a list of related topics based on shared taxonomy tags
 *
 * @param {Object} props - The component props
 * @param {number} [props.maxResults=5] - Maximum number of related topics to display
 * @returns {React.Component} - The RelatedTopics component
 */
const RelatedTopics = ({ maxResults = 5 }) => {
  const location = useLocation();

  // Get current page metadata from static data
  const getCurrentPageMetadata = () => {
    const currentPath = location.pathname;
    
    // Remove /docs prefix if present to match metadata format
    const normalizedPath = currentPath.startsWith('/docs') 
      ? currentPath.replace('/docs', '') 
      : currentPath;
    
    // Find current page in static docs metadata
    const currentDoc = docsMetadata.find(doc => {
      // Handle different path variations
      const docPath = doc.path;
      return docPath === normalizedPath || 
             docPath === normalizedPath.replace(/\/$/, '') ||
             `${docPath}/` === normalizedPath;
    });

    return currentDoc;
  };

  // Calculate tag similarity between two arrays of tags
  const calculateSimilarity = (currentTags, otherTags) => {
    if (!currentTags || !otherTags || !currentTags.length || !otherTags.length) {
      return 0;
    }

    const currentTagsSet = new Set(currentTags);
    const otherTagsSet = new Set(otherTags);
    
    // Calculate intersection
    const intersection = new Set([...currentTagsSet].filter(tag => otherTagsSet.has(tag)));
    
    // Calculate union
    const union = new Set([...currentTagsSet, ...otherTagsSet]);
    
    // Jaccard similarity coefficient
    return intersection.size / union.size;
  };

  // Get related topics based on tag similarity
  const getRelatedTopics = (currentDoc) => {
    if (!currentDoc || !currentDoc.tags) {
      return [];
    }

    const currentTags = currentDoc.tags;
    const currentPath = currentDoc.path;

    // Find related docs
    const relatedDocs = docsMetadata
      .filter(doc => {
        // Exclude current document and docs without tags
        return doc.path !== currentPath && 
               doc.tags &&
               Array.isArray(doc.tags);
      })
      .map(doc => ({
        ...doc,
        similarity: calculateSimilarity(currentTags, doc.tags)
      }))
      .filter(doc => doc.similarity > 0) // Only include docs with some similarity
      .sort((a, b) => {
        // Sort by similarity first, then by title for consistent ordering
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        return a.title.localeCompare(b.title);
      })
      .slice(0, maxResults); // Limit results

    return relatedDocs;
  };

  const currentDoc = getCurrentPageMetadata();
  
  if (!currentDoc || !currentDoc.tags) {
    return null;
  }

  const relatedTopics = getRelatedTopics(currentDoc);

  if (relatedTopics.length === 0) {
    return null; // Don't render if no related topics found
  }

  return (
    <>
      <h2>Related topics</h2>
      <ul>
        {relatedTopics.map((topic, index) => (
          <li key={index}>
            <Link to={`/docs${topic.path}`}>
              {topic.title}
            </Link>
            {topic.description && (
              <span>
                {" – "}{topic.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default RelatedTopics;