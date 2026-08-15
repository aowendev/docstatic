/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * src/utils/linkChecker.js is the browser counterpart to
 * scripts/generate-link-report.js, and replaceLinkNodeWithUrl() is the one
 * function in it with real write consequences: it produces the rich-text
 * body the Link Health dashboard's Replace button sends straight to a
 * document via GraphQL. The shape it produces was verified by hand against
 * the actual @tinacms/mdx parser/serializer (parsing a real `<Url
 * urlKey="..." linkText={[...]} />` string and confirming the resulting node
 * round-trips byte-for-byte); these tests cover the tree-editing logic
 * itself — finding the right node among siblings and nested structure,
 * leaving everything else untouched, and never falling back to anything but
 * the matched link's own text.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractLinksFromRichText,
  isWikipediaUrl,
  replaceLinkNodeWithUrl,
} from "../src/utils/linkChecker.js";

const textNode = (text) => ({ type: "text", text });
const linkNode = (text, url) => ({
  type: "a",
  url,
  children: [textNode(text)],
});
const paragraph = (...children) => ({ type: "p", children });
const root = (...children) => ({ type: "root", children });

test("replaces a matching link with a Url node using the link's own text", () => {
  const body = root(
    paragraph(
      textNode("Refer to "),
      linkNode("CALS table model", "https://oasis.org/cals"),
      textNode(" for details.")
    )
  );

  const { body: next, replacedCount } = replaceLinkNodeWithUrl(
    body,
    "https://oasis.org/cals",
    { urlKey: "cals-table-model", lang: "en" }
  );

  assert.equal(replacedCount, 1);
  const node = next.children[0].children[1];
  assert.equal(node.type, "mdxJsxTextElement");
  assert.equal(node.name, "Url");
  assert.equal(node.props.urlKey, "cals-table-model");
  assert.deepEqual(node.props.linkText, [
    { lang: "en", text: "CALS table model" },
  ]);
  // Untouched siblings are the same content, not just equal.
  assert.equal(next.children[0].children[0].text, "Refer to ");
  assert.equal(next.children[0].children[2].text, " for details.");
});

test("leaves the original body untouched", () => {
  const body = root(paragraph(linkNode("Docs", "https://example.com/docs")));

  replaceLinkNodeWithUrl(body, "https://example.com/docs", {
    urlKey: "docs",
    lang: "en",
  });

  assert.equal(body.children[0].children[0].type, "a");
});

test("only replaces links matching the target URL, and only those", () => {
  const body = root(
    paragraph(
      linkNode("Docs", "https://example.com/docs"),
      textNode(" and "),
      linkNode("Blog", "https://example.com/blog")
    )
  );

  const { body: next, replacedCount } = replaceLinkNodeWithUrl(
    body,
    "https://example.com/docs",
    { urlKey: "docs", lang: "en" }
  );

  assert.equal(replacedCount, 1);
  assert.equal(next.children[0].children[0].type, "mdxJsxTextElement");
  assert.equal(next.children[0].children[2].type, "a");
  assert.equal(next.children[0].children[2].url, "https://example.com/blog");
});

test("each matching link keeps its own text — never one borrowing another's", () => {
  // The real case this guards: the same OASIS page linked twice in one doc
  // with different wording.
  const body = root(
    paragraph(linkNode("CALS table model", "https://oasis.org/cals")),
    paragraph(linkNode("CALS table model reference", "https://oasis.org/cals"))
  );

  const { body: next, replacedCount } = replaceLinkNodeWithUrl(
    body,
    "https://oasis.org/cals",
    { urlKey: "cals-table-model", lang: "en" }
  );

  assert.equal(replacedCount, 2);
  assert.deepEqual(next.children[0].children[0].props.linkText, [
    { lang: "en", text: "CALS table model" },
  ]);
  assert.deepEqual(next.children[1].children[0].props.linkText, [
    { lang: "en", text: "CALS table model reference" },
  ]);
});

test("finds a link nested inside a list item", () => {
  const body = root({
    type: "ul",
    children: [
      {
        type: "li",
        children: [paragraph(linkNode("VSCodium", "https://vscodium.com/"))],
      },
    ],
  });

  const { replacedCount } = replaceLinkNodeWithUrl(
    body,
    "https://vscodium.com/",
    { urlKey: "vscodium", lang: "en" }
  );

  assert.equal(replacedCount, 1);
});

