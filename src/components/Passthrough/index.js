import React from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

/**
 * Passthrough component that renders a string as markdown with KaTeX math support
 * @param {string} summary - A summary description (for documentation purposes)
 * @param {string} string - The markdown content to render (supports LaTeX math)
 */
const Passthrough = ({ summary, string }) => {
  return (
    <span title={summary}>
      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {string}
      </Markdown>
    </span>
  );
};

export default Passthrough;
