import React, { createContext, useState, useCallback, useRef } from "react";
import { generateFootnoteKey } from "./utils";

// Create context with default values
export const FootnotesContext = createContext({
  footnotes: [],
  addFootnote: () => 1,
  clearFootnotes: () => {},
  getFootnoteNumber: () => 1,
});

export const FootnotesProvider = ({ children }) => {
  const [footnotes, setFootnotes] = useState([]);
  const footnoteMapRef = useRef(new Map());
  const footnoteCountRef = useRef(0);

  const addFootnote = useCallback((content) => {
    // Safely convert content to string for comparison
    const contentKey = generateFootnoteKey(content);

    // Check if this footnote already exists
    if (footnoteMapRef.current.has(contentKey)) {
      return footnoteMapRef.current.get(contentKey);
    }

    // Add new footnote
    footnoteCountRef.current += 1;
    const newNumber = footnoteCountRef.current;
    footnoteMapRef.current.set(contentKey, newNumber);

    setFootnotes((prev) => {
      return [...prev, { number: newNumber, content, key: contentKey }];
    });

    return newNumber;
  }, []);

  const clearFootnotes = useCallback(() => {
    setFootnotes([]);
    footnoteMapRef.current.clear();
    footnoteCountRef.current = 0;
  }, []);

  const value = {
    footnotes,
    addFootnote,
    clearFootnotes,
    getFootnoteNumber: (content) => {
      const contentKey = generateFootnoteKey(content);
      return footnoteMapRef.current.get(contentKey);
    },
  };

  return (
    <FootnotesContext.Provider value={value}>
      {children}
    </FootnotesContext.Provider>
  );
};
