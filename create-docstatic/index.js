#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const HELP = `
Usage: npx create-docstatic@latest <project-name> [options]

Options:
  --template <name>   Template to use (default: "default")
  --use-npm           Install dependencies with npm
  --use-yarn          Install dependencies with yarn
  --use-pnpm          Install dependencies with pnpm
  --no-install        Skip installing dependencies
  --tag <dist-tag>    docstatic dist-tag or version to scaffold from (default: "latest")
  -h, --help          Show this help
  -v, --version       Show the create-docstatic version

Examples:
  npx create-docstatic@latest my-docs
  npm create docstatic@latest my-docs
  yarn create docstatic my-docs
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
  console.log(`Downloading docstatic@${tag}...`);
  try {
    execFileSync(
      "npm",
      ["pack", `docstatic@${tag}`, "--pack-destination", tmpDir, "--silent"],
      { stdio: ["ignore", "ignore", "inherit"] }
    );
  } catch {
    fail(
      `Could not download docstatic@${tag} from npm. Check the tag/version and your network connection.`
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

function main() {
  const options = parseArgs(process.argv.slice(2));
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
