/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Characterisation tests for the XLIFF exporter.
 *
 * These lock in current behaviour rather than assert an ideal. xliff.js is the
 * largest and most intricate file in the repo and it round-trips authored
 * content, so the point is to make any change in what it emits visible.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exportOutOfDateAsXliff,
  importXliffBundle,
  parseJsxProps,
  parseMarkdownToTinaAst,
} from "../src/utils/xliff.js";
import { CURRENT, makeClient } from "./helpers/fake-tina-client.mjs";

const SAMPLE = `---
title: Sample
lastmod: "2026-01-01T00:00:00.000Z"
---

Intro with a [markdown link](https://example.com/docs) inline.

<Figure img="/img/a.png" caption="A caption" />

\`\`\`js
const notTranslated = "code fence";
\`\`\`
`;

test("emits a well-formed XLIFF 2.1 document", async () => {
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "sample", raw: SAMPLE }]),
    "fr"
  );

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>'));
  assert.match(xml, /<xliff version="2\.1" srcLang="en" trgLang="fr"/);
  assert.ok(xml.trimEnd().endsWith("</xliff>"));
  assert.equal((xml.match(/<unit /g) || []).length, 1);
  assert.match(xml, /<unit id="sample">/);
});

test("carries path, title and both lastmods as notes", async () => {
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "sample", raw: SAMPLE }]),
    "fr"
  );

  assert.match(xml, /<note id="n1">path:sample\.mdx<\/note>/);
  assert.match(xml, /<note id="n2">title:sample<\/note>/);
  assert.match(xml, /lastmod:2026-01-01T00:00:00\.000Z/);
});

test("preserves markdown link targets in the source segment", async () => {
  // The link-repair path in xliff.js exists to stop hrefs being lost in
  // conversion. If that behaviour regresses, this is what catches it.
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "sample", raw: SAMPLE }]),
    "fr"
  );

  assert.match(xml, /\[markdown link\]\(https:\/\/example\.com\/docs\)/);
});

test("converts JSX to marker form so CAT tools do not eat the tags", async () => {
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "sample", raw: SAMPLE }]),
    "fr"
  );

  assert.match(xml, /\(jsx:Figure /);
  assert.ok(!xml.includes("<Figure"), "raw angle-bracket JSX must not survive");
});

