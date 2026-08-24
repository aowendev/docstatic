/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Generate the site-wide bibliography page from reuse/bibliography/index.json.
 *
 * Runs from `yarn generate`, so it happens before every dev start and every
 * build. Controlled by two Settings values in config/docusaurus/index.json:
 *
 *   citations.bibliographyPage - boolean, off by default
 *   citations.style            - which vendored csl/styles/*.csl to format with
 *
 * Formatting happens here, at build time, and never in the browser. That keeps
 * citeproc - which is CPAL/AGPL - a build-time dependency of this MIT repo, and
 * means anything downstream (the PDF tool included) reads finished strings out
 * of src/data/citations.json rather than linking a copyleft engine.
 *
 * ESM because it imports mapToCslJson.js, which is ESM so the tests can reach
 * it without a bundler.
 *
 * Usage: node scripts/generate-bibliography.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { mapLibraryToCslJson } from "../src/components/Cite/mapToCslJson.js";
import {
  cslHtmlToMarkdown,
  DATA_FILE,
  LIBRARY_FILE,
  localeFor,
  makeEngine,
  ROOT,
  readCitationSettings,
  readJson,
  readStyle,
  writeIfChanged,
} from "./lib/csl.mjs";

/** Route and filename of the generated page, relative to a docs root. */
const PAGE_SLUG = "references";

/**
 * Render the whole library through citeproc for one language.
 *
 * Returns the bibliography entries as HTML strings, in the order the style
 * sorts them - which is the style's job, not ours: IEEE orders by citation
 * order, the author-date styles alphabetically by author.
 */
function renderBibliography(items, styleXml, lang) {
  const ids = Object.keys(items);
  if (ids.length === 0) return [];

  const engine = makeEngine(items, styleXml, lang);
  engine.updateItems(ids);
  const [, entries] = engine.makeBibliography();
  return entries;
}

function frontmatter(title, description) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    "draft: false",
    "review: false",
    // citeproc renders each language from its own CSL locale, so this page must
    // never go out to a CAT tool - export_xliff_from_fs.js skips translate:false.
    "translate: false",
    "approved: true",
    "published: true",
    "unlisted: false",
    "sidebar_position: 999",
    "---",
  ].join("\n");
}

/**
 * Built-in titles, one set per mode.
 *
 * The distinction is not decoration. A *bibliography* may list works the author
 * has not cited; a *reference list*, by convention, lists only what is cited.
 * So the page is named for what it actually contains, and switching the
 * includeUncited setting renames it unless a title is set explicitly.
 *
 * Spanish and French carry the same distinction natively. German and Japanese
 * are best-effort: "Literaturverzeichnis" and "参考文献" cover both senses in
 * ordinary use, so the narrower forms are offered for the cited-only mode and
 * can be overridden per language in Settings.
 */
const PAGE_STRINGS = {
  bibliography: {
    en: {
      title: "Bibliography",
      description: "Sources for this documentation.",
    },
    de: {
      title: "Literaturverzeichnis",
      description: "Quellen für diese Dokumentation.",
    },
    es: {
      title: "Bibliografía",
      description: "Fuentes de esta documentación.",
    },
    fr: {
      title: "Bibliographie",
      description: "Sources de cette documentation.",
    },
    ja: { title: "参考文献", description: "このドキュメントの資料。" },
  },
  references: {
    en: {
      title: "References",
      description: "Sources cited across this documentation.",
    },
    de: {
      title: "Quellenverzeichnis",
      description: "In dieser Dokumentation zitierte Quellen.",
    },
    es: {
      title: "Referencias",
      description: "Fuentes citadas en esta documentación.",
    },
    fr: {
      title: "Références",
      description: "Sources citées dans cette documentation.",
    },
    ja: { title: "引用文献", description: "このドキュメントで引用した資料。" },
  },
};

export function stringsFor(lang, includeUncited) {
  const set = includeUncited
    ? PAGE_STRINGS.bibliography
    : PAGE_STRINGS.references;
  return set[lang] ?? set.en;
}

/**
 * The page's heading, which is also its label in the table of contents.
 *
 * Settings carries a title per language rather than one string, because the
 * page exists in every site language and one word is only right for one of
 * them. A language with no entry falls back to the built-in title for it.
 */
function titleFor(lang, pageTitles, includeUncited) {
  return pageTitles?.[lang] || stringsFor(lang, includeUncited).title;
}

