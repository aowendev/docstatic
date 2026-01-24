#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2];
if (!projectName) {
  console.error('Usage: npx docstatic <project-name>');
  process.exit(1);
}

const targetDir = path.resolve(projectName);

// Check if directory exists
if (fs.existsSync(targetDir)) {
  console.error(`Directory "${projectName}" already exists.`);
  process.exit(1);
}

// Create the project directory
fs.mkdirSync(targetDir);

// Copy starter files from a template directory in your package
// Assume you have a 'template' folder in the package root with starter files
const templateDir = path.join(__dirname, '..', 'template');
fs.copySync(templateDir, targetDir);

// Update package.json with the project name
const packageJsonPath = path.join(targetDir, 'package.json');
const packageJson = fs.readJsonSync(packageJsonPath);
packageJson.name = projectName;
fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

console.log(`Starter repo created in ${targetDir}`);

// Optionally, initialize npm and install dependencies
process.chdir(targetDir);
execSync('npm install', { stdio: 'inherit' });

console.log('Project setup complete. Run "npm run dev" to start.');
