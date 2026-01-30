// scripts/generate-media-index.js

const fs = require('fs');
const path = require('path');

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
      results.push({
        filename: file,
        path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
        size: stat.size
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