export const FigureBlockTemplate = {
  name: "Figure",
  label: "Figure",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "img",
      label: "Image",
      type: "image",
      required: true,
    },
    {
      name: "caption",
      label: "Caption",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "size",
      label: "Size",
      type: "string",
    },
  ],
};
