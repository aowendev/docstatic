/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shared CSL machinery for the two citation generators.
 *
 * generate-bibliography.mjs renders the reference list; generate-citations.mjs
 * renders the citations inside pages. Both need the same style resolution, the
 * same locale loader and the same idea of which English to use, and they must
 * agree - a bibliography formatted by one style and citations by another would
 * be worse than either alone.
 *
 * citeproc is CPAL-1.0 OR AGPL-1.0. It is used unmodified, at build time only,
 * and nothing downstream links it: consumers read the rendered strings out of
 * src/data/citations.json. Keep it that way.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import CSL from "citeproc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.join(__dirname, "../..");
export const SETTINGS_FILE = path.join(ROOT, "config/docusaurus/index.json");
export const LIBRARY_FILE = path.join(ROOT, "reuse/bibliography/index.json");
export const STYLES_DIR = path.join(ROOT, "csl/styles");
export const LOCALES_DIR = path.join(ROOT, "csl/locales");
export const DATA_FILE = path.join(ROOT, "src/data/citations.json");
/**
 * The runtime half, imported by src/components/Cite. Separate from DATA_FILE
 * because a static import ships whatever it points at into every page's bundle,
 * and DATA_FILE holds the whole library plus every locale's bibliography.
 */
export const RUNTIME_DATA_FILE = path.join(
  ROOT,
  "src/data/citations-rendered.json"
);
export const DOCS_DIR = path.join(ROOT, "docs");

/**
 * Site language -> CSL locale.
 *
 * "en" is deliberately absent, because English has no single right answer. Of
 * the vendored styles only Oxford declares a default-locale (en-GB); the rest
 * declare none and citeproc falls back to en-US, so a style that expects
 * day-first dates - Cite Them Right, for one - renders US ones instead. Rather
 * than hardcode which styles expect which, the English locale comes from the
 * citations.englishLocale setting, and an empty setting leaves the choice to
 * the style.
 */
export const CSL_LOCALES = {
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  ja: "ja-JP",
};

/** Fallback when citeproc asks for a locale that is not vendored. */
const FALLBACK_LOCALE = "en-US";

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** The citations block from Settings, with the shape both generators expect. */
export function readCitationSettings() {
  const settings = readJson(SETTINGS_FILE);
  const citations = settings.citations ?? {};
  return {
    bibliographyPage: Boolean(citations.bibliographyPage),
    // Defaults to listing everything, which is what the page did before this
    // setting existed. Only the page's title changes for existing sites.
    includeUncited: citations.includeUncited !== false,
    style: citations.style ?? null,
    englishLocale: citations.englishLocale || null,
    // language code -> author-supplied title for the references page
    pageTitles: Object.fromEntries(
      (Array.isArray(citations.pageTitles) ? citations.pageTitles : [])
        .filter((entry) => entry?.language && entry?.title)
        .map((entry) => [entry.language, entry.title])
    ),
    languages: (settings.languages?.supported ?? [{ code: "en" }]).map(
      (entry) => entry.code
    ),
  };
}

/**
 * Read a vendored style, failing with the list of real ones. A typo in Settings
 * should name its own fix rather than produce an empty page.
 */
export function readStyle(styleName) {
  const file = path.join(STYLES_DIR, `${styleName}.csl`);
  if (!styleName || !fs.existsSync(file)) {
    const available = fs
      .readdirSync(STYLES_DIR)
      .filter((f) => f.endsWith(".csl"))
      .map((f) => f.replace(/\.csl$/, ""))
      .join(", ");
    throw new Error(
      `Unknown citation style "${styleName}". Vendored styles: ${available}`
    );
  }
  return fs.readFileSync(file, "utf8");
}

/**
 * Whether a style puts the citation in the running text or in a footnote.
 *
 * This is the single fact that decides how a citation renders, so it is read
 * from the style itself rather than kept in a list that could drift. Absent a
 * class attribute, CSL's default is in-text.
 */
export function styleClass(styleXml) {
  return /<style[^>]*\sclass="([a-z-]+)"/.exec(styleXml)?.[1] ?? "in-text";
}

