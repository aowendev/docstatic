/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The navigation guard wraps global History methods. Getting the
 * install/uninstall pairing wrong strands a wrapper on the page for good, so
 * the ref-counting is worth proving rather than eyeballing.
 */

import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

// Minimal browser surface: the module only touches history and window.confirm.
const nativePushState = function pushState() {
  globalThis.__calls.push("push");
};
const nativeReplaceState = function replaceState() {
  globalThis.__calls.push("replace");
};

let confirmAnswer = true;
globalThis.__calls = [];
globalThis.history = {
  pushState: nativePushState,
  replaceState: nativeReplaceState,
};
globalThis.window = {
  confirm: () => confirmAnswer,
};

const {
  installNavigationGuard,
  uninstallNavigationGuard,
  navigationGuardDepth,
} = await import("../src/components/HelpButton/navigationGuard.js");

beforeEach(() => {
  // unwind any depth left by a previous test
  while (navigationGuardDepth() > 0) uninstallNavigationGuard();
  globalThis.history.pushState = nativePushState;
  globalThis.history.replaceState = nativeReplaceState;
  globalThis.__calls = [];
  confirmAnswer = true;
});

test("installing wraps both History methods", () => {
  installNavigationGuard(() => false, "msg");

  assert.notEqual(history.pushState, nativePushState);
  assert.notEqual(history.replaceState, nativeReplaceState);
  assert.equal(navigationGuardDepth(), 1);
});

test("uninstalling restores the exact original functions", () => {
  installNavigationGuard(() => false, "msg");
  uninstallNavigationGuard();

  assert.equal(history.pushState, nativePushState);
  assert.equal(history.replaceState, nativeReplaceState);
  assert.equal(navigationGuardDepth(), 0);
});

test("a second install does not wrap the wrapper", () => {
  installNavigationGuard(() => false, "one");
  const afterFirst = history.pushState;

  installNavigationGuard(() => false, "two");

  assert.equal(
    history.pushState,
    afterFirst,
    "double-wrapping would compound the confirm prompt"
  );
  assert.equal(navigationGuardDepth(), 2);
});

test("originals are restored only after the last uninstall", () => {
  installNavigationGuard(() => false, "one");
  installNavigationGuard(() => false, "two");

  uninstallNavigationGuard();
  assert.notEqual(
    history.pushState,
    nativePushState,
    "still one consumer active, guard must stay installed"
  );

  uninstallNavigationGuard();
  assert.equal(history.pushState, nativePushState);
});

test("unbalanced uninstall does not clobber the History API", () => {
  uninstallNavigationGuard();
  uninstallNavigationGuard();

  assert.equal(history.pushState, nativePushState);
  assert.equal(navigationGuardDepth(), 0);
});

test("navigation proceeds when the predicate says there is nothing to lose", () => {
  installNavigationGuard(() => false, "msg");

  history.pushState({}, "", "/next");

  assert.deepEqual(globalThis.__calls, ["push"]);
});

test("navigation is blocked when the user declines the confirm", () => {
  installNavigationGuard(() => true, "msg");
  confirmAnswer = false;

  history.pushState({}, "", "/next");

  assert.deepEqual(globalThis.__calls, [], "the original must not be called");
});

test("navigation proceeds when the user accepts the confirm", () => {
  installNavigationGuard(() => true, "msg");
  confirmAnswer = true;

  history.replaceState({}, "", "/next");

  assert.deepEqual(globalThis.__calls, ["replace"]);
});

test("the most recent predicate wins after a remount", () => {
  installNavigationGuard(() => true, "stale");
  installNavigationGuard(() => false, "fresh");

  history.pushState({}, "", "/next");

  assert.deepEqual(
    globalThis.__calls,
    ["push"],
    "a stale closure must not keep blocking navigation"
  );
});
