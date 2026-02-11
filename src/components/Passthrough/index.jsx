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
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
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
      const isTaskList = className?.includes('contains-task-list');
      
      if (isTaskList) {
        return (
          <ul 
            className={className} 
            style={{
              marginLeft: '0', 
              paddingLeft: '0',
              listStyle: 'none'
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
      const isTaskListItem = className?.includes('task-list-item');
      
      return (
        <li 
          className={className}
          style={isTaskListItem ? { 
            listStyle: 'none',
          } : undefined}
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
    <Markdown
      remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children, ...props }) => {
          // Check if this paragraph contains a task list checkbox
          const hasCheckbox = React.Children.toArray(children).some(
            child => child?.type === 'input' && child?.props?.type === 'checkbox'
          );
          // If it contains a checkbox, render as span to avoid breaking task list structure
          return hasCheckbox ? <span {...props}>{children}</span> : <p {...props}>{children}</p>;
        },
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
  );
};

export default Passthrough;
