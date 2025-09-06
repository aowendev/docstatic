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
              <p>Build beautiful, maintainable documentation with the power of React, Markdown and TinaCMS.</p>
            </div>
            {data.document && (
              <div className={styles.buttons}>
                <Link
                  className={clsx("button button--primary button--lg", styles.primaryButton)}
                  to={getDocPath(data.document)}
                >
                  {data.documentLabel
                    ? data.documentLabel
                    : titleFromSlug(data.document)}
                </Link>
                <Link
                  className={clsx("button button--outline button--lg", styles.secondaryButton)}
                  to="/blog"
                >
                  View Blog
                </Link>
              </div>
            )}
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDots}>
                  <span />
                  <span />
                  <span />
                </div>
                <span className={styles.cardTitle}>docStatic</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.codeBlock}>
                  <span className={styles.codeComment}># Modern documentation platform</span>
                  <br />
                  <span className={styles.codeKeyword}>features:</span>
                  <br />
                  <span className={styles.codeProperty}>  - TinaCMS</span>
                  <br />
                  <span className={styles.codeProperty}>  - React Components</span>
                  <br />
                  <span className={styles.codeProperty}>  - OpenAPI Support</span>
                  <br />
                  <span className={styles.codeProperty}>  - Git-based</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroBackground}>
        <div className={styles.gridPattern} />
      </div>
    </header>
  );
};
