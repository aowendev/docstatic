/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import docusaurusData from "../../../config/docusaurus/index.json";
// Import the JSON data directly at build time
import urlsData from "/reuse/urls/index.json";
import { resolveTranslation } from "../../utils/resolveTranslations";
import { useCurrentLocale } from "../../utils/useCurrentLocale";

const DEFAULT_LOCALE = docusaurusData.languages?.default;

const Url = ({ urlKey, linkText, lang }) => {
  const locale = useCurrentLocale(lang);

  const entry = Array.isArray(urlsData.urls)
    ? urlsData.urls.find((u) => u.key === urlKey)
    : null;

  if (!entry) {
    return <span>URL NOT FOUND</span>;
  }

  const { url: href } = resolveTranslation(entry.url, locale, DEFAULT_LOCALE);
  const { text } = linkText
    ? resolveTranslation(linkText, locale, DEFAULT_LOCALE)
    : resolveTranslation(entry.defaultText, locale, DEFAULT_LOCALE);

  if (!href) {
    return <span>URL NOT FOUND</span>;
  }

  return <a href={href}>{text || href}</a>;
};

export default Url;
