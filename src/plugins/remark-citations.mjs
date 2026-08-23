/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Resolve citations and footnotes into static markup, at build time.
 *
 * Two jobs, one pass, because they share a numbering sequence:
 *
 * - <Cite> is replaced with the citation scripts/generate-citations.mjs already
 *   rendered through citeproc. Under an in-text style it lands in the running
 *   text; under a note style it becomes a numbered note.
 * - <Footnote> gets its number here rather than from a useEffect, and its body
 *   is moved into a notes list appended to the page.
 *
 * The second half fixes a real defect. Footnote numbering used to happen in the
 * browser, so server-rendered HTML carried "[...]" placeholders and no notes
 * list at all - invisible to search engines and to anyone without JavaScript.
 * Doing it here means the notes are in the HTML.
 *
 * Numbering comes from scripts/lib/notes.mjs, the same module the generator
 * uses. Neither side may number independently; see the comment there.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  citeEntries,
  collectNotes,
  createProcessor,
} from "../../scripts/lib/notes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");
const DATA_FILE = path.join(ROOT, "src/data/citations.json");

/** Components the rewritten tree refers to; all registered in MDXComponents. */
const REF_TAG = "FootnoteRef";
const LIST_TAG = "FootnotesList";
const ITEM_TAG = "FootnoteItem";

/**
 * Read once per worker. Docusaurus compiles MDX in worker threads, so this
 * module is instantiated several times over; re-reading per file would be
 * needless I/O on every page of the site.
 */
let cache;
function citationData() {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    // Absent before the first `yarn generate`. Footnotes still get numbered;
    // citations simply have nothing to resolve to yet.
    cache = { clusters: {}, styleClass: "in-text" };
  }
  return cache;
}

/**
 * A fingerprint of the generated citation data, for docusaurus.config.ts to
 * pass in as a plugin option.
 *
 * Without it, changing the citation style renders correctly on disk and not at
 * all in the browser. The bundler caches each compiled page against that page's
 * own source, and citations come from a file it has never heard of - so
 * regenerating leaves every already-compiled page stale, indefinitely, across
 * restarts. Feeding the fingerprint in as an option makes it part of the loader
 * configuration, so new citation data invalidates the cache the way an edit to
 * the page would.
 *
 * Cheap on purpose: size and mtime, not a content hash, since this runs once
 * per build and only has to change when the file does.
 */
export function citationsFingerprint() {
  try {
    const { size, mtimeMs } = fs.statSync(DATA_FILE);
    return `${size}-${mtimeMs}`;
  } catch {
    return "absent";
  }
}

/** Repo-relative POSIX path - the key generate-citations.mjs wrote pages under. */
function pageKey(filePath) {
  if (!filePath) return null;
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

/**
 * Markdown string -> inline mdast nodes.
 *
 * The generator stores citations as markdown rather than HTML precisely so this
 * step is a parse and not a second HTML translation. A citation is always
 * phrasing content, so the paragraph wrapper is unwrapped.
 */
function parseInline(markdown) {
  if (!markdown) return [];
  const tree = createProcessor().parse(markdown);
  const [first] = tree.children ?? [];
  if (!first) return [];
  return first.type === "paragraph" ? first.children : [first];
}

function numberAttribute(value) {
  return {
    type: "mdxJsxAttribute",
    name: "n",
    value: String(value),
  };
}

function refNode(noteIndex) {
  return {
    type: "mdxJsxTextElement",
    name: REF_TAG,
    attributes: [numberAttribute(noteIndex)],
    children: [],
  };
}

function notesListNode(notes) {
  const items = [...notes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([noteIndex, children]) => ({
      type: "mdxJsxFlowElement",
      name: ITEM_TAG,
      attributes: [numberAttribute(noteIndex)],
      children,
    }));

  return {
    type: "mdxJsxFlowElement",
    name: LIST_TAG,
    attributes: [],
    children: items,
  };
}

/**
 * `options.data` overrides what is read from src/data/citations.json. Only the
 * tests pass it; the build always reads the generated file.
 */
export default function remarkCitations(options = {}) {
  return (tree, file) => {
    const data = options.data ?? citationData();
    const key = pageKey(file?.path ?? file?.history?.[0]);
    const page = key ? data.clusters?.[key] : null;
    const noteStyle = data.styleClass === "note";

    const { entries } = collectNotes(tree, { noteStyle });
    if (entries.length === 0) return;

    // Citations resolve positionally: the generator walked this same document
    // with this same module, so the nth <Cite> here is the nth cluster there.
    const clusters = page?.clusters ?? [];
    const clusterByNode = new Map(
      citeEntries(entries).map((entry, index) => [entry.node, clusters[index]])
    );
    const entryByNode = new Map(entries.map((entry) => [entry.node, entry]));

    /** noteIndex -> the mdast that becomes that note's body. */
    const notes = new Map();

    const transform = (parent) => {
      if (!Array.isArray(parent.children)) return;
      const out = [];

      for (const child of parent.children) {
        const entry = entryByNode.get(child);

        if (entry?.kind === "cite") {
          const rendered = clusterByNode.get(child)?.rendered;
          const nodes = parseInline(rendered);

          // A citation nested in a footnote renders where the author put it,
          // inside that note - Chicago's "citation and comment in one note".
          if (noteStyle && !entry.nested) {
            notes.set(entry.noteIndex, nodes);
            out.push(refNode(entry.noteIndex));
          } else {
            out.push(...nodes);
          }
          continue;
        }

        if (entry?.kind === "footnote") {
          // Resolve any citation inside the note before lifting the body out.
          transform(child);
          notes.set(entry.noteIndex, child.children ?? []);
          out.push(refNode(entry.noteIndex));
          continue;
        }

        transform(child);
        out.push(child);
      }

      parent.children = out;
    };

    transform(tree);

    // Last on the page, below everything the author wrote - including a
    // trailing <RelatedTopics />. That is where footnotes have always been
    // here: the previous client-side version rendered the list from the
    // DocItem/Content swizzle, after the page content. Moving them up would
    // also override where the author chose to put their trailing components.
    if (notes.size > 0) tree.children.push(notesListNode(notes));
  };
}
