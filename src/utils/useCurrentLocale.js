/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// Shared locale-resolution fallback chain, matching the one duplicated in
// GlossaryTerm/index.jsx and VariableSet/index.jsx: explicit prop, then
// Docusaurus's own current locale, then the URL path segment (covers static
// export/SSR edge cases where i18n context lags the actual route), then the
// visitor's browser language, then the site's default locale.
export function useCurrentLocale(langProp) {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();

  if (langProp) return langProp;
  if (i18n?.currentLocale) return i18n.currentLocale;

  const pathParts = location.pathname.split("/").filter(Boolean);
  const possibleLang = pathParts[0];
  const supportedLocales = i18n?.locales || ["en"];
  if (supportedLocales.includes(possibleLang)) {
    return possibleLang;
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    const browserLang = navigator.language.split("-")[0];
    if (supportedLocales.includes(browserLang)) {
      return browserLang;
    }
  }

  return i18n?.defaultLocale || "en";
}
