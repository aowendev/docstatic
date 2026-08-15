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
 *
 * The same cross-origin rule applies to `probeHreflangInBrowser()`, used to
 * decide whether a single-use hardcoded link is worth centralizing because
 * its target has language variants — but there it can matter which way a
 * request fails: reading a cross-origin response body (not just its
 * reachability) additionally needs the target to send permissive CORS
 * headers, which plenty of sites do for public HTML and plenty don't. When
 * one doesn't, the probe can't tell hreflang absent from hreflang unknown,
 * so it reports neither — the candidate simply doesn't clear the bar from
 * the browser alone. `yarn check-links` has no such gap, since Node was
 * never subject to the browser's cross-origin restriction in the first
 * place, so it remains the only source of a guaranteed answer.
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
 * Replace every `a`/`link` node matching `targetUrl` in a rich-text body
 * with a `<Url urlKey linkText={[{ lang, text }]} />` embed, returning a new
 * body (the input is never mutated) and how many replacements were made.
 *
 * `text` always comes from the matched link node itself, per-occurrence —
 * never a fallback to the key's preset default text. Two links to the same
 * URL with different wording (a real case: "CALS table model" and "CALS
 * table model reference" both point at the same OASIS page) get their own
 * linkText each, rather than one borrowing the other's.
 *
 * The node shape (`mdxJsxTextElement` with a plain `props` object, no
 * `_template` wrapper) was verified against the actual `@tinacms/mdx`
 * parser/serializer, not assumed: parsing a real `<Url urlKey="..."
 * linkText={[{ lang: "en", text: "..." }]} />` string and re-serializing it
 * round-trips byte-for-byte, and splicing this exact node shape into a
 * parsed link's position serializes to the same MDX a human typing it by
 * hand would produce.
 */
export function replaceLinkNodeWithUrl(body, targetUrl, { urlKey, lang }) {
  const target = normalizeUrl(targetUrl);
  let replacedCount = 0;

  function replaceChildren(children) {
    return children.map((child) => {
      if (!child || typeof child !== "object") return child;

      let url;
      if (child.type === "a" || child.type === "link") {
        url = typeof child.url === "string" ? child.url : child.href;
      }
      if (typeof url === "string" && normalizeUrl(url) === target) {
        replacedCount += 1;
        return {
          type: "mdxJsxTextElement",
          name: "Url",
          children: [{ type: "text", text: "" }],
          props: {
            urlKey,
            linkText: [{ lang, text: plainText(child).trim() || target }],
          },
        };
      }

      if (Array.isArray(child.children)) {
        return { ...child, children: replaceChildren(child.children) };
      }
      return child;
    });
  }

  if (!body || !Array.isArray(body.children)) {
    return { body, replacedCount: 0 };
  }
  return {
    body: { ...body, children: replaceChildren(body.children) },
    replacedCount,
  };
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

/**
 * Wikipedia is a known edge case for language variants: every article has
 * one, but Wikipedia doesn't advertise them via `<link rel="alternate"
 * hreflang>` the way most other multilingual sites do. Mirrors
 * `isWikipediaUrl()` in scripts/generate-link-report.js.
 */
export function isWikipediaUrl(url) {
  try {
    return /(^|\.)wikipedia\.org$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * True if any `<link>` tag in the given HTML declares a language variant.
 * Mirrors `hasHreflangTags()` in scripts/generate-link-report.js.
 */
export function hasHreflangTags(html) {
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (
      /\brel=["']alternate["']/i.test(tag) &&
      /\bhreflang=["'][a-zA-Z-]+["']/i.test(tag)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Best-effort hreflang probe for one external URL, run directly from the
 * browser. Unlike `probeUrlInBrowser()`, this needs to read the response
 * body, so it can't use `mode: "no-cors"` — it uses the default `cors` mode,
 * which only succeeds when the target sends permissive CORS headers. Many
 * public sites do; plenty don't.
 *
 * Returns `true` only when a variant was actually found. Every failure —
 * blocked by CORS, timed out, non-2xx, network error — returns `false`,
 * indistinguishable here from "genuinely no variant." That's fine for this
 * probe's one job (deciding whether to show a migration candidate; a false
 * negative just leaves it hidden until `yarn check-links` runs), but it
 * means this result is never strong enough to say a URL has *no* variant —
 * only that this attempt didn't find one.
 */
export async function probeHreflangInBrowser(
  url,
  { timeout = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = {}
) {
  try {
    const response = await fetchImpl(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) return false;
    return hasHreflangTags(await response.text());
  } catch {
    return false;
  }
}
