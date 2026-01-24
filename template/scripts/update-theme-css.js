#!/usr/bin/env node

/**
 * Script to update theme CSS from theme configuration
 */

const { updateThemeCSS } = require("../src/utils/themeUtils.js");

try {
  updateThemeCSS();
  console.log("✅ Theme CSS updated successfully!");
} catch (error) {
  console.error("❌ Error updating theme CSS:", error);
  process.exit(1);
}