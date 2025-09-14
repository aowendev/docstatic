/**
 * Copyright (c) TinaCMS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { Features } from "../Features";
import { Hero } from "../Hero";
import { YouTubeEmbed } from "../YouTubeEmbed";

export const Blocks = ({ blocks }) => {
  return (
    <>
      {blocks
        ? blocks.map((block, i) => {
            switch (block._template) {
              case "hero":
                return (
                  <div data-tinafield={`blocks.${i}`} key={i + block._template}>
                    <Hero data={block} index={i} />
                  </div>
                );
              case "features":
                return (
                  <div data-tinafield={`blocks.${i}`} key={i + block._template}>
                    <Features data={block} index={i} />
                  </div>
                );
              case "youTubeEmbed":
                return (
                  <div data-tinafield={`blocks.${i}`} key={i + block._template}>
                    <YouTubeEmbed data={block} index={i} />
                  </div>
                );
              default:
                return null;
            }
          })
        : null}
    </>
  );
};
