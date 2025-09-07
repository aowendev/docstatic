import clsx from "clsx";
import React from "react";
import styles from "./styles.module.css";

const Feature = ({ image, title, description }) => {
  return (
    <div className={clsx("col col--4", styles.featureCard)}>
      {image && (
        <div className={styles.featureImageContainer}>
          <img className={styles.featureSvg} src={image} alt={description} />
          <div className={styles.featureOverlay} />
        </div>
      )}
      <div className={styles.featureContent}>
        {title && <h3 className={styles.featureTitle}>{title}</h3>}
        {description && (
          <p className={styles.featureDescription}>{description}</p>
        )}
        <div className={styles.featureArrow}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Features = ({ data, index }) => {
  return (
    <section key={index} className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>Built for Everyone</h2>
          <p className={styles.featuresSubtitle}>
            Whether you're a writer, developer or end user, docStatic has
            something for you.
          </p>
        </div>
        <div className="row">
          {data.items.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
};
