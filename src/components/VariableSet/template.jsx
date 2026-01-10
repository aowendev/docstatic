/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import variableSets from "../../../reuse/variableSets/index.json";

export const VariableSetBlockTemplate = {
  name: "VariableSet",
  label: "Variable",
  inline: true,
  ui: {
    itemProps: (item) => {
      // Extract variable key from composite value for display
      const variableKey = item?.variableSelection?.split("|")[1] || item?.title;
      return { label: variableKey };
    },
  },
  fields: [
    {
      name: "variableSelection",
      label: "Variable",
      type: "string",
      isTitle: true,
      required: true,
      options: variableSets.variableSets.flatMap((set) =>
        set.variables.map((variable) => ({
          value: `${set.name}|${variable.key}`, // Composite value: setKey|variableKey
          label: `${variable.key} (${set.name})`,
        }))
      ),
      ui: {
        component: "select",
      },
    },
    {
      name: "initcap",
      label: "Capitalize first letter",
      type: "boolean",
    },
    {
      name: "bold",
      label: "Bold text",
      type: "boolean",
    },
  ],
};
