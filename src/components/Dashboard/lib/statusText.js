/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Text helpers for the status bar, which writes itself with innerHTML.
 *
 * The bar is injected into an element TinaCMS owns rather than rendered by
 * React (see StatusBar.jsx), so it builds an HTML string by hand - and one of
 * the things it now puts in that string is a GraphQL error message straight
 * off the wire. Escaping is therefore not decoration: an error quoting a bit
 * of a query would otherwise put live markup into the admin chrome.
 *
 * Framework-free so both can be tested directly.
 */

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Neutralises text that is about to be interpolated into innerHTML. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * The bar is one line; a GraphQL error is not. Takes the first line and caps
 * it, because the useful part of these messages is at the front and the rest
 * would push the other three readings off the end of the bar.
 */
export function firstLine(message, limit = 70) {
  const line = String(message).split("\n")[0].trim();
  return line.length > limit ? `${line.slice(0, limit - 1)}…` : line;
}
