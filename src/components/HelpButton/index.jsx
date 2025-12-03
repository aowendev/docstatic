/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from "react";

export default function HelpButton({ url }) {
  useEffect(() => {
    // Inject custom TinaCMS styles for strikethrough highlighting
    const injectTinaStyles = () => {
      // Check if styles are already injected
      if (document.querySelector('#tina-custom-styles')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'tina-custom-styles';
      style.textContent = `
        /* Custom strikethrough styling for TinaCMS rich text editor */
        .slate-strikethrough,
        s.slate-strikethrough,
        del.slate-strikethrough,
        .slate-editor s,
        .slate-editor del {
          text-decoration: none !important;
          background-color: #ffff99 !important;
          color: #000 !important;
          padding: 1px 3px !important;
          border-radius: 3px !important;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
    };

    const injectIcon = () => {
      // Find all <nav> elements
      const elements = Array.from(document.querySelectorAll("nav"));
      // Pick the one nearest the top of the page
      let target = null;
      let minTop = Infinity;
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top < minTop) {
          minTop = top;
          target = el;
        }
      }
      if (target && !target.querySelector(".help-button-injected")) {
        // Inject icon as absolutely positioned floating element
        target.style.position = "relative";
        const button = document.createElement("span");
        button.className =
          "icon-parent help-button-injected items-center border border-blue-500 text-sm font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out rounded-full shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 h-7 w-7";
        button.style.position = "absolute";
        button.style.top = "-4px";
        button.style.right = "-8px";
        button.style.zIndex = "1000";
        button.innerHTML = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5/6 h-auto"><rect x="0" y="0" width="32" height="32" rx="16" fill="#3b82f6"/><text x="16" y="17" text-anchor="middle" font-size="28" font-weight="bold" fill="white" font-family="Arial, sans-serif" dominant-baseline="central">?</text></svg>`;
        button.style.cursor = "pointer";
        button.title = "Learn more";
        button.addEventListener("click", () => {
          window.open(url, "_blank", "noopener");
        });
        target.appendChild(button);
      }
    };
    
    // Inject custom TinaCMS styles
    injectTinaStyles();
    
    // Inject help button icon
    injectIcon();
    const timeout = setTimeout(injectIcon, 500);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
