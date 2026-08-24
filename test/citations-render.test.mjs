/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Citations and footnotes share one numbered sequence per page, and that
 * numbering is decided at build time in scripts/lib/notes.mjs.
 *
 * It has to be build time because citeproc chooses a short form over a full one
 * from `citation.properties.noteIndex` - a number assigned in the browser could
 * never reach it. And it has to be one sequence because Oxford numbers notes
 * "consecutively throughout" and Chicago lets a single note hold both a comment
 * and a citation.
 *
 * The generator and the remark plugin both import that module rather than
 * counting for themselves. These tests pin the numbering rules, and check that
 * the two sides still agree - if they ever drift, every note after the first
 * divergence is silently misnumbered.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  citationId,
  citeEntries,
  collectNotes,
  literalFromEstree,
  parseMdx,
  readCiteItems,
} from "../scripts/lib/notes.mjs";
import { lookupCitation } from "../src/components/Cite/lookup.mjs";
import remarkCitations, {
  citationStyleClass,
} from "../src/plugins/remark-citations.mjs";

/** The plugin now takes styleClass directly instead of a data blob. */
const run = (tree, styleClass, path = "docs/x.mdx") =>
  remarkCitations({ styleClass })(tree, { path });

/** Every citation id a page produces, in document order. */
const idsOf = (source, noteStyle, page = "docs/x.mdx") =>
  citeEntries(collectNotes(parseMdx(source), { noteStyle }).entries).map((e) =>
    citationId(page, e)
  );

/** An author footnote, a citation, a footnote holding a citation, a citation. */
const MIXED_PAGE = [
  'Text one<Footnote summary="a">plain note</Footnote> and',
  '<Cite items={[{ key: "smith2020", locator: "14", label: "page" }]} /> then',
  '<Footnote summary="b">Compare <Cite items={[{ key: "jones2019" }]} />.</Footnote>',
  'and finally <Cite items={[{ key: "smith2020", locator: "22", label: "page" }]} />.',
].join(" ");

const notesOf = (source, noteStyle) =>
  collectNotes(parseMdx(source), { noteStyle });

test("a note style numbers footnotes and citations in one unbroken sequence", () => {
  const { entries, noteCount } = notesOf(MIXED_PAGE, true);

  assert.equal(noteCount, 4);

  // The nested citation shares its footnote's number, so the distinct note
  // numbers are exactly 1..noteCount with nothing missing and nothing repeated.
  const distinct = [...new Set(entries.map((e) => e.noteIndex))].sort(
    (a, b) => a - b
  );
  assert.deepEqual(distinct, [1, 2, 3, 4]);
});

test("a citation inside a footnote joins that note rather than making a new one", () => {
  const { entries, noteCount } = notesOf(MIXED_PAGE, true);

  const nested = entries.find((e) => e.kind === "cite" && e.nested);
  const enclosing = entries.find(
    (e) => e.kind === "footnote" && e.noteIndex === 3
  );

  assert.ok(nested, "the nested citation should be found");
  assert.equal(nested.noteIndex, enclosing.noteIndex);

  const without = notesOf(
    MIXED_PAGE.replace(
      'Compare <Cite items={[{ key: "jones2019" }]} />.',
      "Compare."
    ),
    true
  );
  assert.equal(
    without.noteCount,
    noteCount,
    "removing the nested citation must not change how many notes the page has"
  );
});

test("an in-text style leaves citations out of the note sequence", () => {
  const { entries, noteCount } = notesOf(MIXED_PAGE, false);

  assert.equal(noteCount, 2, "only the two author footnotes are notes");

  for (const entry of entries.filter((e) => e.kind === "cite" && !e.nested)) {
    assert.equal(
      entry.noteIndex,
      0,
      "citeproc's noteIndex for a citation that is not in a note is 0"
    );
  }

  // Author footnotes are numbered the same either way: they do not depend on
  // citation style.
  const footnotes = (style) =>
    notesOf(MIXED_PAGE, style)
      .entries.filter((e) => e.kind === "footnote")
      .map((e) => e.noteIndex);
  assert.deepEqual(footnotes(false), [1, 2]);
});

