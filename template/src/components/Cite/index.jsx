/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A citation, rendered from build-time output.
 *
 * src/plugins/remark-citations.mjs has already replaced the authored
 * `<Cite items={[...]} />` with `<Cite id="…" />`; this looks that id up in the
 * data citeproc produced. The engine itself never reaches the browser - it is
 * CPAL-1.0 OR AGPL-1.0, and only its output ships.
 *
 * The static import is the point of the whole design. It makes
 * citations-rendered.json a module the dev server watches, so editing a source
 * in the CMS updates every citation of it without a rebuild or a restart -
 * exactly how GlossaryTerm and VariableSet have always worked.
 *
 * The lookup happens during render, never in an effect. Docusaurus
 * server-renders every page, so computing here puts the citation in the static
 * HTML; computing in a useEffect would leave the served page empty until
 * hydration, which is the defect the footnote rewrite existed to fix.
 */

import citations from "@site/src/data/citations-rendered.json";
import React from "react";
import NotFound from "../NotFound";
import { lookupCitation } from "./lookup.mjs";

/**
 * Tokens -> elements. Recursive, and deliberately dependency-free: rendering
 * "Smith, J., <i>The Art of Documentation</i>" does not justify a markdown
 * parser in the page bundle.
 */
function renderTokens(tokens) {
  return tokens.map((token, index) => {
    if (typeof token === "string") return token;
    if (token.a !== undefined) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
        <a key={index} href={token.a}>
          {renderTokens(token.c)}
        </a>
      );
    }
    if (token.i !== undefined) {
      // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
      return <em key={index}>{renderTokens(token.i)}</em>;
    }
    if (token.b !== undefined) {
      // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
      return <strong key={index}>{renderTokens(token.b)}</strong>;
    }
    return null;
  });
}

const Cite = ({ id }) => {
  const entry = lookupCitation(citations, id);

  // No entry yet: the citation was added to the page since the last
  // generation. Render nothing rather than something wrong - `yarn generate`
  // fills it in. Cannot happen in a production build, where generation runs
  // first via prebuild.
  if (!entry) return null;

  // A citation naming a source that is not in the bibliography says so where it
  // stands, the way a glossary term or a variable does. It used to fail the
  // build, which stopped anyone previewing the site over one mistyped key.
  if (entry.missing) {
    return <NotFound name={entry.missing} />;
  }

  return <span className="citation">{renderTokens(entry.tokens)}</span>;
};

export default Cite;