export function isNoteStyle(styleXml) {
  return styleClass(styleXml) === "note";
}

/**
 * Locale loader for citeproc. citeproc asks for locales by name as it walks a
 * style, including ones the style mentions but we have not vendored, so an
 * unknown name falls back rather than throwing.
 */
export function makeLocaleLoader() {
  const cache = new Map();

  return (lang) => {
    const wanted = [
      lang,
      `${lang}-${String(lang).toUpperCase()}`,
      FALLBACK_LOCALE,
    ];

    for (const name of wanted) {
      if (cache.has(name)) return cache.get(name);
      const file = path.join(LOCALES_DIR, `locales-${name}.xml`);
      if (fs.existsSync(file)) {
        const xml = fs.readFileSync(file, "utf8");
        cache.set(name, xml);
        return xml;
      }
    }

    throw new Error(
      `No CSL locale for "${lang}" and no ${FALLBACK_LOCALE} fallback in ${LOCALES_DIR}`
    );
  };
}

/**
 * A citeproc engine over the given items.
 *
 * `lang` null means "let the style decide" - the case for English, where only
 * Oxford declares a default-locale. Anything else is forced, because a German
 * page must not inherit an English style's en-US.
 */
export function makeEngine(items, styleXml, lang) {
  const sys = {
    retrieveLocale: makeLocaleLoader(),
    retrieveItem: (id) => items[id],
  };
  return lang
    ? new CSL.Engine(sys, styleXml, lang, true)
    : new CSL.Engine(sys, styleXml);
}

/** Whether a CSL locale file is vendored under csl/locales. */
export function hasLocale(name) {
  return fs.existsSync(path.join(LOCALES_DIR, `locales-${name}.xml`));
}

/**
 * The CSL locale for a site language, honouring the English setting.
 *
 * CSL_LOCALES above covers the languages this site ships with, but a site can
 * add any language. Rather than leave those silently English, an unlisted
 * language derives the conventional CSL name - "it" becomes "it-IT" - and uses
 * it if that locale is vendored. Adding a language then needs only its locale
 * file, not a code change.
 *
 * Returns null when nothing matches, which tells citeproc to use the style's
 * own default locale. That is a real limitation, not a fix, so the generators
 * report it: see missingLocales.
 */
export function localeFor(lang, englishLocale) {
  if (lang === "en") return englishLocale;

  const explicit = CSL_LOCALES[lang];
  if (explicit) return hasLocale(explicit) ? explicit : null;

  const derived = `${lang}-${lang.toUpperCase()}`;
  return hasLocale(derived) ? derived : null;
}

/**
 * Site languages that will fall back to the style's default locale, with the
 * locale file that would fix each one.
 *
 * Worth reporting rather than swallowing: a language with no CSL locale still
 * produces a page, but its citations come out with English terms, English date
 * order and English quotation marks, which is easy to miss.
 */
export function missingLocales(languages) {
  return languages
    .filter((lang) => lang !== "en" && localeFor(lang, null) === null)
    .map((lang) => ({
      lang,
      expected: CSL_LOCALES[lang] ?? `${lang}-${lang.toUpperCase()}`,
    }));
}

/** Only touch the file when the content actually changed, to keep diffs quiet. */
export function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) {
    return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}
const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(text) {
  return text
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (m) => ENTITIES[m])
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

/**
 * Flatten citeproc's block wrappers, which both converters below need.
 *
 * Numeric styles put the "[1]" in its own margin div; an emphasis wrapper around
 * a field that turned out blank leaves an empty tag pair behind.
 */
function flattenCslBlocks(html) {
  return html
    .replace(/<div class="csl-left-margin">([\s\S]*?)<\/div>\s*/g, "$1 ")
    .replace(/<div class="csl-right-inline">([\s\S]*?)<\/div>/g, "$1")
    .replace(/<\/?div[^>]*>/g, "")
    .replace(/<(i|em|b|strong)>\s*<\/\1>/g, "");
}

