import React from 'react';

/**
 * Safely generates a string key for footnote content, handling React elements and cyclic objects
 * @param {*} content - The content to generate a key for
 * @returns {string} - A safe string key
 */
export const generateFootnoteKey = (content) => {
  try {
    if (typeof content === 'string') {
      return content;
    } else if (React.isValidElement(content)) {
      // For React elements, use the element type and extract text content
      const textContent = extractTextFromReactElement(content);
      return `react-${content.type?.name || content.type || 'unknown'}-${textContent}`;
    } else if (typeof content === 'object' && content !== null) {
      // For objects, try to stringify safely
      return JSON.stringify(content, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Skip React internal properties that can cause circular references
          if (value._owner || value._store || value._source || value._self) {
            return '[React Element]';
          }
          // Skip DOM nodes
          if (value.nodeType) {
            return '[DOM Node]';
          }
        }
        return value;
      });
    } else {
      return String(content);
    }
  } catch (error) {
    // Fallback if JSON.stringify fails due to circular references
    console.warn('Failed to generate footnote key, using fallback:', error);
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Recursively extracts text content from React elements
 * @param {*} element - React element or content
 * @returns {string} - Extracted text
 */
const extractTextFromReactElement = (element) => {
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }
  
  if (React.isValidElement(element)) {
    const children = element.props?.children;
    if (children) {
      if (Array.isArray(children)) {
        return children.map(extractTextFromReactElement).join('');
      } else {
        return extractTextFromReactElement(children);
      }
    }
  }
  
  return '';
};
