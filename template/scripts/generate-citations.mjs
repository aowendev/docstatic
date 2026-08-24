/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Render every citation in every page, at build time.
 *
 * Runs from `yarn generate`, after generate-bibliography.mjs, and adds a
 * `clusters` key to src/data/citations.json. src/plugins/remark-citations.mjs
 * then reads that file and rewrites each page's mdast, so citations end up as
 * static markup rather than something assembled in the browser.
 *
 * Why here and not in the remark plugin: Docusaurus compiles MDX in worker
 * threads, so a plugin cannot aggregate across pages or write a file. It also
 * keeps citeproc - CPAL-1.0 OR AGPL-1.0 - in exactly one build-time place, which
 * is what lets anything downstream (the PDF tool) read finished strings instead
 * of linking a copyleft engine.
 *
 * Note numbering comes from scripts/lib/notes.mjs, shared with the plugin. See
 * the comment there for why that sharing is load-bearing.
 *
 * Usage: node scripts/generate-citations.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { mapLibraryToCslJson } from "../src/components/Cite/mapToCslJson.js";
import {
  cslHtmlToMarkdown,
  cslHtmlToTokens,
  DATA_FILE,
  DOCS_DIR,
  isNoteStyle,
  LIBRARY_FILE,
  localeFor,
  makeEngine,
  ROOT,
  RUNTIME_DATA_FILE,
  readCitationSettings,
  readJson,
  readStyle,
  styleClass,
  writeIfChanged,
} from "./lib/csl.mjs";
import {
  citationId,
  citeEntries,
  collectNotes,
  parseMdx,
} from "./lib/notes.mjs";

/** Tina writes _template into embed props; it is ours, not CSL's. */
const NON_CSL_ITEM_FIELDS = ["_template"];

/**
 * Every documentation root, one per site language.
 *
 * The translated copies carry their own <Cite> elements, and each renders in its
 * own CSL locale - which is how a German page gets German date order and
 * quotation marks without any of it passing through translation.
 */
function docRoots(languages) {
  return languages.map((lang) => ({
    lang,
    dir:
      lang === "en"
        ? DOCS_DIR
        : path.join(
            ROOT,
            "i18n",
            lang,
            "docusaurus-plugin-content-docs/current"
          ),
  }));
}

