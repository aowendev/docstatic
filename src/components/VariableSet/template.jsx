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
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "setKey",
      label: "Variable Set",
      type: "string",
      required: true,
      options: variableSets.variableSets.map(set => ({
        value: set.name,
        label: set.name
      })),
    },
    {
      name: "variableKey",
      label: "Variable",
      type: "string",
      isTitle: true,
      required: true,
      options: variableSets.variableSets.flatMap(set => 
        set.variables.map(variable => ({
          value: variable.key,
          label: `${variable.key} (${set.name})`
        }))
      ),
      ui: {
        component: "select",
      },
    },
  ],
};
