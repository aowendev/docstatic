/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The bibliography generator turns CMS-shaped entries into CSL-JSON and hands
 * them to citeproc. Two things can go wrong quietly: a mapped property that is
 * not real CSL (csl-data.json sets additionalProperties:false, so citeproc
 * discards the whole item rather than complaining), and a re-vendored style
 * that changes class from in-text to note, which would silently move every
 * citation into a footnote.
 *
 * These check shape and invariants. They deliberately do not assert formatted
 * output against a vendored style - that tests upstream, not us, and churns on
 * every re-vendor.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import bibliography from "../reuse/bibliography/index.json" with {
  type: "json",
};
import { cslHtmlToMarkdown } from "../scripts/lib/csl.mjs";
import {
  NON_CSL_FIELDS,
  REFERENCE_TYPES,
} from "../src/components/Cite/cslTerms.js";
import {
  mapLibraryToCslJson,
  mapToCslJson,
  toCslDate,
  toCslName,
} from "../src/components/Cite/mapToCslJson.js";

const dataSchema = JSON.parse(
  readFileSync(new URL("../csl/csl-data.json", import.meta.url), "utf8")
);

const stylesDir = new URL("../csl/styles/", import.meta.url);
const localesDir = new URL("../csl/locales/", import.meta.url);

/** Every property csl-data.json allows on an item. */
const cslProperties = new Set(Object.keys(dataSchema.items.properties));

/**
 * The class each vendored style is expected to have. A style that flips between
 * these needs a different rendering path, so the change must be deliberate.
 */
const EXPECTED_STYLE_CLASS = {
  "chicago-author-date": "in-text",
  "chicago-notes-bibliography": "note",
  "harvard-cite-them-right": "in-text",
  ieee: "in-text",
  "oxford-guide-to-style-notes": "note",
};

test("every mapped property is a real CSL property", () => {
  for (const entry of bibliography.bibliography) {
    const item = mapToCslJson(entry);
    for (const property of Object.keys(item)) {
      assert.ok(
        cslProperties.has(property),
        `"${property}" on ${entry.key} is not in csl-data.json, so citeproc would discard the whole item`
      );
    }
  }
});

test("Tina bookkeeping never survives into CSL-JSON", () => {
  const item = mapToCslJson({
    key: "x",
    type: "book",
    title: "T",
    _template: "reference",
    cslJson: "",
  });

  for (const field of NON_CSL_FIELDS) {
    assert.ok(!(field in item), `${field} must be stripped`);
  }
});

test("contributors become CSL name variables, empty rows dropped", () => {
  const item = mapToCslJson({
    key: "x",
    type: "book",
    authors: [
      { family: "Smith", given: "Jane", _template: "contributor" },
      { _template: "contributor" },
      { literal: "Some Institute", _template: "contributor" },
    ],
  });

  assert.deepEqual(item.author, [
    { family: "Smith", given: "Jane" },
    { literal: "Some Institute" },
  ]);
});

test("dates become date-parts, not strings", () => {
  assert.deepEqual(toCslDate("2020-05-01"), { "date-parts": [[2020, 5, 1]] });
  assert.deepEqual(toCslDate("2019-11"), { "date-parts": [[2019, 11]] });
  assert.deepEqual(toCslDate("2024"), { "date-parts": [[2024]] });
  assert.equal(toCslDate("not a date"), null);
  assert.equal(toCslDate(undefined), null);
});

test("a date that will not parse is dropped rather than passed through", () => {
  const item = mapToCslJson({ key: "x", type: "book", issued: "circa 1920" });
  assert.ok(!("issued" in item), "an unparseable date must not reach citeproc");
});

test("the cslJson override replaces mapped fields but keeps the key as id", () => {
  const item = mapToCslJson({
    key: "mykey",
    type: "book",
    title: "Ignored",
    cslJson: JSON.stringify({
      id: "somethingelse",
      type: "thesis",
      title: "Real",
    }),
  });

  assert.equal(
    item.id,
    "mykey",
    "the key is what <Cite> refers to and must win"
  );
  assert.equal(item.title, "Real");
  assert.equal(item.type, "thesis");
});

test("malformed cslJson falls back to the mapped fields", () => {
  const item = mapToCslJson({
    key: "x",
    type: "book",
    title: "Mapped",
    cslJson: "{ not json",
  });

  assert.equal(item.title, "Mapped");
});

