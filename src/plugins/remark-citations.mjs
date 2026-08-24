/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Resolve citation identity and footnote numbering at build time.
 *
 * Two jobs, one pass, because they share a numbering sequence:
 *
 * - Each <Cite> keeps its place but loses its props, gaining a stable `id`.
 *   The text it stands for is looked up at render time by
 *   src/components/Cite from src/data/citations-rendered.json.
 * - <Footnote> becomes a numbered <FootnoteRef>, and its body moves into a
 *   <FootnotesList> appended to the page.
 *
 * Putting the id in the page rather than the text is what makes bibliography
 * edits live. A compiled page then depends only on its own source, so editing a
 * source in the CMS changes the data file, the bundler sees a watched module
 * change, and the citation updates without a rebuild or a restart. When this
 * plugin inlined the text instead, nothing connected the two: the bundler had
 * never heard of the data file, so a compiled page stayed stale indefinitely.
 *
 * `styleClass` is the one thing that still has to be known here, because it
 * decides page *structure* - whether a citation is inline or a note - which is
 * baked into the compiled output. It arrives as an option so it forms part of
 * the loader's cache key; changing the citation style therefore still requires
 * a restart, and a bibliography edit does not.
 *
 * Numbering comes from scripts/lib/notes.mjs, the same module the generator
 * uses. Neither side may number independently; see the comment there.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  citationId,
  citeEntries,
  collectNotes,
} from "../../scripts/lib/notes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");
const DATA_FILE = path.join(ROOT, "src/data/citations.json");

/** Components the rewritten tree refers to; all registered in MDXComponents. */
const CITE_TAG = "Cite";
const REF_TAG = "FootnoteRef";
const LIST_TAG = "FootnotesList";
const ITEM_TAG = "FootnoteItem";

/**
 * Whether the configured style puts citations in the running text or in notes,
 * for docusaurus.config.ts to pass in as a plugin option.
 *
 * Deliberately a tiny read of one field rather than an import of the CSL
 * machinery: this runs while the config loads, and citeproc is a devDependency
 * that a production install may not have.
 */
export function citationStyleClass() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return data.styleClass ?? "in-text";
  } catch {
    // Absent before the first `yarn generate`. In-text is the CSL default and
    // the safe assumption: it leaves footnote numbering untouched.
    return "in-text";
  }
}

function attribute(name, value) {
  return { type: "mdxJsxAttribute", name, value };
}

/**
 * A citation reduced to its id.
 *
 * The `items` prop is dropped rather than kept alongside: MDX compiles an
 * attribute expression into the page as a real JS literal, so leaving it would
 * put every citation's props back into the bundle we just took the text out of.
 */
function citeNode(id) {
  return {
    type: "mdxJsxTextElement",
    name: CITE_TAG,
    attributes: [attribute("id", id)],
    children: [],
  };
}

/**
 * The superscript marker.
 *
 * A repeated footnote carries no id. Both markers of a repeat share one note,
 * so both would otherwise emit the same `id="footnote-ref-N"` - invalid HTML,
 * and the note's backlink could only ever return to one of them. Standard
 * markdown links a repeat back to its first instance, which is what dropping
 * the id on repeats achieves.
 */
function refNode(noteIndex, repeat) {
  return {
    type: "mdxJsxTextElement",
    name: REF_TAG,
    attributes: repeat
      ? [attribute("n", String(noteIndex)), attribute("repeat", null)]
      : [attribute("n", String(noteIndex))],
    children: [],
  };
}

function notesListNode(notes) {
  const items = [...notes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([noteIndex, children]) => ({
      type: "mdxJsxFlowElement",
      name: ITEM_TAG,
      attributes: [attribute("n", String(noteIndex))],
      children,
    }));

  return {
    type: "mdxJsxFlowElement",
    name: LIST_TAG,
    attributes: [],
    children: items,
  };
}

/** Repo-relative POSIX path - the page half of a citation id. */
function pageKey(filePath) {
  if (!filePath) return "";
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

export default function remarkCitations(options = {}) {
  const noteStyle = (options.styleClass ?? citationStyleClass()) === "note";

  return (tree, file) => {
    const key = pageKey(file?.path ?? file?.history?.[0]);
    const { entries } = collectNotes(tree, { noteStyle });
    if (entries.length === 0) return;

    const idByNode = new Map(
      citeEntries(entries).map((entry) => [entry.node, citationId(key, entry)])
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
          const marker = citeNode(idByNode.get(child));

          // A citation nested in a footnote renders where the author put it,
          // inside that note - Chicago's "citation and comment in one note".
          if (noteStyle && !entry.nested) {
            notes.set(entry.noteIndex, [marker]);
            out.push(refNode(entry.noteIndex, false));
          } else {
            out.push(marker);
          }
          continue;
        }

        if (entry?.kind === "footnote") {
          // Resolve any citation inside the note before lifting the body out.
          transform(child);
          if (!entry.repeat) notes.set(entry.noteIndex, child.children ?? []);
          out.push(refNode(entry.noteIndex, entry.repeat));
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
    // theme swizzle, after the page content. Moving them up would
    // also override where the author chose to put their trailing components.
    if (notes.size > 0) tree.children.push(notesListNode(notes));
  };
}