test("keeps fenced code blocks intact", async () => {
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "sample", raw: SAMPLE }]),
    "fr"
  );

  assert.match(xml, /```js/);
  assert.match(xml, /const notTranslated/);
});

test("skips documents whose translation is already current", async () => {
  const xml = await exportOutOfDateAsXliff(
    makeClient([
      { name: "stale", raw: SAMPLE },
      { name: "fresh", raw: SAMPLE, translationLastmod: CURRENT },
    ]),
    "fr"
  );

  assert.match(xml, /<unit id="stale">/);
  assert.ok(
    !xml.includes('<unit id="fresh">'),
    "an up-to-date translation should not be exported"
  );
});

test("escapes XML metacharacters in content", async () => {
  const raw = `---
title: Escapes
---

Text with <angle> & ampersand and "quotes".
`;
  const xml = await exportOutOfDateAsXliff(
    makeClient([{ name: "escapes", raw }]),
    "fr"
  );

  assert.ok(!/<angle>/.test(xml), "raw angle brackets must be escaped");
  assert.match(xml, /&amp;|&lt;|&quot;/);
});

test("importXliffBundle degrades to a result array instead of throwing", async () => {
  // The import path parses with DOMParser, which only exists in the browser.
  // Rather than pull in a DOM implementation — sync-template would push it
  // into every scaffolded site — assert the contract that holds everywhere:
  // importXliffBundle reports failure through its return value and never
  // throws at the caller.
  const client = makeClient([{ name: "sample", raw: SAMPLE }]);
  const xml = await exportOutOfDateAsXliff(client, "fr");

  const results = await importXliffBundle({ ...client }, xml, "fr");

  assert.ok(Array.isArray(results), "always returns an array");
  assert.ok(results.length > 0, "reports something rather than staying silent");
  assert.equal(results[0].status, "error");
  assert.ok(
    typeof results[0].error === "string" && results[0].error.length > 0,
    "the failure carries a message"
  );
});

test("importXliffBundle rejects malformed input the same way", async () => {
  const results = await importXliffBundle({}, "not xliff at all", "fr");

  assert.ok(Array.isArray(results));
  assert.equal(results[0].status, "error");
});

/**
 * parseMarkdownToTinaAst is what importXliffBundle actually uses to turn a
 * translated <target> back into the AST Tina writes to disk, and it's pure
 * (no DOMParser dependency) so - unlike importXliffBundle itself - it can be
 * exercised directly in Node. These cases target the bug that shipped a
 * broken CALS Tables translation: the old marker parser used
 * `\{[^}]*\}` for JSX props, which only matches one level of `{}`, so a
 * component with a deeply nested object prop (e.g.
 * `<CalsTable table={{ tgroup: { colspecs: [...] } }} />`) fell through to
 * plain-text handling instead of being recognised as JSX - and Tina's own
 * serializer then backslash-escaped the `[`/`:` characters in that text,
 * producing MDX that fails to compile.
 */

test("parseMarkdownToTinaAst resolves a self-closing marker with deeply nested object/array props", () => {
  const marker =
    '(jsx:CalsTable table={{ frame: "all", tgroup: { cols: 2, colspecs: [ { colname: "c1", colwidth: "1*" }, { colname: "c2" } ] } }} pgwide/)';
  const ast = parseMarkdownToTinaAst(marker);

  const node = ast.children[0];
  assert.equal(node.type, "mdxJsxFlowElement");
  assert.equal(node.name, "CalsTable");
  assert.equal(node.props.pgwide, true);
  assert.equal(node.props.table.frame, "all");
  assert.equal(node.props.table.tgroup.cols, 2);
  assert.equal(node.props.table.tgroup.colspecs.length, 2);
  assert.equal(node.props.table.tgroup.colspecs[0].colname, "c1");
  assert.equal(node.props.table.tgroup.colspecs[0].colwidth, "1*");
  assert.equal(node.props.table.tgroup.colspecs[1].colname, "c2");
});

test("parseMarkdownToTinaAst still resolves a simple paired marker (regression check)", () => {
  const marker =
    '(jsx:Admonition type="note" title="Scope")Body text here(/jsx:Admonition)';
  const ast = parseMarkdownToTinaAst(marker);

  const node = ast.children[0];
  assert.equal(node.type, "mdxJsxFlowElement");
  assert.equal(node.name, "Admonition");
  assert.equal(node.props.type, "note");
  assert.equal(node.props.title, "Scope");
  assert.equal(
    node.props.children.children[0].children[0].text,
    "Body text here"
  );
});

test("parseMarkdownToTinaAst resolves an inline self-closing marker with nested props inside a paragraph", () => {
  const md =
    "Before text (jsx:Figure meta={{ size: { width: 10, height: 20 } }}/) after text";
  const ast = parseMarkdownToTinaAst(md);

  const para = ast.children[0];
  assert.equal(para.type, "p");
  const jsxNode = para.children.find((c) => c.type === "mdxJsxTextElement");
  assert.ok(
    jsxNode,
    "the inline marker should be recognised as JSX, not left as text"
  );
  assert.equal(jsxNode.name, "Figure");
  assert.equal(jsxNode.props.meta.size.width, 10);
  assert.equal(jsxNode.props.meta.size.height, 20);
});

test("parseJsxProps keeps brackets inside quoted strings from being mistaken for structural braces", () => {
  const props = parseJsxProps(
    'caption="Revenue (Q1)" data={{ label: "a [b] c" }}'
  );
  assert.equal(props.caption, "Revenue (Q1)");
  assert.equal(props.data.label, "a [b] c");
});

test("parseJsxProps handles bare boolean props alongside typed ones", () => {
  const props = parseJsxProps('initcap count={3} label="x"');
  assert.equal(props.initcap, true);
  assert.equal(props.count, 3);
  assert.equal(props.label, "x");
});
