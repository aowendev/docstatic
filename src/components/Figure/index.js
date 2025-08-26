import React from "react";

const Figure = ({ img, caption, size }) => {
  return (
    <div style={{ textAlign: "center", margin: "2rem 0" }}>
      <figure>
        <img
          src={img}
          alt={caption}
          style={{ cursor: "pointer", maxWidth: size, height: "auto" }}
          onClick={() => window.open(img, "_blank")}
        />
        <figcaption>{caption}</figcaption>
      </figure>
    </div>
  );
};

export default Figure;
