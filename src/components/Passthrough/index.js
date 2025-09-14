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
 * @param {string} string - The content to render (supports JSX, HTML, markdown, or plain text)
 */
const Passthrough = ({ summary, string }) => {
  // Ensure string is valid
  if (!string) {
    return null;
  }

  // Process the string to handle line breaks properly
  const processedString = string.replace(/\\n/g, '\n');

  // Check if the content is a React component reference (like "<ColorGenerator />")
  const isReactComponent = /^[\s]*<[A-Z][a-zA-Z0-9]*[^>]*\/?>[\s]*$/.test(processedString.trim());
  
  // Check if it's an HTML element (like "<h2>Hello</h2>" or "<div>content</div>")
  const isHTML = /^[\s]*<[a-z][a-zA-Z0-9]*[^>]*>.*<\/[a-z][a-zA-Z0-9]*>[\s]*$/.test(processedString.trim()) ||
                 /^[\s]*<[a-z][a-zA-Z0-9]*[^>]*\/>[\s]*$/.test(processedString.trim());
  
  // Check if it's an import statement
  const isImportStatement = processedString.includes('import ') && processedString.includes('from ');

  // Handle React component rendering
  if (isReactComponent) {
    const componentName = processedString.trim().match(/<([A-Z][a-zA-Z0-9]*)/)?.[1];
    
    // Map component names to actual components
    const componentMap = {
      ColorGenerator: ColorGenerator,
    };

    const Component = componentMap[componentName];
    
    if (Component) {
      return (
        <div title={summary} className="passthrough-content passthrough-jsx">
          <Component />
        </div>
      );
    }
  }

  // Handle HTML content - render using react-markdown with HTML support
  if (isHTML) {
    return (
      <div title={summary} className="passthrough-content passthrough-html">
        <Markdown 
          remarkPlugins={[remarkMath, remarkBreaks]} 
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            // Allow HTML elements to pass through
            p: ({ children, ...props }) => <span {...props}>{children}</span>,
          }}
        >
          {processedString}
        </Markdown>
      </div>
    );
  }

  // Handle import statements - don't render them visually, just return null
  if (isImportStatement) {
    return null;
  }

  // Handle other code statements - display as code
  if (processedString.includes('export ') ||
      /^\s*const\s+\w+\s*=/.test(processedString) ||
      /^\s*function\s+\w+/.test(processedString)) {
    return (
      <div title={summary} className="passthrough-content passthrough-code">
        <code className="passthrough-jsx">{processedString}</code>
      </div>
    );
  }

  // Otherwise, render as markdown
  return (
    <div title={summary} className="passthrough-content">
      <Markdown 
        remarkPlugins={[remarkMath, remarkBreaks]} 
        rehypePlugins={[rehypeKatex]}
        components={{
          // Ensure paragraphs render properly in inline context
          p: ({ children, ...props }) => <span {...props}>{children}</span>,
          // Handle line breaks explicitly
          br: () => <br />,
          // Preserve other markdown elements
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
    </div>
  );
};

export default Passthrough;
