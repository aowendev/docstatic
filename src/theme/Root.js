import BrowserOnly from "@docusaurus/BrowserOnly";
import React from "react";

export default function Root({ children }) {
  return (
    <>
      {children}
      <BrowserOnly>
        {() => {
          const FloatingChatBot =
            require("../components/FloatingChatBot").default;
          return <FloatingChatBot />;
        }}
      </BrowserOnly>
    </>
  );
}
