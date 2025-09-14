/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require("node:fs");
const path = require("node:path");

function generateFileList() {
  const codeDir = path.join(__dirname, "../reuse/code");
  const files = [];

  function walkDir(dir, relativePath = "") {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and directories
        if (entry.name.startsWith(".")) continue;

        const fullPath = path.join(dir, entry.name);
        const relativeFilePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          walkDir(fullPath, relativeFilePath);
        } else {
          files.push(relativeFilePath);
        }
      }
    } catch (error) {}
  }

  if (!fs.existsSync(codeDir)) {
    files.push("example.a", "example.b"); // fallback files
  } else {
    walkDir(codeDir);
  }

  // Sort files alphabetically
  files.sort();

  // Ensure public directory exists
  const publicDir = path.join(__dirname, "../reuse");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write to public directory
  const outputPath = path.join(publicDir, "code-files.json");
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
}

// Run the function
generateFileList();
