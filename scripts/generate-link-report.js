/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Build the link inventory that the Broken Links dashboard reads, and
 * optionally check every external link over the network.
 *
 * This exists because the check cannot be done from the browser. A page
 * fetching a third-party URL is a cross-origin request, so the browser forces
 * `mode: "no-cors"` and hands back an opaque response whose status is always 0.
 * A 404 is indistinguishable from a 200 there. Node has no such restriction, so
 * running the check here is what makes real 404/500 detection possible.
 *
 * Two modes:
 *
 *   node scripts/generate-link-report.js            inventory only, no network
 *   node scripts/generate-link-report.js --check    also request every external URL
 *
 * The inventory-only mode is the one wired into `yarn generate`, so the report
 * always exists for the build and never depends on the network. `--check`
 * (`yarn check-links`) is what fills in real HTTP statuses.
 *
 * Flags: --check, --strict (exit 1 if broken), --concurrency=N, --timeout=MS.
 */

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "link-report.json");

const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 15000;
const USER_AGENT = "Mozilla/5.0 (compatible; docStatic Link Checker/1.0)";

/**
 * Blank out fenced code, inline code, and comments so example URLs inside them
 * are not reported as links. Replaces the content with spaces rather than
 * deleting it, which keeps every later match at its true line and offset.
 */
