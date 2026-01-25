#!/usr/bin/env node
/**
 * Writes the current Git user's identity to static/git-identity.json
 * so the Tina admin (browser) can read it during local development.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function safe(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch (_) {
    return "";
  }
}

function main() {
  const name = safe("git config user.name");
  const email = safe("git config user.email");
  const data = { name, email };

  const outDir = path.join(process.cwd(), "static");
  const outFile = path.join(outDir, "git-identity.json");
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n");
    // eslint-disable-next-line no-console
    console.log(`[git-identity] Wrote ${outFile}: ${name}${email ? ` <${email}>` : ""}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[git-identity] Failed to write git identity:", err.message);
  }
}

main();
