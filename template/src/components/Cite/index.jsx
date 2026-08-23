/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Citation marker.
 *
 * Citations are resolved at build time, not here.
 * scripts/generate-citations.mjs renders each one through citeproc, and
 * src/plugins/remark-citations.mjs replaces the <Cite> in the page's mdast with
 * the result - inline under an in-text style, or as a numbered note under a
 * note style. So on a docs page this component is never actually rendered.
 *
 * It still has to exist and stay registered in MDXComponents: MDX throws on an
 * unregistered capitalised component, and the remark plugin runs only where it
 * is configured (the docs plugin). Anywhere else - a blog post, a standalone
 * page - a <Cite> reaches this component unresolved.
 *
 * There it renders nothing, as it did before the pipeline existed. If a citation
 * is missing from a page, that is the reason: check that the page is under the
 * docs plugin and that `yarn generate` has run.
 *
 * Props (the shape the CMS writes):
 *
 *   items  - array of citation items, at least one. Each item is:
 *              key            - key of an entry in reuse/bibliography/index.json
 *              locator        - bare value only: "14", "14-16", "vii".
 *                               Never "p. 14" - the CSL locale supplies "p."/"pp."
 *              label          - what the locator counts: page, chapter, section...
 *              prefix         - text before the citation, e.g. "see also"
 *              suffix         - text after it; the place for a short remark
 *              suppressAuthor - omit the author, for "Smith (2020) argued..."
 *
 * One <Cite> is one citeproc cluster, which is what lets a style collapse
 * several sources into "[1-3]" or "(Smith 2020a, 2020b)". For a remark longer
 * than `suffix` suits, put the citation inside a <Footnote> instead: it renders
 * within that note rather than making a new one.
 */

const Cite = () => null;

export default Cite;
