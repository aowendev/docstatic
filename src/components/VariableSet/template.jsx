export const VariableSetBlockTemplate = {
  name: "VariableSet",
  label: "Variable",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "setKey",
      label: "Variable Set",
      type: "string",
      required: true,
    },
    {
      name: "variableKey",
      label: "Variable",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};
