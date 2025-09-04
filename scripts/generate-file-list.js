const fs = require('fs');
const path = require('path');

function generateFileList() {
  const codeDir = path.join(__dirname, '../reuse/code');
  const files = [];
  
  function walkDir(dir, relativePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip hidden files and directories
        if (entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativeFilePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          walkDir(fullPath, relativeFilePath);
        } else {
          files.push(relativeFilePath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error.message);
    }
  }
  
  if (!fs.existsSync(codeDir)) {
    console.warn(`Code directory not found: ${codeDir}`);
    console.log('Creating empty file list...');
    files.push('example.a', 'example.b'); // fallback files
  } else {
    console.log(`Scanning code directory: ${codeDir}`);
    walkDir(codeDir);
  }
  
  // Sort files alphabetically
  files.sort();
  
  // Ensure public directory exists
  const publicDir = path.join(__dirname, '../reuse');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write to public directory
  const outputPath = path.join(publicDir, 'code-files.json');
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
  
  console.log(`Generated code file list with ${files.length} files:`);
  files.forEach(file => console.log(`  - ${file}`));
  console.log(`Written to: ${outputPath}`);
}

// Run the function
generateFileList();