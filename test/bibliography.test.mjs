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
import { foreignFrontmatterLines } from "../scripts/generate-bibliography.mjs";
import { cslHtmlToMarkdown, cslHtmlToTokens } from "../scripts/lib/csl.mjs";
import {
  NON_CSL_FIELDS,
  REFERENCE_TYPES,
} from "../src/components/Cite/cslTerms.mjs";
import {
  mapLibraryToCslJson,
  mapToCslJson,
  toCslDate,
  toCslName,
} from "../src/components/Cite/mapToCslJson.mjs";

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

test("citeproc markup becomes tokens the browser can render without a parser", () => {
  assert.deepEqual(cslHtmlToTokens("Smith, <i>Title</i>."), [
    "Smith, ",
    { i: ["Title"] },
    ".",
  ]);
  assert.deepEqual(cslHtmlToTokens("<b>Bold</b>"), [{ b: ["Bold"] }]);
  assert.deepEqual(cslHtmlToTokens('<a href="https://x.test/">x</a>'), [
    { a: "https://x.test/", c: ["x"] },
  ]);
});

test("numeric styles keep their bracketed number in tokens too", () => {
  const html =
    '<div class="csl-entry"><div class="csl-left-margin">[1]</div>' +
    '<div class="csl-right-inline">J. Smith, <i>Title</i>.</div></div>';
  assert.deepEqual(cslHtmlToTokens(html), [
    "[1] J. Smith, ",
    { i: ["Title"] },
    ".",
  ]);
});

test("tokens decode entities but do not escape for MDX", () => {
  // The markdown converter has to escape braces and angle brackets so the
  // string survives an MDX parse. Tokens are never parsed, so escaping them
  // would put backslashes on the page.
  assert.deepEqual(cslHtmlToTokens("Smith &amp; Jones"), ["Smith & Jones"]);
  assert.deepEqual(cslHtmlToTokens("Set {a} and 3 &lt; 4"), [
    "Set {a} and 3 < 4",
  ]);
});

test("tokens keep the text of markup they cannot represent", () => {
  assert.deepEqual(
    cslHtmlToTokens('<span style="font-variant:small-caps;">caps</span> after'),
    ["caps", " after"]
  );
});

test("nested emphasis nests in the tokens", () => {
  assert.deepEqual(cslHtmlToTokens("<i><b>both</b></i>"), [
    { i: [{ b: ["both"] }] },
  ]);
});

test("the sources page is named for what it actually contains", async () => {
  // A bibliography may list works the author has not cited; a reference list,
  // by convention, may not. So the two modes get different default titles, and
  // switching the setting renames the page.
  const { stringsFor } = await import("../scripts/generate-bibliography.mjs");

  assert.equal(stringsFor("en", true).title, "Bibliography");
  assert.equal(stringsFor("en", false).title, "References");

  // Every site language has both, so a translated page is never left with an
  // English heading.
  for (const lang of ["en", "de", "es", "fr", "ja"]) {
    for (const includeUncited of [true, false]) {
      const strings = stringsFor(lang, includeUncited);
      assert.ok(strings.title, `${lang} needs a title for both modes`);
      assert.ok(strings.description, `${lang} needs a description`);
    }
  }

  // Spanish and French carry the distinction natively; the two modes must not
  // collapse to the same word there.
  for (const lang of ["en", "es", "fr"]) {
    assert.notEqual(
      stringsFor(lang, true).title,
      stringsFor(lang, false).title,
      `${lang} distinguishes a bibliography from a reference list`
    );
  }
});

test("cited-only mode keeps just the sources the doc set cites", async () => {
  const { citedOnly } = await import("../scripts/generate-bibliography.mjs");
  const items = { a: { id: "a" }, b: { id: "b" }, c: { id: "c" } };

  assert.deepEqual(Object.keys(citedOnly(items, new Set(["a", "c"]))), [
    "a",
    "c",
  ]);
  assert.deepEqual(Object.keys(citedOnly(items, new Set())), []);
  // A key cited but missing from the library cannot conjure an entry.
  assert.deepEqual(Object.keys(citedOnly(items, new Set(["a", "zz"]))), ["a"]);
});

