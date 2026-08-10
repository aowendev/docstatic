/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from "react";

// Depends on nothing, so it lives at module scope rather than being rebuilt on
// every render.
const lightboxStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    cursor: "pointer",
    border: "none",
    padding: 0,
  },
  content: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    position: "relative",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  closeButton: {
    position: "absolute",
    top: "-40px",
    right: "0",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "8px",
  },
  caption: {
    color: "white",
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
  },
  thumbnailButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline",
    font: "inherit",
    color: "inherit",
  },
};

const Figure = ({ img, caption, size, hideCaption = false, align }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  // Convert size to percentage width (e.g., 25 becomes "25%")
  const imageWidth = size ? `${size}%` : "100%";

  // Determine text alignment - only apply left/right if size < 100
  const getAlignment = () => {
    if (size && size < 100 && align) {
      return align;
    }
    return "center";
  };

  // Close on Escape and lock background scrolling while the lightbox is open.
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  // An image with no caption would otherwise render with no alt text at all.
  const altText = caption || "Figure";

  return (
    <>
      <div style={{ textAlign: getAlignment(), margin: "2rem 0" }}>
        <figure>
          <button
            type="button"
            onClick={openLightbox}
            aria-label={`Enlarge image: ${altText}`}
            style={{ ...lightboxStyles.thumbnailButton, width: imageWidth }}
          >
            <img
              src={img}
              alt={altText}
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </button>
          {!hideCaption && <figcaption>{caption}</figcaption>}
        </figure>
      </div>

      {isLightboxOpen && (
        // biome-ignore lint/a11y/noStaticElementInteractions: click-to-dismiss backdrop; Escape and the close button provide the keyboard path
        <div
          style={lightboxStyles.overlay}
          onClick={closeLightbox}
          role="presentation"
        >
          <div
            style={lightboxStyles.content}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={altText}
          >
            <button
              type="button"
              style={lightboxStyles.closeButton}
              onClick={closeLightbox}
              aria-label="Close image"
            >
              ✕
            </button>
            <img src={img} alt={altText} style={lightboxStyles.image} />
            {caption && <div style={lightboxStyles.caption}>{caption}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default Figure;
