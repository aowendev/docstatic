/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CalsTableEditor from "./CalsTableEditor";

// This schema exists purely so @tinacms/mdx can round-trip the nested
// object/array shape to and from MDX - every field it declares is required
// for that serialization, even though none of them are ever rendered by
// Tina's default form UI. The "table" field's own `ui.component` replaces
// the whole visual editor, same pattern as ConditionsField/TagsField (see
// src/components/ConditionsField/index.jsx), just applied one level higher.
// See calsLayout.js for what each attribute means.

const spanAttrs = [
  { name: "align", type: "string" },
  { name: "char", type: "string" },
  { name: "charoff", type: "number" },
  { name: "colsep", type: "number" },
  { name: "rowsep", type: "number" },
];

const colspecFields = [
  { name: "colnum", type: "number" },
  { name: "colname", type: "string" },
  { name: "colwidth", type: "string" },
  ...spanAttrs,
];

const spanspecFields = [
  { name: "spanname", type: "string" },
  { name: "namest", type: "string" },
  { name: "nameend", type: "string" },
  ...spanAttrs,
];

const entryFields = [
  { name: "colname", type: "string" },
  { name: "namest", type: "string" },
  { name: "nameend", type: "string" },
  { name: "spanname", type: "string" },
  { name: "morerows", type: "number" },
  { name: "align", type: "string" },
  { name: "valign", type: "string" },
  { name: "char", type: "string" },
  { name: "charoff", type: "number" },
  { name: "colsep", type: "number" },
  { name: "rowsep", type: "number" },
  { name: "content", type: "string" },
];

const rowFields = [
  { name: "valign", type: "string" },
  { name: "rowsep", type: "number" },
  { name: "entries", type: "object", list: true, fields: entryFields },
];

const sectionField = (name) => ({
  name,
  type: "object",
  fields: [{ name: "rows", type: "object", list: true, fields: rowFields }],
});

export const CalsTableBlockTemplate = {
  name: "CalsTable",
  label: "CALS Table",
  inline: true,
  ui: {
    itemProps: (item) => ({ label: item?.table?.title || "CALS Table" }),
  },
  fields: [
    {
      name: "table",
      label: "Table",
      type: "object",
      ui: { component: CalsTableEditor },
      fields: [
        { name: "frame", type: "string" },
        { name: "title", type: "string" },
        { name: "pgwide", type: "boolean" },
        { name: "colsep", type: "number" },
        { name: "rowsep", type: "number" },
        {
          name: "tgroup",
          type: "object",
          fields: [
            { name: "cols", type: "number" },
            {
              name: "colspecs",
              type: "object",
              list: true,
              fields: colspecFields,
            },
            {
              name: "spanspecs",
              type: "object",
              list: true,
              fields: spanspecFields,
            },
            sectionField("thead"),
            sectionField("tbody"),
            sectionField("tfoot"),
          ],
        },
      ],
    },
  ],
};
