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

export const FeatureItemTranslationTemplate = {
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
      type: "string",
    },
    {
      name: "description",
      label: "Description",
      type: "rich-text",
    },
  ],
};

export const FeaturesTranslationTemplate = {
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
      label: "Heading",
      type: "string",
    },
    {
      name: "subtitle",
      label: "Subheading",
      type: "string",
    },
  ],
};

export const FeaturesBlockTemplate = {
  name: "features",
  label: "Features",
  fields: [
    {
      name: "items",
      label: "Features",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item.translations?.[0]?.title,
        }),
      },
      fields: [
        {
          name: "image",
          label: "Image",
          type: "image",
        },
        {
          label: "Document Link",
          name: "document",
          type: "reference",
          collections: ["doc"],
        },
        {
          type: "object",
          name: "translations",
          label: "Translations",
          list: true,
          templates: [FeatureItemTranslationTemplate],
        },
      ],
    },
    {
      type: "object",
      name: "translations",
      label: "Translations",
      list: true,
      templates: [FeaturesTranslationTemplate],
    },
  ],
};
