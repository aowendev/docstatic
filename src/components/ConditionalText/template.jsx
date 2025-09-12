export const ConditionalTextBlockTemplate = {
  name: "ConditionalText",
  label: "Conditional Text",
  ui: {
    previewSrc: "/blocks/ConditionalText.png",
    defaultItem: {
      text: "This text will appear when conditions are met.",
      conditions: [],
      languages: [],
      logic: "any",
      languageLogic: "any",
      requireBothConditions: false,
      fallback: "",
      debug: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "text",
      label: "Text Content",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      name: "conditions",
      label: "Required Conditions",
      list: true,
      ui: {
        description: "Content will show when these conditions are met",
      },
    },
    {
      type: "string",
      name: "languages",
      label: "Required Languages",
      list: true,
      ui: {
        description: "Content will show for these languages (e.g., en, fr, es)",
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
    {
      type: "boolean",
      name: "debug",
      label: "Show Debug Info",
      ui: {
        description: "Display debugging information (for development)",
      },
    },
  ],
};
