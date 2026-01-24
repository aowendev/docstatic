/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

export const HeroBlockTemplate = {
  name: "hero",
  label: "Hero",
  fields: [
    {
      name: "title",
      label: "Title",
      description: "By default this is the site title",
      type: "string",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      description: "By default this is the site tagline",
      type: "string",
    },
    {
      name: "description",
      label: "Description",
      description: "Additional text displayed below the subtitle",
      type: "string",
    },
    {
      label: "Document Link",
      name: "document",
      type: "reference",
      collections: ["doc"],
    },
    {
      name: "documentLabel",
      label: "Primary Button Text",
      type: "string",
    },
    {
      name: "secondaryButtonText",
      label: "Secondary Button Text",
      type: "string",
    },
    {
      name: "secondaryButtonLink",
      label: "Secondary Button Link",
      type: "string",
    },
    {
      name: "showHeroCard",
      label: "Show Hero Card",
      description: "Display the visual hero card with features",
      type: "boolean",
    },
    {
      name: "heroCardTitle",
      label: "Hero Card Title",
      type: "string",
    },
    {
      name: "heroCardFeatures",
      label: "Hero Card Features",
      type: "object",
      list: true,
      fields: [
        {
          name: "feature",
          label: "Feature",
          type: "string",
        },
      ],
    },
  ],
};
