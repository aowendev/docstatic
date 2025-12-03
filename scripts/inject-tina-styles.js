#!/usr/bin/env node
/**
 * Script to inject custom CSS into the TinaCMS admin HTML file
 * This script monitors the admin/index.html file and injects styles when it's created/modified.
 */

const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '../static/admin/index.html');
const adminDir = path.join(__dirname, '../static/admin');

const customStyles = `
    <style>
      /* Custom strikethrough styling for TinaCMS rich text editor */
      .slate-strikethrough,
      s.slate-strikethrough,
      del.slate-strikethrough,
      .slate-editor s,
      .slate-editor del {
        text-decoration: none !important;
        background-color: #ffff99 !important;
        color: #000 !important;
        padding: 1px 3px !important;
        border-radius: 3px !important;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
      }
    </style>`;

function injectStyles() {
  try {
    // Check if the admin HTML file exists
    if (!fs.existsSync(adminHtmlPath)) {
      return false;
    }

    // Read the current content
    const content = fs.readFileSync(adminHtmlPath, 'utf8');
    
    // Check if our styles are already injected
    if (content.includes('Custom strikethrough styling for TinaCMS')) {
      return false;
    }

    // Inject the styles before the closing </head> tag
    const updatedContent = content.replace('</head>', `${customStyles}\n  </head>`);
    
    // Write the updated content back to the file
    fs.writeFileSync(adminHtmlPath, updatedContent, 'utf8');
    return true;
    
  } catch (error) {
    return false;
  }
}

// If run directly (not as a watcher), try to inject once
if (require.main === module) {
  const success = injectStyles();
  if (success) {
    process.stdout.write('Successfully injected custom styles into TinaCMS admin HTML.\n');
  } else if (!fs.existsSync(adminHtmlPath)) {
    process.stdout.write('Admin HTML file not found. TinaCMS may not be running yet.\n');
  } else {
    process.stdout.write('Custom styles already present or injection failed.\n');
  }
  process.exit(0);
}

// Watch for file changes
function startWatcher() {
  process.stdout.write('Watching for TinaCMS admin file changes...\n');
  
  // Watch the admin directory
  if (fs.existsSync(adminDir)) {
    fs.watch(adminDir, (eventType, filename) => {
      if (filename === 'index.html' && eventType === 'change') {
        // Small delay to ensure file is fully written
        setTimeout(() => {
          const success = injectStyles();
          if (success) {
            process.stdout.write('Injected styles into regenerated TinaCMS admin file.\n');
          }
        }, 100);
      }
    });
  }
  
  // Also try initial injection in case file already exists
  setTimeout(() => {
    injectStyles();
  }, 1000);
}

module.exports = { injectStyles, startWatcher };