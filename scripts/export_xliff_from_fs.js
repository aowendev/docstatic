#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// simple frontmatter extractor (same semantics as xliff util)
function extractFrontmatter(text) {
  if (!text) return { metadata: {}, body: text || "" };
  const m = String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { metadata: {}, body: text };
  const fmRaw = m[1];
  const body = text.slice(m[0].length);
  const metadata = {};
  for (const line of fmRaw.split(/\n/)) {
    const kv = line.match(
      /^([A-Za-z0-9_-]+):\s*(?:"([^"]+)"|'([^']+)'|(.+))?$/
    );
    if (kv) {
      metadata[kv[1]] = (kv[2] || kv[3] || kv[4] || "").trim();
    }
  }
  return { metadata, body };
}

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(res, cb);
    else cb(res);
  }
}

async function main() {
  const language = process.argv[2] || "fr";
  const outFile = process.argv[3] || `translations-${language}.xlf`;
  const docsRoot = path.join(process.cwd(), "docs");

  if (!fs.existsSync(docsRoot)) {
    console.error("docs/ directory not found in", process.cwd());
    process.exit(1);
  }

  const docNodes = [];
  walkDir(docsRoot, (file) => {
    if (!/\.mdx?$|\.md$/i.test(file)) return;
    const rel = path.relative(process.cwd(), file).replace(/\\\\/g, "/");
    const raw = fs.readFileSync(file, "utf8");
    const stat = fs.statSync(file);
    const parsed = extractFrontmatter(raw);
    const title = parsed.metadata?.title
      ? parsed.metadata.title
      : path.basename(file);
    // Prefer the frontmatter lastmod (what Tina/GraphQL would report) over
    // the file's mtime, which reflects the last checkout/clone, not the
    // last real edit.
    const lastmod = parsed.metadata?.lastmod || stat.mtime.toISOString();
    docNodes.push({
      node: {
        raw,
        title,
        lastmod,
        _sys: { relativePath: rel },
      },
    });
  });

  // Read the translations that actually exist on disk, so
  // exportOutOfDateAsXliff sees real lastmod dates and only includes topics
  // that are genuinely out of date — the same "out of date" set the
  // Translation Dashboard's Export XLIFF button produces via Tina/GraphQL.
  const i18nRoot = path.join(
    process.cwd(),
    "i18n",
    language,
    "docusaurus-plugin-content-docs",
    "current"
  );
  const i18nNodes = [];
  if (fs.existsSync(i18nRoot)) {
    walkDir(i18nRoot, (file) => {
      if (!/\.mdx?$|\.md$/i.test(file)) return;
      const relInLang = path.relative(i18nRoot, file).replace(/\\\\/g, "/");
      const raw = fs.readFileSync(file, "utf8");
      const stat = fs.statSync(file);
      const parsed = extractFrontmatter(raw);
      const title = parsed.metadata?.title
        ? parsed.metadata.title
        : path.basename(file);
      const lastmod = parsed.metadata?.lastmod || stat.mtime.toISOString();
      const rel = `${language}/docusaurus-plugin-content-docs/current/${relInLang}`;
      i18nNodes.push({
        node: { raw, title, lastmod, _sys: { relativePath: rel } },
      });
    });
  }

  // Minimal fake client matching the shape expected by xliff util
  const client = {
    queries: {
      docConnection: async () => ({
        data: { docConnection: { edges: docNodes } },
      }),
      i18nConnection: async () => ({
        data: { i18nConnection: { edges: i18nNodes } },
      }),
    },
  };

  // Require the xliff util and call exportOutOfDateAsXliff
  const xliff = require("../src/utils/xliff");
  try {
    const xml = await xliff.exportOutOfDateAsXliff(client, language);
    fs.writeFileSync(path.join(process.cwd(), outFile), xml, "utf8");
    console.error("Wrote", outFile);
  } catch (e) {
    console.error("Error running export:", e?.stack ? e.stack : e);
    process.exit(1);
  }
}

main();
