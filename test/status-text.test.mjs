/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status bar builds itself with innerHTML, and one of its readings is now
 * a GraphQL error message straight off the wire. That makes escaping a
 * correctness property rather than a nicety: an error quoting part of a query
 * would otherwise put live markup into the admin chrome.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  escapeHtml,
  firstLine,
} from "../src/components/Dashboard/lib/statusText.js";

test("markup in an error message is neutralised", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
  );
  assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
});

test("ampersands are escaped first, so entities are not double-built", () => {
  assert.equal(escapeHtml("&lt;"), "&amp;lt;");
});

test("ordinary text is left readable", () => {
  assert.equal(
    escapeHtml("Local files (localhost:4001)"),
    "Local files (localhost:4001)"
  );
});

test("non-strings do not throw", () => {
  assert.equal(escapeHtml(undefined), "undefined");
  assert.equal(escapeHtml(42), "42");
});

test("firstLine takes the first line only", () => {
  assert.equal(
    firstLine("Query failed\n  at doThing\n  at other"),
    "Query failed"
  );
});

test("firstLine caps a long line and marks the cut", () => {
  const result = firstLine("x".repeat(200));
  assert.equal(result.length, 70);
  assert.ok(result.endsWith("…"));
});

test("firstLine leaves a short line whole", () => {
  assert.equal(firstLine("  Unauthorized  "), "Unauthorized");
});
