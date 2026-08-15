/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The link report replaced a browser-side check that could not see HTTP status
 * at all. Its value rests entirely on classifying real responses correctly, so
 * the classification and the HEAD/GET fallback are tested directly, with a fake
 * fetch rather than the network.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import linkReport from "../scripts/generate-link-report.js";

const {
  extractLinks,
  classifyUrl,
  classifyStatus,
  classifyError,
  checkUrl,
  maskNonProse,
  normalizeUrl,
  mapWithConcurrency,
  collectUrlsJsonLinks,
} = linkReport;

const urls = (content) =>
  extractLinks(content, "/docs/x.mdx").map((l) => l.url);

/* ------------------------------ extraction ------------------------------ */

test("extracts markdown, HTML and reference links", () => {
  const content = [
    "[inline](https://example.com/a)",
    '<a href="https://example.com/b">html</a>',
    "[ref][key]",
    "",
    "[key]: https://example.com/c",
  ].join("\n");

  assert.deepEqual(urls(content).sort(), [
    "https://example.com/a",
    "https://example.com/b",
    "https://example.com/c",
  ]);
});

test("ignores URLs inside fenced code blocks", () => {
  const content = [
    "```js",
    'fetch("https://example.com/not-a-link")',
    "```",
    "[real](https://example.com/real)",
  ].join("\n");

  assert.deepEqual(urls(content), ["https://example.com/real"]);
});

test("ignores URLs inside inline code and comments", () => {
  const content = [
    "Use `[x](https://example.com/inline-code)` for that.",
    "<!-- [x](https://example.com/html-comment) -->",
    "{/* [x](https://example.com/mdx-comment) */}",
    "[real](https://example.com/real)",
  ].join("\n");

  assert.deepEqual(urls(content), ["https://example.com/real"]);
});

test("masking preserves line numbers so reported lines stay true", () => {
  const content = [
    "```",
    "https://example.com/masked",
    "```",
    "[real](https://example.com/real)",
  ].join("\n");

  assert.equal(maskNonProse(content).split("\n").length, 4);
  assert.equal(extractLinks(content, "/docs/x.mdx")[0].line, 4);
});

test("strips markdown link titles and angle brackets", () => {
  assert.equal(
    normalizeUrl('https://example.com "Title"'),
    "https://example.com"
  );
  assert.equal(normalizeUrl("<https://example.com>"), "https://example.com");
  assert.deepEqual(urls('[a](https://example.com/p "Title")'), [
    "https://example.com/p",
  ]);
});

test("a reference link with no definition is not reported", () => {
  assert.deepEqual(urls("[text][missing]"), []);
});

/* ----------------------------- classification ---------------------------- */

test("non-HTTP and internal targets are skipped, not requested", () => {
  assert.equal(classifyUrl("#section").kind, "skipped");
  assert.equal(classifyUrl("mailto:a@b.com").kind, "skipped");
  assert.equal(classifyUrl("./other.mdx").kind, "skipped");
  assert.equal(classifyUrl("/docs/guide").kind, "skipped");
  assert.equal(classifyUrl("ftp://example.com").kind, "skipped");
  assert.equal(classifyUrl("https://example.com").kind, "external");
});

test("localhost URLs are never requested", () => {
  // Requesting these hit the author's own dev server, which answered the
  // bodyless HEAD with an error on the CLI.
  for (const url of [
    "http://localhost:3000",
    "http://localhost:3000/admin",
    "http://127.0.0.1:8080/x",
    "http://my-site.local/x",
  ]) {
    const result = classifyUrl(url);
    assert.equal(result.kind, "skipped", `${url} must not be requested`);
    assert.match(result.reason, /Local address/);
  }
});

test("HTTP status maps to the right verdict", () => {
  assert.equal(classifyStatus(200).status, "ok");
  assert.equal(classifyStatus(301).status, "ok");
  assert.equal(classifyStatus(404).status, "broken");
  assert.equal(classifyStatus(410).status, "broken");
  assert.equal(classifyStatus(500).status, "broken");
  // Not proof the link is dead — a human has to look.
  assert.equal(classifyStatus(403).status, "unverified");
  assert.equal(classifyStatus(401).status, "unverified");
  assert.equal(classifyStatus(429).status, "unverified");
});

test("no answer at all is unverified, never broken", () => {
  // Only a server saying no counts as broken. A local DNS fault once made this
  // script report a live domain as dead, which is exactly the false alarm that
  // makes a link checker worth ignoring.
  for (const error of [
    { name: "TimeoutError" },
    { cause: { code: "ENOTFOUND" } },
    { cause: { code: "EAI_AGAIN" } },
    { cause: { code: "ECONNREFUSED" } },
    { cause: { code: "CERT_HAS_EXPIRED" } },
    new Error("something else"),
  ]) {
    assert.equal(classifyError(error).status, "unverified");
  }

  assert.match(classifyError({ cause: { code: "ENOTFOUND" } }).reason, /DNS/);
});

/* ------------------------------- checkUrl -------------------------------- */

const fakeResponse = (status, url = "https://example.com/") => ({
  status,
  url,
  body: null,
});

test("a successful HEAD is enough", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(init.method);
    return fakeResponse(200, url);
  };

  const result = await checkUrl("https://example.com/", { fetchImpl });

  assert.deepEqual(calls, ["HEAD"]);
  assert.equal(result.status, "ok");
  assert.equal(result.code, 200);
});

