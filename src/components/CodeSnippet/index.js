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
