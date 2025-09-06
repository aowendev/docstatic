import React, { useState } from "react";

const Figure = ({ img, caption, size }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  const lightboxStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      cursor: 'pointer'
    },
    content: {
      maxWidth: '90vw',
      maxHeight: '90vh',
      position: 'relative'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    },
    closeButton: {
      position: 'absolute',
      top: '-40px',
      right: '0',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: '8px'
    },
    caption: {
      color: 'white',
      textAlign: 'center',
      marginTop: '10px',
      fontSize: '14px'
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <figure>
          <img
            src={img}
            alt={caption}
            style={{ cursor: "pointer", maxWidth: size, height: "auto" }}
            onClick={openLightbox}
          />
          <figcaption>{caption}</figcaption>
        </figure>
      </div>

      {isLightboxOpen && (
        <div style={lightboxStyles.overlay} onClick={closeLightbox}>
          <div style={lightboxStyles.content} onClick={(e) => e.stopPropagation()}>
            <button style={lightboxStyles.closeButton} onClick={closeLightbox}>
              ✕
            </button>
            <img
              src={img}
              alt={caption}
              style={lightboxStyles.image}
            />
            {caption && (
              <div style={lightboxStyles.caption}>{caption}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Figure;
