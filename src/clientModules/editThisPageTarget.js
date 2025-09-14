/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

if (ExecutionEnvironment.canUseDOM) {
  // Add a global event listener to catch all clicks
  function globalClickHandler(event) {
    // Check for any link with admin in the href (edit links)
    const target = event.target;
    if (
      target.tagName === "A" &&
      target.href &&
      target.href.includes("/admin")
    ) {
      // This is an edit link - prevent default and open in new window
      event.preventDefault();
      event.stopPropagation();
      window.open(target.href, "_blank", "noopener,noreferrer");
      return false;
    }
  }

  // Also try to set target="_blank" as a backup
  function processEditLinks() {
    // Try multiple ways to find edit links
    const possibleSelectors = [
      'a[href*="/admin"]',
      "a.theme-edit-this-page",
      'a[aria-label*="Edit"]',
      'a[title*="Edit"]',
    ];

    let linksFound = 0;
    for (const selector of possibleSelectors) {
      const links = document.querySelectorAll(selector);
      for (const link of links) {
        if (!link.hasAttribute("data-processed-edit")) {
          link.setAttribute("data-processed-edit", "true");
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
          linksFound++;
        }
      }
    }
    return linksFound;
  }

  // Initialize
  function initialize() {
    // Add global click listener
    document.addEventListener("click", globalClickHandler, true);

    // Process existing links
    processEditLinks();

    // Check for new links periodically
    setInterval(processEditLinks, 1000);
  }

  // Start when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
}