test("normalizes the target URL the same way a title or trailing slash would be stripped", () => {
  const body = root(paragraph(linkNode("KaTeX", 'https://katex.org "Title"')));

  const { replacedCount } = replaceLinkNodeWithUrl(body, "https://katex.org", {
    urlKey: "katex",
    lang: "en",
  });

  assert.equal(replacedCount, 1);
});

test("a URL that doesn't appear makes no change", () => {
  const body = root(paragraph(linkNode("Docs", "https://example.com/docs")));

  const { body: next, replacedCount } = replaceLinkNodeWithUrl(
    body,
    "https://example.com/nowhere",
    { urlKey: "nowhere", lang: "en" }
  );

  assert.equal(replacedCount, 0);
  assert.equal(next.children[0].children[0].type, "a");
});

test("an empty or malformed body is handled without throwing", () => {
  assert.deepEqual(
    replaceLinkNodeWithUrl(null, "https://example.com/", {
      urlKey: "x",
      lang: "en",
    }),
    { body: null, replacedCount: 0 }
  );
  assert.deepEqual(
    replaceLinkNodeWithUrl({ type: "root" }, "https://example.com/", {
      urlKey: "x",
      lang: "en",
    }),
    { body: { type: "root" }, replacedCount: 0 }
  );
});

test("falls back to the URL only when the matched link has no text of its own", () => {
  const body = root(paragraph(linkNode("", "https://example.com/bare")));

  const { body: next } = replaceLinkNodeWithUrl(
    body,
    "https://example.com/bare",
    { urlKey: "bare", lang: "en" }
  );

  assert.deepEqual(next.children[0].children[0].props.linkText, [
    { lang: "en", text: "https://example.com/bare" },
  ]);
});

/* ------------------------------ defaultText ------------------------------ */

test("omits linkText when the matched text equals the resolved default text", () => {
  const body = root(paragraph(linkNode("Infima", "https://infima.dev/")));

  const { body: next } = replaceLinkNodeWithUrl(body, "https://infima.dev/", {
    urlKey: "infima",
    lang: "en",
    defaultText: "Infima",
  });

  const node = next.children[0].children[0];
  assert.deepEqual(node.props, { urlKey: "infima" });
  assert.equal("linkText" in node.props, false);
});

test("still overrides when the matched text differs from the default text", () => {
  const body = root(
    paragraph(linkNode("Infima website", "https://infima.dev/"))
  );

  const { body: next } = replaceLinkNodeWithUrl(body, "https://infima.dev/", {
    urlKey: "infima",
    lang: "en",
    defaultText: "Infima",
  });

  assert.deepEqual(next.children[0].children[0].props.linkText, [
    { lang: "en", text: "Infima website" },
  ]);
});

test("no defaultText means always override, same as before this comparison existed", () => {
  const body = root(paragraph(linkNode("Infima", "https://infima.dev/")));

  const { body: next } = replaceLinkNodeWithUrl(body, "https://infima.dev/", {
    urlKey: "infima",
    lang: "en",
  });

  assert.deepEqual(next.children[0].children[0].props.linkText, [
    { lang: "en", text: "Infima" },
  ]);
});

test("each occurrence is compared against defaultText independently", () => {
  // One matches the default, one doesn't — only the second gets an override.
  const body = root(
    paragraph(linkNode("CALS table model", "https://oasis.org/cals")),
    paragraph(linkNode("CALS table model reference", "https://oasis.org/cals"))
  );

  const { body: next } = replaceLinkNodeWithUrl(
    body,
    "https://oasis.org/cals",
    { urlKey: "cals-table-model", lang: "en", defaultText: "CALS table model" }
  );

  assert.equal("linkText" in next.children[0].children[0].props, false);
  assert.deepEqual(next.children[1].children[0].props.linkText, [
    { lang: "en", text: "CALS table model reference" },
  ]);
});

/* -------- sanity check against extractLinksFromRichText -------- */

test("a link replaceLinkNodeWithUrl acts on is one extractLinksFromRichText would have found", () => {
  const body = root(paragraph(linkNode("Infima", "https://infima.dev/")));

  const found = extractLinksFromRichText(body, "/docs/x.mdx");
  assert.equal(found.length, 1);
  assert.equal(found[0].url, "https://infima.dev/");

  const { replacedCount } = replaceLinkNodeWithUrl(body, found[0].url, {
    urlKey: "infima",
    lang: "en",
  });
  assert.equal(replacedCount, 1);
});

test("isWikipediaUrl agrees with the Node script's version", () => {
  assert.ok(isWikipediaUrl("https://en.wikipedia.org/wiki/Docusaurus"));
  assert.ok(!isWikipediaUrl("https://example.com/"));
});
