/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What is left of a <Snippet> that could not be inlined.
 *
 * src/plugins/remark-snippets.mjs replaces every snippet it can resolve with
 * the snippet's own content, at build time, so a working snippet never reaches
 * this component at all. What arrives here is a filepath that named no file,
 * or a snippet that includes itself - and it renders the same marker a missing
 * glossary term, variable or citation renders, naming the key so the author
 * knows what to fix.
 *
 * The component used to load the file itself, in a useEffect. That left
 * "Loading snippet..." in the static HTML of every page that reused anything:
 * absent from the served page, absent from the search index, and present only
 * after hydration. Resolving it at build time is what fixed that; this file is
 * the leftover error path.
 */

import React from "react";
import NotFound from "../NotFound";

const Snippet = ({ filepath }) => <NotFound name={filepath || "Snippet"} />;

export default Snippet;
