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
      if (document.querySelector("#tina-custom-styles")) {
        return;
      }

      const style = document.createElement("style");
      style.id = "tina-custom-styles";
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

    // Modify TinaCMS rich text editor strikethrough button to show "Highlight"
    const modifyStrikeThroughButton = () => {
      // Look for the specific strikethrough SVG element
      const strikeThroughSvgs = document.querySelectorAll(
        "svg.lucide-strikethrough"
      );

      for (const svg of strikeThroughSvgs) {
        const button = svg.closest("button");
        if (!button || button.dataset.highlightModified) continue; // Already modified

        // Replace the SVG with the Lucide highlighter icon
        svg.outerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-highlighter-icon lucide-highlighter"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
        `;

        // Update button title/tooltip
        button.title = "highlight text";
        button.setAttribute("aria-label", "highlight text");

        button.dataset.highlightModified = "true";
      }
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


    // Hide unwanted Tina menu items
    const hideUnwantedMenuItems = () => {
      // Hide by href
      const unwantedLinks = document.querySelectorAll('a[href="#/collections/generated/~"], a[href="#/collections/media/~"]');
      unwantedLinks.forEach(link => {
        const li = link.closest('li');
        if (li) {
          li.remove();
        } else {
          link.remove();
        }
      });
      // Hide by label text (if needed)
      document.querySelectorAll('nav a').forEach(link => {
        if (
          link.textContent.includes("API (generated)") ||
          link.textContent.includes("Media (generated)")
        ) {
          const li = link.closest('li');
          if (li) {
            li.remove();
          } else {
            link.remove();
          }
        }
      });
    };

    // Inject custom TinaCMS styles
    injectTinaStyles();

    // Modify strikethrough button to show "Highlight"
    modifyStrikeThroughButton();

    // Inject help button icon
    injectIcon();

    // Hide unwanted menu items
    hideUnwantedMenuItems();

    const timeout = setTimeout(() => {
      injectIcon();
      modifyStrikeThroughButton(); // Try again after delay in case UI loads late
      hideUnwantedMenuItems();     // Try again after delay
    }, 500);

    // Also try again after a longer delay for slower loading
    const longerTimeout = setTimeout(() => {
      modifyStrikeThroughButton();
      hideUnwantedMenuItems();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(longerTimeout);
    };
  }, []);

  return null;
}
