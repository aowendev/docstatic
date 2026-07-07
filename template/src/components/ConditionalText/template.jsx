/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import conditionsData from "../../../reuse/conditions/index.json";
import docusaurusData from "../../../config/docusaurus/index.json";
import ConditionsTreeField from "../ConditionsField";

// Build condition options from conditions data
const conditionOptions = [];
if (Array.isArray(conditionsData?.categories)) {
  for (const category of conditionsData.categories) {
    if (category.conditions && Array.isArray(category.conditions)) {
      for (const condition of category.conditions) {
        if (condition.active !== false) {
          conditionOptions.push({
            value: condition.condition,
            label: `${condition.condition} (${category.name})`,
          });
        }
      }
    }
  }
}

// Build language options from docusaurus config
const languageOptions = (docusaurusData.languages?.supported || []).map(
  (lang) => ({
    value: lang.code,
    label: `${lang.label} (${lang.code})`,
  })
);

export const ConditionalTextBlockTemplate = {
  name: "ConditionalText",
  label: "Conditional Text",
  inline: true,
  ui: {
    previewSrc: "/blocks/ConditionalText.png",
    defaultItem: {
      action: "show",
      conditions: [],
      languages: [],
      logic: "any",
      languageLogic: "any",
      requireBothConditions: false,
      fallback: "",
      // debug: false,
    },
  },
  fields: [
    {
      type: "rich-text",
      name: "children",
      label: "Content",
    },
    {
      type: "string",
      name: "action",
      label: "Action",
      options: [
        { value: "show", label: "Show when conditions are met" },
        { value: "hide", label: "Hide when conditions are met" },
      ],
      ui: {
        component: "select",
        description: "Choose whether to show or hide content when conditions match",
      },
    },
    {
      type: "string",
      name: "conditions",
      label: "Required Conditions",
      list: true,
      options: conditionOptions,
      ui: {
        component: ConditionsTreeField,
        description: "Content action will be triggered when these conditions are met (defined in page metadata)",
      },
    },
    {
      type: "string",
      name: "languages",
      label: "Required Languages",
      list: true,
      options: languageOptions,
      ui: {
        component: "checkbox-group",
        description: "Content action will be triggered for these languages",
      },
    },
    {
      type: "string",
      name: "logic",
      label: "Condition Logic",
      options: [
        { value: "any", label: "Any condition matches (OR)" },
        { value: "all", label: "All conditions must match (AND)" },
      ],
      ui: {
        component: "select",
      },
    },
    {
      type: "string",
      name: "languageLogic",
      label: "Language Logic",
      options: [
        { value: "any", label: "Any language matches (OR)" },
        { value: "all", label: "All languages must match (AND)" },
      ],
      ui: {
        component: "select",
      },
    },
    {
      type: "boolean",
      name: "requireBothConditions",
      label: "Require Both Condition AND Language Conditions",
      ui: {
        description:
          "When true, both condition and language conditions must be satisfied",
      },
    },
    {
      type: "string",
      name: "fallback",
      label: "Fallback Text",
      ui: {
        component: "textarea",
        description: "Optional text to show when conditions are not met",
      },
    },
    // {
    //   type: "boolean",
    //   name: "debug",
    //   label: "Show Debug Info",
    //   ui: {
    //     description: "Display debugging information (for development)",
    //   },
    // },
  ],
};
