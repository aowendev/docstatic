/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import OriginalMermaid from "@theme-original/Mermaid";
import React, { useEffect, useRef, useState } from "react";
import "./mermaid-zoom.css";

export default function Mermaid(props) {
  const containerRef = useRef(null);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !isZoomEnabled) return;

    const container = containerRef.current;
    const svg = container.querySelector("svg");

    if (!svg) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, scale * delta));

      // Calculate new translation to zoom towards mouse position
      const newTranslateX = mouseX - (mouseX - translateX) * (newScale / scale);
      const newTranslateY = mouseY - (mouseY - translateY) * (newScale / scale);

      setScale(newScale);
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        // Left mouse button
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setTranslateX(translateX + deltaX);
      setTranslateY(translateY + deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isZoomEnabled, scale, translateX, translateY, isDragging, lastMousePos]);

  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(5, prev * 1.2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.1, prev / 1.2));
  };

  return (
    <div className="mermaid-zoom-wrapper">
      <div className="mermaid-zoom-controls">
        <button
          className={`mermaid-zoom-toggle ${isZoomEnabled ? "active" : ""}`}
          onClick={() => setIsZoomEnabled(!isZoomEnabled)}
          title={isZoomEnabled ? "Disable zoom" : "Enable zoom"}
          type="button"
        >
          🔍
        </button>
        {isZoomEnabled && (
          <>
            <button
              className="mermaid-zoom-btn"
              onClick={zoomIn}
              title="Zoom in"
              type="button"
            >
              +
            </button>
            <button
              className="mermaid-zoom-btn"
              onClick={zoomOut}
              title="Zoom out"
              type="button"
            >
              −
            </button>
            <button
              className="mermaid-zoom-btn"
              onClick={resetZoom}
              title="Reset zoom"
              type="button"
            >
              ↻
            </button>
          </>
        )}
      </div>
      <div
        ref={containerRef}
        className={`mermaid-container ${isZoomEnabled ? "zoom-enabled" : ""} ${isDragging ? "dragging" : ""}`}
        style={{
          transform: isZoomEnabled
            ? `translate(${translateX}px, ${translateY}px) scale(${scale})`
            : "none",
        }}
      >
        <OriginalMermaid {...props} />
      </div>
    </div>
  );
}
