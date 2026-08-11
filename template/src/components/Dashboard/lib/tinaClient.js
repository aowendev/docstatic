/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Single place the generated Tina client is loaded from.
 *
 * Eight dashboard components each did their own
 * `await import("../../../tina/__generated__/client")` — eighteen call sites in
 * total, several of them inside per-item loops. The import is memoised here so
 * the module is resolved once per page and the path exists in one place.
 */

let clientPromise = null;

export function getTinaClient() {
  if (!clientPromise) {
    clientPromise = import("../../../../tina/__generated__/client").then(
      (mod) => mod.client
    );
    // Don't cache a rejection: a failed load (offline, dev server not up yet)
    // should be retried on the next call rather than poisoning the page.
    clientPromise.catch(() => {
      clientPromise = null;
    });
  }
  return clientPromise;
}

/** Test seam. */
export function resetTinaClientCache() {
  clientPromise = null;
}
