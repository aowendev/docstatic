import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";
// Import the JSON data directly at build time
import glossaryData from "/reuse/glossaryTerms/index.json";

const GlossaryTerm = ({ termKey, lang }) => {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();

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

      // Find the language object by current language, fallback to 'en'
      const langObj =
        entry && Array.isArray(entry.languages)
          ? entry.languages.find((l) => l.lang === currentLang) ||
            entry.languages.find((l) => l.lang === "en")
          : null;

      // Find the first translation (if any)
      const translation =
        langObj && Array.isArray(langObj.translations)
          ? langObj.translations[0]
          : null;

      return {
        term: translation?.term || "TERM NOT FOUND",
        definition: translation?.definition || "NOT FOUND",
      };
    } catch (error) {
      return {
        term: "TERM NOT FOUND",
        definition: "NOT FOUND",
      };
    }
  };

  const { term, definition } = getTermData();

  return (
    <span
      title={definition}
      style={{ textDecoration: "underline", cursor: "help" }}
    >
      {term}
    </span>
  );
};

export default GlossaryTerm;
