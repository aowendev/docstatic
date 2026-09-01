/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Resolves <VariableSet> inside a CALS table cell.
 *
 * A cell's content is a Markdown string, not MDX, so the <VariableSet>
 * component the rest of the site uses never runs here - Markdown parses the
 * tag as inline HTML, and the cell renderer deliberately does not enable
 * rehypeRaw (see markdownCell.jsx), so it would be dropped without trace.
 * This plugin resolves the reference while the cell is still an mdast tree
 * and puts the variable's text in its place.
 *
 * The syntax is the site's own - the same element Tina writes into a
 * paragraph - rather than a shorthand invented for tables. One way to write a
 * variable across docStatic is worth more than a shorter one here, and it
 * means an author can copy a variable out of a topic and into a cell.
 *
 * Working on the tree rather than on the string is what keeps a cell that
 * *documents* the syntax, in backticks, from having its example resolved:
 * inline code is a different node type and is never visited.
 */

import { visit } from "unist-util-visit";
import { initcapValue, resolveVariable } from "../../utils/variables.js";

/** The whole node must be the tag - a cell's `html` node holds one tag. */
const VARIABLE_TAG = /^<VariableSet\b([^>]*?)\/?>$/i;

/**
 * name, name="value", name='value' or name={value}. Deliberately forgiving:
 * this is hand-typed markdown, not a JSX parser's input.
 */
const ATTRIBUTE =
  /([A-Za-z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;

function parseAttributes(source) {
  const attributes = {};
  ATTRIBUTE.lastIndex = 0;
  let match = ATTRIBUTE.exec(source);
  while (match !== null) {
    const [, name, doubleQuoted, singleQuoted, braced] = match;
    const value = doubleQuoted ?? singleQuoted ?? braced;
    // A bare `bold` is true, the way it is in JSX; `bold={false}` is not.
    attributes[name] = value === undefined ? true : value;
    match = ATTRIBUTE.exec(source);
  }
  return attributes;
}

function isTruthy(value) {
  return value === true || value === "true" || value === "";
}

/**
 * The NOT FOUND marker, built as an mdast node.
 *
 * `emphasis` carrying an hName override rather than a node type of our own:
 * mdast-to-hast only reaches `data.hName` for node types it already knows how
 * to handle, so an invented type would be dropped instead of styled.
 */
function notFoundNode(variableSelection) {
  return {
    type: "emphasis",
    data: {
      hName: "span",
      hProperties: { className: "key--error" },
    },
    children: [{ type: "text", value: `${variableSelection} NOT FOUND` }],
  };
}

function resolvedNode(value, attributes) {
  const text = {
    type: "text",
    value: isTruthy(attributes.initcap) ? initcapValue(value) : value,
  };
  return isTruthy(attributes.bold)
    ? { type: "strong", children: [text] }
    : text;
}

/**
 * `variableSets` is the reuse data (a parameter, not an import - see
 * src/utils/variables.js). `locale` is the language the cell is being rendered
 * for and `fallbackLocale` the language to fall back to: the published site
 * passes the page's locale, the Tina preview the site default, because Tina's
 * admin has no Docusaurus context to ask.
 */
export default function remarkVariables({
  variableSets,
  locale,
  fallbackLocale,
} = {}) {
  return (tree) => {
    visit(tree, "html", (node, index, parent) => {
      if (!parent || index === null) return;

      const match = VARIABLE_TAG.exec(node.value.trim());
      if (!match) return;

      const attributes = parseAttributes(match[1]);
      const variableSelection = attributes.variableSelection;
      if (typeof variableSelection !== "string") {
        parent.children[index] = notFoundNode("VariableSet");
        return;
      }

      const value = resolveVariable(
        variableSets,
        variableSelection,
        attributes.lang ?? locale,
        fallbackLocale
      );

      parent.children[index] =
        value === null
          ? notFoundNode(variableSelection)
          : resolvedNode(value, attributes);
    });
  };
}
