/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

const IMG_DIR = path.join(__dirname, '../static/img');
const OUTPUT_FILE = path.join(__dirname, '../reuse/media/index.json');

function getMediaFiles(dir, baseDir = IMG_DIR) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMediaFiles(filePath, baseDir));
    } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
      const ext = path.extname(file).toLowerCase();
      let dimensions = undefined;
      // Only get dimensions for raster images
      if (/(jpg|jpeg|png|gif|webp)$/i.test(ext)) {
        try {
          const buffer = fs.readFileSync(filePath);
          const size = imageSize(buffer);
          console.log(`image-size for ${filePath}:`, size);
          if (size.width && size.height) {
            dimensions = `${size.width}x${size.height}`;
          } else {
            console.warn(`No dimensions found for ${filePath}`);
          }
        } catch (e) {
          console.error(`Error reading dimensions for ${filePath}:`, e.message || e);
          // Skip dimensions for this file, continue processing others
        }
      }
      // Get last modified date (ISO string)
      const lastModified = stat.mtime.toISOString();
      results.push({
        filename: file,
        path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
        size: stat.size,
        ...(dimensions ? { dimensions } : {}),
        lastModified
      });
    }
  });
  return results;
}

function main() {
  const mediaFiles = getMediaFiles(IMG_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ media: mediaFiles }, null, 2));
  console.log(`Media index written to ${OUTPUT_FILE}`);
}

main();