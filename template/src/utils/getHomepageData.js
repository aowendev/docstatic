/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import docusaurusData from "../../config/docusaurus/index.json";
import homepageData from "../../reuse/homepage/index.json";
import { resolveTranslation } from "./resolveTranslations";

const DEFAULT_LOCALE = docusaurusData.languages?.default;

function resolveBlock(block, locale) {
  const { translations, heroCardFeatures, items, ...shared } = block;
  const resolved = {
    ...shared,
    ...resolveTranslation(translations, locale, DEFAULT_LOCALE),
  };

  if (heroCardFeatures) {
    resolved.heroCardFeatures = heroCardFeatures.map((item) =>
      resolveTranslation(item.translations, locale, DEFAULT_LOCALE)
    );
  }

  if (items) {
    resolved.items = items.map(({ translations: itemTranslations, ...itemShared }) => ({
      ...itemShared,
      ...resolveTranslation(itemTranslations, locale, DEFAULT_LOCALE),
    }));
  }

  return resolved;
}

export function getHomepageData(locale) {
  const { translations, blocks, ...shared } = homepageData;
  return {
    ...shared,
    ...resolveTranslation(translations, locale, DEFAULT_LOCALE),
    blocks: (blocks || []).map((block) => resolveBlock(block, locale)),
  };
}
