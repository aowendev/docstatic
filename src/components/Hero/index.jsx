/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
import React from "react";
import { getDocPath, titleFromSlug } from "../../../util";
import styles from "./index.module.css";

export const Hero = ({ data, index }) => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header
      key={index}
      className={clsx("hero hero--primary", styles.heroBanner)}
    >
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={clsx("hero__title", styles.heroTitle)}>
              {data.title ? data.title : siteConfig.title}
            </h1>
            <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
              {data.subtitle ? data.subtitle : siteConfig.tagline}
            </p>
            <div className={styles.heroDescription}>
              <p>
                {data.description ||
                  "Bridging the gap between writers and developers to help you create online documentation your users will love."}
              </p>
            </div>
            {data.document && (
              <div className={styles.buttons}>
                <Link
                  className={clsx(
                    "button button--primary button--lg",
                    styles.primaryButton
                  )}
                  to={getDocPath(data.document)}
                >
                  {data.documentLabel
                    ? data.documentLabel
                    : titleFromSlug(data.document)}
                </Link>
                {(data.secondaryButtonText && data.secondaryButtonLink) && (
                  <Link
                    className={clsx(
                      "button button--outline button--lg",
                      styles.secondaryButton
                    )}
                    to={data.secondaryButtonLink}
                  >
                    {data.secondaryButtonText}
                  </Link>
                )}
              </div>
            )}
          </div>
          {data.showHeroCard !== false && (
            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.cardTitle}>
                    {data.heroCardTitle || "docStatic"}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.codeBlock}>
                    <span className={styles.codeKeyword}># Features</span>
                    <br />
                    {data.heroCardFeatures && data.heroCardFeatures.length > 0 ? (
                      data.heroCardFeatures.map((item, index) => (
                        <React.Fragment key={index}>
                          <span className={styles.codeProperty}>
                            {" "}
                            - {item.feature}
                          </span>
                          <br />
                        </React.Fragment>
                      ))
                    ) : (
                      <>
                        <span className={styles.codeProperty}>
                          {" "}
                          - Content Reuse & Single Sourcing
                        </span>
                        <br />
                        <span className={styles.codeProperty}>
                          {" "}
                          - Simple Structured Authoring & Semantic Models
                        </span>
                        <br />
                        <span className={styles.codeProperty}>
                          {" "}
                          - Content Lifecycle & Workflow Management
                        </span>
                        <br />
                        <span className={styles.codeProperty}>
                          {" "}
                          - Translation & Localization Support
                        </span>
                        <br />
                        <span className={styles.codeProperty}>
                          {" "}
                          - Versioning & Variant Management
                        </span>
                        <br />
                        <span className={styles.codeProperty}>
                          {" "}
                          - Integrated GraphQL & OpenAPI Documentation
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.heroBackground}>
        <div className={styles.gridPattern} />
      </div>
    </header>
  );
};
