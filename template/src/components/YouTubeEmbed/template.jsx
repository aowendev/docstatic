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

export const YouTubeEmbedTranslationTemplate = {
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
      name: "caption",
      label: "Caption",
      type: "string",
    },
  ],
};

export const YouTubeEmbedBlockTemplate = {
  name: "youTubeEmbed",
  label: "YouTube Embed",
  fields: [
    {
      name: "url",
      label: "YouTube URL",
      type: "string",
    },
    {
      type: "object",
      name: "translations",
      label: "Translations",
      list: true,
      templates: [YouTubeEmbedTranslationTemplate],
    },
  ],
};
