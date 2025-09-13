export const SnippetBlockTemplate = {
  name: "Snippet",
  label: "Snippet",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "filepath",
      label: "File Path",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};
