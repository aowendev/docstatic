export const FootnoteBlockTemplate = {
  name: "Footnote",
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
      label: "Footnote",
      type: "rich-text",
    },
  ],
};
