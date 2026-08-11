/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * generateThemeCSS is pure — config in, CSS out — and its output is committed
 * as src/css/theme-variables.css, so a change here changes the built site.
 */

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { generateThemeCSS } = require("../src/utils/themeUtils.js");

test("returns an empty string for no config", () => {
  assert.equal(generateThemeCSS(null), "");
  assert.equal(generateThemeCSS(undefined), "");
});

test("maps colours onto Infima custom properties", () => {
  const css = generateThemeCSS({
    colors: { primary: "#123456", primaryDark: "#0f2a44" },
  });

  assert.match(css, /:root \{/);
  assert.match(css, /--ifm-color-primary: #123456;/);
  assert.match(css, /--ifm-color-primary-dark: #0f2a44;/);
});

test("omits properties that are not configured", () => {
  const css = generateThemeCSS({ colors: { primary: "#123456" } });

  assert.ok(!css.includes("--ifm-color-primary-dark"));
  assert.ok(!css.includes("--ifm-font-family-base"));
});

test("emits a dark-mode block only when darkColors is given", () => {
  const light = generateThemeCSS({ colors: { primary: "#fff" } });
  assert.ok(!light.includes("[data-theme='dark']"));

  const dark = generateThemeCSS({
    colors: { primary: "#fff" },
    darkColors: { primary: "#000" },
  });
  assert.match(dark, /\[data-theme='dark'\] \{/);
  assert.match(dark, /--ifm-color-primary: #000;/);
});

test("adds px units to the radius values that need them", () => {
  const css = generateThemeCSS({
    layout: { globalRadius: 8, buttonRadius: 4, navbarHeight: "60px" },
  });

  assert.match(css, /--ifm-global-radius: 8px;/);
  assert.match(css, /--ifm-button-border-radius: 4px;/);
  // navbarHeight already carries its unit and must not be doubled
  assert.match(css, /--ifm-navbar-height: 60px;/);
  assert.ok(!css.includes("60pxpx"));
});

test("places custom CSS before the :root block so @import stays valid", () => {
  const css = generateThemeCSS({
    customCSS: '@import "x.css";',
    colors: { primary: "#fff" },
  });

  assert.ok(
    css.indexOf('@import "x.css";') < css.indexOf(":root {"),
    "@import must precede any rule or browsers ignore it"
  );
});