test("a failing HEAD is re-checked with GET, and GET wins", async () => {
  // Regression guard: the VS Code marketplace answers 404 to HEAD on a page
  // that serves 200 to GET. Trusting HEAD invented a broken link.
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(init.method);
    return fakeResponse(init.method === "HEAD" ? 404 : 200, url);
  };

  const result = await checkUrl("https://example.com/", { fetchImpl });

  assert.deepEqual(calls, ["HEAD", "GET"]);
  assert.equal(result.status, "ok", "GET must override the HEAD result");
  assert.equal(result.code, 200);
});

test("a 404 confirmed by GET is reported broken", async () => {
  const fetchImpl = async (url) => fakeResponse(404, url);

  const result = await checkUrl("https://example.com/", { fetchImpl });

  assert.equal(result.status, "broken");
  assert.equal(result.code, 404);
});

test("a 500 confirmed by GET is reported broken", async () => {
  const fetchImpl = async (url) => fakeResponse(500, url);

  const result = await checkUrl("https://example.com/", { fetchImpl });

  assert.equal(result.status, "broken");
  assert.equal(result.code, 500);
});

test("a thrown HEAD falls back to GET", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(init.method);
    if (init.method === "HEAD") throw new Error("HEAD not supported");
    return fakeResponse(200, url);
  };

  const result = await checkUrl("https://example.com/", { fetchImpl });

  assert.deepEqual(calls, ["HEAD", "GET"]);
  assert.equal(result.status, "ok");
});

test("when both methods throw, the error is classified", async () => {
  const fetchImpl = async () => {
    const error = new Error("getaddrinfo ENOTFOUND example.invalid");
    error.cause = { code: "ENOTFOUND" };
    throw error;
  };

  const result = await checkUrl("https://example.invalid/", { fetchImpl });

  assert.equal(result.status, "unverified");
  assert.match(result.reason, /did not resolve/);
  assert.equal(result.code, null);
});

test("a redirect target is recorded", async () => {
  const fetchImpl = async () => fakeResponse(200, "https://example.com/moved");

  const result = await checkUrl("https://example.com/old", { fetchImpl });

  assert.equal(result.redirectedTo, "https://example.com/moved");
});

/* --------------------------- concurrency pool ---------------------------- */

test("the pool preserves order and respects its limit", async () => {
  let inFlight = 0;
  let peak = 0;

  const results = await mapWithConcurrency(
    [1, 2, 3, 4, 5, 6, 7],
    3,
    async (n) => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return n * 2;
    }
  );

  assert.deepEqual(results, [2, 4, 6, 8, 10, 12, 14]);
  assert.ok(peak <= 3, `expected at most 3 in flight, saw ${peak}`);
});

test("an empty input does not hang", async () => {
  assert.deepEqual(await mapWithConcurrency([], 4, async (x) => x), []);
});

/* ---------------------------- urls.json links ---------------------------- */

test("collectUrlsJsonLinks produces one link per language, tagged as urls-json", () => {
  const urlsData = {
    urls: [
      {
        key: "pricing",
        url: [
          { lang: "en", url: "https://example.com/en/pricing" },
          { lang: "fr", url: "https://example.com/fr/pricing" },
        ],
      },
    ],
  };

  const links = collectUrlsJsonLinks(urlsData);

  assert.equal(links.length, 2);
  for (const link of links) {
    assert.equal(link.source, "urls-json");
    assert.equal(link.urlKey, "pricing");
    assert.equal(link.type, "urls-json");
    assert.equal(link.text, "pricing");
  }
  assert.deepEqual(
    links.map((l) => [l.lang, l.url]).sort(),
    [
      ["en", "https://example.com/en/pricing"],
      ["fr", "https://example.com/fr/pricing"],
    ]
  );
});

test("collectUrlsJsonLinks normalizes URLs the same way doc-scanned links are", () => {
  const urlsData = {
    urls: [
      {
        key: "titled",
        url: [{ lang: "en", url: '<https://example.com/x> "Title"' }],
      },
    ],
  };

  assert.equal(
    collectUrlsJsonLinks(urlsData)[0].url,
    "https://example.com/x"
  );
});

test("collectUrlsJsonLinks tolerates missing/empty data", () => {
  assert.deepEqual(collectUrlsJsonLinks({ urls: [] }), []);
  assert.deepEqual(collectUrlsJsonLinks({}), []);
  assert.deepEqual(
    collectUrlsJsonLinks({ urls: [{ key: "no-urls" }] }),
    []
  );
});

test("a urls.json URL set catches the same string a doc-scanned link would produce", () => {
  // This is the exact membership check generateLinkReport() uses to tag
  // doc-scanned links `inUrlsJson: true/false` — verified here via the two
  // already-tested normalizers agreeing on the same string, since
  // generateLinkReport() itself reads from the real docs/ and urls/
  // directories and isn't independently overridable for a unit test.
  const urlsData = {
    urls: [
      { key: "a", url: [{ lang: "en", url: "https://example.com/a" }] },
    ],
  };
  const set = new Set(collectUrlsJsonLinks(urlsData).map((l) => l.url));

  const docLinkUrl = normalizeUrl('https://example.com/a "Title"');
  assert.ok(set.has(docLinkUrl));
  assert.ok(!set.has(normalizeUrl("https://example.com/b")));
});
