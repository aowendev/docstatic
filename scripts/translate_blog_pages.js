#!/usr/bin/env node
/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Fills in missing blog/pages translations using the DeepL API.
 *
 * Blog posts (blog/*.mdx) and pages (src/pages/*.mdx) aren't managed by any
 * Tina collection for their i18n copies (unlike docs), so there is no
 * GraphQL/XLIFF pipeline for them — this script works directly against the
 * filesystem, matching the on-disk convention already used by the existing
 * fr translations (i18n/<lang>/docusaurus-plugin-content-blog/*.mdx and
 * i18n/<lang>/docusaurus-plugin-content-pages/*.mdx).
 *
 * As with translate_xliff_deepl.js, content inside fenced code blocks and
 * inside JSX/component tags is never sent to DeepL — it's replaced with an
 * opaque <ph id="N"/> placeholder, then restored byte-for-byte afterwards.
 * Only surrounding prose (including frontmatter title/description) is
 * translated.
 *
 * Usage:
 *   node scripts/translate_blog_pages.js [--langs de,es,fr,ja] [--force]
 *
 * Requires DEEPL_API_KEY in the environment (see .env). Without --force,
 * only files missing for a given language are created; existing translated
 * files are left untouched.
 */

const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const matter = require("gray-matter");
const xliffUtils = require("../src/utils/xliff");
const { restore, placeholderIdsAreIntact, batchByLimits } = require("./translate_xliff_deepl");

const PLACEHOLDER_RE = /<ph id="(\d+)"\/>/g;
const OPEN_TAG_RE = /<([A-Z][\w.-]*)\b/g;

// Finds the '>' that closes the tag whose attributes start at `start`,
// tracking quote state so a '>' inside a quoted attribute value (e.g. a
// Passthrough component's `string="...<div>...</div>..."` prop) doesn't
// get mistaken for the tag's own end. Returns -1 if unterminated.
function findTagEnd(s, start) {
  let quote = null;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === ">") return i;
  }
  return -1;
}

// Scans for top-level JSX tags (component names start with an uppercase
// letter, matching this project's MDX convention) and protects each whole
// tag — attributes and, for paired tags, children — as one opaque
// placeholder, quote-aware so multi-line HTML-in-an-attribute props don't
// desync the match.
function protectAngleJsx(text, placeholders) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    OPEN_TAG_RE.lastIndex = i;
    const m = OPEN_TAG_RE.exec(text);
    if (!m) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, m.index);
    const name = m[1];
    const tagEnd = findTagEnd(text, OPEN_TAG_RE.lastIndex);
    if (tagEnd === -1) {
      out += text.slice(m.index);
      break;
    }
    const selfClosing = text[tagEnd - 1] === "/";
    let whole;
    let next;
    if (selfClosing) {
      whole = text.slice(m.index, tagEnd + 1);
      next = tagEnd + 1;
    } else {
      const closeTag = `</${name}>`;
      const closeIdx = text.indexOf(closeTag, tagEnd + 1);
      if (closeIdx === -1) {
        whole = text.slice(m.index, tagEnd + 1);
        next = tagEnd + 1;
      } else {
        whole = text.slice(m.index, closeIdx + closeTag.length);
        next = closeIdx + closeTag.length;
      }
    }
    out += `<ph id="${placeholders.push(whole) - 1}"/>`;
    i = next;
  }
  return out;
}

function protect(text) {
  const placeholders = [];
  const protectedText = xliffUtils
    .splitOutsideCodeFences(text)
    .map((seg) =>
      seg.code
        ? `<ph id="${placeholders.push(seg.text) - 1}"/>`
        : protectAngleJsx(seg.text, placeholders)
    )
    .join("");
  return { protectedText, placeholders };
}

const LANGS = ["de", "es", "fr", "ja"];

const TASKS = [
  {
    collection: "blog",
    srcDir: path.join(process.cwd(), "blog"),
    destDir: (lang) =>
      path.join(
        process.cwd(),
        "i18n",
        lang,
        "docusaurus-plugin-content-blog"
      ),
  },
  {
    collection: "pages",
    srcDir: path.join(process.cwd(), "src", "pages"),
    destDir: (lang) =>
      path.join(
        process.cwd(),
        "i18n",
        lang,
        "docusaurus-plugin-content-pages"
      ),
  },
];

async function translateBatch(deepl, texts, targetLang) {
  if (texts.length === 0) return [];
  const results = new Array(texts.length);
  const jobs = texts.map((text, i) => {
    const { protectedText, placeholders } = protect(text);
    return { i, protectedText, placeholders };
  });
  const batches = batchByLimits(jobs);
  for (const batch of batches) {
    const translations = await deepl.translateText(
      batch.map((j) => j.protectedText),
      "en",
      targetLang
    );
    for (let k = 0; k < batch.length; k++) {
      const { i, placeholders } = batch[k];
      const translatedProtected = translations[k].text;
      if (!placeholderIdsAreIntact(translatedProtected, placeholders.length)) {
        throw new Error(
          `DeepL altered a protected code/JSX span in item ${i}`
        );
      }
      results[i] = xliffUtils.stripControlChars(
        restore(translatedProtected, placeholders)
      );
    }
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const langsArg = args.find((a) => a.startsWith("--langs="));
  const langs = langsArg ? langsArg.replace("--langs=", "").split(",") : LANGS;

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("DEEPL_API_KEY is not set. Add it to .env.");
    process.exit(1);
  }
  const deeplNode = require("deepl-node");
  const deepl = new deeplNode.DeepLClient(apiKey);

  for (const task of TASKS) {
    const srcFiles = fs
      .readdirSync(task.srcDir)
      .filter((f) => /\.mdx?$/i.test(f))
      .map((f) => path.join(task.srcDir, f));

    for (const lang of langs) {
      const destDir = task.destDir(lang);
      fs.mkdirSync(destDir, { recursive: true });

      for (const srcFile of srcFiles) {
        const base = path.basename(srcFile);
        const destFile = path.join(destDir, base);
        if (fs.existsSync(destFile) && !force) {
          console.log(`[${task.collection}/${lang}] skip (exists): ${base}`);
          continue;
        }

        const raw = fs.readFileSync(srcFile, "utf8");
        const parsed = matter(raw);
        const data = { ...parsed.data };
        const body = parsed.content;

        const textsToTranslate = [];
        const fieldRefs = [];
        if (data.title) {
          fieldRefs.push({ field: "title" });
          textsToTranslate.push(data.title);
        }
        if (data.description) {
          fieldRefs.push({ field: "description" });
          textsToTranslate.push(data.description);
        }
        const bodyIndex = textsToTranslate.push(body) - 1;

        console.log(`[${task.collection}/${lang}] translating: ${base}`);
        const translated = await translateBatch(deepl, textsToTranslate, lang);

        for (let i = 0; i < fieldRefs.length; i++) {
          data[fieldRefs[i].field] = translated[i];
        }
        const translatedBody = translated[bodyIndex];

        data.lastmod = new Date().toISOString();

        const out = matter.stringify(translatedBody, data);
        fs.writeFileSync(destFile, out, "utf8");
        console.log(`[${task.collection}/${lang}] wrote: ${destFile}`);
      }
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.stack || err);
    process.exit(1);
  });
}
