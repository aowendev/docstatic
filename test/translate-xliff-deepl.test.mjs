/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Tests for the protect/restore logic in translate_xliff_deepl.js — the
 * mechanism that keeps fenced code blocks and JSX/component markers
 * (including their children) out of what gets sent to DeepL.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import mod from "../scripts/translate_xliff_deepl.js";

const { protect, restore, placeholderIdsAreIntact, parseUnits, batchByLimits } =
  mod;

test("protects a fenced code block from translation and restores it verbatim", () => {
  const text = [
    "Some prose before.",
    "",
    "```js",
    'const notTranslated = "code fence";',
    "```",
    "",
    "Some prose after.",
  ].join("\n");

  const { protectedText, placeholders } = protect(text);

  assert.ok(!protectedText.includes("notTranslated"));
  assert.equal(restore(protectedText, placeholders), text);
});

test("protects a self-closing JSX marker, props and all", () => {
  const text =
    'Intro.\n\n(jsx:Figure img="/img/a.png" caption="A caption (with parens)"/)\n\nOutro.';

  const { protectedText, placeholders } = protect(text);

  assert.ok(!protectedText.includes("Figure"));
  assert.ok(protectedText.includes("Intro."));
  assert.ok(protectedText.includes("Outro."));
  assert.equal(restore(protectedText, placeholders), text);
});

test("protects a paired JSX marker and its children as one opaque span", () => {
  const text =
    'Before.\n\n(jsx:Admonition type="note")This text must not be translated.(/jsx:Admonition)\n\nAfter.';

  const { protectedText, placeholders } = protect(text);

  assert.ok(!protectedText.includes("must not be translated"));
  assert.ok(protectedText.includes("Before."));
  assert.ok(protectedText.includes("After."));
  assert.equal(restore(protectedText, placeholders), text);
});

test("placeholderIdsAreIntact detects a dropped placeholder", () => {
  const text = 'Hello <ph id="0"/> world <ph id="1"/>.';
  assert.equal(placeholderIdsAreIntact(text, 2), true);

  const dropped = "Hello world.";
  assert.equal(placeholderIdsAreIntact(dropped, 2), false);

  const duplicated = 'Hello <ph id="0"/> world <ph id="0"/>.';
  assert.equal(placeholderIdsAreIntact(duplicated, 2), false);
});

test("parseUnits extracts id, source and target from a unit block", () => {
  const xml = [
    '<xliff version="2.1" srcLang="en" trgLang="fr">',
    '  <file id="fr" original="docstatic-export">',
    '    <unit id="sample">',
    '      <notes><note id="n1">path:sample.mdx</note></notes>',
    "      <segment>",
    '        <source xml:space="preserve">Hello</source>',
    '        <target xml:space="preserve">Bonjour (old)</target>',
    "      </segment>",
    "    </unit>",
    "  </file>",
    "</xliff>",
  ].join("\n");

  const units = parseUnits(xml);
  assert.equal(units.length, 1);
  assert.equal(units[0].id, "sample");
  assert.equal(units[0].sourceXml, "Hello");
  assert.equal(units[0].targetXml, "Bonjour (old)");
});

test("batchByLimits splits on the count limit", () => {
  const items = Array.from({ length: 5 }, (_, i) => ({
    protectedText: `text ${i}`,
  }));
  const batches = batchByLimits(items, 2, 1024 * 1024);
  assert.equal(batches.length, 3);
  assert.equal(batches[0].length, 2);
  assert.equal(batches[2].length, 1);
});

test("batchByLimits splits on the byte-size limit", () => {
  const items = [
    { protectedText: "a".repeat(60) },
    { protectedText: "b".repeat(60) },
  ];
  const batches = batchByLimits(items, 50, 100);
  assert.equal(batches.length, 2);
});
