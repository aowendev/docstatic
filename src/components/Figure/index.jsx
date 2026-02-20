/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from "react";

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
  };

  return (
    <>
      <div style={{ textAlign: getAlignment(), margin: "2rem 0" }}>
        <figure>
          <img
            src={img}
            alt={caption}
            style={{ cursor: "pointer", width: imageWidth, maxWidth: "100%", height: "auto" }}
            onClick={openLightbox}
          />
          {!hideCaption && <figcaption>{caption}</figcaption>}
        </figure>
      </div>

      {isLightboxOpen && (
        <div style={lightboxStyles.overlay} onClick={closeLightbox}>
          <div
            style={lightboxStyles.content}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={lightboxStyles.closeButton}
              onClick={closeLightbox}
            >
              ✕
            </button>
            <img src={img} alt={caption} style={lightboxStyles.image} />
            {caption && <div style={lightboxStyles.caption}>{caption}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default Figure;
