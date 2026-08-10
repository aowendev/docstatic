/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Sync the scaffolding template (template/) with the main site.
 *
 * Copies the code surface (src, shared scripts, tina config, docusaurus
 * config, etc.) from the repo root into template/, and aligns the template's
 * package.json dependencies and scripts with the root. Template-specific
 * content (starter docs, config values, reuse content, static assets,
 * generated files) is left alone.
 *
 * Usage: node scripts/sync-template.js [--check]
 *   --check  Report what would change without writing (exits 1 if out of sync)
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const TEMPLATE = path.join(ROOT, "template");
const CHECK = process.argv.includes("--check");

// src/ subdirectories mirrored verbatim (template copy is replaced entirely)
const MIRROR_SRC_DIRS = [
  "src/clientModules",
  "src/components",
  "src/plugins",
  "src/theme",
  "src/utils",
];

// Individual files copied verbatim
const COPY_FILES = [
  "docusaurus.config.ts",
  "sidebars.ts",
  // biome.json ships under a different name, see BIOME_TEMPLATE_NAME below
  "frontmatter.json",
  "tina/config.jsx",
  "config/docusaurus/openapi-tag-template.md",
  // src/css/theme-variables.css is generated per-site by update-theme-css
  "src/css/custom.css",
  // Generic pages only; site-content pages (e.g. Getting-Started mdx) stay out
  "src/pages/404.js",
  "src/pages/index.jsx",
  "src/pages/index.module.css",
  "src/pages/example-page.mdx",
];

// scripts/ is mirrored to exactly this allowlist (dev-only tooling stays out)
const SCRIPTS_ALLOWLIST = [
  "generate-file-list.js",
  "generate-media-index.js",
  "generate-docs-metadata.js",
  "generate-git-identity.js",
  "update-theme-css.js",
  "util.js",
];

// Biome only auto-discovers "biome.json"/"biome.jsonc", so the template ships
// its config under this name and the create CLI renames it on scaffold.
const BIOME_TEMPLATE_NAME = "biome.template.json";

// Oldest create-docstatic that can consume this manifest correctly. Bump this
// whenever the manifest gains semantics an older CLI would silently ignore —
// renameFiles landed in 0.2.1, and a CLI without it scaffolds a site with no
// biome.json at all. The CLI refuses rather than producing a broken site.
const MIN_CREATE_VERSION = "0.2.1";

// Stale files removed from BOTH template/ and, via the update manifest, from
// existing sites. Only put things here that sites should genuinely lose.
const REMOVE_FILES = [
  "util.js", // moved to scripts/util.js
  "babel.config.js", // root site dropped it (@docusaurus/faster)
];

// Stale files removed from template/ only. biome.json lives here because a
// scaffolded site must KEEP its biome.json — it is merely shipped under
// BIOME_TEMPLATE_NAME, so listing it in REMOVE_FILES would tell every existing
// site to delete its config.
const TEMPLATE_ONLY_REMOVE = ["biome.json"];

// Root package.json scripts that make no sense in a scaffolded site
const EXCLUDED_SCRIPTS = [
  "postinstall",
  "setup-git-hooks",
  "sync-template",
  "sync-template:check",
];

let changes = 0;

function log(action, rel) {
  changes++;
  console.log(`  ${action.padEnd(7)} ${rel}`);
}

