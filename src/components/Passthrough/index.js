/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

// Import available components that can be used in JSX
import ColorGenerator from "@site/src/components/ColorGenerator";

/**
 * Passthrough component that renders content as JSX, HTML, markdown, or plain text
 * @param {string} summary - A summary description (for documentation purposes)
 * @param {string} string - The content to render
 * @param {string} type - The content type: 'jsx', 'html', 'markdown', 'code', or 'auto' (default)
 */
const Passthrough = ({ summary, string, type }) => {
  if (!string) return null;
  const processedString = string.replace(/\\n/g, '\n');

  if (type === 'html') {
    return (
        <Markdown 
          remarkPlugins={[remarkMath, remarkBreaks]} 
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            p: ({ children, ...props }) => <span {...props}>{children}</span>,
          }}
        >
          {processedString}
        </Markdown>
    );
  }

  if (type === 'jsx') {
    const componentName = processedString.trim().match(/<([A-Z][a-zA-Z0-9]*)/)?.[1];
    const componentMap = {
      ColorGenerator: ColorGenerator,
    };
    const Component = componentMap[componentName];
    if (Component) {
      return (
          <Component />
      );
    }
    return null;
  }

  // Default to markdown
  return (
      <Markdown 
        remarkPlugins={[remarkMath, remarkBreaks]} 
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children, ...props }) => <span {...props}>{children}</span>,
          br: () => <br />,
          strong: ({ children, ...props }) => <strong {...props}>{children}</strong>,
          em: ({ children, ...props }) => <em {...props}>{children}</em>,
          code: ({ children, ...props }) => <code {...props}>{children}</code>,
          a: ({ children, ...props }) => <a {...props}>{children}</a>,
          ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
          ol: ({ children, ...props }) => <ol {...props}>{children}</ol>,
          li: ({ children, ...props }) => <li {...props}>{children}</li>,
          h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
          h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
          h5: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
          h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
        }}
      >
        {processedString}
      </Markdown>
  );
};

export default Passthrough;