test("a citation inside a footnote still shares the note under an in-text style", () => {
  const { entries } = notesOf(MIXED_PAGE, false);
  const nested = entries.find((e) => e.kind === "cite" && e.nested);
  assert.equal(nested.noteIndex, 2, "the second footnote is note 2");
});

test("the style class is readable without loading the CSL machinery", () => {
  // docusaurus.config.ts calls this while the config loads, so it must not pull
  // in citeproc - a devDependency a production install may not have.
  const styleClass = citationStyleClass();
  assert.ok(
    styleClass === "note" || styleClass === "in-text",
    `expected a CSL style class, got ${styleClass}`
  );
});

test("two footnotes with the same content share a number", () => {
  // Documented in docs/guides/markdown-features/footnotes.mdx and provided by
  // the previous client-side implementation; moving numbering to build time
  // must not quietly change it.
  const source =
    'A<Footnote summary="x">same</Footnote> B<Footnote summary="y">other</Footnote> ' +
    'C<Footnote summary="x">same</Footnote>.';
  const { entries, noteCount } = notesOf(source, false);

  assert.equal(noteCount, 2, "the repeat does not claim a third number");
  assert.deepEqual(
    entries.map((e) => e.noteIndex),
    [1, 2, 1]
  );
  assert.equal(entries.at(-1).repeat, true);

  // And the notes list holds one entry per distinct note, not per reference.
  const tree = parseMdx(source);
  run(tree, "in-text");
  assert.equal(tree.children.at(-1).children.length, 2);
});

test("the notes list goes last, below trailing components the author placed", () => {
  // Where footnotes have always been on this site: the previous client-side
  // version rendered the list from the DocItem/Content swizzle, after the page
  // content. Most doc pages end with <RelatedTopics />, and the notes belong
  // below it rather than displacing something the author put there.
  const source =
    'Text<Footnote summary="a">a note</Footnote>.\n\n<RelatedTopics maxResults={7} />\n';
  const tree = parseMdx(source);
  run(tree, "in-text");

  assert.equal(tree.children.at(-1).name, "FootnotesList");
});

test("the walk is deterministic across repeated parses", () => {
  const a = notesOf(MIXED_PAGE, true);
  const b = notesOf(MIXED_PAGE, true);
  const shape = ({ entries }) =>
    entries.map((e) => `${e.kind}:${e.noteIndex}:${e.nested ?? false}`);
  assert.deepEqual(shape(a), shape(b));
});

test("the plugin gives every citation the id the generator wrote", () => {
  // The invariant the whole design rests on. The generator keys its output by
  // id; the plugin stamps ids into the page. If the two ever derive them
  // differently, every citation silently renders nothing.
  const expected = idsOf(MIXED_PAGE, true);

  const tree = parseMdx(MIXED_PAGE);
  run(tree, "note");

  const ids = [];
  const walk = (n) => {
    if (n.name === "Cite") {
      ids.push(n.attributes.find((a) => a.name === "id").value);
    }
    for (const c of n.children ?? []) walk(c);
  };
  walk(tree);

  assert.deepEqual(ids, expected);
});

test("notes still come out ordered and complete", () => {
  const tree = parseMdx(MIXED_PAGE);
  run(tree, "note");

  const list = tree.children.at(-1);
  assert.equal(list.name, "FootnotesList");
  assert.deepEqual(
    list.children.map((item) =>
      Number(item.attributes.find((a) => a.name === "n").value)
    ),
    [1, 2, 3, 4]
  );
});

