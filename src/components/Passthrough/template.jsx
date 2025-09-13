export const PassthroughBlockTemplate = {
  name: "Passthrough",
  label: "Passthrough",
  ui: {
    itemProps: (item) => {
      return { label: item?.summary || "Passthrough" };
    },
  },
  fields: [
    {
      type: "string",
      name: "summary",
      label: "Summary",
      description: "A brief description of the passthrough content",
    },
    {
      type: "string",
      name: "string",
      label: "Markdown Content",
      description: "Markdown content with LaTeX math support (use $...$ for inline math, $$...$$ for block math)",
      ui: {
        component: "textarea",
      },
    },
  ],
};