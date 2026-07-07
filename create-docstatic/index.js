#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const HELP = `
Usage: npx create-docstatic@latest <project-name> [options]
       npx create-docstatic@latest --update [options]

Options:
  --template <name>   Template to use (default: "default")
  --use-npm           Install dependencies with npm
  --use-yarn          Install dependencies with yarn
  --use-pnpm          Install dependencies with pnpm
  --no-install        Skip installing dependencies
  --tag <dist-tag>    docstatic dist-tag or version to scaffold from (default: "latest")
  -h, --help          Show this help
  -v, --version       Show the create-docstatic version

Update options (run inside an existing docStatic site):
  --update            Update the site's docStatic-owned files to the latest
                      template, leaving your content untouched
  --dry-run           With --update: report what would change without writing
  --force             With --update: proceed even if the git working tree is
                      not clean

Examples:
  npx create-docstatic@latest my-docs
  npm create docstatic@latest my-docs
  yarn create docstatic my-docs
  npx create-docstatic@latest --update --dry-run
`.trim();

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    projectName: null,
    template: "default",
    install: true,
    packageManager: null,
    tag: "latest",
    update: false,
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        console.log(HELP);
        process.exit(0);
        break;
      case "-v":
      case "--version":
        console.log(require("./package.json").version);
        process.exit(0);
        break;
      case "--template":
        options.template = argv[++i];
        if (!options.template) fail("--template requires a value.");
        break;
      case "--tag":
        options.tag = argv[++i];
        if (!options.tag) fail("--tag requires a value.");
        break;
      case "--use-npm":
        options.packageManager = "npm";
        break;
      case "--use-yarn":
        options.packageManager = "yarn";
        break;
      case "--use-pnpm":
        options.packageManager = "pnpm";
        break;
      case "--no-install":
        options.install = false;
        break;
      case "--update":
        options.update = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--force":
        options.force = true;
        break;
      default:
        if (arg.startsWith("-")) fail(`Unknown option: ${arg}`);
        if (options.projectName) fail(`Unexpected argument: ${arg}`);
        options.projectName = arg;
    }
  }

  return options;
}

function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  return "npm";
}

function validateProjectName(name) {
  if (!name) {
    console.log(HELP);
    process.exit(1);
  }
  const base = path.basename(name);
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(base)) {
    fail(
      `"${base}" is not a valid project name. Use letters, numbers, dots, hyphens, and underscores.`
    );
  }
}

function downloadTemplate(tag, tmpDir) {
  // "file:<path>" packs a local docstatic checkout instead (used for testing)
  const spec = tag.startsWith("file:") ? tag.slice(5) : `docstatic@${tag}`;
  console.log(`Downloading ${spec}...`);
  try {
    execFileSync(
      "npm",
      ["pack", spec, "--pack-destination", tmpDir, "--silent"],
      { stdio: ["ignore", "ignore", "inherit"] }
    );
  } catch {
    fail(
      `Could not download ${spec} from npm. Check the tag/version and your network connection.`
    );
  }

  const tarball = fs.readdirSync(tmpDir).find((f) => f.endsWith(".tgz"));
  if (!tarball) fail("npm pack did not produce a tarball.");

  try {
    execFileSync("tar", ["-xzf", path.join(tmpDir, tarball), "-C", tmpDir], {
      stdio: ["ignore", "ignore", "inherit"],
    });
  } catch {
    fail(
      'Failed to extract the docstatic package. Is "tar" available on your PATH?'
    );
  }

  return path.join(tmpDir, "package");
}

function resolveTemplateDir(packageDir, template) {
  const candidates =
    template === "default"
      ? [path.join(packageDir, "template")]
      : [path.join(packageDir, "templates", template)];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  const available = ["default"];
  const templatesDir = path.join(packageDir, "templates");
  if (fs.existsSync(templatesDir)) {
    for (const entry of fs.readdirSync(templatesDir, { withFileTypes: true })) {
      if (entry.isDirectory()) available.push(entry.name);
    }
  }
  fail(
    `Unknown template "${template}". Available templates: ${available.join(", ")}.`
  );
}

function filesEqual(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  if (fs.statSync(a).size !== fs.statSync(b).size) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

function runUpdate(options) {
  const siteDir = process.cwd();

  if (
    !fs.existsSync(path.join(siteDir, "package.json")) ||
    !fs.existsSync(path.join(siteDir, "tina")) ||
    !fs.existsSync(path.join(siteDir, "docusaurus.config.ts"))
  ) {
    fail(
      "This does not look like a docStatic site. Run --update from the root of a site created with create-docstatic."
    );
  }

  // Updates overwrite docStatic-owned files; insist on git so the user can
  // review and revert with `git diff` / `git checkout`.
  let gitStatus = null;
  try {
    gitStatus = execSync("git status --porcelain", {
      cwd: siteDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // not a git repo
  }
  if (gitStatus === null && !options.force && !options.dryRun) {
    fail(
      "This site is not a git repository, so the update could not be reviewed or undone. Run `git init && git add -A && git commit` first, or pass --force."
    );
  }
  if (gitStatus && !options.force && !options.dryRun) {
    fail(
      "The git working tree is not clean. Commit or stash your changes first so the update is easy to review, or pass --force."
    );
  }

  const dryRun = options.dryRun;
  let changes = 0;
  const log = (action, rel) => {
    changes++;
    console.log(`  ${action.padEnd(7)} ${rel}`);
  };

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-docstatic-"));
  try {
    const packageDir = downloadTemplate(options.tag, tmpDir);

    const manifestPath = path.join(packageDir, "update-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      fail(
        "This docstatic version does not include an update manifest. Updating requires docstatic 0.3.101 or later (try --tag latest)."
      );
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const templateDir = path.join(packageDir, "template");

    const copy = (rel) => {
      const src = path.join(templateDir, rel);
      const dest = path.join(siteDir, rel);
      if (!fs.existsSync(src) || filesEqual(src, dest)) return;
      log(fs.existsSync(dest) ? "update" : "add", rel);
      if (dryRun) return;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    };

    console.log(
      dryRun
        ? "Checking for docStatic updates (dry run)..."
        : "Updating docStatic files..."
    );

    for (const dir of manifest.mirrorDirs || []) {
      for (const f of listFiles(path.join(templateDir, dir))) {
        copy(path.join(dir, f));
      }
    }
    for (const rel of manifest.files || []) copy(rel);

    for (const rel of manifest.removeFiles || []) {
      const dest = path.join(siteDir, rel);
      if (fs.existsSync(dest)) {
        log("remove", rel);
        if (!dryRun) fs.rmSync(dest);
      }
    }

    // Seeds: only created when their parent directory is missing entirely,
    // so deleting an individual starter file is respected.
    for (const rel of manifest.ensureFiles || []) {
      const dest = path.join(siteDir, rel);
      if (!fs.existsSync(path.dirname(dest)) && !fs.existsSync(dest)) {
        log("add", rel);
        if (!dryRun) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(path.join(templateDir, rel), dest);
        }
      }
    }

    // package.json: docStatic-owned sections come from the template; the
    // site keeps its name/version/etc. and any extra scripts it added.
    const sitePkgPath = path.join(siteDir, "package.json");
    const sitePkg = JSON.parse(fs.readFileSync(sitePkgPath, "utf8"));
    const templatePkg = JSON.parse(
      fs.readFileSync(path.join(templateDir, "package.json"), "utf8")
    );
    const nextPkg = { ...sitePkg };
    for (const key of manifest.packageJsonKeys || []) {
      nextPkg[key] = templatePkg[key];
    }
    nextPkg.scripts = { ...sitePkg.scripts, ...templatePkg.scripts };
    const serialized = `${JSON.stringify(nextPkg, null, 2)}\n`;
    const current = fs.readFileSync(sitePkgPath, "utf8");
    let pkgChanged = false;
    if (serialized !== current) {
      pkgChanged = true;
      log("update", "package.json");
      if (!dryRun) fs.writeFileSync(sitePkgPath, serialized);
    }

    if (changes === 0) {
      console.log("\nAlready up to date.");
      return;
    }

    if (dryRun) {
      console.log(`\n${changes} file(s) would change. Run --update to apply.`);
      return;
    }

    const packageManager = options.packageManager || detectPackageManager();
    if (options.install && pkgChanged) {
      console.log(`\nInstalling dependencies with ${packageManager}...`);
      try {
        execSync(`${packageManager} install`, {
          cwd: siteDir,
          stdio: "inherit",
        });
      } catch {
        console.warn(
          `\nWarning: "${packageManager} install" failed. You can install dependencies manually.`
        );
      }
    }

    console.log(`
