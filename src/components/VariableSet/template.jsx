/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
