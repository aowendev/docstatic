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
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

// Import available components that can be used in JSX
import ColorGenerator from "@site/src/components/ColorGenerator";

/**
 * Passthrough renders authored content as JSX, HTML, markdown or plain text.
 *
 * It exists so a custom React page can still be opened and edited in the CMS:
 * the markup lives in a content field rather than in a source file, so authors
 * keep the visual editor. It doubles as the renderer for markdown task lists,
 * which is why the custom input/ul/li renderers below exist.
 *
 * TRUST BOUNDARY
 * --------------
 * rehypeRaw is enabled, so raw HTML in the content string is parsed and
 * rendered rather than escaped. That is the feature — passing markup through
 * intact is the whole point — but it means the content field is executable:
 * a <script> tag or an onerror attribute authored here runs for every visitor.
 *
 * The practical consequence is that CMS write access to any document using
 * this component is equivalent to script execution on the published site.
 * That is acceptable while authors are trusted, which is the normal docStatic
 * setup. If editing is ever opened to a wider or less trusted group, this
 * component is the thing to revisit — either drop rehypeRaw (which breaks the
 * custom-page use case) or sanitise with rehype-sanitize on an allowlist.
 *
 * @param {string} summary - A summary description (for documentation purposes)
 * @param {string} string - The content to render
 * @param {string} type - The content type: 'jsx', 'html', 'markdown', 'code', or 'auto' (default)
 */
const Passthrough = ({ string, type }) => {
  // Custom input renderer to make task list checkboxes interactive
  const CustomInput = ({ disabled, style, ...props }) => {
    // Remove disabled attribute from task list checkboxes and add readOnly
    if (props.type === "checkbox") {
      return <input {...props} readOnly />;
    }
    return <input disabled={disabled} {...props} />;
  };

  // Custom ul renderer with static CSS-only indentation
  const CustomUl = ({ className, children, ...props }) => {
    const isTaskList = className?.includes("contains-task-list");

    if (isTaskList) {
      return (
        <ul
          className={className}
          style={{
            marginLeft: "0",
            paddingLeft: "0",
            listStyle: "none",
          }}
          {...props}
        >
          {children}
        </ul>
      );
    }

    return (
      <ul className={className} {...props}>
        {children}
      </ul>
    );
  };

  // Custom li renderer with proper task list styling
  const CustomLi = ({ className, children, ...props }) => {
    const isTaskListItem = className?.includes("task-list-item");

    return (
      <li
        className={className}
        style={
          isTaskListItem
            ? {
                listStyle: "none",
              }
            : undefined
        }
        {...props}
      >
        {children}
      </li>
    );
  };

  if (!string) return null;

  // Process ^ symbols for indentation (each ^ = 2 spaces)
  const processedString = string.replace(/\^/g, "  ");

  if (type === "html") {
    return (
      <Markdown
        remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          p: ({ children, ...props }) => <span {...props}>{children}</span>,
          input: CustomInput,
        }}
      >
        {processedString}
      </Markdown>
    );
  }

  if (type === "jsx") {
    const componentName = processedString
      .trim()
      .match(/<([A-Z][a-zA-Z0-9]*)/)?.[1];
    const componentMap = {
      ColorGenerator: ColorGenerator,
    };
    const Component = componentMap[componentName];
    if (Component) {
      return <Component />;
    }
    return null;
  }

  // Default to markdown
  return (
    <div className="passthrough-content">
      <Markdown
        remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          ul: CustomUl,
          li: CustomLi,
          br: () => <br />,
          strong: ({ children, ...props }) => (
            <strong {...props}>{children}</strong>
          ),
          em: ({ children, ...props }) => <em {...props}>{children}</em>,
          code: ({ children, ...props }) => <code {...props}>{children}</code>,
          a: ({ children, ...props }) => <a {...props}>{children}</a>,
          input: CustomInput,
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