function filesEqual(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  const sa = fs.statSync(a);
  const sb = fs.statSync(b);
  if (sa.size !== sb.size) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dest = path.join(TEMPLATE, rel);
  if (!fs.existsSync(src)) {
    console.error(`  missing in root, skipped: ${rel}`);
    process.exitCode = 1;
    return;
  }
  if (filesEqual(src, dest)) return;
  log(fs.existsSync(dest) ? "update" : "add", rel);
  if (CHECK) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

function mirrorDir(rel) {
  const src = path.join(ROOT, rel);
  const dest = path.join(TEMPLATE, rel);
  const srcFiles = new Set(listFiles(src));
  for (const f of listFiles(dest)) {
    if (!srcFiles.has(f)) {
      log("remove", path.join(rel, f));
      if (!CHECK) fs.rmSync(path.join(dest, f));
    }
  }
  for (const f of srcFiles) copyFile(path.join(rel, f));
}

function mirrorScripts() {
  const dest = path.join(TEMPLATE, "scripts");
  if (fs.existsSync(dest)) {
    for (const f of listFiles(dest)) {
      if (!SCRIPTS_ALLOWLIST.includes(f)) {
        log("remove", path.join("scripts", f));
        if (!CHECK) fs.rmSync(path.join(dest, f));
      }
    }
  }
  for (const f of SCRIPTS_ALLOWLIST) copyFile(path.join("scripts", f));
}

function syncPackageJson() {
  const rootPkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8")
  );
  const pkgPath = path.join(TEMPLATE, "package.json");
  const tplPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const scripts = {};
  for (const [name, cmd] of Object.entries(rootPkg.scripts)) {
    if (EXCLUDED_SCRIPTS.includes(name) || name.startsWith("mcp:")) continue;
    scripts[name] = cmd;
  }

  const next = {
    ...tplPkg,
    scripts,
    dependencies: rootPkg.dependencies,
    resolutions: rootPkg.resolutions,
    browserslist: rootPkg.browserslist,
    devDependencies: rootPkg.devDependencies,
    engines: rootPkg.engines,
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  if (serialized !== fs.readFileSync(pkgPath, "utf8")) {
    log("update", "package.json");
    if (!CHECK) fs.writeFileSync(pkgPath, serialized);
  }
}

// One-time seeds: created if missing, never overwritten (they are content)
function seedFile(rel, content) {
  const dest = path.join(TEMPLATE, rel);
  if (fs.existsSync(dest)) return;
  log("seed", rel);
  if (CHECK) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

console.log(
  CHECK ? "Checking template against main site..." : "Syncing template..."
);

for (const dir of MIRROR_SRC_DIRS) mirrorDir(dir);
mirrorScripts();
for (const file of COPY_FILES) copyFile(file);
syncPackageJson();

for (const rel of [...REMOVE_FILES, ...TEMPLATE_ONLY_REMOVE]) {
  const dest = path.join(TEMPLATE, rel);
  if (fs.existsSync(dest)) {
    log("remove", rel);
    if (!CHECK) fs.rmSync(dest);
  }
}

// npm never packs files named .gitignore, so the template ships a dotless
// "gitignore" (renamed by the create CLI) built from the root .gitignore.
{
  const gitignore = `${fs
    .readFileSync(path.join(ROOT, ".gitignore"), "utf8")
    .trimEnd()}\n\n# TinaCMS generated files\ntina/__generated__\n`;
  const dest = path.join(TEMPLATE, "gitignore");
  if (!fs.existsSync(dest) || fs.readFileSync(dest, "utf8") !== gitignore) {
    log(fs.existsSync(dest) ? "update" : "add", "gitignore");
    if (!CHECK) fs.writeFileSync(dest, gitignore);
  }
}

// Biome discovers nested config files regardless of files.includes, so shipping
// template/biome.json would make `biome check .` abort at the repo root with
// "found a nested root configuration". Marking it "root": false is NOT a fix:
// Biome then looks for a parent root config and, finding none in a scaffolded
// site, silently ignores the whole file. So the template ships it under a name
// Biome does not discover, and the create CLI renames it during scaffolding
// (same trick as the dotless "gitignore" above).
{
  const serialized = fs.readFileSync(path.join(ROOT, "biome.json"), "utf8");
  const dest = path.join(TEMPLATE, BIOME_TEMPLATE_NAME);
  if (!fs.existsSync(dest) || fs.readFileSync(dest, "utf8") !== serialized) {
    log(fs.existsSync(dest) ? "update" : "add", BIOME_TEMPLATE_NAME);
    if (!CHECK) fs.writeFileSync(dest, serialized);
  }
}

// docusaurus.config.ts requires blog/ and generate-media-index writes into
// reuse/media/, so a scaffolded site needs both to exist.
seedFile(
  "reuse/media/index.json",
  `${JSON.stringify({ media: [] }, null, 2)}\n`
);
// The Snippet component's dynamic import needs @site/i18n to resolve
seedFile("i18n/.gitkeep", "");
seedFile(
  "blog/welcome.mdx",
  `---
title: Welcome to your blog
authors:
  - name: "docStatic"
    title: "Starter post"
    url: "https://docstatic.com"
date: "2024-01-01"
---

This is your first blog post. Edit it in the CMS at
\`/admin/index.html\`, or replace this file in the \`blog\` directory.
`
);

// Manifest shipped in the npm tarball; `create-docstatic --update` uses it
// to know which files in an existing site are docStatic-owned code surface
// (safe to overwrite) versus user content (never touched).
{
  const manifest = {
    manifestVersion: 1,
    minCreateVersion: MIN_CREATE_VERSION,
    // Directories copied over the site's copy, overwriting file by file
    mirrorDirs: [...MIRROR_SRC_DIRS, "scripts"],
    // Individual files overwritten
    files: [
      ...COPY_FILES.filter((f) => f !== "src/pages/example-page.mdx"),
      BIOME_TEMPLATE_NAME,
    ],
    // Template path -> path written into the site
    renameFiles: { [BIOME_TEMPLATE_NAME]: "biome.json" },
    // Stale files deleted if present
    removeFiles: REMOVE_FILES,
    // Created only if missing (content-ish or required-to-exist files)
    ensureFiles: [
      "src/pages/example-page.mdx",
      "i18n/.gitkeep",
      "reuse/media/index.json",
      "blog/welcome.mdx",
    ],
    // package.json sections replaced from the template's package.json
    packageJsonKeys: [
      "dependencies",
      "devDependencies",
      "resolutions",
      "browserslist",
      "engines",
    ],
  };
  const dest = path.join(ROOT, "update-manifest.json");
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!fs.existsSync(dest) || fs.readFileSync(dest, "utf8") !== serialized) {
    log(fs.existsSync(dest) ? "update" : "add", "update-manifest.json");
    if (!CHECK) fs.writeFileSync(dest, serialized);
  }
}

if (changes === 0) {
  console.log("Template is in sync.");
} else if (CHECK) {
  console.log(`\nTemplate is out of sync: ${changes} change(s) needed.`);
  console.log("Run: node scripts/sync-template.js");
  process.exitCode = 1;
} else {
  console.log(`\nDone: ${changes} change(s).`);
}
