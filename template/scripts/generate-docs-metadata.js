/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

function generateDocsMetadata() {
  const docs = [];
  const docsDir = path.join(__dirname, "../docs");

  function walkDir(dir, relativePath = "") {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and API directory
        if (entry.name.startsWith(".") || entry.name === "api") continue;

        const fullPath = path.join(dir, entry.name);
        const relativeFilePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          walkDir(fullPath, relativeFilePath);
        } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
          try {
            const fileContent = fs.readFileSync(fullPath, "utf-8");
            const { data: frontmatter } = matter(fileContent);

            // Only include published documents with tags
            if (frontmatter.published !== false && frontmatter.tags && Array.isArray(frontmatter.tags)) {
              // Generate the URL path for Docusaurus
              let urlPath = relativeFilePath
                .replace(/\.(mdx?|md)$/, "")
                .replace(/\/index$/, "")
                .replace(/\s+/g, "-")
                .toLowerCase();

              // Handle root level files
              if (!urlPath.includes("/")) {
                urlPath = `/${urlPath}`;
              } else {
                urlPath = `/${urlPath}`;
              }

              docs.push({
                title: frontmatter.title || path.basename(entry.name, path.extname(entry.name)),
                description: frontmatter.description || "",
                tags: frontmatter.tags || [],
                path: urlPath,
                filePath: relativeFilePath,
                lastmod: frontmatter.lastmod || null,
              });
            }
          } catch (error) {
            console.warn(`Warning: Could not process ${fullPath}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
  }

  if (fs.existsSync(docsDir)) {
    walkDir(docsDir);
  }

  // Sort by title alphabetically
  docs.sort((a, b) => a.title.localeCompare(b.title));

  // Ensure output directory exists
  const outputDir = path.join(__dirname, "../src/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the metadata file
  const outputPath = path.join(outputDir, "docs-metadata.json");
  fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2));

  console.log(`Generated docs metadata for ${docs.length} documents`);
}

// Run if called directly
if (require.main === module) {
  generateDocsMetadata();
}

module.exports = generateDocsMetadata;