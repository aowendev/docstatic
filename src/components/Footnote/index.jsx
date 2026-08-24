/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A footnote, before the build gets to it.
 *
 * src/plugins/remark-citations.mjs replaces every <Footnote> with a numbered
 * <FootnoteRef> and moves its body into the notes list at the foot of the page,
 * so on a docs page or a blog post this component is never rendered.
 *
 * It stays registered in MDXComponents because MDX throws on an unregistered
 * capitalised component, and the plugin only runs where it is configured. In
 * any such context this renders the note's text inline rather than dropping it:
 * an unnumbered aside still reads, whereas a blank does not.
 *
 * This used to hold the whole footnote mechanism - a React context that
 * collected notes and numbered them after hydration. That left server-rendered
 * HTML with "[...]" placeholders and no notes at all, invisible to search
 * engines and to readers without JavaScript. Numbering now happens at build
 * time, and FootnotesProvider and its content-hashing helper went with it.
 */

import React from "react";

const Footnote = ({ children }) => <span>{children}</span>;

export default Footnote;
