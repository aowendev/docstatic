/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import React from "react";

/**
 * RelatedTopics component for Tina CMS
 * Displays a placeholder for related topics
 *
 * @param {Object} props - The component props
 * @param {number} [props.maxResults=5] - Maximum number of related topics to display
 * @returns {React.Component} - The RelatedTopics component
 */
const RelatedTopics = ({ maxResults = 5 }) => {
  // For the template, we'll show a placeholder since there's no metadata yet
  return (
    <>
      <h2>Related topics</h2>
      <p><em>Related topics will appear here once the site has content and metadata.</em></p>
    </>
  );
};

export default RelatedTopics;