test("the plugin resolves every Footnote and strips citation props", () => {
  const tree = parseMdx(MIXED_PAGE);
  run(tree, "note");

  const names = [];
  const cites = [];
  const walk = (n) => {
    if (n.name) names.push(n.name);
    if (n.name === "Cite") cites.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  walk(tree);

  assert.ok(
    !names.includes("Footnote"),
    "every footnote should become a reference"
  );
  assert.ok(names.includes("FootnoteRef"), "markers replace them");

  // Citations survive by design now, but carrying only an id. Keeping `items`
  // would compile the authored props back into the page as a JS literal,
  // undoing the payload saving that moving the text out achieved.
  for (const cite of cites) {
    assert.deepEqual(
      cite.attributes.map((a) => a.name),
      ["id"],
      "a citation should carry its id and nothing else"
    );
  }
});

test("an in-text citation becomes a marker carrying its id, not a note", () => {
  const source = 'Some text <Cite items={[{ key: "smith2020" }]} />.';
  const tree = parseMdx(source);
  run(tree, "in-text");

  assert.equal(
    tree.children.at(-1).name,
    undefined,
    "no notes list is appended when there are no notes"
  );

  const [expected] = idsOf(source, false);
  assert.ok(JSON.stringify(tree).includes(expected));
});

test("citation items are read from the authored literal", () => {
  const tree = parseMdx(
    '<Cite items={[{ key: "a", locator: "1", suppressAuthor: true }, { key: "b" }]} />'
  );
  const [entry] = citeEntries(collectNotes(tree, { noteStyle: false }).entries);

  assert.deepEqual(entry.items, [
    { key: "a", locator: "1", suppressAuthor: true },
    { key: "b" },
  ]);
});

test("a non-literal items prop is reported as unreadable rather than guessed at", () => {
  const tree = parseMdx("<Cite items={someVariable} />");
  const [entry] = citeEntries(collectNotes(tree, { noteStyle: false }).entries);
  assert.equal(entry.items, undefined);
});

test("literalFromEstree refuses anything that is not plain data", () => {
  const call = parseMdx("<Cite items={[getSource()]} />");
  const [entry] = citeEntries(collectNotes(call, { noteStyle: false }).entries);
  assert.equal(
    entry.items,
    undefined,
    "a build step must not execute authored content"
  );

  assert.equal(literalFromEstree(undefined), undefined);
  assert.equal(literalFromEstree({ type: "Literal", value: 7 }), 7);
});

test("a Cite with no items prop is caught, not silently empty", () => {
  const tree = parseMdx("<Cite />");
  const [entry] = citeEntries(collectNotes(tree, { noteStyle: false }).entries);
  assert.equal(readCiteItems(entry.node), undefined);
});

test("a page with neither citations nor footnotes is left alone", () => {
  const tree = parseMdx("Just ordinary prose.");
  const before = JSON.stringify(tree);
  run(tree, "note");
  assert.equal(JSON.stringify(tree), before);
});

test("footnotes still resolve on a page the generator never saw", () => {
  // Citations need generated data; author footnotes must not. A page added
  // since the last `yarn generate` should still get numbered notes.
  const tree = parseMdx('Text<Footnote summary="a">a note</Footnote>.');
  remarkCitations({ data: { styleClass: "note", clusters: {} } })(tree, {
    path: "docs/unseen.mdx",
  });

  const list = tree.children.at(-1);
  assert.equal(list.name, "FootnotesList");
  assert.equal(list.children.length, 1);
});

test("ids survive a citation being inserted earlier on the page", () => {
  // The property positional ids lack, and the reason for the whole scheme.
  // With "page#3" style ids, inserting a citation shifts every later one, so a
  // citations file generated before the edit would render the WRONG SOURCE
  // under each marker. A content signature only ever fails to resolve.
  const before = idsOf(MIXED_PAGE, true);
  const after = idsOf(
    `Opening<Cite items={[{ key: "csl-spec" }]} /> ${MIXED_PAGE}`,
    true
  );

  assert.deepEqual(
    after.slice(1),
    before,
    "existing citations must keep their ids"
  );
});

test("ids survive a citation being deleted earlier on the page", () => {
  const source = [
    '<Cite items={[{ key: "csl-spec" }]} /> then',
    '<Cite items={[{ key: "smith2020", locator: "14", label: "page" }]} /> and',
    '<Cite items={[{ key: "jones2019" }]} />.',
  ].join(" ");
  const full = idsOf(source, false);
  const trimmed = idsOf(
    source.replace('<Cite items={[{ key: "csl-spec" }]} /> then ', ""),
    false
  );

  assert.deepEqual(trimmed, full.slice(1));
});

test("identical citations on one page are told apart by occurrence", () => {
  const source =
    'A<Cite items={[{ key: "smith2020" }]} /> B<Cite items={[{ key: "smith2020" }]} />';
  const [first, second] = idsOf(source, true);

  assert.notEqual(first, second, "the second is the one a note style shortens");
  assert.equal(first.replace(/#0$/, ""), second.replace(/#1$/, ""));
});

test("an id ignores prop order and Tina bookkeeping", () => {
  // Tina rewrites embed props on save; a re-save that reorders them, or adds
  // its own _template, must not change what a citation *is*.
  const a = idsOf(
    '<Cite items={[{ key: "smith2020", locator: "14" }]} />',
    false
  );
  const b = idsOf(
    '<Cite items={[{ locator: "14", key: "smith2020", _template: "citeItem" }]} />',
    false
  );
  assert.deepEqual(a, b);
});

test("a different page gives a different id for the same citation", () => {
  const source = '<Cite items={[{ key: "smith2020" }]} />';
  assert.notDeepEqual(
    idsOf(source, false, "docs/a.mdx"),
    idsOf(source, false, "docs/b.mdx")
  );
});

test("a repeated footnote yields exactly one backlink target", () => {
  // Two markers sharing a note must not both claim id="footnote-ref-N": that is
  // invalid HTML, and the note's backlink can only return to one of them.
  const source =
    'A<Footnote summary="x">same</Footnote> B<Footnote summary="x">same</Footnote>.';
  const tree = parseMdx(source);
  run(tree, "in-text");

  const refs = [];
  const walk = (n) => {
    if (n.name === "FootnoteRef") refs.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  walk(tree);

  assert.equal(refs.length, 2, "both markers still render");
  const repeats = refs.map((r) =>
    r.attributes.some((a) => a.name === "repeat")
  );
  assert.deepEqual(
    repeats,
    [false, true],
    "the first owns the target, the second is marked a repeat"
  );
  assert.equal(tree.children.at(-1).children.length, 1, "one note, not two");
});

test("an unknown id renders nothing rather than throwing", () => {
  // The stale window: a citation added since the last generation. Rendering
  // nothing is recoverable; throwing would take the page down.
  assert.equal(lookupCitation({}, "docs/x.mdx#abc#0"), null);
  assert.equal(lookupCitation(null, "docs/x.mdx#abc#0"), null);
  assert.equal(lookupCitation({ a: ["x"] }, undefined), null);
  assert.deepEqual(lookupCitation({ a: ["x"] }, "a"), { tokens: ["x"] });
});

/**
 * Everything above parses with this repo's own parseMdx. That is a blind spot:
 * Docusaurus builds its tree with a longer plugin chain and appends an mdxjsEsm
 * `export const toc` node ours does not have. A note-ordering bug once passed
 * every test here while the built site was wrong, for exactly that reason.
 *
 * This runs the plugin through Docusaurus's own processor instead.
 * createProcessorUncached is exported for this purpose - its own source calls it
 * "useful for tests" - and DEFAULT_MARKDOWN_CONFIG supplies the config fields it
 * requires. Note the call signature is {content, filePath}, not a VFile's
 * {value, path}: passing the latter silently compiles an empty document.
 */
test("the plugin behaves the same through Docusaurus's own MDX pipeline", async () => {
  const { DEFAULT_MARKDOWN_CONFIG } = await import(
    "@docusaurus/core/lib/server/configValidation.js"
  );
  const { createProcessorUncached } = await import(
    "@docusaurus/mdx-loader/lib/processor.js"
  );

  const processor = await createProcessorUncached({
    options: {
      admonitions: true,
      markdownConfig: DEFAULT_MARKDOWN_CONFIG,
      remarkPlugins: [[remarkCitations, { styleClass: "note" }]],
      rehypePlugins: [],
      recmaPlugins: [],
    },
    format: "mdx",
  });

  const filePath = new URL("../docs/x.mdx", import.meta.url).pathname;
  const source =
    'Text<Footnote summary="a">note</Footnote> and ' +
    '<Cite items={[{ key: "smith2020" }]} />.\n\n<RelatedTopics maxResults={7} />\n';

  const { content } = await processor.process({
    content: source,
    filePath,
    frontMatter: {},
    compilerName: "server",
  });

  assert.match(
    content,
    /docs\/x\.mdx#[a-f0-9]+#0/,
    "the citation should carry its id"
  );
  assert.ok(
    !/items:/.test(content),
    "the authored props must not be compiled into the page"
  );

  // Order is read from the render calls, not the whole file: the component
  // destructuring near the top lists names alphabetically and would otherwise
  // report the opposite.
  const body = content.slice(content.indexOf("_createMdxContent"));
  const order = [
    ...body.matchAll(/_jsx\w*\((FootnotesList|RelatedTopics)/g),
  ].map((match) => match[1]);
  assert.deepEqual(
    order,
    ["RelatedTopics", "FootnotesList"],
    "notes go last, below the author's trailing components"
  );
});

test("a citation naming a missing source reports itself instead of failing", async () => {
  // A mistyped key is one word in one topic. Taking the build down for it stops
  // anyone previewing anything, so it renders in place like a glossary term or
  // a variable does. lookupCitation distinguishes the two shapes it can hold.
  const problem = lookupCitation(
    { "docs/x.mdx#abc#0": { problem: "SOURCE NOT FOUND: typo-here" } },
    "docs/x.mdx#abc#0"
  );
  assert.deepEqual(problem, { problem: "SOURCE NOT FOUND: typo-here" });

  const ok = lookupCitation(
    { "docs/x.mdx#abc#0": ["Smith, J."] },
    "docs/x.mdx#abc#0"
  );
  assert.deepEqual(ok, { tokens: ["Smith, J."] });

  // Still nothing for an id the generator has not seen.
  assert.equal(lookupCitation({}, "docs/x.mdx#abc#0"), null);
  // And a malformed entry is treated as absent rather than rendered.
  assert.equal(lookupCitation({ a: { problem: 7 } }, "a"), null);
});

test("a broken citation does not disturb the ones around it", async () => {
  const { renderPage } = await import("../scripts/generate-citations.mjs");
  const { readStyle, makeEngine } = await import("../scripts/lib/csl.mjs");
  const { mapLibraryToCslJson } = await import(
    "../src/components/Cite/mapToCslJson.mjs"
  );
  const { default: library } = await import(
    "../reuse/bibliography/index.json",
    { with: { type: "json" } }
  );

  const items = mapLibraryToCslJson(library.bibliography);
  const styleXml = readStyle("chicago-notes-bibliography");

  // Good, broken, good - citing the same source either side of the break.
  const source = [
    '<Cite items={[{ key: "smith2020", locator: "14", label: "page" }]} />',
    '<Cite items={[{ key: "no-such-key" }]} />',
    '<Cite items={[{ key: "smith2020", locator: "22", label: "page" }]} />',
  ].join(" and ");

  const page = renderPage({
    source,
    items,
    styleXml,
    locale: null,
    noteStyle: true,
    key: "docs/x.mdx",
  });

  const [first, broken, third] = page.clusters;

  assert.equal(broken.problem, "SOURCE NOT FOUND: no-such-key");
  assert.ok(!first.problem && !third.problem);

  // Note numbering runs straight through the break.
  assert.deepEqual(
    page.clusters.map((c) => c.noteIndex),
    [1, 2, 3]
  );

  // And the surviving pair still shortens: skipping the broken one must not
  // make citeproc forget it had already seen this source.
  assert.match(first.rendered, /Jane Smith/, "the first is the full form");
  assert.ok(
    !/Jane Smith/.test(third.rendered) && /Smith/.test(third.rendered),
    `the third should be a short form, got: ${third.rendered}`
  );
});
