/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The superscript marker in the running text.
 *
 * src/plugins/remark-citations.mjs puts this in place of a <Footnote>, or of a
 * <Cite> under a note style, with the number already decided at build time. It
 * therefore renders complete in server HTML - the previous component assigned
 * its number in a useEffect, which left "[...]" in the static output.
 */

import React from "react";
import styles from "./Footnote.module.css";

/**
 * `repeat` marks the second and later markers of a footnote whose content is
 * identical to an earlier one. They share a note, so only the first carries the
 * `footnote-ref-N` id: two elements with the same id is invalid HTML, and the
 * note's backlink can only return to one place anyway. Standard markdown sends
 * a repeat back to its first instance, which is what this produces.
 */
const FootnoteRef = ({ n, repeat }) => (
  <sup className={styles.ref}>
    <a href={`#footnote-${n}`} id={repeat ? undefined : `footnote-ref-${n}`}>
      [{n}]
    </a>
  </sup>
);

export default FootnoteRef;
