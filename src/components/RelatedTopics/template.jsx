/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const RelatedTopicsBlockTemplate = {
  name: "RelatedTopics",
  label: "Related Topics",
  inline: false,
  ui: {
    itemProps: (item) => {
      const maxResults = item?.maxResults || 5;
      return { 
        label: `Related Topics (max: ${maxResults})`
      };
    },
  },
  fields: [
    {
      name: "maxResults",
      label: "Maximum Results",
      type: "number",
      description: "Maximum number of related topics to display",
      ui: {
        validate: (value) => {
          if (value && (value < 1 || value > 20)) {
            return "Maximum results must be between 1 and 20";
          }
        },
      },
    },
  ],
};