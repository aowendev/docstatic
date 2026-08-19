/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Citation marker.
 *
 * Deliberately renders nothing for now. The CSL pipeline that formats
 * citations does not exist yet, and a half-formatted citation on a built page
 * is worse than no citation at all - it looks like the feature works. The
 * component still has to exist and be registered in MDXComponents, because MDX
 * throws on an unregistered capitalised component, so <Cite> in a page has to
 * build cleanly and round-trip through the CMS today.
 *
 * Props (the shape the CMS writes, fixed now so authored content does not have
 * to be rewritten later):
 *
 *   items  - array of citation items, at least one. Each item is:
 *              key            - key of an entry in reuse/bibliography/index.json
 *              locator        - bare value only: "14", "14-16", "vii".
 *                               Never "p. 14" - the CSL locale supplies "p."/"pp."
 *              label          - what the locator counts: page, chapter, section...
 *              prefix         - text before the citation, e.g. "see also"
 *              suffix         - text after the citation
 *              suppressAuthor - omit the author, for "Smith (2020) argued..."
 *
 * One <Cite> is one citeproc cluster, which is what lets a style collapse
 * several sources into "[1-3]" or "(Smith 2020a, 2020b)".
 *
 * Next slice: scripts/generate-citations.js precomputes every citation at build
 * time and this returns the string it finds in src/data/citations.json, keyed
 * by page and by a normalised signature of these props.
 */
const Cite = () => null;

export default Cite;
