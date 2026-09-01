/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Where the content on screen actually comes from.
 *
 * Read off the generated Tina client's own `apiUrl` rather than inferred from
 * the browser's location, because those two can disagree and the disagreement
 * is the whole point: a client built for production still points at TinaCloud
 * while you are editing on localhost, so the dev server is running and the
 * content on screen is not local. The status bar's Environment row answers
 * "which API answered a ping"; this answers "which one will my queries
 * actually go to", and the two rows differing is itself the diagnosis.
 *
 * Deliberately framework-free so it can be tested directly. The status bar is
 * the only caller today; StatusBar.jsx renders what this returns.
 */
export function describeDataSource(apiUrl) {
  if (!apiUrl) return { type: "error", message: "Unknown" };

  let host;
  try {
    host = new URL(apiUrl).host;
  } catch {
    return { type: "error", message: "Unrecognised API URL" };
  }

  // The host, not the hostname: a local server is identified as much by its
  // port as its name, and "localhost:4001" is what a reader recognises.
  const local =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:");

  return local
    ? { type: "localhost", message: `Local files (${host})` }
    : { type: "tinacloud", message: `TinaCloud (${host})` };
}
