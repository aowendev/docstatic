/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CodeBlock from "@theme/CodeBlock";
import React from "react";

const CodeSnippet = ({ language, title, filepath }) => {
  const rawCode = require(`!!raw-loader!@site/reuse/code/${filepath}`).default;

  return (
    <CodeBlock language={language} title={title}>
      {rawCode}
    </CodeBlock>
  );
};

export default CodeSnippet;
