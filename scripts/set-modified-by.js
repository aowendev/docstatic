#!/usr/bin/env node
/**
 * Update the front matter `modifiedBy` (and optionally `lastmod`) of a given file
 * using the local Git user identity. Intended to be invoked by Front Matter CMS
 * custom script with the current file path.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function git(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return '';
  }
}

function getIdentity() {
  const name = git('git config user.name');
  const email = git('git config user.email');
  if (!name && !email) return '';
  return name ? `${name}${email ? ` <${email}>` : ''}` : email;
}

function updateFrontMatter(content, updates) {
  // Ensure file starts with front matter; if not, create it
  if (!content.startsWith('---')) {
    const fm = Object.entries(updates)
      .map(([k, v]) => `${k}: ${v.includes(':') ? `'${v.replace(/'/g, "''")}'` : v}`)
      .join('\n');
    return `---\n${fm}\n---\n\n${content}`;
  }

  const lines = content.split(/\r?\n/);
  let start = 0;
  let end = -1;
  // Find closing --- line
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return content; // malformed; bail

  const fmLines = lines.slice(start + 1, end);
  const fmText = fmLines.join('\n');

  let out = fmText;
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(out)) {
      out = out.replace(re, `${key}: ${value.includes(':') ? `'${value.replace(/'/g, "''")}'` : value}`);
    } else {
      out += `\n${key}: ${value.includes(':') ? `'${value.replace(/'/g, "''")}'` : value}`;
    }
  }

  const updated = [
    '---',
    out,
    '---',
    ...lines.slice(end + 1),
  ].join('\n');

  return updated;
}

function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('[set-modified-by] No file path provided.');
    process.exit(1);
  }
  const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`[set-modified-by] File not found: ${filePath}`);
    process.exit(1);
  }

  const identity = getIdentity() || 'unknown';
  let content = fs.readFileSync(filePath, 'utf8');
  const iso = new Date().toISOString();
  content = updateFrontMatter(content, { modifiedBy: identity, lastmod: iso });
  fs.writeFileSync(filePath, content);
  console.log(`[set-modified-by] Updated ${path.relative(process.cwd(), filePath)} -> modifiedBy: ${identity}`);
}

main();
