/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