Updated ${changes} file(s).

Review the changes with \`git diff\`. If you had customized any of the
updated files, re-apply your changes on top, then commit.
`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.update) {
    if (options.projectName) {
      fail(
        "--update runs inside an existing site; do not pass a project name."
      );
    }
    runUpdate(options);
    return;
  }

  validateProjectName(options.projectName);

  const targetDir = path.resolve(options.projectName);
  const projectName = path.basename(targetDir);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    fail(`Directory "${options.projectName}" already exists and is not empty.`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-docstatic-"));
  try {
    const packageDir = downloadTemplate(options.tag, tmpDir);
    const templateDir = resolveTemplateDir(packageDir, options.template);

    console.log(`Creating a new docStatic site in ${targetDir}...`);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(templateDir, targetDir, { recursive: true });

    // npm strips .gitignore files from packages, so the template ships a
    // dotless "gitignore" that gets renamed here.
    const gitignorePath = path.join(targetDir, "gitignore");
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(targetDir, ".gitignore"));
    }

    const packageJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      packageJson.name = projectName;
      fs.writeFileSync(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`
      );
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  try {
    execSync("git init --quiet", { cwd: targetDir, stdio: "ignore" });
  } catch {
    // git is optional; skip silently
  }

  const packageManager = options.packageManager || detectPackageManager();
  let installed = false;
  if (options.install) {
    console.log(`Installing dependencies with ${packageManager}...`);
    try {
      execSync(`${packageManager} install`, {
        cwd: targetDir,
        stdio: "inherit",
      });
      installed = true;
    } catch {
      console.warn(
        `\nWarning: "${packageManager} install" failed. You can install dependencies manually.`
      );
    }
  }

  // A clean baseline commit lets `--update` show its changes with git diff
  try {
    execSync(
      'git add -A && git commit --quiet -m "Initial commit from create-docstatic"',
      {
        cwd: targetDir,
        stdio: "ignore",
      }
    );
  } catch {
    // no git or no git identity configured; skip silently
  }

  const run = packageManager === "npm" ? "npm run" : packageManager;
  console.log(`
Success! Created ${projectName} at ${targetDir}

Next steps:

  cd ${options.projectName}${installed ? "" : `\n  ${packageManager} install`}
  ${run} dev

Your site will be running at http://localhost:3000 with the TinaCMS
editor at http://localhost:3000/admin/index.html
`);
}

main();
