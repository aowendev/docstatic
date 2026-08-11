/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

/** Collapse duplicate and trailing slashes, keeping a single leading one. */
function normalizeUrlPath(urlPath) {
  const collapsed = `/${urlPath.split("/").filter(Boolean).join("/")}`;
  return collapsed;
}

/**
 * Work out the URL a document is served at, relative to the docs root.
 *
 * RelatedTopics renders `/docs${path}` from this value, so anything that does
 * not match the route Docusaurus actually creates becomes a dead link on every
 * page that lists the document. Three rules were previously missing and each
 * produced real 404s:
 *
 *   - `slug` front matter overrides the file path entirely. A slug starting
 *     with "/" is relative to the docs root, otherwise to the file's own
 *     directory. `guides/markdown-features/context-help.mdx` sets
 *     `slug: "/context-help"` and is served at /docs/context-help.
 *   - `index` AND `readme` both name their parent directory. Only `index` was
 *     handled, so `wiki/readme.mdx` was recorded as /wiki/readme when it is
 *     served at /wiki.
 *   - Docusaurus preserves case in routes, so lowercasing the path invents a
 *     URL that does not exist for any file with a capital in its name.
 */
function docUrlPath(relativeFilePath, slug) {
  const withoutExtension = relativeFilePath.replace(/\.mdx?$/i, "");
  const lastSlash = withoutExtension.lastIndexOf("/");
  const directory =
    lastSlash === -1 ? "" : withoutExtension.slice(0, lastSlash);

  if (typeof slug === "string" && slug.trim()) {
    const trimmed = slug.trim();
    return normalizeUrlPath(
      trimmed.startsWith("/") ? trimmed : `${directory}/${trimmed}`
    );
  }

  return normalizeUrlPath(
    withoutExtension.replace(/(^|\/)(index|readme)$/i, "")
  );
}

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
            if (
              frontmatter.published !== false &&
              frontmatter.tags &&
              Array.isArray(frontmatter.tags)
            ) {
              const urlPath = docUrlPath(relativeFilePath, frontmatter.slug);

              docs.push({
                title:
                  frontmatter.title ||
                  path.basename(entry.name, path.extname(entry.name)),
                description: frontmatter.description || "",
                tags: frontmatter.tags || [],
                path: urlPath,
                filePath: relativeFilePath,
                lastmod: frontmatter.lastmod || null,
              });
            }
          } catch (error) {
            console.warn(
              `Warning: Could not process ${fullPath}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read directory ${dir}: ${error.message}`
      );
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
module.exports.docUrlPath = docUrlPath;
