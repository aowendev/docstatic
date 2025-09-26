/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useContext, useEffect, useState } from "react";
import { FootnotesContext } from "./FootnotesProvider";

const FootnotesList = () => {
  const context = useContext(FootnotesContext);
  const [footnotes, setFootnotes] = useState([]);

  useEffect(() => {
    if (context?.footnotes) {
      // Use context footnotes if available
      setFootnotes(context.footnotes);
    } else if (typeof window !== "undefined" && window.globalFootnotes) {
      // Fallback to global footnotes
      setFootnotes(window.globalFootnotes);
    } else {
      setFootnotes([]);
    }
  }, [context?.footnotes]);

  // Clear footnotes when component unmounts (page navigation)
  useEffect(() => {
    if (context?.clearFootnotes) {
      return () => {
        context.clearFootnotes();
      };
    }
    // Clear global footnotes
    return () => {
      if (typeof window !== "undefined") {
        window.globalFootnotes = [];
        window.globalFootnoteMap = new Map();
      }
    };
  }, [context?.clearFootnotes]);

  if (!footnotes || footnotes.length === 0) {
    return null;
  }

  const handleBackClick = (footnoteNumber) => (e) => {
    e.preventDefault();
    const refElement = document.getElementById(
      `footnote-ref-${footnoteNumber}`
    );
    if (refElement) {
      refElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to safely render footnote content
  const renderFootnoteContent = (content) => {
    if (typeof content === "string") {
      return <span>{content}</span>;
    }
    if (React.isValidElement(content)) {
      return content;
    }
    if (Array.isArray(content)) {
      // Handle array of mixed content (strings and elements)
      return content.map((item, index) => {
        if (typeof item === "string") {
          return <span key={index}>{item}</span>;
        }
        if (React.isValidElement(item)) {
          return React.cloneElement(item, { key: index });
        }
        return <span key={index}>{String(item)}</span>;
      });
    }
    if (typeof content === "object" && content !== null) {
      // Try to extract text content from object
      if (content.props?.children) {
        return renderFootnoteContent(content.props.children);
      }
      return <span>{String(content)}</span>;
    }
    return <span>{String(content)}</span>;
  };

  return (
    <div className="footnotes-list">
      <hr />
      <h3 className="footnotes-title">Footnotes</h3>
      <ol className="footnotes-ol">
        {footnotes.map((footnote) => (
          <li key={footnote.number} className="footnotes-item">
            <span id={`footnote-${footnote.number}`} />
            <span className="footnotes-content">
              {renderFootnoteContent(footnote.content)}
              <a
                href={`#footnote-ref-${footnote.number}`}
                onClick={handleBackClick(footnote.number)}
                className="footnotes-backlink"
                title="Back to reference"
              >
                ↩
              </a>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FootnotesList;