test("a site language finds its CSL locale without a code change", async () => {
  const { localeFor, hasLocale } = await import("../scripts/lib/csl.mjs");

  // The five this site ships with resolve to vendored files.
  for (const [lang, expected] of [
    ["de", "de-DE"],
    ["es", "es-ES"],
    ["fr", "fr-FR"],
    ["ja", "ja-JP"],
  ]) {
    assert.equal(localeFor(lang, null), expected);
    assert.ok(
      hasLocale(expected),
      `locales-${expected}.xml should be vendored`
    );
  }

  // English is the one language with no forced locale: only Oxford declares a
  // default, so the setting decides and blank leaves it to the style.
  assert.equal(localeFor("en", null), null);
  assert.equal(localeFor("en", "en-GB"), "en-GB");
});

test("an unvendored language degrades to English and says so", async () => {
  const { localeFor, missingLocales } = await import("../scripts/lib/csl.mjs");

  // Italian is not vendored here. It must not silently claim a locale: null
  // tells citeproc to use the style's default rather than hand it a locale file
  // that does not exist.
  assert.equal(localeFor("it", null), null);

  // ...and it must be reported, naming the file that would fix it.
  const missing = missingLocales(["en", "de", "it"]);
  assert.deepEqual(missing, [{ lang: "it", expected: "it-IT" }]);

  // A language that is vendored is never reported.
  assert.deepEqual(missingLocales(["en", "de", "fr"]), []);
});

/**
 * The references page is generated, but it lives in the docs collection, so
 * the CMS stamps lastmod/modifiedBy onto it. The generator used to rebuild the
 * frontmatter from a fixed list and throw those away on every run, which put
 * the page back in `git status` after every build. What it owns it may
 * rewrite; what it does not own it has to carry.
 */

const GENERATED_PAGE = [
  "---",
  'title: "References"',
  'description: "Works cited."',
  "draft: false",
  "review: false",
  "translate: false",
  "approved: true",
  "published: true",
  "unlisted: false",
  "sidebar_position: 999",
  "---",
  "",
  "# References",
].join("\n");

function withFrontmatter(extraLines) {
  const lines = GENERATED_PAGE.split("\n");
  const close = lines.indexOf("---", 1);
  return [...lines.slice(0, close), ...extraLines, ...lines.slice(close)].join(
    "\n"
  );
}

test("frontmatter the generator does not own is carried forward", () => {
  const source = withFrontmatter([
    "modifiedBy: aowendev <someone@example.com>",
    "lastmod: '2026-08-24T21:41:47.779Z'",
  ]);

  assert.deepEqual(foreignFrontmatterLines(source), [
    "modifiedBy: aowendev <someone@example.com>",
    "lastmod: '2026-08-24T21:41:47.779Z'",
  ]);
});

test("frontmatter the generator owns is not carried, so it stays authoritative", () => {
  assert.deepEqual(foreignFrontmatterLines(GENERATED_PAGE), []);
});

test("a carried value keeps its own formatting rather than being re-serialised", () => {
  const line = "modifiedBy: aowendev <someone@example.com>";
  assert.deepEqual(foreignFrontmatterLines(withFrontmatter([line])), [line]);
});

test("a multi-line value is carried with the lines that belong to it", () => {
  const source = withFrontmatter([
    "tags:",
    "  - reference",
    "  - generated",
    "lastmod: '2026-08-24T21:41:47.779Z'",
  ]);

  assert.deepEqual(foreignFrontmatterLines(source), [
    "tags:",
    "  - reference",
    "  - generated",
    "lastmod: '2026-08-24T21:41:47.779Z'",
  ]);
});

test("the continuation lines of an owned key are dropped with it", () => {
  const source = withFrontmatter(["keep: yes"]).replace(
    "sidebar_position: 999",
    ["sidebar_position: 999", "description:", "  - not really a list"].join(
      "\n"
    )
  );

  assert.deepEqual(foreignFrontmatterLines(source), ["keep: yes"]);
});

test("carrying is idempotent, so a second run reproduces the same page", () => {
  const carried = ["lastmod: '2026-08-24T21:41:47.779Z'"];
  const once = withFrontmatter(carried);
  assert.deepEqual(foreignFrontmatterLines(once), carried);
  assert.deepEqual(
    foreignFrontmatterLines(withFrontmatter(foreignFrontmatterLines(once))),
    carried
  );
});

test("a page with no usable frontmatter carries nothing", () => {
  assert.deepEqual(foreignFrontmatterLines("# Just a heading"), []);
  assert.deepEqual(
    foreignFrontmatterLines("---\nlastmod: x\n# never closed"),
    []
  );
  assert.deepEqual(foreignFrontmatterLines(undefined), []);
  assert.deepEqual(foreignFrontmatterLines(""), []);
});
