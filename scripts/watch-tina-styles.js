#!/usr/bin/env node
/**
 * Watcher script for TinaCMS admin styles
 * This script runs alongside the dev server and watches for the admin file to be generated
 */

const { startWatcher } = require('./inject-tina-styles.js');

startWatcher();

// Keep the process running
process.on('SIGINT', () => {
  process.stdout.write('\nStopping TinaCMS style watcher...\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});