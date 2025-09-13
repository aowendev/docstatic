export const GlossaryTermBlockTemplate = {
  name: "GlossaryTerm",
  label: "Glossary Term",
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
    },
  ],
};
