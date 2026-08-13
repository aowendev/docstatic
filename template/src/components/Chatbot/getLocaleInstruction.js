/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import docusaurusData from "@site/config/docusaurus/index.json";

/**
 * Builds a system-prompt instruction telling the model to reply in the
 * visitor's current locale, using the site's own configured language label
 * (e.g. "日本語" for "ja") so it reads naturally. Empty for the default
 * locale, since no instruction is needed there.
 * @param {string} locale
 * @returns {string}
 */
export function getLocaleInstruction(locale) {
  if (!locale || locale === docusaurusData.languages?.default) return "";

  const match = docusaurusData.languages?.supported?.find(
    (lang) => lang.code === locale
  );
  const label = match?.label || locale;

  return `Respond in ${label} (locale "${locale}"), matching the language of the page the visitor is asking from.`;
}
