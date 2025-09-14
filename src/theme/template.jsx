/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import codeFiles from "../../reuse/code-files.json";
import { slugify } from "../../util";
import { CodeSnippetBlockTemplate } from "../components/CodeSnippet/template";
import { ConditionalTextBlockTemplate } from "../components/ConditionalText/template";
import { FigureBlockTemplate } from "../components/Figure/template";
import { FootnoteBlockTemplate } from "../components/Footnote/template";
import { GlossaryTermBlockTemplate } from "../components/GlossaryTerm/template";
import { PassthroughBlockTemplate } from "../components/Passthrough/template";
import { SnippetBlockTemplate } from "../components/Snippet/template";
import { VariableSetBlockTemplate } from "../components/VariableSet/template";

// Default Docusaurus components

const AdmonitionTemplate = {
  name: "Admonition",
  ui: {
    defaultItem: {
      type: "note",
      title: "Note",
    },
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "type",
      label: "Type",
      type: "string",
      options: [
        {
          label: "Note",
          value: "note",
        },
        {
          label: "Tip",
          value: "tip",
        },
        {
          label: "Info",
          value: "info",
        },
        {
          label: "Caution",
          value: "caution",
        },
        {
          label: "Warning",
          value: "danger",
        },
      ],
    },
    {
      name: "title",
      label: "Title",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "children",
      label: "Content",
      type: "rich-text",
    },
  ],
};

const DetailsTemplate = {
  name: "Details",
  fields: [
    {
      name: "summary",
      label: "Summary",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "children",
      label: "Details",
      type: "rich-text",
    },
  ],
};

const DocCardListTemplate = {
  name: "DocCardList",
  label: "Doc Card List",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
  ],
};

// Custom DocStatic components

const CommentsTemplate = {
  name: "hidden",
  label: "Comment",
  match: {
    start: "<!--",
    end: "-->",
  },
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "comment",
      label: "Comment",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const TruncateTemplate = {
  name: "truncate",
  label: "Truncate",
  match: {
    start: "<!--",
    end: "-->",
  },
  fields: [
    {
      name: "deactivate",
      label:
        "Do not modify this string or you will not be able to edit this topic in the rich text editor.",
      type: "string",
      defaultValue: "",
    },
  ],
};

// Get the last segment of the path as the slug
const usePageSlug = () => {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
};

const slug = usePageSlug();

const ContextHelpTemplate = {
  name: "a",
  label: "Context Help",
  ui: {
    itemProps: (item, slug) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "id",
      label: "Context Help ID (<URL>/docs/<slug>#<ID>)",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const TabsTemplate = {
  name: "Tabs",
  label: "Tabs",
  ui: {
    itemProps: (item) => {
      return { label: "Tabs" };
    },
  },
  fields: [
    {
      name: "children",
      label: "Tab Items",
      type: "rich-text",
      templates: [
        {
          name: "TabItem",
          label: "Tab Item",
          ui: {
            defaultItem: {
              label: "New Tab",
              value: "new-tab",
            },
            itemProps: (item) => {
              return { label: item?.label || "New Tab" };
            },
          },
          fields: [
            {
              name: "value",
              label: "Tab Value",
              type: "string",
              required: true,
              description: "Unique identifier for this tab",
            },
            {
              name: "label",
              label: "Tab Label",
              type: "string",
              required: true,
              isTitle: true,
              description: "Display text for the tab button",
            },
            {
              name: "default",
              label: "Default Tab",
              type: "boolean",
              description: "Set this tab as the default selected tab",
            },
            {
              name: "children",
              label: "Tab Content",
              type: "rich-text",
              templates: [],
            },
          ],
        },
      ],
    },
  ],
};

export const MDXTemplates = [
  AdmonitionTemplate,
  CodeSnippetBlockTemplate,
  CommentsTemplate,
  ConditionalTextBlockTemplate,
  ContextHelpTemplate,
  DetailsTemplate,
  DocCardListTemplate,
  FigureBlockTemplate,
  FootnoteBlockTemplate,
  GlossaryTermBlockTemplate,
  SnippetBlockTemplate,
  PassthroughBlockTemplate,
  TabsTemplate,
  TruncateTemplate,
  VariableSetBlockTemplate,
];