test("an entry with no key is dropped rather than given a bad id", () => {
  assert.equal(mapToCslJson({ type: "book", title: "T" }), null);
  assert.equal(mapToCslJson({ key: "   ", type: "book" }), null);
});

test("every offered reference type maps without producing junk properties", () => {
  for (const { value } of REFERENCE_TYPES) {
    const item = mapToCslJson({
      key: `k-${value}`,
      type: value,
      title: "T",
      issued: "2020",
    });
    assert.equal(item.type, value);
    for (const property of Object.keys(item)) {
      assert.ok(
        cslProperties.has(property),
        `${property} is not a CSL property`
      );
    }
  }
});

test("the library maps to an id-keyed lookup", () => {
  const items = mapLibraryToCslJson(bibliography.bibliography);
  assert.equal(Object.keys(items).length, bibliography.bibliography.length);
  for (const entry of bibliography.bibliography) {
    assert.equal(items[entry.key].id, entry.key);
  }
});

test("a missing or malformed library does not throw", () => {
  assert.deepEqual(mapLibraryToCslJson(undefined), {});
  assert.deepEqual(mapLibraryToCslJson(null), {});
  assert.deepEqual(mapLibraryToCslJson([]), {});
});

test("toCslName ignores anything that is not a filled-in row", () => {
  assert.equal(toCslName(null), null);
  assert.equal(toCslName({}), null);
  assert.equal(toCslName({ family: "   " }), null);
});

test("every vendored style parses and keeps the class it was chosen for", () => {
  const files = readdirSync(stylesDir).filter((f) => f.endsWith(".csl"));

  assert.deepEqual(
    files.map((f) => f.replace(/\.csl$/, "")).sort(),
    Object.keys(EXPECTED_STYLE_CLASS).sort(),
    "vendored styles and the styles the Settings dropdown offers must match"
  );

  for (const file of files) {
    const name = file.replace(/\.csl$/, "");
    const xml = readFileSync(new URL(file, stylesDir), "utf8");

    assert.match(xml, /<style[\s>]/, `${file} does not look like a CSL style`);
    assert.match(
      xml,
      /<bibliography[\s>]/,
      `${file} has no bibliography element`
    );

    const cls = /<style[^>]*\sclass="([a-z-]+)"/.exec(xml)?.[1];
    assert.equal(
      cls,
      EXPECTED_STYLE_CLASS[name],
      `${name} is class="${cls}" - a change here moves citations between the running text and footnotes`
    );
  }
});

test("a locale is vendored for every language the generator maps", () => {
  const locales = readdirSync(localesDir);
  for (const name of ["en-GB", "en-US", "de-DE", "es-ES", "fr-FR", "ja-JP"]) {
    assert.ok(
      locales.includes(`locales-${name}.xml`),
      `locales-${name}.xml is missing; citeproc needs a locale even for English`
    );
  }
});

test("citeproc markup becomes MDX-safe markdown", () => {
  assert.equal(cslHtmlToMarkdown("<i>Title</i>."), "*Title*.");
  assert.equal(cslHtmlToMarkdown("<b>Bold</b>"), "**Bold**");
  assert.equal(
    cslHtmlToMarkdown('<div class="csl-entry">Smith, J. 2020.</div>'),
    "Smith, J. 2020."
  );
  assert.equal(
    cslHtmlToMarkdown('<a href="https://x.test/">x</a>'),
    "[x](https://x.test/)"
  );
});

test("numeric styles keep their bracketed number", () => {
  const html =
    '<div class="csl-entry"><div class="csl-left-margin">[1]</div>' +
    '<div class="csl-right-inline">J. Smith, <i>Title</i>.</div></div>';
  assert.equal(cslHtmlToMarkdown(html), "[1] J. Smith, *Title*.");
});

test("MDX-hostile characters are escaped, not emitted raw", () => {
  const out = cslHtmlToMarkdown("Set {a, b} and 3 &lt; 4");
  assert.ok(
    !/(?<!\\)[{}]/.test(out),
    `unescaped brace would break MDX: ${out}`
  );
  assert.ok(
    !/(?<!\\)<(?![/a-zA-Z])/.test(out),
    `unescaped < would break MDX: ${out}`
  );
});

test("entities are decoded so readers do not see &amp;", () => {
  assert.equal(cslHtmlToMarkdown("Smith &amp; Jones"), "Smith & Jones");
  assert.equal(cslHtmlToMarkdown("&#8220;Quoted&#8221;"), "“Quoted”");
});