function findPages(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findPages(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Repo-relative POSIX path - the key the remark plugin looks pages up by. */
export function pageKey(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join("/");
}

/**
 * One authored citation item -> one CSL citation item.
 *
 * `locator` is the bare value and `label` says what it counts, because the CSL
 * locale supplies "p."/"pp." itself and styles disagree about which.
 */
function toCitationItem(item) {
  const out = { id: item.key };
  if (item.locator) out.locator = String(item.locator);
  if (item.label) out.label = item.label;
  if (item.prefix) out.prefix = item.prefix;
  if (item.suffix) out.suffix = item.suffix;
  if (item.suppressAuthor) out["suppress-author"] = true;
  return out;
}

/** The authored item, minus Tina bookkeeping - what the PDF tool re-renders from. */
function structuredItem(item) {
  const out = {};
  for (const [key, value] of Object.entries(item)) {
    if (NON_CSL_ITEM_FIELDS.includes(key)) continue;
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

/**
 * Render one page's citations.
 *
 * A fresh engine per page, because note numbering restarts per page: on the web
 * a page is a standalone document. The PDF tool renumbers across the flattened
 * doc set from the structured half of the output.
 */
function renderPage({ source, items, styleXml, locale, noteStyle, key }) {
  const tree = parseMdx(source);
  const { entries, noteCount } = collectNotes(tree, { noteStyle });
  const cites = citeEntries(entries);
  if (cites.length === 0) return null;

  const engine = makeEngine(items, styleXml, locale);
  const rendered = [];

  cites.forEach((entry, index) => {
    if (!entry.items) {
      throw new Error(
        `${key}: citation ${index + 1} has an unreadable items prop. ` +
          'It must be a literal array, e.g. items={[{ key: "smith2020" }]}'
      );
    }
    for (const item of entry.items) {
      if (!item.key || !items[item.key]) {
        throw new Error(
          `${key}: citation ${index + 1} refers to "${item.key}", ` +
            "which is not in reuse/bibliography/index.json"
        );
      }
    }

    // appendCitationCluster returns [clusterIndex, html] pairs, and may revise
    // clusters already emitted - a later citation of the same source can turn an
    // earlier one into a disambiguated or short form. So results are written by
    // the index citeproc reports, never assumed to be the one just added.
    const result = engine.appendCitationCluster({
      citationID: `${key}#${index}`,
      citationItems: entry.items.map(toCitationItem),
      properties: { noteIndex: entry.noteIndex },
    });
    for (const [clusterIndex, html] of result) rendered[clusterIndex] = html;
  });

  return {
    noteCount,
    clusters: cites.map((entry, index) => ({
      // The id the compiled page will carry in place of this citation's text.
      // A content signature, not a position - see citationId in lib/notes.mjs.
      id: citationId(key, entry),
      noteIndex: entry.noteIndex,
      nested: entry.nested,
      items: entry.items.map(structuredItem),
      // Markdown for the reference page and the PDF tool; tokens for the
      // browser. Both come from the same citeproc HTML rather than one being
      // derived from the other, so neither is a lossy round trip.
      rendered: cslHtmlToMarkdown(rendered[index] ?? ""),
      tokens: cslHtmlToTokens(rendered[index] ?? ""),
    })),
  };
}

/**
 * Merge a patch into src/data/citations.json without disturbing the keys
 * generate-bibliography.mjs owns.
 */
function updateData(patch) {
  const existing = fs.existsSync(DATA_FILE) ? readJson(DATA_FILE) : {};
  return writeIfChanged(
    DATA_FILE,
    `${JSON.stringify({ ...existing, ...patch }, null, 2)}\n`
  );
}

/**
 * The file the browser actually loads: id -> tokens, and nothing else.
 *
 * Kept separate from citations.json deliberately. That file carries the full
 * CSL-JSON for every source and the rendered bibliography for every locale -
 * fine for the PDF tool to read off disk, but a static import of it would ship
 * all of that into every page's bundle.
 */
function writeRuntimeData(clusters) {
  const rendered = {};
  for (const page of Object.values(clusters)) {
    for (const cluster of page.clusters) rendered[cluster.id] = cluster.tokens;
  }
  return writeIfChanged(
    RUNTIME_DATA_FILE,
    `${JSON.stringify(rendered, null, 2)}\n`
  );
}

function main() {
  const settings = readCitationSettings();

  if (!settings.style) {
    // styleClass is still recorded: the remark plugin reads it to decide whether
    // a citation is a note or inline, and an absent value would leave it acting
    // on whatever the previous run wrote.
    updateData({ styleClass: "in-text", clusters: {} });
    writeRuntimeData({});
    console.log("No citation style set - citations not rendered");
    return;
  }

  const styleXml = readStyle(settings.style);
  const noteStyle = isNoteStyle(styleXml);

  const library = readJson(LIBRARY_FILE).bibliography ?? [];
  const items = mapLibraryToCslJson(library);

  const clusters = {};
  let pageCount = 0;
  let citationCount = 0;

  for (const { lang, dir } of docRoots(settings.languages)) {
    const locale = localeFor(lang, settings.englishLocale);

    for (const file of findPages(dir)) {
      const key = pageKey(file);
      const source = fs.readFileSync(file, "utf8");
      if (!source.includes("<Cite")) continue;

      const page = renderPage({
        source,
        items,
        styleXml,
        locale,
        noteStyle,
        key,
      });
      if (!page) continue;

      clusters[key] = page;
      pageCount += 1;
      citationCount += page.clusters.length;
    }
  }

  updateData({
    style: settings.style,
    styleClass: styleClass(styleXml),
    clusters,
  });
  writeRuntimeData(clusters);

  console.log(
    `Citations (${settings.style}, ${styleClass(styleXml)}): ` +
      `${citationCount} citation(s) across ${pageCount} page(s)`
  );
}

/**
 * Run a full generation. The Docusaurus plugin calls this in-process so a
 * bibliography edit can be picked up without spawning a Node process.
 */
export function generateCitations() {
  main();
}

// Only generate when run as a script; the tests import the helpers above.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
