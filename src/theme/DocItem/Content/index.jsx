/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This wrapper used to add a FootnotesProvider around the page and a
 * FootnotesList after it, because footnotes were numbered and collected in the
 * browser. src/plugins/remark-citations.mjs now does both at build time and
 * appends the list to the page's own content, so the swizzle has nothing left
 * to add - the notes are in the served HTML rather than assembled after
 * hydration.
 *
 * Kept as a pass-through rather than deleted: removing a swizzled theme
 * component means deleting the directory, and this is the natural place for any
 * future doc-content wrapper.
 */

import DocItemContent from "@theme-original/DocItem/Content";
import React from "react";

export default function DocItemContentWrapper(props) {
  return <DocItemContent {...props} />;
}
