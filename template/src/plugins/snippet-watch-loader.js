/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Makes a page depend on the snippets it includes.
 *
 * src/plugins/remark-snippets.mjs splices snippet content into the page, which
 * means the compiled page no longer imports the snippet file - so nothing tells
 * the bundler to recompile the page when the snippet changes, and a CMS edit
 * would sit invisible until someone restarted the dev server.
 *
 * A remark plugin cannot register a dependency itself: it is handed a vfile,
 * not the webpack loader context, and @docusaurus/mdx-loader only forwards the
 * one static `dependencies` option it is configured with. A pre-loader runs in
 * that context, ahead of the MDX loader on the same file, so it can.
 *
 * It registers the snippet *directories*, not the individual files a page
 * resolves. Working out the latter would mean duplicating the resolver's
 * locale precedence here, against raw text, for a worse result: a directory
 * dependency also catches a snippet being added, renamed or deleted. The cost
 * is that editing any snippet recompiles every page that uses any snippet,
 * which in a watch session is a handful of pages.
 *
 * The source is returned untouched; this loader exists only for its side
 * effect.
 */

/** Matches an opening <Snippet tag, not the word in prose or a code fence. */
const SNIPPET_TAG = /<Snippet[\s/>]/;

module.exports = function snippetWatchLoader(source) {
  if (this.cacheable) this.cacheable();

  if (SNIPPET_TAG.test(source)) {
    const { dirs = [] } = this.getOptions() ?? {};
    for (const dir of dirs) {
      this.addContextDependency(dir);
    }
  }

  return source;
};
