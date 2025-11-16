/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// Import the JSON data directly at build time
import glossaryData from "/reuse/glossaryTerms/index.json";

const GlossaryTerm = ({ termKey, lang }) => {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();
  const [showDefinition, setShowDefinition] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const termRef = useRef(null);
  const definitionRef = useRef(null);

  const [portalElement, setPortalElement] = useState(null);

  // Create and manage portal element
  useEffect(() => {
    if (isTouchDevice && showDefinition && typeof document !== "undefined") {
      const portalDiv = document.createElement("div");
      portalDiv.style.cssText = `
        position: fixed !important;
        top: 0px !important;
        left: 0px !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 999999999 !important;
        background: transparent !important;
      `;
      document.documentElement.appendChild(portalDiv);
      setPortalElement(portalDiv);

      return () => {
        if (portalDiv.parentNode) {
          portalDiv.parentNode.removeChild(portalDiv);
        }
      };
    }

    return () => {
      setPortalElement(null);
    };
  }, [isTouchDevice, showDefinition]);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      // Add debug mode - uncomment next line to force touch mode for testing
      // return true; // TEMPORARY: Force touch mode for testing

      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  // Handle clicking outside to close definition
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDefinition &&
        termRef.current &&
        !termRef.current.contains(event.target)
      ) {
        // Check if click is inside the definition box
        const definitionElement = definitionRef.current;
        if (definitionElement && !definitionElement.contains(event.target)) {
          setShowDefinition(false);
        }
      }
    };

    if (isTouchDevice && showDefinition) {
      // Use both touchstart and click for better compatibility
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showDefinition, isTouchDevice]);

  // Position the definition box to avoid screen overflow
  const getDefinitionStyle = () => {
    if (!termRef.current || !showDefinition) return {};

    const termRect = termRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default positioning below the term
    let top = termRect.bottom + 8;
    let left = termRect.left;

    // Estimated definition box width (will be adjusted by CSS max-width)
    const estimatedWidth = Math.min(300, viewportWidth - 20);

    // Check if definition would overflow right edge
    if (left + estimatedWidth > viewportWidth - 10) {
      left = viewportWidth - estimatedWidth - 10;
    }

    // Check if definition would overflow left edge
    if (left < 10) {
      left = 10;
    }

    // Check if definition would overflow bottom edge
    // Estimate height as roughly 100px (will be adjusted by content)
    const estimatedHeight = 100;
    if (top + estimatedHeight > viewportHeight - 10) {
      // Position above the term instead
      top = termRect.top - estimatedHeight - 8;

      // If still overflowing top, position at top of viewport
      if (top < 10) {
        top = 10;
      }
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 2147483647, // Maximum z-index value
    };
  };

  const handleTermClick = () => {
    if (isTouchDevice) {
      setShowDefinition(!showDefinition);
    }
  };

  // Determine the current language
  const getCurrentLanguage = () => {
    // 1. Use explicit lang prop if provided
    if (lang) return lang;

    // 2. Try to get from current locale
    if (i18n?.currentLocale) return i18n.currentLocale;

    // 3. Try to extract from URL path (e.g., /es/docs/... -> 'es')
    const pathParts = location.pathname.split("/").filter(Boolean);
    const possibleLang = pathParts[0];

    // Check if first path segment is a valid language code
    const supportedLocales = i18n?.locales || ["en"];
    if (supportedLocales.includes(possibleLang)) {
      return possibleLang;
    }

    // 4. Try to get from browser language
    if (typeof navigator !== "undefined" && navigator.language) {
      const browserLang = navigator.language.split("-")[0]; // 'en-US' -> 'en'
      if (supportedLocales.includes(browserLang)) {
        return browserLang;
      }
    }

    // 5. Fallback to default
    return i18n?.defaultLocale || "en";
  };

  const currentLang = getCurrentLanguage();

  // All logic now runs at build time
  const getTermData = () => {
    try {
      // Find the glossary term by key
      const entry = Array.isArray(glossaryData.glossaryTerms)
        ? glossaryData.glossaryTerms.find((t) => t.key === termKey)
        : null;

      if (!entry || !Array.isArray(entry.translations)) {
        return {
          term: "TERM NOT FOUND",
          definition: "NOT FOUND",
        };
      }

      // Find the translation by current language, fallback to 'en'
      const translation =
        entry.translations.find((t) => t.lang === currentLang) ||
        entry.translations.find((t) => t.lang === "en") ||
        entry.translations[0]; // Fallback to first available translation

      return {
        term: translation?.term || "TERM NOT FOUND",
        definition: translation?.definition || "NOT FOUND",
      };
    } catch {
      return {
        term: "TERM NOT FOUND",
        definition: "NOT FOUND",
      };
    }
  };

  const { term, definition } = getTermData();

  // Create the definition box component
  const DefinitionBox = () => {
    if (!termRef.current) return null;

    const termRect = termRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Estimated definition box dimensions
    const estimatedWidth = Math.min(300, viewportWidth - 20);
    const estimatedHeight = 120; // Rough estimate for height

    // Default positioning below the term
    let top = termRect.bottom + 8;
    let left = termRect.left;

    // Check if definition would overflow right edge
    if (left + estimatedWidth > viewportWidth - 10) {
      left = viewportWidth - estimatedWidth - 10;
    }

    // Check if definition would overflow left edge
    if (left < 10) {
      left = 10;
    }

    // Check if definition would overflow bottom edge
    if (top + estimatedHeight > viewportHeight - 10) {
      // Position above the term instead
      top = termRect.top - estimatedHeight - 8;

      // If still overflowing top, position at top of viewport
      if (top < 10) {
        top = 10;
      }
    }

    // Detect current theme to set appropriate colors
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    const backgroundColor = isDarkMode ? "#1b1b1d" : "white";
    const textColor = isDarkMode ? "#e3e3e3" : "black";
    const secondaryTextColor = isDarkMode ? "#b3b3b3" : "#333";
    const borderColor = isDarkMode ? "#444" : "#666";

    return (
      <div
        ref={definitionRef}
        style={{
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          zIndex: "999999999",
          backgroundColor: backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "16px",
          maxWidth: "300px",
          minWidth: "200px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          fontSize: "14px",
          lineHeight: "1.4",
          wordWrap: "break-word",
          pointerEvents: "auto",
          fontFamily: "Arial, sans-serif",
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{ fontWeight: "bold", marginBottom: "8px", color: textColor }}
        >
          {term}
        </div>
        <div style={{ color: secondaryTextColor }}>{definition}</div>
      </div>
    );
  };

  return (
    <>
      <span
        ref={termRef}
        title={!isTouchDevice ? definition : undefined}
        style={{
          textDecoration: "underline",
          cursor: isTouchDevice ? "pointer" : "help",
          position: "relative",
        }}
        onClick={handleTermClick}
        onTouchStart={isTouchDevice ? (e) => e.stopPropagation() : undefined}
      >
        {term}
      </span>

      {isTouchDevice &&
        showDefinition &&
        typeof document !== "undefined" &&
        portalElement &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: "0px",
              left: "0px",
              width: "100vw",
              height: "100vh",
              backgroundColor: "transparent",
              pointerEvents: "none",
              zIndex: "999999999",
            }}
          >
            <DefinitionBox />
          </div>,
          portalElement
        )}
    </>
  );
};

export default GlossaryTerm;
