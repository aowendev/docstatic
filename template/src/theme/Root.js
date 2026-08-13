/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chatbotConfig from "@site/config/chatbot/index.json";
import React, { lazy, Suspense, useEffect, useState } from "react";

// Dynamic import so the Chatbot chunk (which pulls in @mlc-ai/web-llm) is
// only ever fetched by the browser when the site-owner switch is on — not
// merely tree-shaken, actually never requested when it's off.
const Chatbot = lazy(() => import("@site/src/components/Chatbot"));

export default function Root({ children }) {
  // Checking canUseDOM directly during render would make the client's first
  // hydration pass disagree with the server-rendered markup (the client's
  // very first render already has `window`, even before mount) — a real
  // hydration mismatch, not just a theoretical one. Deferring to state set
  // in an effect keeps the first client render identical to the server's.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {children}
      {mounted && chatbotConfig?.enabled && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
    </>
  );
}
