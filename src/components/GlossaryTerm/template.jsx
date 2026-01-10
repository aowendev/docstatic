/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import glossaryTerms from "../../../reuse/glossaryTerms/index.json";
import docusaurusData from "../../../config/docusaurus/index.json";
import HelpButton from "../HelpButton";

// Function to create language options from config data
function createLanguageOptions(configData = docusaurusData) {
  const supportedLanguages = configData.languages?.supported || [{code: "en", label: "English"}];
  
  return supportedLanguages.map((langObj) => {
    return {
      value: langObj.code,
      label: `${langObj.label} (${langObj.code})`,
    };
  });
}

const languageOptions = createLanguageOptions();

export const GlossaryTermTranslationTemplate = {
  name: "translation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.term}`,
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
      type: "string",
      name: "term",
      label: "Term",
      required: true,
    },
    {
      type: "string",
      name: "definition",
      label: "Definition",
      required: true,
    },
  ],
};

export const GlossaryTermTemplate = {
  name: "glossaryTerm",
  label: "Glossary Term",
  ui: {
    itemProps: (item) => ({
      label: item?.key,
    }),
  },
  fields: [
    {
      type: "string",
      name: "key",
      label: "Key",
      isTitle: true,
      required: true,
    },
    {
      type: "object",
      name: "translations",
      label: "Translations",
      list: true,
      templates: [GlossaryTermTranslationTemplate],
    },
  ],
};

export const GlossaryTermCollection = {
  label: "Glossary Terms",
  name: "glossaryTerms",
  path: "reuse/glossaryTerms",
  format: "json",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/markdown-features/glossary"
            {...props}
          />
        ),
      },
    },
    {
      type: "object",
      name: "glossaryTerms",
      label: "Glossary Terms",
      list: true,
      templates: [GlossaryTermTemplate],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

export const GlossaryTermBlockTemplate = {
  name: "GlossaryTerm",
  label: "Glossary Term",
  inline: true,
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "termKey",
      label: "Term Key",
      type: "string",
      isTitle: true,
      required: true,
      options: glossaryTerms.glossaryTerms.map((item) => ({
        label: item.key,
        value: item.key,
      })),
      ui: {
        component: "select",
        description:
          "Select a glossary term key from the Glossary Terms collection",
      },
    },
    {
      name: "initcap",
      label: "Capitalize first letter",
      type: "boolean",
    },
    {
      name: "bold",
      label: "Bold text",
      type: "boolean",
    },
  ],
};

