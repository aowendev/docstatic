/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import styles from "./index.module.css";

export const YouTubeEmbed = ({ data, index }) => {
  const regex =
    /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
  const videoId = regex.exec(data.url)[3];
  return (
    <section key={index} className={styles.videoSection}>
      <div className="container">
        <div className={styles.videoContainer}>
          <div className={styles.videoHeader}>
            <h2 className={styles.videoTitle}>{data.title}</h2>
            <p className={styles.videoSubtitle}>
              See docStatic in action and learn how it can transform your
              documentation workflow.
            </p>
          </div>
          <div className={styles.videoWrapper}>
            <div className={styles.videoFrame}>
              <iframe
                width="853"
                height="480"
                src={`https://www.youtube.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
                className={styles.iframe}
              />
            </div>
            <div className={styles.videoDecorations}>
              <div className={styles.decoration1} />
              <div className={styles.decoration2} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
