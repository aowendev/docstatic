#!/usr/bin/env node
/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Fills in <target> segments of an "out of date" XLIFF export (produced by
 * the Translation Dashboard's Export XLIFF button, or by
 * export_xliff_from_fs.js) using the DeepL API.
 *
 * Content inside JSX/component markers ("(jsx:Name ...)...(/jsx:Name)" and
 * "(jsx:Name .../)", the marker form the exporter converts real JSX into)
 * and inside fenced code blocks is never sent to DeepL — it is replaced
 * with an opaque <ph id="N"/> placeholder that DeepL is told to leave
 * untouched (tagHandling: "xml", ignoreTags: ["ph"]), then restored
 * byte-for-byte afterwards. Only the surrounding prose is translated.
 *
 * Usage:
 *   node scripts/translate_xliff_deepl.js <input.xlf> [output.xlf]
 *
 * Requires DEEPL_API_KEY in the environment (see .env).
 */

const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const xliffUtils = require("../src/utils/xliff");

const PLACEHOLDER_RE = /<ph id="(\d+)"\/>/g;
// (jsx:Name props)...(/jsx:Name) — props may contain nested "()" (e.g. a
// caption with parenthetical text), so match the closing marker for the
// *same* component name rather than trying to balance parens in the props.
const PAIRED_JSX_RE = /\(jsx:([\w-]+)\b[\s\S]*?\(\/jsx:\1\)/g;
// Props may contain nested "()" (e.g. a caption with parenthetical text), so
// match up to the nearest "/)" rather than excluding ")" outright.
const SELF_CLOSING_JSX_RE = /\(jsx:[\w-]+\b[\s\S]*?\/\)/g;

function protectJsxMarkers(text, placeholders) {
  const protectOne = (m) => `<ph id="${placeholders.push(m) - 1}"/>`;
  return text
    .replace(PAIRED_JSX_RE, protectOne)
    .replace(SELF_CLOSING_JSX_RE, protectOne);
}

// Replaces fenced code blocks and JSX markers with <ph id="N"/> placeholders
// so only prose is ever sent to DeepL. Returns the protected text plus the
// list of original spans, keyed by placeholder id.
function protect(text) {
  const placeholders = [];
  const protectedText = xliffUtils
    .splitOutsideCodeFences(text)
    .map((seg) =>
      seg.code
        ? `<ph id="${placeholders.push(seg.text) - 1}"/>`
        : protectJsxMarkers(seg.text, placeholders)
    )
    .join("");
  return { protectedText, placeholders };
}

function restore(text, placeholders) {
  return text.replace(PLACEHOLDER_RE, (m, idStr) => {
    const id = Number(idStr);
    return id < placeholders.length ? placeholders[id] : m;
  });
}

// The exact set of placeholder ids 0..n-1 must appear exactly once each for
// a restore to be trustworthy — anything else means DeepL dropped,
// duplicated, or mangled a protected span.
function placeholderIdsAreIntact(text, expectedCount) {
  const found = [...text.matchAll(PLACEHOLDER_RE)].map((m) => Number(m[1]));
  if (found.length !== expectedCount) return false;
  const seen = new Set(found);
  if (seen.size !== expectedCount) return false;
  for (let i = 0; i < expectedCount; i++) {
    if (!seen.has(i)) return false;
  }
  return true;
}

function parseUnits(fileText) {
  const units = [];
  const unitRe = /<unit id="([^"]*)">([\s\S]*?)<\/unit>/g;
  for (const m of fileText.matchAll(unitRe)) {
    const [fullMatch, id, block] = m;
    const sourceMatch = block.match(
      /<source xml:space="preserve">([\s\S]*?)<\/source>/
    );
    const targetMatch = block.match(
      /<target xml:space="preserve">([\s\S]*?)<\/target>/
    );
    if (!sourceMatch || !targetMatch) continue;
    units.push({
      id,
      fullMatch,
      sourceXml: sourceMatch[1],
      targetXml: targetMatch[1],
    });
  }
  return units;
}

// DeepL limits: at most 50 texts and 128 KiB per translateText() call.
function batchByLimits(items, maxCount = 50, maxBytes = 120 * 1024) {
  const batches = [];
  let current = [];
  let currentBytes = 0;
  for (const item of items) {
    const bytes = Buffer.byteLength(item.protectedText, "utf8");
    if (
      current.length &&
      (current.length >= maxCount || currentBytes + bytes > maxBytes)
    ) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(item);
    currentBytes += bytes;
  }
  if (current.length) batches.push(current);
  return batches;
}

