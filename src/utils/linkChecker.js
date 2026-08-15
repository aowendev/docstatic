/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Browser-side counterpart to `scripts/generate-link-report.js`, used by the
 * Link Health dashboard's Refresh button.
 *
 * `yarn check-links` cannot run in TinaCloud — there is no shell there, only
 * the CMS UI — so editors working purely in TinaCloud had no way to get a
 * current link report short of asking someone to run the script locally and
 * ship a new build. Refresh instead queries the live Tina GraphQL API for
 * the current doc content and `reuse/urls/index.json`, rebuilds the same
 * report shape client-side, and probes external links directly from the
 * browser.
 *
 * Two real limitations come with that, and the dashboard says so rather than
 * quietly producing a lesser report and calling it equivalent:
 *
 * 1. Doc bodies come back from GraphQL as Tina's parsed rich-text AST, not
 *    raw Markdown, so links are found by walking `a`/`link` nodes rather
 *    than the regex `extractLinks()` uses in the Node script. That misses
 *    links inside a CalsTable's embedded cell content (a JSON prop blob, not
 *    AST children) and doesn't recognize a `<Url>` reference as a link the
 *    way a hardcoded one is recognized. The Node script has that same
 *    `<Url>` blind spot today, so this isn't a new gap, just an existing one
 *    inherited here too.
 *
 * 2. A page fetching a third-party URL from the browser is a cross-origin
 *    request, so `fetch` is forced into `mode: "no-cors"` and hands back an
 *    opaque response whose status is always 0 — a 404 is indistinguishable
 *    from a 200. `probeUrlInBrowser()` can therefore only ever report
 *    "reachable" or "request failed," never a real broken/OK verdict. Real
 *    4xx/5xx detection needs `yarn check-links`, which makes the same
 *    request from Node and can read the real status.
 */

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Markdown permits `(url "Title")` and `(<url>)`. Strip both down to the URL
 * so the title text is never mistaken for part of the address. Mirrors
 * `normalizeUrl()` in scripts/generate-link-report.js.
 */
export function normalizeUrl(raw) {
  let url = raw.trim();
  if (url.startsWith("<")) {
    const close = url.indexOf(">");
    if (close !== -1) return url.slice(1, close).trim();
  }
  url = url.replace(/\s+["'(].*$/s, "");
  return url.trim();
}

/**
 * Decide what kind of link this is before any network work. Mirrors
 * `classifyUrl()` in scripts/generate-link-report.js.
 */
export function classifyUrl(url) {
  if (url.startsWith("#")) {
    return { kind: "skipped", reason: "Anchor link" };
  }
  if (/^(mailto|tel|sms):/i.test(url)) {
    return { kind: "skipped", reason: "Not an HTTP link" };
  }
  if (/^https?:\/\//i.test(url)) {
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

/** Run `worker` over `items` with a fixed number of tasks in flight. Mirrors
 * `mapWithConcurrency()` in scripts/generate-link-report.js. */
export async function mapWithConcurrency(items, limit, worker) {
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

function plainText(node) {
  if (!node || typeof node !== "object") return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (Array.isArray(node.children))
    return node.children.map(plainText).join("");
  return "";
}

/**
 * Walk a Tina rich-text AST node (and its `children`) depth-first, calling
 * `visit` on every node encountered. Generic on purpose: link nodes can
 * appear inside paragraphs, list items, table cells, blockquotes, and so on.
 */
function walkRichText(node, visit) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) walkRichText(child, visit);
    return;
  }
  visit(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walkRichText(child, visit);
  }
}

/**
 * Pull every link out of one document's rich-text body, in the same shape
 * `extractLinks()` produces in scripts/generate-link-report.js — except
 * `line` is null. The AST doesn't reliably carry source positions once it
 * has round-tripped through GraphQL, and a wrong line number would be worse
 * than none: the dashboard's "Edit" buttons open the file itself, so editors
 * still land on the right document either way.
 */
export function extractLinksFromRichText(body, filePath) {
  const links = [];
  walkRichText(body, (node) => {
    let url;
    if (node.type === "a" || node.type === "link") {
      url = typeof node.url === "string" ? node.url : node.href;
    } else if (
      (node.type === "mdxJsxTextElement" ||
        node.type === "mdxJsxFlowElement") &&
      node.name === "a"
    ) {
      url = node.props?.href;
    }
    if (typeof url !== "string" || url.trim() === "") return;
    links.push({
      text: plainText(node).trim(),
      url: normalizeUrl(url),
      type: "markdown",
      filePath,
      line: null,
    });
  });
  return links.filter((link) => link.url.length > 0);
}

/**
 * Turn every {lang, url} pair in a live `urls.json` query result into a link
 * record, mirroring `collectUrlsJsonLinks()` in scripts/generate-link-report.js.
 */
export function collectUrlsJsonLinks(urlsData) {
  const links = [];
  for (const entry of urlsData.urls || []) {
    for (const { lang, url } of entry.url || []) {
      if (typeof url !== "string" || url.trim() === "") continue;
      links.push({
        text: entry.key,
        url: normalizeUrl(url),
        type: "urls-json",
        source: "urls-json",
        urlKey: entry.key,
        lang,
        filePath: "reuse/urls/index.json",
        line: null,
      });
    }
  }
  return links;
}

/**
 * Best-effort reachability probe for one external URL, run directly from the
 * browser. This can never report a real broken/OK verdict — see the module
 * doc comment above for why — so both branches map to "unverified" and say
 * plainly what was and wasn't established.
 */
export async function probeUrlInBrowser(
  url,
  { timeout = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = {}
) {
  const checkedAt = new Date().toISOString();
  try {
    await fetchImpl(url, {
      mode: "no-cors",
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
    });
    return {
      status: "unverified",
      reason:
        "Reachable from the browser — HTTP status isn't visible cross-origin. Run yarn check-links for a real check.",
      checkedVia: "browser",
      checkedAt,
    };
  } catch (error) {
    const timedOut =
      error?.name === "TimeoutError" || error?.name === "AbortError";
    return {
      status: "unverified",
      reason: timedOut
        ? "Timed out from the browser — could be slow, blocked, or actually down. Run yarn check-links to confirm."
        : "Request failed from the browser — likely blocked by CORS, not necessarily broken. Run yarn check-links to confirm.",
      checkedVia: "browser",
      checkedAt,
    };
  }
}
