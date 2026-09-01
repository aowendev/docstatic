/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The webpack half of snippet inlining. Two jobs, both about reaching files
 * that src/plugins/remark-snippets.mjs would otherwise never see or never be
 * re-run for.
 *
 * 1. Keeping inlined snippets live
 * -------------------------------
 * Inlining bakes the snippet into the compiled page, so nothing tells the
 * bundler to rebuild that page when the snippet changes, and a CMS edit would
 * sit invisible until someone restarted the dev server. A remark plugin cannot
 * register the dependency itself - it is handed a vfile, not the webpack
 * loader context - so a pre-loader does it. See snippet-watch-loader.js.
 *
 * 2. Reaching MDX that no content plugin owns
 * -------------------------------------------
 * docusaurus.config.ts can only attach remark plugins to the docs, blog and
 * pages loaders. An MDX file imported as a partial from outside those folders
 * is compiled by a fourth loader Docusaurus adds for itself - its "MDX
 * fallback" - which is configured with the site's markdown settings and no
 * remark plugins at all. A <Snippet> in such a file would reach the browser
 * unresolved.
 *
 * There is no option to add a plugin to that loader, so this replaces it: the
 * rule below is the same loader with the same options, plus the snippet
 * plugin, covering the whole site except the folders the content plugins
 * already own.
 *
 * Docusaurus stands its own fallback down on its own. That plugin builds its
 * exclude list by scanning every rule whose `test` matches an .mdx path and
 * collecting that rule's `include`; this rule includes the site directory, so
 * the fallback excludes the site directory and matches nothing. That handshake
 * is the reason the rule below is written with `include` and a `test` - it has
 * to be legible to that scan, and the same scan is why the *watch* rule is
 * matched on `resource` instead (see below).
 */

const fs = require("node:fs");
const { createMDXLoaderRule } = require("@docusaurus/mdx-loader");

/**
 * The folders whose MDX a content plugin already compiles, read off the rules
 * they contributed - the same way Docusaurus's own fallback finds them, rather
 * than by rebuilding Docusaurus's knowledge of where content lives. Reading
 * them keeps this correct per locale, where the docs folder is joined by the
 * translated one.
 */
function contentMDXPaths(config) {
  return (config.module?.rules ?? [])
    .flatMap((rule) => {
      const isMDXRule = rule.test instanceof RegExp && rule.test.test("x.mdx");
      return isMDXRule ? (rule.include ?? []) : [];
    })
    .filter(Boolean);
}

module.exports = async function snippetsPlugin(context) {
  const { siteDir, siteConfig, i18n } = context;
  const locales = i18n?.locales ?? [];

  const watchDirs = [
    `${siteDir}/reuse/snippets`,
    ...locales.map((locale) => `${siteDir}/i18n/${locale}/snippets`),
  ].filter((dir) => fs.existsSync(dir));

  const { default: remarkSnippets } = await import("./remark-snippets.mjs");

  // Docusaurus's own fallback options, verbatim, plus the snippet plugin.
  // beforeDefaultRemarkPlugins for the same reason it is used for the content
  // plugins: a snippet spliced after the default plugins would miss headings,
  // toc, admonitions and the image and link transforms.
  const fallbackRule = await createMDXLoaderRule({
    include: [siteDir],
    options: {
      useCrossCompilerCache: siteConfig.future?.faster?.mdxCrossCompilerCache,
      admonitions: true,
      staticDirs: siteConfig.staticDirectories.map(
        (dir) => `${siteDir}/${dir}`
      ),
      siteDir,
      // External MDX files are always meant to be imported as partials, and
      // may carry front matter that is not worth a warning.
      isMDXPartial: () => true,
      isMDXPartialFrontMatterWarningDisabled: true,
      markdownConfig: siteConfig.markdown,
      beforeDefaultRemarkPlugins: [remarkSnippets],
    },
  });

  return {
    name: "docstatic-snippets",

    configureWebpack(config) {
      return {
        module: {
          rules: [
            {
              enforce: "pre",
              // `resource`, not `test`, though the two mean the same thing to
              // the bundler. The MDX fallback's scan described above reads the
              // `include` of every rule matched on `test`, and this rule
              // applies everywhere and so has none - which would put an
              // undefined in that list and kill the build inside the bundler
              // with "condition should be one of string, RegExp, Array,
              // Object". Matching on `resource` keeps this rule out of a
              // question it was never meant to answer.
              resource: /\.mdx?$/i,
              exclude: /node_modules/,
              use: [
                {
                  loader: require.resolve("./snippet-watch-loader.js"),
                  options: { dirs: watchDirs },
                },
              ],
            },
            {
              ...fallbackRule,
              exclude: contentMDXPaths(config),
            },
          ],
        },
      };
    },
  };
};
