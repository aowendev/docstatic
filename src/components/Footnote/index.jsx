/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useContext, useEffect, useState } from "react";
import { FootnotesContext } from "./FootnotesProvider";

const Footnote = ({ children }) => {
  const context = useContext(FootnotesContext);
  const [footnoteNumber, setFootnoteNumber] = useState(null);

  // FootnotesContext is created with a default value that already provides
  // addFootnote, so this is always defined — the previous window.globalFootnotes
  // fallback below it was unreachable and has been removed.
  useEffect(() => {
    setFootnoteNumber(context.addFootnote(children));
  }, [children, context.addFootnote]);

  const handleClick = (e) => {
    e.preventDefault();
    const footnoteElement = document.getElementById(
      `footnote-${footnoteNumber}`
    );
    if (footnoteElement) {
      footnoteElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (footnoteNumber === null) {
    return (
      <sup>
        <span style={{ color: "#1976d2", fontSize: "0.8em" }}>[...]</span>
      </sup>
    );
  }
  return (
    <sup>
      <a
        href={`#footnote-${footnoteNumber}`}
        id={`footnote-ref-${footnoteNumber}`}
        onClick={handleClick}
        style={{
          color: "#1976d2",
          textDecoration: "none",
          fontSize: "0.8em",
        }}
      >
        [{footnoteNumber}]
      </a>
    </sup>
  );
};

export default Footnote;
