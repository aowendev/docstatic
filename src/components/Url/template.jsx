import React from "react";
/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { wrapFieldsWithMeta } from "tinacms";
import docusaurusData from "../../../config/docusaurus/index.json";
import urlsData from "../../../reuse/urls/index.json";
import HelpButton from "../HelpButton";
import LinkHealthDashboard from "../Dashboard/LinkHealthDashboard";

// Gives the dashboard access to this document's own live form (tinaForm), so
// "Centralize" can append a urls[] entry directly instead of just navigating.
const LinkHealthDashboardField = wrapFieldsWithMeta(({ tinaForm }) => (
  <div style={{ display: "block", width: "100%", clear: "both" }}>
    <LinkHealthDashboard tinaForm={tinaForm} />
  </div>
));

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

export const UrlValueTranslationTemplate = {
  name: "urlTranslation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.url}`,
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
      name: "url",
      label: "URL",
      required: true,
    },
  ],
};

export const UrlDefaultTextTranslationTemplate = {
  name: "textTranslation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.text}`,
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
      name: "text",
      label: "Default Text",
      required: true,
    },
  ],
};

export const UrlEntryTemplate = {
  name: "urlEntry",
  label: "URL",
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
      name: "url",
      label: "URL (per language)",
      list: true,
      templates: [UrlValueTranslationTemplate],
    },
    {
      type: "object",
      name: "defaultText",
      label: "Default Link Text (per language)",
      description:
        "Used when a <Url> usage in a doc doesn't supply its own linkText.",
      list: true,
      templates: [UrlDefaultTextTranslationTemplate],
    },
  ],
};

export const UrlCollection = {
  label: "URLs",
  name: "urls",
  path: "reuse/urls",
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
            url="https://docstatic.com/docs/guides/markdown-features/urls"
            {...props}
          />
        ),
      },
    },
    {
      type: "boolean",
      name: "linkHealthDashboard",
      label: "Link Health",
      ui: {
        component: LinkHealthDashboardField,
      },
    },
    {
      type: "object",
      name: "urls",
      label: "URLs",
      list: true,
      templates: [UrlEntryTemplate],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

export const UrlLinkTextTranslationTemplate = {
  name: "translation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.text}`,
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
      name: "text",
      label: "Link Text",
      required: true,
    },
  ],
};

export const UrlLinkBlockTemplate = {
  name: "Url",
  label: "URL Link",
  inline: true,
  ui: {
    itemProps: (item) => ({ label: item?.urlKey }),
  },
  fields: [
    {
      name: "urlKey",
      label: "URL Key",
      type: "string",
      isTitle: true,
      required: true,
      options: urlsData.urls.map((item) => ({
        label: item.key,
        value: item.key,
      })),
      ui: {
        component: "select",
        description: "Select a URL key from the URLs collection",
      },
    },
    {
      type: "object",
      name: "linkText",
      label: "Link Text (per language, optional)",
      description:
        "Leave empty to use the key's default text. If used, must be filled in for every supported language now — it is never machine-translated later.",
      list: true,
      templates: [UrlLinkTextTranslationTemplate],
    },
  ],
};
