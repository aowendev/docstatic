/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The notes at the foot of the page.
 *
 * Built by src/plugins/remark-citations.mjs, which appends it to the page and
 * fills it with one FootnoteItem per note, already in order. Under a note style
 * that list holds author footnotes and citations together in one sequence -
 * which is what Oxford and Chicago both require, and what lets citeproc pick a
 * short form over a full one.
 *
 * This replaced a client-only version that rendered nothing at all into the
 * static HTML.
 */

import Translate from "@docusaurus/Translate";
import React from "react";
import styles from "./Footnote.module.css";

const FootnotesList = ({ children }) => (
  <div className={styles.list}>
    <hr />
    <h2 className={styles.title}>
      <Translate
        id="theme.footnotes.title"
        description="Heading above the notes at the foot of a page"
      >
        Footnotes
      </Translate>
    </h2>
    <ol className={styles.ol}>{children}</ol>
  </div>
);

export default FootnotesList;
