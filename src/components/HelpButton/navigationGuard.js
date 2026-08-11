/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Intercepts SPA navigation so the CMS can warn about unsaved changes.
 * history.pushState / replaceState bypass the beforeunload event, so the only
 * way to catch TinaCMS's own left-nav links is to wrap them.
 *
 * Wrapping global functions is inherently fragile: if two callers each save
 * "the original" and restore in the wrong order, a wrapper is stranded on the
 * History API for the life of the page. This module owns the wrapping so that
 * cannot happen — the first install captures the originals, later installs are
 * no-ops, and only the last uninstall restores.
 */

let depth = 0;
let originals = null;
let shouldBlock = () => false;
let confirmMessage = "";

function wrap(original) {
  return function guardedHistoryMethod(...args) {
    if (shouldBlock() && !window.confirm(confirmMessage)) return undefined;
    return original.apply(history, args);
  };
}

/**
 * @param {() => boolean} predicate returns true when navigation should prompt
 * @param {string} message text shown in the confirm dialog
 */
export function installNavigationGuard(predicate, message) {
  // The most recent caller's predicate wins; the wrapper reads these at call
  // time so a remount does not leave a stale closure in charge.
  shouldBlock = predicate;
  confirmMessage = message;

  depth += 1;
  if (depth > 1) return;

  originals = {
    pushState: history.pushState,
    replaceState: history.replaceState,
  };
  history.pushState = wrap(originals.pushState);
  history.replaceState = wrap(originals.replaceState);
}

export function uninstallNavigationGuard() {
  if (depth === 0) return;

  depth -= 1;
  if (depth > 0) return;

  if (originals) {
    history.pushState = originals.pushState;
    history.replaceState = originals.replaceState;
    originals = null;
  }
  shouldBlock = () => false;
  confirmMessage = "";
}

/** Test seam: current install depth. */
export function navigationGuardDepth() {
  return depth;
}
