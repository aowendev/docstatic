/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A CALS cell holds Markdown, not MDX, so the <VariableSet> element an author
 * writes into a cell is resolved by a remark plugin rather than by the React
 * component - see src/components/CalsTable/remarkVariables.js. These cases
 * cover the two things that plugin has to get right: the same resolution rule
 * the component uses (locale, fallback, initcap, bold, unresolved), and not
 * touching text that only looks like a reference.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkVariables from "../src/components/CalsTable/remarkVariables.js";
import {
  initcapValue,
  resolveVariable,
  splitVariableSelection,
} from "../src/utils/variables.js";

const VARIABLE_SETS = [
  {
    name: "product",
    variables: [
      {
        key: "name",
        translations: [
          { lang: "en", value: "docStatic" },
          { lang: "de", value: "docStatik" },
        ],
      },
      {
        key: "english-only",
        translations: [{ lang: "en", value: "only English" }],
      },
      { key: "untranslated", translations: [] },
    ],
  },
  { name: "Excluded", variables: [{ key: "x", translations: [] }] },
];

/** The cell's mdast, after the plugin has run over it. */
function runPlugin(content, options = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkVariables, { variableSets: VARIABLE_SETS, ...options });
  return processor.runSync(processor.parse(content));
}

/** Every node of a type, depth-first - the tests only need small trees. */
function collect(tree, type, found = []) {
  if (tree.type === type) found.push(tree);
  for (const child of tree.children ?? []) collect(child, type, found);
  return found;
}

function textOf(tree) {
  return collect(tree, "text")
    .map((n) => n.value)
    .join("");
}

test("splitVariableSelection splits the composite value the CMS writes", () => {
  assert.deepEqual(splitVariableSelection("product_name"), {
    setKey: "product",
    variableKey: "name",
  });
  assert.deepEqual(splitVariableSelection(undefined), {
    setKey: undefined,
    variableKey: undefined,
  });
});

test("resolveVariable returns the translation for the requested locale", () => {
  assert.equal(
    resolveVariable(VARIABLE_SETS, "product_name", "de"),
    "docStatik"
  );
});

test("resolveVariable falls back when the locale has no translation", () => {
  assert.equal(
    resolveVariable(VARIABLE_SETS, "product_english-only", "de", "en"),
    "only English"
  );
});

test("resolveVariable returns null for an unknown set, variable or empty translations", () => {
  assert.equal(resolveVariable(VARIABLE_SETS, "nope_name", "en"), null);
  assert.equal(resolveVariable(VARIABLE_SETS, "product_nope", "en"), null);
  assert.equal(
    resolveVariable(VARIABLE_SETS, "product_untranslated", "en"),
    null
  );
  assert.equal(resolveVariable(VARIABLE_SETS, undefined, "en"), null);
});

test("initcapValue capitalises only the first character", () => {
  assert.equal(initcapValue("only English"), "Only English");
  assert.equal(initcapValue(""), "");
});

test("a variable in a cell is replaced by its text", () => {
  const tree = runPlugin(
    'Made with <VariableSet variableSelection="product_name" />.'
  );
  assert.equal(textOf(tree), "Made with docStatic.");
  assert.equal(collect(tree, "html").length, 0);
});

test("a variable in a cell resolves to the locale it is rendered for", () => {
  const tree = runPlugin('<VariableSet variableSelection="product_name" />', {
    locale: "de",
  });
  assert.equal(textOf(tree), "docStatik");
});

test("an explicit lang prop wins over the rendering locale", () => {
  const tree = runPlugin(
    '<VariableSet variableSelection="product_name" lang="en" />',
    { locale: "de" }
  );
  assert.equal(textOf(tree), "docStatic");
});

test("initcap and bold props are honoured", () => {
  const initcapped = runPlugin(
    '<VariableSet variableSelection="product_english-only" initcap />'
  );
  assert.equal(textOf(initcapped), "Only English");

  const bolded = runPlugin(
    '<VariableSet variableSelection="product_name" bold={true} />'
  );
  assert.equal(collect(bolded, "strong").length, 1);
  assert.equal(textOf(bolded), "docStatic");
});

test("bold={false} is not bold", () => {
  const tree = runPlugin(
    '<VariableSet variableSelection="product_name" bold={false} />'
  );
  assert.equal(collect(tree, "strong").length, 0);
});

test("an unresolved variable renders the NOT FOUND marker naming the selection", () => {
  const tree = runPlugin('<VariableSet variableSelection="product_nope" />');
  assert.equal(textOf(tree), "product_nope NOT FOUND");

  const [marker] = collect(tree, "emphasis");
  assert.equal(marker.data.hName, "span");
  assert.equal(marker.data.hProperties.className, "key--error");
});

test("a VariableSet with no selection is marked, not silently dropped", () => {
  const tree = runPlugin("<VariableSet />");
  assert.equal(textOf(tree), "VariableSet NOT FOUND");
});

test("a reference inside inline code is left alone", () => {
  const tree = runPlugin(
    'Write `<VariableSet variableSelection="product_name" />` in a cell.'
  );
  assert.equal(collect(tree, "inlineCode").length, 1);
  assert.ok(!textOf(tree).includes("docStatic"));
});

test("other inline HTML is left untouched", () => {
  const tree = runPlugin("a <span> b");
  assert.equal(collect(tree, "html").length, 1);
});
