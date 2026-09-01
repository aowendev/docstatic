/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status bar's Data source row exists to answer a question its Environment
 * row cannot: a client built for production points at TinaCloud even while the
 * dev server is running, so the two can disagree and the content on screen is
 * not the local content. That answer is only trustworthy if it comes from the
 * client's own configured URL, so the classification is tested directly.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { describeDataSource } from "../src/components/Dashboard/lib/dataSource.js";

test("a localhost client is reporting local files", () => {
  const result = describeDataSource("http://localhost:4001/graphql");
  assert.equal(result.type, "localhost");
  assert.match(result.message, /Local files \(localhost:4001\)/);
});

test("127.0.0.1 is local too", () => {
  assert.equal(
    describeDataSource("http://127.0.0.1:4001/graphql").type,
    "localhost"
  );
});

test("a TinaCloud client names the host it will query", () => {
  const result = describeDataSource(
    "https://content.tinajs.io/2.4/content/abc123/github/main"
  );
  assert.equal(result.type, "tinacloud");
  assert.match(result.message, /TinaCloud \(content\.tinajs\.io\)/);
});

test("a host that merely contains 'localhost' is not local", () => {
  // localhost.example.com is somebody else's server.
  assert.equal(
    describeDataSource("https://localhost.example.com/graphql").type,
    "tinacloud"
  );
});

test("no URL and an unparseable URL are reported, not guessed at", () => {
  assert.equal(describeDataSource(undefined).type, "error");
  assert.equal(describeDataSource("").type, "error");
  assert.equal(describeDataSource("not a url").type, "error");
});
