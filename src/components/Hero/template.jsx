import React from "react";
/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import docusaurusData from "../../../config/docusaurus/index.json";

// Function to create language options from config data
function createLanguageOptions(configData = docusaurusData) {
  const supportedLanguages = configData.languages?.supported || [
    { code: "en", label: "English" },
  ];

  return supportedLanguages.map((langObj) => {
    return {
      value: langObj.code,
      label: `${langObj.label} (${langObj.code})`,
    };
  });
}

const languageOptions = createLanguageOptions();

export const HeroCardFeatureTranslationTemplate = {
  name: "translation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.feature}`,
    }),
  },
  fields: [
    {
      type: "string",
      name: "lang",
      label: "Language Code",
      required: true,
      options: languageOptions,
    },
    {
      name: "feature",
      label: "Feature",
      type: "string",
    },
  ],
};

export const HeroTranslationTemplate = {
  name: "translation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.title}`,
    }),
  },
  fields: [
    {
      type: "string",
      name: "lang",
      label: "Language Code",
      required: true,
      options: languageOptions,
    },
    {
      name: "title",
      label: "Title",
      description: "By default this is the site title",
      type: "string",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      description: "By default this is the site tagline",
      type: "string",
    },
    {
      name: "description",
      label: "Description",
      description: "Additional text displayed below the subtitle",
      type: "string",
    },
    {
      name: "documentLabel",
      label: "Primary Button Text",
      type: "string",
    },
    {
      name: "secondaryButtonText",
      label: "Secondary Button Text",
      type: "string",
    },
    {
      name: "heroCardTitle",
      label: "Hero Card Title",
      type: "string",
    },
    {
      name: "heroCardFeaturesLabel",
      label: "Hero Card Features Label",
      description: 'Heading shown above the feature list, e.g. "# Features"',
      type: "string",
    },
  ],
};

export const HeroBlockTemplate = {
  name: "hero",
  label: "Hero",
  fields: [
    {
      label: "Document Link",
      name: "document",
      type: "reference",
      collections: ["doc"],
    },
    {
      name: "secondaryButtonLink",
      label: "Secondary Button Link",
      type: "string",
    },
    {
      name: "showHeroCard",
      label: "Show Hero Card",
      description: "Display the visual hero card with features",
      type: "boolean",
    },
    {
      name: "heroCardFeatures",
      label: "Hero Card Features",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item.translations?.[0]?.feature,
        }),
      },
      fields: [
        {
          type: "object",
          name: "translations",
          label: "Translations",
          list: true,
          templates: [HeroCardFeatureTranslationTemplate],
        },
      ],
    },
    {
      type: "object",
      name: "translations",
      label: "Translations",
      list: true,
      templates: [HeroTranslationTemplate],
    },
  ],
};
