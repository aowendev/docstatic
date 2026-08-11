/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * RelatedTopics renders `/docs${path}` straight from docs-metadata.json, and it
 * appears on most doc pages. A path that does not match the route Docusaurus
 * creates is therefore a dead link repeated across the site — which is exactly
 * what happened with a slug'd document and a README index.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import generateDocsMetadata from "../scripts/generate-docs-metadata.js";

const { docUrlPath } = generateDocsMetadata;

test("a plain file maps to its path", () => {
  assert.equal(docUrlPath("introduction.mdx"), "/introduction");
  assert.equal(docUrlPath("guides/vale.mdx"), "/guides/vale");
  assert.equal(
    docUrlPath("guides/docs/create-doc.md"),
    "/guides/docs/create-doc"
  );
});

test("index names its parent directory", () => {
  assert.equal(docUrlPath("guides/index.mdx"), "/guides");
  assert.equal(docUrlPath("advanced/index.mdx"), "/advanced");
});

test("readme names its parent directory too", () => {
  // Regression: wiki/readme.mdx was recorded as /wiki/readme, which 404s.
  // Docusaurus serves it at /wiki.
  assert.equal(docUrlPath("wiki/readme.mdx"), "/wiki");
  assert.equal(docUrlPath("wiki/README.mdx"), "/wiki");
  assert.equal(docUrlPath("wiki/ReadMe.md"), "/wiki");
});

test("an absolute slug replaces the whole path", () => {
  // Regression: context-help.mdx sets slug: "/context-help" and is served at
  // /docs/context-help, not at its file path.
  assert.equal(
    docUrlPath("guides/markdown-features/context-help.mdx", "/context-help"),
    "/context-help"
  );
});

test("a relative slug resolves against the file's own directory", () => {
  assert.equal(
    docUrlPath("guides/markdown-features/x.mdx", "custom"),
    "/guides/markdown-features/custom"
  );
  assert.equal(docUrlPath("top-level.mdx", "custom"), "/custom");
});

test("case is preserved, because Docusaurus routes are case-sensitive", () => {
  assert.equal(
    docUrlPath("Getting-started---working-locally.mdx"),
    "/Getting-started---working-locally"
  );
});

test("an empty or whitespace slug falls back to the file path", () => {
  assert.equal(docUrlPath("guides/vale.mdx", ""), "/guides/vale");
  assert.equal(docUrlPath("guides/vale.mdx", "   "), "/guides/vale");
  assert.equal(docUrlPath("guides/vale.mdx", undefined), "/guides/vale");
});

test("slashes never double up", () => {
  assert.equal(docUrlPath("guides/vale.mdx", "/x/"), "/x");
  assert.equal(docUrlPath("guides/vale.mdx", "//x"), "/x");
});

test("a root-level readme maps to the docs root", () => {
  assert.equal(docUrlPath("readme.mdx"), "/");
  assert.equal(docUrlPath("index.mdx"), "/");
});
