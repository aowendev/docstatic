/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useContext, useState, useEffect } from "react";
import { FootnotesContext } from "./FootnotesProvider";
import { generateFootnoteKey } from "./utils";

const Footnote = ({ children }) => {
  const context = useContext(FootnotesContext);
  const [footnoteNumber, setFootnoteNumber] = useState(null);

  useEffect(() => {
    // Safely convert content to string for comparison
    const contentKey = generateFootnoteKey(children);

    if (context?.addFootnote) {
      // Use context if available
      const number = context.addFootnote(children);
      setFootnoteNumber(number);
    } else {
      // Fallback to global state
      if (typeof window !== "undefined") {
        if (!window.globalFootnotes) window.globalFootnotes = [];
        if (!window.globalFootnoteMap) window.globalFootnoteMap = new Map();

        if (window.globalFootnoteMap.has(contentKey)) {
          const number = window.globalFootnoteMap.get(contentKey);
          setFootnoteNumber(number);
        } else {
          const newNumber = window.globalFootnotes.length + 1;
          window.globalFootnotes.push({
            number: newNumber,
            content: children,
            key: contentKey,
          });
          window.globalFootnoteMap.set(contentKey, newNumber);
          setFootnoteNumber(newNumber);
        }
      } else {
        // Server-side rendering fallback
        setFootnoteNumber(1);
      }
    }
  }, [children, context?.addFootnote]);

  const handleClick = (e) => {
    e.preventDefault();
    const footnoteElement = document.getElementById(
      `footnote-${footnoteNumber}`
    );
    if (footnoteElement) {
      footnoteElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (footnoteNumber === null) {
    return (
      <sup>
        <span style={{ color: "#1976d2", fontSize: "0.8em" }}>[...]</span>
      </sup>
    );
  }
  return (
    <sup>
      <a
        href={`#footnote-${footnoteNumber}`}
        id={`footnote-ref-${footnoteNumber}`}
        onClick={handleClick}
        style={{
          color: "#1976d2",
          textDecoration: "none",
          fontSize: "0.8em",
        }}
      >
        [{footnoteNumber}]
      </a>
    </sup>
  );
};

export default Footnote;
