/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * One note at the foot of the page.
 *
 * Its children are the authored footnote body, moved here by the remark plugin,
 * so links, emphasis and a nested citation all survive - which is why the body
 * travels as mdast rather than as a string prop.
 */

import { translate } from "@docusaurus/Translate";
import React from "react";
import styles from "./Footnote.module.css";

const FootnoteItem = ({ n, children }) => (
  <li id={`footnote-${n}`} className={styles.item}>
    <span className={styles.content}>{children}</span>{" "}
    <a
      href={`#footnote-ref-${n}`}
      className={styles.backlink}
      aria-label={translate(
        {
          id: "theme.footnotes.backToReference",
          message: "Back to reference {number}",
          description: "Link from a footnote back to its marker in the text",
        },
        { number: n }
      )}
    >
      ↩
    </a>
  </li>
);

export default FootnoteItem;