function maskNonProse(content) {
  const blank = (match) => match.replace(/[^\n]/g, " ");
  return content
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/~~~[\s\S]*?~~~/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/`[^`\n]*`/g, blank);
}

/**
 * Markdown permits `(url "Title")` and `(<url>)`. Strip both down to the URL so
 * the title text is never mistaken for part of the address.
 */
function normalizeUrl(raw) {
  let url = raw.trim();
  if (url.startsWith("<")) {
    const close = url.indexOf(">");
    if (close !== -1) return url.slice(1, close).trim();
  }
  url = url.replace(/\s+["'(].*$/s, "");
  return url.trim();
}

const lineAt = (content, index) => content.slice(0, index).split("\n").length;

/**
 * Pull every link out of one document's body. Mirrors the four forms the
 * dashboard used to scan for: inline markdown, HTML anchors, and reference
 * links with their definitions.
 */
function extractLinks(rawContent, filePath) {
  const content = maskNonProse(rawContent);
  const links = [];

  const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const refLinkRegex = /\[([^\]]+)\]\[([^\]]*)\]/g;
  const refDefRegex = /^\[([^\]]+)\]:\s*(.+)$/gm;

  for (const match of content.matchAll(markdownLinkRegex)) {
    links.push({
      text: match[1],
      url: normalizeUrl(match[2]),
      type: "markdown",
      filePath,
      line: lineAt(content, match.index),
    });
  }

  for (const match of content.matchAll(htmlLinkRegex)) {
    links.push({
      text: match[0],
      url: normalizeUrl(match[1]),
      type: "html",
      filePath,
      line: lineAt(content, match.index),
    });
  }

  const refDefs = {};
  for (const match of content.matchAll(refDefRegex)) {
    refDefs[match[1].toLowerCase()] = normalizeUrl(match[2]);
  }

  for (const match of content.matchAll(refLinkRegex)) {
    const refKey = (match[2] || match[1]).toLowerCase();
    if (refDefs[refKey]) {
      links.push({
        text: match[1],
        url: refDefs[refKey],
        type: "reference",
        filePath,
        line: lineAt(content, match.index),
      });
    }
  }

  return links.filter((link) => link.url.length > 0);
}

/**
 * Decide what kind of link this is before any network work.
 *
 * Internal links are deliberately not resolved here: `onBrokenLinks` in the
 * Docusaurus build already validates them against the real route table, which
 * is far more accurate than anything this script could reimplement.
 */
function classifyUrl(url) {
  if (url.startsWith("#")) {
    return { kind: "skipped", reason: "Anchor link" };
  }
  if (/^(mailto|tel|sms):/i.test(url)) {
    return { kind: "skipped", reason: "Not an HTTP link" };
  }
  if (/^https?:\/\//i.test(url)) {
    // A documented localhost URL points at whatever happens to be running on
    // the machine doing the check, which says nothing about the link. Checking
    // them also meant firing bodyless HEAD requests at the author's own dev
    // server, which the Tina dev layer answers with an error on the CLI.
    let hostname;
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch {
      return { kind: "skipped", reason: "Malformed URL" };
    }
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local")
    ) {
      return { kind: "skipped", reason: "Local address — not checked" };
    }
    return { kind: "external" };
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return { kind: "skipped", reason: "Unsupported URL scheme" };
  }
  return {
    kind: "skipped",
    reason: "Internal link — checked by the Docusaurus build",
  };
}

/** Turn an HTTP status into a verdict. This is the whole point of the script. */
function classifyStatus(status) {
  if (status >= 200 && status < 400) {
    return { status: "ok", reason: `HTTP ${status}` };
  }
  if (status === 401 || status === 403) {
    return {
      status: "unverified",
      reason: `HTTP ${status} — access restricted, check manually`,
    };
  }
  if (status === 429) {
    return {
      status: "unverified",
      reason: "HTTP 429 — rate limited, check manually",
    };
  }
  if (status >= 400 && status < 500) {
    return { status: "broken", reason: `HTTP ${status}` };
  }
  return { status: "broken", reason: `HTTP ${status} — server error` };
}

/**
 * Map a thrown fetch error onto a verdict.
 *
 * Everything here reports "unverified" rather than "broken", and the boundary
 * is deliberate: a link is only called broken when a server answered and said
 * no (a 4xx or 5xx). If no answer arrived at all, the cause may well be the
 * machine running the check rather than the link. That is not hypothetical —
 * the first real run of this script reported mermaid.js.org as a dead domain
 * because the local resolver was returning SERVFAIL, while public resolvers
 * answered it fine. Reporting that as broken sends authors to "fix" a working
 * link. The reason strings still name the failure so a human can judge it.
 */
function classifyError(error) {
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return { status: "unverified", reason: "Timed out — no response" };
  }
  const cause = error?.cause?.code || error?.code;
  if (cause === "ENOTFOUND") {
    return {
      status: "unverified",
      reason: "Domain did not resolve — check DNS, then the link",
    };
  }
  if (cause === "EAI_AGAIN") {
    return {
      status: "unverified",
      reason: "Temporary DNS failure — retry the check",
    };
  }
  if (cause === "ECONNREFUSED") {
    return { status: "unverified", reason: "Connection refused" };
  }
  if (typeof cause === "string" && cause.startsWith("CERT_")) {
    return {
      status: "unverified",
      reason: `TLS certificate problem (${cause})`,
    };
  }
  return {
    status: "unverified",
    reason: error?.message
      ? `Request failed: ${error.message}`
      : "Request failed",
  };
}

/**
 * Check one URL.
 *
 * HEAD goes first because it is cheap, but a failing HEAD is never the final
 * word: it is only trusted when it succeeds. Plenty of real servers mishandle
 * the method — the VS Code marketplace answers 404 to HEAD on a page that
 * serves 200 to GET — so any non-2xx/3xx HEAD is re-checked with GET and the
 * GET result wins. Without that, the report would invent 404s, and a link
 * checker that cries wolf gets ignored.
 */
async function checkUrl(
  url,
  { timeout = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = {}
) {
  const request = (method) =>
    fetchImpl(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    });

  // Release the socket rather than leaving an unread body streaming.
  const discardBody = (response) => {
    try {
      response.body?.cancel?.();
    } catch {
      // Nothing to clean up if the stream was already consumed.
    }
  };

  let response;
  try {
    response = await request("HEAD");
    if (response.status >= 400) {
      discardBody(response);
      response = await request("GET");
    }
  } catch (_headError) {
    try {
      response = await request("GET");
    } catch (getError) {
      return { ...classifyError(getError), code: null };
    }
  }

  const verdict = classifyStatus(response.status);
  const redirectedTo =
    response.url && response.url !== url ? response.url : undefined;
  discardBody(response);
  return { ...verdict, code: response.status, redirectedTo };
}

/** Run `worker` over `items` with a fixed number of tasks in flight. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }
  );

  await Promise.all(runners);
  return results;
}

function collectDocs(dir, relativePath = "") {
  const docs = [];
  if (!fs.existsSync(dir)) return docs;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // `docs/api` is regenerated from the OpenAPI spec, so its links are an
    // artefact of the generator rather than anything an author can fix.
    // generate-docs-metadata.js skips it for the same reason.
    if (entry.name.startsWith(".") || (!relativePath && entry.name === "api")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    const relative = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      docs.push(...collectDocs(fullPath, relative));
    } else if (/\.mdx?$/i.test(entry.name)) {
      docs.push({ fullPath, relativePath: relative });
    }
  }
  return docs;
}

/**
 * Read the verdicts from the previous report, keyed by URL.
 *
 * The inventory pass runs on every build, so without this it would overwrite
 * the results of the last `yarn check-links` with "unchecked" and the dashboard
 * would go blank after any build. Carrying verdicts forward keeps the last real
 * answer visible, with `checkedAt` saying how old it is.
 */
function loadPreviousVerdicts() {
  const verdicts = new Map();
  try {
    const previous = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    for (const link of previous.links || []) {
      if (link.status !== "unchecked" && link.status !== "skipped") {
        verdicts.set(link.url, {
          status: link.status,
          reason: link.reason,
          code: link.code ?? null,
          redirectedTo: link.redirectedTo,
          checkedAt: link.checkedAt,
        });
      }
    }
  } catch {
    // No usable previous report; every external link starts out unchecked.
  }
  return verdicts;
}

/**
 * Build the report. With `check: false` no network request is made: previously
 * recorded verdicts are carried forward and anything new is left "unchecked".
 */
async function generateLinkReport({
  check = false,
  concurrency = DEFAULT_CONCURRENCY,
  timeout = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
  onProgress,
} = {}) {
  const files = {};
  const links = [];
  const previousVerdicts = check ? new Map() : loadPreviousVerdicts();

  for (const doc of collectDocs(DOCS_DIR)) {
    let parsed;
    try {
      parsed = matter(fs.readFileSync(doc.fullPath, "utf-8"));
    } catch (error) {
      console.warn(
        `Warning: could not read ${doc.relativePath}: ${error.message}`
      );
      continue;
    }

    const filePath = `/docs/${doc.relativePath}`;
    const found = extractLinks(parsed.content, filePath);

    files[filePath] = {
      fileName: path.basename(doc.relativePath),
      relativePath: doc.relativePath,
      title:
        parsed.data.title ||
        path.basename(doc.relativePath).replace(/\.mdx?$/i, ""),
      totalLinks: found.length,
    };

    for (const link of found) {
      const classification = classifyUrl(link.url);
      if (classification.kind !== "external") {
        links.push({
          ...link,
          status: "skipped",
          reason: classification.reason,
        });
        continue;
      }
      const previous = previousVerdicts.get(link.url);
      links.push(
        previous
          ? { ...link, ...previous }
          : { ...link, status: "unchecked", reason: "Not checked yet" }
      );
    }
  }

  if (check) {
    // The same URL usually appears in many documents; check each one once.
    const externalUrls = [
      ...new Set(
        links.filter((l) => l.status === "unchecked").map((l) => l.url)
      ),
    ];

    let done = 0;
    const outcomes = await mapWithConcurrency(
      externalUrls,
      concurrency,
      async (url) => {
        const result = await checkUrl(url, { timeout, fetchImpl });
        result.checkedAt = new Date().toISOString();
        done += 1;
        onProgress?.(done, externalUrls.length, url, result);
        return [url, result];
      }
    );

    const byUrl = new Map(outcomes);
    for (const link of links) {
      const result = byUrl.get(link.url);
      if (result) Object.assign(link, result);
    }
  }

  const stats = links.reduce(
    (acc, link) => {
      acc.total += 1;
      acc[link.status] = (acc[link.status] || 0) + 1;
      return acc;
    },
    { total: 0, ok: 0, broken: 0, unverified: 0, unchecked: 0, skipped: 0 }
  );

  // When the inventory pass carries verdicts forward, the newest of them is
  // what the dashboard should report as the age of the results.
  const checkTimes = links
    .map((l) => l.checkedAt)
    .filter(Boolean)
    .sort();

  return {
    generatedAt: new Date().toISOString(),
    lastCheckedAt: checkTimes.length ? checkTimes[checkTimes.length - 1] : null,
    checked: check,
    stats,
    files,
    links,
  };
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function parseArgs(argv) {
  const numeric = (flag, fallback) => {
    const arg = argv.find((a) => a.startsWith(`${flag}=`));
    const value = arg ? Number.parseInt(arg.split("=")[1], 10) : Number.NaN;
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  return {
    check: argv.includes("--check"),
    strict: argv.includes("--strict"),
    concurrency: numeric("--concurrency", DEFAULT_CONCURRENCY),
    timeout: numeric("--timeout", DEFAULT_TIMEOUT_MS),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const report = await generateLinkReport({
    ...options,
    onProgress: (done, total, url, result) => {
      if (result.status === "broken") {
        console.log(`  broken  ${result.reason.padEnd(24)} ${url}`);
      }
      if (done === total || done % 25 === 0) {
        console.log(`  checked ${done}/${total}`);
      }
    },
  });

  writeReport(report);

  const { stats } = report;
  if (options.check) {
    console.log(
      `Link report: ${stats.total} links, ${stats.ok} ok, ${stats.broken} broken, ` +
        `${stats.unverified} unverified, ${stats.skipped} skipped`
    );
  } else {
    console.log(
      `Link report: ${stats.total} links across ${Object.keys(report.files).length} documents ` +
        `(${stats.unchecked} external, not checked — run \`yarn check-links\`)`
    );
  }

  if (options.strict && stats.broken > 0) {
    console.error(`Found ${stats.broken} broken link(s).`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  generateLinkReport,
  extractLinks,
  classifyUrl,
  classifyStatus,
  classifyError,
  checkUrl,
  maskNonProse,
  normalizeUrl,
  mapWithConcurrency,
  OUTPUT_PATH,
};
