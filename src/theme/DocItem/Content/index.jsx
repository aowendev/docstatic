/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FootnotesList from "@site/src/components/Footnote/FootnotesList";
import { FootnotesProvider } from "@site/src/components/Footnote/FootnotesProvider";
import DocItemContent from "@theme-original/DocItem/Content";
import React from "react";

export default function DocItemContentWrapper(props) {
  return (
    <FootnotesProvider>
      <DocItemContent {...props} />
      <FootnotesList />
    </FootnotesProvider>
  );
}
