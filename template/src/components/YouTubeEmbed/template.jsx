/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const YouTubeEmbedBlockTemplate = {
  name: "youTubeEmbed",
  label: "YouTube Embed",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
    {
      name: "url",
      label: "YouTube URL",
      type: "string",
    },
    {
      name: "caption",
      label: "Caption",
      type: "string",
    },
  ],
};
