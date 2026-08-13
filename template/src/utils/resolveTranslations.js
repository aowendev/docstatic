/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Picks the entry matching `locale` from a `translations` list (as used by
// glossary terms, variable sets, and now homepage/chatbot copy), falling
// back to `defaultLocale`, then the first entry, then {}.
export function resolveTranslation(translations, locale, defaultLocale) {
  if (!Array.isArray(translations)) return {};
  return (
    translations.find((t) => t.lang === locale) ||
    translations.find((t) => t.lang === defaultLocale) ||
    translations[0] ||
    {}
  );
}
