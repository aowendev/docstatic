/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createStorageSlot } from "@docusaurus/theme-common";
import { useCallback, useState } from "react";

const STORAGE_KEY = "docstatic-chatbot-optin";

// This component only ever renders client-side (see src/theme/Root.js), but
// guard the same way src/utils/colorUtils.js does in case that changes.
function getStorage() {
  if (typeof window === "undefined") {
    return { get: () => null, set: () => {} };
  }
  return createStorageSlot(STORAGE_KEY, { persistence: "localStorage" });
}

/**
 * Tracks the visitor's persisted opt-in to loading the chatbot engine.
 * Level 1 (site-owner enabled) is checked separately in Root.js — this is
 * only ever consulted once that's already true.
 */
export function useOptIn() {
  const [optedIn, setOptedIn] = useState(() => getStorage().get() === "true");

  const optIn = useCallback(() => {
    getStorage().set("true");
    setOptedIn(true);
  }, []);

  return { optedIn, optIn };
}
