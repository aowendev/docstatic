/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Keeps the generated citation data current while the dev server runs.
 *
 * Without this, editing a source in the CMS changes
 * reuse/bibliography/index.json and nothing else: citeproc has to run to turn
 * that into rendered text, and only `yarn generate` was doing so. This watches
 * the two files the CMS writes that citations depend on, and re-runs the
 * generator when either changes. The generator writes
 * src/data/citations-rendered.json, which src/components/Cite imports, so the
 * bundler takes it from there and the page updates - no rebuild, no restart.
 *
 * CommonJS, matching blog-date-filter.js, because docusaurus.config.ts requires
 * it directly.
 */

const path = require("node:path");

const ROOT = path.join(__dirname, "../..");

/**
 * What to watch.
 *
 * Deliberately NOT docs/ or i18n/. A new <Cite> on a page is the case the user
 * has accepted a rebuild for, and watching content would be actively risky:
 * Docusaurus's dev server reloads plugins per watcher without debouncing or
 * queueing them (see the TODO in @docusaurus/core start/utils.js), so a save
 * that trips two watchers at once can have one reload silently discard the
 * other's content. Watching only files the CMS writes on their own keeps this
 * to one watcher and one reload.
 */
const WATCHED = [
  path.join(ROOT, "reuse/bibliography/index.json"),
  path.join(ROOT, "config/docusaurus/index.json"),
];

module.exports = function citationsPlugin() {
  return {
    name: "docstatic-citations",

    getPathsToWatch() {
      return WATCHED;
    },

    async loadContent() {
      // Imported here rather than at module scope so that loading
      // docusaurus.config.ts does not pull in citeproc, which is a
      // devDependency and may be absent from a production install.
      const { generateCitations } = await import(
        "../../scripts/generate-citations.mjs"
      );
      generateCitations();
    },
  };
};
