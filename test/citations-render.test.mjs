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
  citeEntries,
  collectNotes,
  literalFromEstree,
  parseMdx,
  readCiteItems,
} from "../scripts/lib/notes.mjs";
import remarkCitations, {
  citationsFingerprint,
} from "../src/plugins/remark-citations.mjs";

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

test("the citation data has a fingerprint the bundler can key a cache on", () => {
  // Citations come from a file the bundler has never heard of, so it caches a
  // compiled page against that page's own source and nothing else. Regenerating
  // then leaves every already-compiled page stale, across restarts - a style
  // change renders correctly on disk and not at all in the browser.
  // docusaurus.config.ts passes this in as a plugin option so new citation data
  // invalidates the cache the way an edit to the page would.
  const fingerprint = citationsFingerprint();

  assert.equal(typeof fingerprint, "string");
  assert.notEqual(
    fingerprint,
    "",
    "an empty fingerprint would never invalidate"
  );
  assert.equal(
    fingerprint,
    citationsFingerprint(),
    "it must be stable while the data is unchanged, or every build recompiles"
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
  remarkCitations({ data: { styleClass: "in-text", clusters: {} } })(tree, {
    path: "docs/x.mdx",
  });
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
  remarkCitations({ data: { styleClass: "in-text", clusters: {} } })(tree, {
    path: "docs/x.mdx",
  });

  assert.equal(tree.children.at(-1).name, "FootnotesList");
});

test("the walk is deterministic across repeated parses", () => {
  const a = notesOf(MIXED_PAGE, true);
  const b = notesOf(MIXED_PAGE, true);
  const shape = ({ entries }) =>
    entries.map((e) => `${e.kind}:${e.noteIndex}:${e.nested ?? false}`);
  assert.deepEqual(shape(a), shape(b));
});

test("the plugin numbers notes exactly as the generator did", () => {
  // The invariant the whole design rests on: the generator wrote clusters in
  // the order its walk produced, and the plugin consumes them positionally.
  const generatorOrder = citeEntries(notesOf(MIXED_PAGE, true).entries).map(
    (e) => e.noteIndex
  );

  const tree = parseMdx(MIXED_PAGE);
  const data = {
    styleClass: "note",
    clusters: {
      "docs/x.mdx": {
        noteCount: 4,
        clusters: generatorOrder.map((noteIndex, i) => ({
          noteIndex,
          rendered: `CITATION-${i}`,
        })),
      },
    },
  };

  remarkCitations({ data })(tree, { path: "docs/x.mdx" });

  const list = tree.children.at(-1);
  assert.equal(list.name, "FootnotesList");

  const numbers = list.children.map((item) =>
    Number(item.attributes.find((a) => a.name === "n").value)
  );
  assert.deepEqual(
    numbers,
    [1, 2, 3, 4],
    "notes come out ordered and complete"
  );

  const rendered = JSON.stringify(list);
  for (let i = 0; i < generatorOrder.length; i += 1) {
    assert.ok(
      rendered.includes(`CITATION-${i}`),
      `cluster ${i} should reach the note it was numbered for`
    );
  }
});

test("the plugin leaves no Cite or Footnote behind in the tree", () => {
  const tree = parseMdx(MIXED_PAGE);
  const data = {
    styleClass: "note",
    clusters: {
      "docs/x.mdx": {
        noteCount: 4,
        clusters: [1, 2, 3, 4].map(() => ({ rendered: "x" })),
      },
    },
  };
  remarkCitations({ data })(tree, { path: "docs/x.mdx" });

  const names = [];
  const walk = (n) => {
    if (n.name) names.push(n.name);
    for (const c of n.children ?? []) walk(c);
  };
  walk(tree);

  assert.ok(!names.includes("Cite"), "every citation should be resolved");
  assert.ok(
    !names.includes("Footnote"),
    "every footnote should become a reference"
  );
  assert.ok(names.includes("FootnoteRef"), "markers replace them");
});

test("an in-text citation is spliced into the text, not turned into a note", () => {
  const source = 'Some text <Cite items={[{ key: "smith2020" }]} />.';
  const tree = parseMdx(source);
  remarkCitations({
    data: {
      styleClass: "in-text",
      clusters: {
        "docs/x.mdx": {
          noteCount: 0,
          clusters: [{ rendered: "(Smith 2020)" }],
        },
      },
    },
  })(tree, { path: "docs/x.mdx" });

  assert.equal(
    tree.children.at(-1).name,
    undefined,
    "no notes list is appended when there are no notes"
  );
  assert.ok(JSON.stringify(tree).includes("(Smith 2020)"));
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
  remarkCitations({ data: { styleClass: "note", clusters: {} } })(tree, {
    path: "docs/x.mdx",
  });
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
