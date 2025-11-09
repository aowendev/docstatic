/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import glossaryTerms from "../../../reuse/glossaryTerms/index.json";

export const GlossaryTermBlockTemplate = {
  name: "GlossaryTerm",
  label: "Glossary Term",
  inline: true,
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
      options: glossaryTerms.glossaryTerms.map((item) => ({
        label: item.key,
        value: item.key,
      })),
      ui: {
        component: "select",
        description:
          "Select a file from /reuse/snippets/ (includes subdirectories)",
      },
    },
  ],
};