async function main() {
  const inPath = process.argv[2];
  if (!inPath) {
    console.error(
      "Usage: node scripts/translate_xliff_deepl.js <input.xlf> [output.xlf]"
    );
    process.exit(1);
  }
  const outPath =
    process.argv[3] || inPath.replace(/(\.xlf|\.xliff)?$/i, ".translated.xlf");

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error(
      "DEEPL_API_KEY is not set. Add it to .env — see the comment above that line for where to get a key."
    );
    process.exit(1);
  }

  if (!fs.existsSync(inPath)) {
    console.error(`Input file not found: ${inPath}`);
    process.exit(1);
  }
  const fileText = fs.readFileSync(inPath, "utf8");

  const trgLangMatch = fileText.match(/trgLang="([^"]+)"/);
  const targetLang = trgLangMatch ? trgLangMatch[1] : null;
  if (!targetLang) {
    console.error("Could not find trgLang= on the <xliff> root element.");
    process.exit(1);
  }

  const units = parseUnits(fileText);
  if (units.length === 0) {
    console.log("No <unit> elements found — nothing to translate.");
    fs.writeFileSync(outPath, fileText, "utf8");
    return;
  }

  // Protect each unit's source text, and self-check that restoring the
  // placeholders with no translation reproduces the original byte-for-byte.
  // If it doesn't, our own marker parsing got confused for this unit (e.g. a
  // caption containing an unbalanced paren) and it's not safe to send —
  // leave that unit's target untouched rather than risk corrupting it.
  const jobs = [];
  const skipped = [];
  for (const unit of units) {
    const plainSource = xliffUtils.unescapeXml(unit.sourceXml);
    const { protectedText, placeholders } = protect(plainSource);
    if (restore(protectedText, placeholders) !== plainSource) {
      skipped.push({
        id: unit.id,
        reason: "unsafe to protect (marker parsing mismatch)",
      });
      continue;
    }
    jobs.push({ unit, protectedText, placeholders });
  }

  const deepl = require("deepl-node");
  const client = new deepl.DeepLClient(apiKey);

  const results = new Map(); // id -> new target inner XML
  const batches = batchByLimits(jobs);
  console.log(
    `Translating ${jobs.length} unit(s) to ${targetLang} in ${batches.length} batch(es) (${skipped.length} skipped)...`
  );

  for (const batch of batches) {
    let translations;
    try {
      // tagHandling: "xml" was tried first, but DeepL requires the *entire*
      // string to be well-formed XML in that mode, and ordinary prose (a
      // stray "<" or ">" in running text, an inequality, etc.) routinely
      // isn't — it rejected every real document with a "mismatched tag"
      // error. Plain-text mode is far more forgiving; the placeholder-id
      // check below is the actual safety net either way, so this doesn't
      // weaken protection, it just stops false-positive whole-batch failures.
      translations = await client.translateText(
        batch.map((j) => j.protectedText),
        "en",
        targetLang
      );
    } catch (err) {
      for (const job of batch) {
        skipped.push({
          id: job.unit.id,
          reason: `DeepL error: ${err.message}`,
        });
      }
      continue;
    }

    for (let i = 0; i < batch.length; i++) {
      const { unit, placeholders } = batch[i];
      const translatedProtected = translations[i].text;
      if (!placeholderIdsAreIntact(translatedProtected, placeholders.length)) {
        skipped.push({
          id: unit.id,
          reason: "DeepL altered a protected code/JSX span",
        });
        continue;
      }
      const translatedPlain = restore(translatedProtected, placeholders);
      const sanitized = xliffUtils.stripControlChars(translatedPlain);
      results.set(unit.id, xliffUtils.escapeXml(sanitized));
    }
  }

  const outText = fileText.replace(
    /<unit id="([^"]*)">([\s\S]*?)<\/unit>/g,
    (fullMatch, id, block) => {
      const newTargetXml = results.get(id);
      if (newTargetXml === undefined) return fullMatch;
      const newBlock = block.replace(
        /<target xml:space="preserve">[\s\S]*?<\/target>/,
        `<target xml:space="preserve">${newTargetXml}</target>`
      );
      return `<unit id="${id}">${newBlock}</unit>`;
    }
  );

  fs.writeFileSync(outPath, outText, "utf8");

  console.log(`Translated ${results.size}/${units.length} unit(s).`);
  if (skipped.length) {
    console.log(`Left ${skipped.length} unit(s) unchanged:`);
    for (const s of skipped) console.log(`  ${s.id}: ${s.reason}`);
  }
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.stack || err);
    process.exit(1);
  });
}

module.exports = {
  protect,
  restore,
  placeholderIdsAreIntact,
  parseUnits,
  batchByLimits,
};