/**
 * citeproc HTML -> structured tokens for the runtime <Cite> component.
 *
 *   Token = string | { i: Token[] } | { b: Token[] } | { a: href, c: Token[] }
 *
 * Tokens rather than markdown because the browser is the consumer here. Handing
 * <Cite> a markdown string would mean bundling a markdown parser - micromark and
 * the mdast-util stack - into every page, to render "Smith, J., *The Art of
 * Documentation* (Oxford, 2020)". A recursive eight-line renderer over these
 * needs no dependency at all.
 *
 * It also drops a whole class of bug: cslHtmlToMarkdown has to escape braces and
 * angle brackets so the string survives an MDX parse. Tokens are never parsed,
 * so nothing needs escaping.
 */
export function cslHtmlToTokens(html) {
  const source = flattenCslBlocks(html ?? "");
  const root = { c: [] };
  const stack = [root];
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)>/g;

  const push = (token) => stack[stack.length - 1].c.push(token);
  const pushText = (text) => {
    if (text) push(decodeEntities(text));
  };

  let cursor = 0;
  let match = tagPattern.exec(source);
  while (match !== null) {
    pushText(source.slice(cursor, match.index));

    const [full, closing, rawName, attributes] = match;
    const name = rawName.toLowerCase();

    if (closing) {
      // Close the nearest matching frame. An unmatched close is ignored rather
      // than allowed to pop the root, so malformed input degrades to plain text.
      if (stack.length > 1 && stack[stack.length - 1].tag === name) stack.pop();
    } else if (name === "i" || name === "em") {
      const frame = { tag: name, c: [] };
      push({ i: frame.c });
      stack.push(frame);
    } else if (name === "b" || name === "strong") {
      const frame = { tag: name, c: [] };
      push({ b: frame.c });
      stack.push(frame);
    } else if (name === "a") {
      const href = /href="([^"]*)"/.exec(attributes)?.[1] ?? "";
      const frame = { tag: name, c: [] };
      push({ a: decodeEntities(href), c: frame.c });
      stack.push(frame);
    } else {
      // Small-caps spans and anything else carry no meaning we can render, so
      // the tag is dropped and its text kept.
      const frame = { tag: name, c: stack[stack.length - 1].c };
      stack.push(frame);
    }

    cursor = match.index + full.length;
    match = tagPattern.exec(source);
  }
  pushText(source.slice(cursor));

  return root.c;
}

/**
 * citeproc HTML -> MDX-safe markdown.
 *
 * The page is real MDX, not an HTML blob, so it stays readable, greppable and
 * diffable. That means citeproc's markup has to come out as markdown, and
 * anything MDX would try to interpret has to be neutralised: MDX v3 parses raw
 * HTML as JSX, so a stray class= or an unescaped brace is a build error rather
 * than a stray character.
 */
export function cslHtmlToMarkdown(html) {
  let text = html;

  // IEEE and other numeric styles put the "[1]" in its own margin div.
  text = text.replace(
    /<div class="csl-left-margin">([\s\S]*?)<\/div>\s*/g,
    "$1 "
  );
  text = text.replace(/<div class="csl-right-inline">([\s\S]*?)<\/div>/g, "$1");
  text = text.replace(/<\/?div[^>]*>/g, "");

  // A style that wraps a field which turned out blank leaves empty emphasis
  // behind. Drop it here, while it is still a tag: once it is asterisks it
  // cannot be told apart from the delimiters of real emphasis.
  text = text.replace(/<(i|em|b|strong)>\s*<\/\1>/g, "");

  text = text.replace(/<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, "[$2]($1)");
  text = text.replace(/<(i|em)>([\s\S]*?)<\/\1>/g, "*$2*");
  text = text.replace(/<(b|strong)>([\s\S]*?)<\/\1>/g, "**$2**");

  // Small-caps, nocase and the rest carry no markdown equivalent: keep the text.
  text = text.replace(/<[^>]+>/g, "");

  text = decodeEntities(text);

  // MDX reads { } as an expression and < as a tag.
  text = text.replace(/[{}]/g, "\\$&").replace(/<(?!\/?[a-zA-Z])/g, "\\<");

  return text.replace(/\s+/g, " ").trim();
}
