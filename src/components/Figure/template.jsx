/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const FigureBlockTemplate = {
  name: "Figure",
  label: "Figure",
  inline: true,
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
      label: "Size (%)",
      type: "number",
      description: "Width as a percentage of the container (e.g., 25 for quarter width, 50 for half width)",
    },
    {
      name: "align",
      label: "Alignment",
      type: "string",
      description: "Align the image left or right (only applies when size is less than 100)",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
    },
    {
      name: "hideCaption",
      label: "Hide Caption",
      type: "boolean",
    },
  ],
};
