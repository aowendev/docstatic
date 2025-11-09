/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";

// Import the JSON data directly at build time
import variableSetsData from "/reuse/variableSets/index.json";

const VariableSet = ({ variableSelection, lang }) => {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();

  // Parse composite value
  const [finalSetKey, finalVariableKey] = variableSelection?.split('|') || [];

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
  const getTranslation = () => {
    try {
      // Find the set by finalSetKey
      const set = Array.isArray(variableSetsData.variableSets)
        ? variableSetsData.variableSets.find((s) => s.name === finalSetKey)
        : null;

      // Find the variable by finalVariableKey
      const variable =
        set && Array.isArray(set.variables)
          ? set.variables.find((v) => v.key === finalVariableKey)
          : null;

      // Find the translation by current language, fallback to 'en'
      if (variable && Array.isArray(variable.translations)) {
        const translationObj =
          variable.translations.find((t) => t.lang === currentLang) ||
          variable.translations.find((t) => t.lang === "en");
        return translationObj ? translationObj.value : "NOT FOUND";
      }

      return "NOT FOUND";
    } catch {
      return "NOT FOUND";
    }
  };

  const translation = getTranslation();

  return <span>{translation}</span>;
};

export default VariableSet;
