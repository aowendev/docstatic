/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CommentBlockTemplate = {
  name: "Comment",
  label: "Comment",
  inline: true,
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "reviewer",
      label: "Reviewer",
      type: "string",
      required: true,
    },
    {
      name: "comment",
      label: "Comment",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};