function buildPage(entries, lang, pageTitles, includeUncited) {
  const base = stringsFor(lang, includeUncited);
  const strings = {
    ...base,
    title: titleFor(lang, pageTitles, includeUncited),
  };
  const body = entries.map((entry) => cslHtmlToMarkdown(entry)).filter(Boolean);

  return [
    frontmatter(strings.title, strings.description),
    "",
    "{/* Generated by scripts/generate-bibliography.mjs - do not edit.",
    "    Edit the Bibliography collection in the CMS instead. */}",
    "",
    `# ${strings.title}`,
    "",
    ...body.flatMap((line) => [line, ""]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Where the generated page goes for a given site language. */
function pageFileFor(lang) {
  if (lang === "en") return path.join(ROOT, "docs", `${PAGE_SLUG}.mdx`);
  return path.join(
    ROOT,
    "i18n",
    lang,
    "docusaurus-plugin-content-docs/current",
    `${PAGE_SLUG}.mdx`
  );
}

/**
 * Remove a page left behind by an earlier run. Toggling the feature off has to
 * actually take the page away, or the site keeps serving a stale bibliography.
 */
function removeGeneratedPages(languages) {
  let removed = 0;
  for (const lang of languages) {
    const file = pageFileFor(lang);
    if (fs.existsSync(file)) {
      fs.rmSync(file);
      removed += 1;
    }
  }
  return removed;
}

/**
 * Every source key cited anywhere in the doc set.
 *
 * Read from the clusters generate-citations.mjs writes, which is why that script
 * now runs first: the reference list cannot know what is cited until the
 * citations have been resolved.
 *
 * The union across every language, not per locale. A source cited only on a
 * page that is not translated yet is still cited by the doc set, and a reference
 * list that shrank when a translation lagged would be a confusing thing to hand
 * a reader.
 */
function citedKeys() {
  const data = fs.existsSync(DATA_FILE) ? readJson(DATA_FILE) : {};
  const keys = new Set();
  for (const page of Object.values(data.clusters ?? {})) {
    for (const cluster of page.clusters ?? []) {
      for (const item of cluster.items ?? []) {
        if (item.key) keys.add(item.key);
      }
    }
  }
  return keys;
}

/** The library narrowed to what the doc set actually cites. */
export function citedOnly(items, keys) {
  return Object.fromEntries(
    Object.entries(items).filter(([key]) => keys.has(key))
  );
}

/**
 * Merge into src/data/citations.json rather than replacing it.
 *
 * generate-citations.mjs owns the `clusters` key in the same file and runs after
 * this script; clobbering the file here would drop its work on any run where
 * only the bibliography changed.
 */
function updateData(patch) {
  const existing = fs.existsSync(DATA_FILE) ? readJson(DATA_FILE) : {};
  writeIfChanged(
    DATA_FILE,
    `${JSON.stringify({ ...existing, ...patch }, null, 2)}\n`
  );
}

function main() {
  const settings = readCitationSettings();
  const { languages } = settings;

  if (!settings.bibliographyPage) {
    const removed = removeGeneratedPages(languages);
    // The style is still recorded: citations inside pages render regardless of
    // whether the reference list page is switched on.
    updateData({ style: settings.style, bibliography: {} });
    console.log(
      removed > 0
        ? `Bibliography page disabled - removed ${removed} generated page(s)`
        : "Bibliography page disabled - nothing to generate"
    );
    return;
  }

  const styleName = settings.style;
  const styleXml = readStyle(styleName);

  const library = readJson(LIBRARY_FILE).bibliography ?? [];
  const allItems = mapLibraryToCslJson(library);
  const items = settings.includeUncited
    ? allItems
    : citedOnly(allItems, citedKeys());

  if (library.length > 0 && Object.keys(allItems).length !== library.length) {
    const mapped = new Set(Object.keys(allItems));
    const dropped = library
      .map((entry) => entry?.key)
      .filter((key) => !mapped.has(key));
    throw new Error(
      `Bibliography entries could not be mapped to CSL-JSON: ${dropped.join(", ")}`
    );
  }

  const rendered = {};
  let written = 0;

  for (const lang of languages) {
    const locale = localeFor(lang, settings.englishLocale);
    const entries = renderBibliography(items, styleXml, locale);
    rendered[lang] = entries.map((entry) => cslHtmlToMarkdown(entry));
    if (
      writeIfChanged(
        pageFileFor(lang),
        buildPage(entries, lang, settings.pageTitles, settings.includeUncited)
      )
    ) {
      written += 1;
    }
  }

  // The contract the PDF tool reads. generate-citations.mjs adds "clusters"
  // beside these, which is why this merges rather than replaces.
  updateData({ style: styleName, bibliography: { items, rendered } });

  console.log(
    `Bibliography (${styleName}): ${Object.keys(items).length} source(s), ` +
      `${languages.length} language(s), ${written} page(s) updated`
  );
}

// Only generate when run as a script. The tests import cslHtmlToMarkdown from
// here, and importing must not rewrite the site's pages as a side effect.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
