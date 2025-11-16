/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createStorageSlot } from "@docusaurus/theme-common";
import Color from "color";
export const COLOR_SHADES = {
  "--ifm-color-primary": {
    adjustment: 0,
    adjustmentInput: "0",
    displayOrder: 3,
    codeOrder: 0,
  },
  "--ifm-color-primary-dark": {
    adjustment: 0.1,
    adjustmentInput: "10",
    displayOrder: 4,
    codeOrder: 1,
  },
  "--ifm-color-primary-darker": {
    adjustment: 0.15,
    adjustmentInput: "15",
    displayOrder: 5,
    codeOrder: 2,
  },
  "--ifm-color-primary-darkest": {
    adjustment: 0.3,
    adjustmentInput: "30",
    displayOrder: 6,
    codeOrder: 3,
  },
  "--ifm-color-primary-light": {
    adjustment: -0.1,
    adjustmentInput: "-10",
    displayOrder: 2,
    codeOrder: 4,
  },
  "--ifm-color-primary-lighter": {
    adjustment: -0.15,
    adjustmentInput: "-15",
    displayOrder: 1,
    codeOrder: 5,
  },
  "--ifm-color-primary-lightest": {
    adjustment: -0.3,
    adjustmentInput: "-30",
    displayOrder: 0,
    codeOrder: 6,
  },
};
export const LIGHT_PRIMARY_COLOR = "#005eb8";
export const DARK_PRIMARY_COLOR = "#0055a6";
export const LIGHT_BACKGROUND_COLOR = "#ffffff";
export const DARK_BACKGROUND_COLOR = "#181920";

// Create storage slots only on client side to prevent SSR SecurityErrors
// During SSR (Server-Side Rendering), localStorage is not available and causes:
// "SecurityError: Cannot initialize local storage without a `--localstorage-file` path"
const createStorage = () => {
  if (typeof window === 'undefined') {
    // Server-side fallback with dummy storage
    return {
      get: () => null,
      set: () => {},
      del: () => {}
    };
  }
  return createStorageSlot("ifm-theme-colors-light", {
    persistence: "sessionStorage",
  });
};

const createDarkStorage = () => {
  if (typeof window === 'undefined') {
    // Server-side fallback with dummy storage
    return {
      get: () => null,
      set: () => {},
      del: () => {}
    };
  }
  return createStorageSlot("ifm-theme-colors-dark", {
    persistence: "sessionStorage",
  });
};

export const lightStorage = createStorage();
export const darkStorage = createDarkStorage();
export function getAdjustedColors(shades, baseColor) {
  return Object.keys(shades).map((shade) => {
    const shadeValue = shades[shade];
    if (!shadeValue) throw new Error(`Shade value for ${shade} is undefined`);
    return {
      ...shadeValue,
      variableName: shade,
      hex: Color(baseColor).darken(shadeValue.adjustment).hex(),
    };
  });
}
export function updateDOMColors(
  { shades, baseColor, background },
  isDarkTheme
) {
  const styleSheet = Array.from(document.styleSheets).find((item) =>
    item.href?.match(/styles(?:\.[\da-f]+)?\.css/)
  );
  if (!styleSheet) return;
  const rules = Array.from(styleSheet.cssRules);
  const ruleToDelete = rules.findIndex(
    (rule) =>
      rule.selectorText ===
        (isDarkTheme ? '[data-theme="dark"]' : '[data-theme="light"]') &&
      Array.from(rule.style).includes("--ifm-color-primary") &&
      rule.style.length < 10
  );
  if (ruleToDelete >= 0) styleSheet.deleteRule(ruleToDelete);
  // Always set the correct footer background color for the theme
  const footerBg = isDarkTheme ? "#0d0d0d" : "#f2f2f2";
  const overrideStyle = `${isDarkTheme ? '[data-theme="dark"]' : '[data-theme="light"]'} {
${getAdjustedColors(shades, baseColor)
  .map((value) => `  ${value.variableName}: ${value.hex};`)
  .join("\n")}
  --ifm-background-color: ${background};
  --ifm-footer-background-color: ${footerBg};
}`;
  styleSheet.insertRule(overrideStyle, styleSheet.cssRules.length - 1);
}
