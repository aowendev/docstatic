/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useRef, useState } from "react";
// Relative, not the "@site" alias: this component is pulled into the Tina
// admin bundle, which esbuild builds without Docusaurus's path aliases.
import docusaurusData from "../../../config/docusaurus/index.json";
import initialLinkReport from "../../data/link-report.json";
import {
  classifyUrl,
  collectUrlsJsonLinks,
  extractLinksFromRichText,
  mapWithConcurrency,
  normalizeUrl,
  probeUrlInBrowser,
} from "../../utils/linkChecker";
import { useTinaTask } from "./lib/useTinaTask";

// Requests in flight during a browser Refresh. Lower than the Node script's
// default (8): this runs in a live admin session someone is watching, on
// whatever concurrent-connections-per-host limit the browser itself imposes,
// not in a CI job.
const REFRESH_CONCURRENCY = 6;

const DEFAULT_LOCALE = docusaurusData.languages?.default || "en";

// Short, readable key from a candidate's link text (falling back to its
// host), unique against whatever keys already exist in the urls[] list.
function suggestKey(candidate, existingKeys) {
  const base =
    (candidate.text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    (() => {
      try {
        return new URL(candidate.url).hostname.replace(/^www\./, "");
      } catch {
        return "link";
      }
    })();
  let key = base;
  let n = 2;
  while (existingKeys.has(key)) {
    key = `${base}-${n}`;
    n += 1;
  }
  return key;
}

/**
 * On first render this shows whatever `scripts/generate-link-report.js` last
 * produced, bundled at build time as `src/data/link-report.json`. That's a
 * real `yarn check-links` run with real HTTP statuses, but it's frozen at
 * whenever the site was last built — and in TinaCloud there is no shell to
 * run that script from, only this CMS UI, so an editor working purely there
 * could never get a current report without asking someone else to run it
 * locally and ship a new build.
 *
 * The Refresh button (see `handleRefresh` below) closes most of that gap: it
 * queries the live Tina GraphQL API for the current docs and
 * `reuse/urls/index.json`, rebuilds this same report shape in the browser,
 * and probes external links directly from here. It carries forward any real
 * "ok"/"broken" verdict `yarn check-links` already recorded for a URL that's
 * still present, and only probes what's new or was never checked — a real
 * HTTP status is worth more than a browser guess, so refreshing doesn't
 * throw one away.
 *
 * The probe itself is the one thing that stays permanently weaker than the
 * Node script: fetching a third-party URL from the browser is a cross-origin
 * request, so it is forced into `mode: "no-cors"` and gets back an opaque
 * response whose status is always 0 — a 404 is indistinguishable from a 200.
 * `probeUrlInBrowser()` in `src/utils/linkChecker.js` therefore only ever
 * reports "reachable" or "request failed," both surfaced as "unverified,"
 * never a real broken/OK verdict. `yarn check-links` remains the only way to
 * get one.
 */
const LinkHealthDashboard = ({ tinaForm }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMigrationDetails, setShowMigrationDetails] = useState(false);
  const [showCentralizedDocsDetails, setShowCentralizedDocsDetails] =
    useState(false);
  const [justCentralized, setJustCentralized] = useState(null);
  const [report, setReport] = useState(initialLinkReport);
  const [refreshProgress, setRefreshProgress] = useState(null);
  const rootRef = useRef(null);
  const { loading: refreshing, error: refreshError, run } = useTinaTask();

  // Tina's admin layout scrolls an inner container, not the window, so
  // window.scrollTo alone is a no-op there. Walk up from this component's
  // own root to find whatever ancestor is actually scrollable.
  const scrollToTop = () => {
    let el = rootRef.current?.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      if (
        (style.overflowY === "auto" || style.overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        el.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
      el = el.parentElement;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Rebuilds the report live from GraphQL instead of waiting for the next
  // build — see the module doc comment above for what this can and can't do.
  const handleRefresh = () => {
    setRefreshProgress(null);
    run(async ({ client, isCurrent }) => {
      // 1. The live urls.json — the piece most likely to have just changed,
      // since centralizing a link is a one-document CMS edit.
      const urlsRes = await client.queries.urls({ relativePath: "index.json" });
      const urlsData = urlsRes.data.urls || { urls: [] };
      const urlsJsonUrlSet = new Set(
        (urlsData.urls || []).flatMap((entry) =>
          (entry.url || []).map((u) => normalizeUrl(u.url))
        )
      );

      // 2. Every doc, paginated. `docs/api` is excluded for the same reason
      // generate-link-report.js excludes it: it's regenerated from the
      // OpenAPI spec, so its links are an artefact of the generator rather
      // than anything an author can fix.
      const files = {};
      const links = [];
      let after;
      for (;;) {
        const res = await client.queries.docConnection({ first: 200, after });
        if (!isCurrent()) return;
        for (const edge of res.data.docConnection.edges || []) {
          const node = edge.node;
          const relativePath = node._sys?.relativePath;
          if (!relativePath || relativePath.startsWith("api/")) continue;

          const filePath = `/docs/${relativePath}`;
          const found = extractLinksFromRichText(node.body, filePath);

          files[filePath] = {
            fileName: relativePath.split("/").pop(),
            relativePath,
            title: node.title || relativePath.replace(/\.mdx?$/i, ""),
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
            links.push({
              ...link,
              source: "doc",
              inUrlsJson: urlsJsonUrlSet.has(link.url),
              status: "unchecked",
              reason: "Not checked yet",
            });
          }
        }
        const pageInfo = res.data.docConnection.pageInfo;
        if (!pageInfo?.hasNextPage) break;
        after = pageInfo.endCursor;
      }

      for (const link of collectUrlsJsonLinks(urlsData)) {
        links.push({ ...link, status: "unchecked", reason: "Not checked yet" });
      }

      // 3. Carry forward any real verdict yarn check-links already recorded
      // for a URL that's still here, so a browser guess never overwrites an
      // actual HTTP status. Only what's new or was never checked gets probed.
      const previousVerdicts = new Map();
      for (const link of report.links || []) {
        if (link.status === "ok" || link.status === "broken") {
          previousVerdicts.set(link.url, {
            status: link.status,
            reason: link.reason,
            code: link.code ?? null,
            redirectedTo: link.redirectedTo,
            checkedAt: link.checkedAt,
          });
        }
      }
      for (const link of links) {
        const previous = previousVerdicts.get(link.url);
        if (previous) Object.assign(link, previous);
      }

      const toProbe = [
        ...new Set(
          links.filter((l) => l.status === "unchecked").map((l) => l.url)
        ),
      ];

      let done = 0;
      setRefreshProgress({ done: 0, total: toProbe.length });
      const outcomes = await mapWithConcurrency(
        toProbe,
        REFRESH_CONCURRENCY,
        async (url) => {
          const result = await probeUrlInBrowser(url);
          done += 1;
          if (isCurrent()) setRefreshProgress({ done, total: toProbe.length });
          return [url, result];
        }
      );
      const byUrl = new Map(outcomes);
      for (const link of links) {
        const result = byUrl.get(link.url);
        if (result) Object.assign(link, result);
      }

      const stats = links.reduce(
        (acc, link) => {
          acc.total += 1;
          acc[link.status] = (acc[link.status] || 0) + 1;
          return acc;
        },
        { total: 0, ok: 0, broken: 0, unverified: 0, unchecked: 0, skipped: 0 }
      );

      const checkTimes = links
        .map((l) => l.checkedAt)
        .filter(Boolean)
        .sort();

      if (!isCurrent()) return;
      setReport({
        generatedAt: new Date().toISOString(),
        lastCheckedAt: checkTimes.length
          ? checkTimes[checkTimes.length - 1]
          : null,
        checked: true,
        checkedVia: "browser",
        stats,
        files,
        links,
      });
      setRefreshProgress(null);
    });
  };

  // The report maps onto the vocabulary this view already speaks: "valid" is a
  // real 2xx/3xx, "broken" is a server-attested 4xx/5xx, and "warning" covers
  // links no answer came back for, which are for a human to judge.
  const linkData = useMemo(() => {
    const statusMap = {
      ok: "valid",
      broken: "broken",
      unverified: "warning",
      unchecked: "skipped",
      skipped: "skipped",
    };

    const allLinks = (report.links || []).map((link) => ({
      ...link,
      status: statusMap[link.status] || "skipped",
      lineNumber: link.line,
    }));

    const stats = allLinks.reduce(
      (acc, link) => {
        acc.total++;
        acc[link.status]++;
        return acc;
      },
      { total: 0, valid: 0, broken: 0, warning: 0, skipped: 0 }
    );

    // Keyed by full path, not basename. fileStats is keyed by full path, and
    // the two are looked up against each other — with basenames, every doc
    // called index.mdx shared one bucket and files inherited each other's
    // problems, inflating the "files with problem links" count.
    const linksByFile = {};
    for (const link of allLinks) {
      if (!linksByFile[link.filePath]) linksByFile[link.filePath] = [];
      linksByFile[link.filePath].push(link);
    }

    const centralizedLinks = allLinks.filter(
      (link) => link.source === "urls-json"
    );

    // Grouped by URL, not by file: the same hardcoded URL commonly repeats
    // across many docs, and the point of these lists is "go do something
    // about this one URL," not "here are five identical rows."
    //
    // Split in two rather than filtered to one list: centralizing a URL
    // (adding it to urls.json) doesn't touch the docs that still hardcode it
    // — that's a manual follow-up — so a link that's already centralized but
    // not yet swapped for a <Url> reference anywhere needs to stay visible,
    // just without a "Centralize" action that would be redundant. If the
    // urls.json entry is later deleted and the report regenerated, its links
    // fall back into migrationCandidates automatically, since this grouping
    // is recomputed from inUrlsJson fresh every time.
    const groupByUrl = (predicate) => {
      const byUrl = {};
      for (const link of allLinks) {
        if (link.source !== "doc" || !predicate(link)) continue;
        if (!byUrl[link.url]) {
          byUrl[link.url] = { url: link.url, text: link.text, occurrences: [] };
        }
        byUrl[link.url].occurrences.push({
          filePath: link.filePath,
          line: link.lineNumber,
        });
      }
      return Object.values(byUrl);
    };
    const migrationCandidates = groupByUrl((link) => link.inUrlsJson === false);
    const centralizedButHardcoded = groupByUrl(
      (link) => link.inUrlsJson === true
    );

    return {
      stats,
      fileStats: report.files || {},
      linksByFile,
      allLinks,
      brokenLinks: allLinks.filter((link) => link.status === "broken"),
      warningLinks: allLinks.filter((link) => link.status === "warning"),
      centralizedLinks,
      migrationCandidates,
      centralizedButHardcoded,
      generatedAt: report.generatedAt,
      lastCheckedAt: report.lastCheckedAt,
      checkedVia: report.checkedVia,
      uncheckedCount: report.stats?.unchecked || 0,
    };
  }, [report]);

  // Function to open file in CMS editor
  const openInCMS = (link) => {
    if (link.source === "urls-json") {
      window.open("/admin/index.html#/collections/edit/urls/index", "_blank");
      return;
    }
    // Extract relative path from full path
    const relativePath = link.filePath
      .replace(/^\/docs\//, "")
      .replace(/\.mdx?$/i, "");
    const cmsUrl = `/admin/index.html#/collections/edit/doc/${encodeURIComponent(relativePath)}`;
    window.open(cmsUrl, "_blank");
  };

  // Appends a new entry to this document's own urls[] field, pre-filled from
  // the migration candidate, instead of just navigating somewhere — this is
  // the same document the dashboard already lives in, so the new entry shows
  // up immediately in the URLs list above, ready to review, add other
  // languages to, and Save.
  const handleCentralize = (candidate) => {
    if (!tinaForm) {
      // No form context (e.g. rendered outside the URLs collection editor) —
      // fall back to just opening the collection.
      window.open("/admin/index.html#/collections/edit/urls/index", "_blank");
      return;
    }
    const currentUrls = tinaForm.values.urls || [];
    const existingKeys = new Set(currentUrls.map((u) => u.key));
    const key = suggestKey(candidate, existingKeys);
    tinaForm.change("urls", [
      ...currentUrls,
      {
        _template: "urlEntry",
        key,
        url: [
          {
            _template: "urlTranslation",
            lang: DEFAULT_LOCALE,
            url: candidate.url,
          },
        ],
        defaultText: [
          {
            _template: "textTranslation",
            lang: DEFAULT_LOCALE,
            text: candidate.text || candidate.url,
          },
        ],
      },
    ]);
    setJustCentralized(key);
    scrollToTop();
  };

  const {
    stats,
    fileStats,
    linksByFile,
    brokenLinks,
    warningLinks,
    centralizedLinks,
    migrationCandidates,
    centralizedButHardcoded,
    lastCheckedAt,
    checkedVia,
    uncheckedCount,
  } = linkData;
  const problemLinks = [...(brokenLinks || []), ...(warningLinks || [])];

  return (
    <div
      ref={rootRef}
      style={{
        padding: "24px",
        borderBottom: "2px solid #d1d9e0",
        marginBottom: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="text-3xl text-tina-orange">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Link Health Dashboard
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="text-right text-sm text-gray-500 whitespace-normal">
            {lastCheckedAt ? (
              <>
                Links last checked{" "}
                <strong className="text-gray-700">
                  {new Date(lastCheckedAt).toLocaleString()}
                </strong>
                {checkedVia === "browser" && (
                  <span className="text-gray-400"> (from this browser)</span>
                )}
              </>
            ) : (
              <strong className="text-gray-700">Links not checked yet</strong>
            )}
            <div className="text-xs text-gray-400">
              Run <code>yarn check-links</code> for a real HTTP-status check
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Query the current docs and urls.json over GraphQL and probe external links from this browser. Can't see real HTTP statuses cross-origin — see docs/guides/dashboards."
            style={{
              padding: "8px 14px",
              backgroundColor: refreshing ? "#94a3b8" : "#0366d6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: refreshing ? "default" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {refreshing
              ? refreshProgress
                ? `Checking ${refreshProgress.done}/${refreshProgress.total}…`
                : "Refreshing…"
              : "Refresh"}
          </button>
        </div>
      </div>

      {refreshError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-6 text-sm text-red-900 whitespace-normal">
          Refresh failed: {refreshError}
        </div>
      )}

      {checkedVia === "browser" && !refreshing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-6 text-sm text-blue-900 whitespace-normal">
          This report was refreshed from this browser. New and previously
          unchecked links are marked <strong>Unverified</strong> rather than OK
          or Broken — a browser can't see a third-party site's real HTTP status,
          only whether the request went through. Run{" "}
          <code>yarn check-links</code> for a verdict that can actually say
          "broken."
        </div>
      )}

      {justCentralized && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 mb-6 text-sm text-green-900 whitespace-normal">
          Added <strong>{justCentralized}</strong> to the URLs list above.
          Review it, add any other languages it needs, then click{" "}
          <strong>Save</strong>.
        </div>
      )}

      {/* No standing explanation of what the statuses mean: the card labels
          carry it, each problem link states its own reason, and the Help
          button links to docs/guides/dashboards for the full account. This
          alert stays because it is actionable rather than explanatory, and it
          only appears when there is something to act on. */}
      {/* whitespace-normal: a Tina admin ancestor sets whitespace-nowrap, which
          this alert would otherwise inherit and render as one long line. */}
      {uncheckedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6 text-sm text-amber-900 whitespace-normal">
          <strong>
            {uncheckedCount} external links have never been checked.
          </strong>{" "}
          Run <code>yarn check-links</code> to request them and record real HTTP
          statuses.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-blue-600"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">Total Links</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-green-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">OK</p>
            <p className="text-3xl font-bold text-gray-800">{stats.valid}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.9 4.9 14.2 14.2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">Broken</p>
            <p className="text-3xl font-bold text-red-600">{stats.broken}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-orange-600"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="m12 17 .01 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">Unverified</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.warning || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-gray-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">Internal</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.skipped || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-purple-600"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">Files Scanned</p>
            <p className="text-3xl font-bold text-gray-800">
              {Object.keys(fileStats).length}
            </p>
          </div>
        </div>
      </div>

      {/* Second row: URLs-collection-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-teal-600"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">
              Centralized (urls.json)
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {centralizedLinks.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
          <div className="bg-amber-100 p-3 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-2xl text-amber-600"
            >
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium">
              Migration Candidates
            </p>
            <p className="text-3xl font-bold text-amber-600">
              {migrationCandidates.length}
            </p>
            <p className="text-xs text-gray-400">
              {stats.total > 0
                ? `${migrationCandidates.reduce((n, m) => n + m.occurrences.length, 0)} occurrences across docs`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Broken Links Section */}
      {problemLinks.length > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#d73a49",
              marginBottom: "15px",
            }}
          >
            🚨 Problem Links ({problemLinks.length})
          </h3>
          <div
            style={{
              border: "1px solid #d0d7de",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {problemLinks.map((link, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    index < problemLinks.length - 1
                      ? "1px solid #d0d7de"
                      : "none",
                  backgroundColor:
                    link.status === "broken" ? "#fff5f5" : "#fff8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      marginBottom: "4px",
                      color: "#24292e",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {link.status === "broken" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.9 4.9 14.2 14.2" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <path d="M12 9v4" />
                          <path d="m12 17 .01 0" />
                        </svg>
                      )}
                      {link.text || "No text"}
                      {link.source === "urls-json" && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#0366d6",
                            border: "1px solid #0366d6",
                            borderRadius: "3px",
                            padding: "0 4px",
                            marginLeft: "4px",
                          }}
                        >
                          urls.json · {link.lang}
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontFamily: "monospace",
                      marginBottom: "4px",
                    }}
                  >
                    {link.url.startsWith("http://") ||
                    link.url.startsWith("https://") ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color:
                            link.status === "broken" ? "#d73a49" : "#fb8500",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.textDecoration = "none")
                        }
                        onFocus={(e) =>
                          (e.target.style.textDecoration = "none")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.textDecoration = "underline")
                        }
                        onBlur={(e) =>
                          (e.target.style.textDecoration = "underline")
                        }
                      >
                        {link.url}
                      </a>
                    ) : (
                      <span
                        style={{
                          color:
                            link.status === "broken" ? "#d73a49" : "#fb8500",
                        }}
                      >
                        {link.url}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#656d76",
                    }}
                  >
                    {link.source === "urls-json"
                      ? `URLs collection — ${link.reason}`
                      : `${link.filePath.split("/").pop()} (line ${link.lineNumber}) - ${link.reason}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openInCMS(link)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#0366d6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginLeft: "12px",
                    flexShrink: 0,
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Candidates: external links hardcoded in docs that aren't
          in the URLs collection yet. */}
      {migrationCandidates.length > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#24292e",
                margin: 0,
              }}
            >
              🧭 Migration Candidates ({migrationCandidates.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowMigrationDetails(!showMigrationDetails)}
              style={{
                padding: "4px 8px",
                backgroundColor: "transparent",
                color: "#0366d6",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {showMigrationDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
          <div
            style={{
              border: "1px solid #d0d7de",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {migrationCandidates
              .slice(0, showMigrationDetails ? undefined : 5)
              .map((candidate, index) => (
                <div
                  key={candidate.url}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      index < migrationCandidates.length - 1
                        ? "1px solid #d0d7de"
                        : "none",
                    backgroundColor: "#fffdf5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#24292e",
                          marginBottom: "2px",
                        }}
                      >
                        {candidate.text || candidate.url}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "monospace",
                          color: "#656d76",
                          marginBottom: "2px",
                          wordBreak: "break-all",
                        }}
                      >
                        {candidate.url}
                      </div>
                      <div style={{ fontSize: "11px", color: "#656d76" }}>
                        Used in {candidate.occurrences.length} place
                        {candidate.occurrences.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCentralize(candidate)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#2da44e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginLeft: "12px",
                        flexShrink: 0,
                      }}
                    >
                      Centralize
                    </button>
                  </div>
                  {/* Centralize only adds the urls.json entry — it doesn't
                      touch the doc(s) that still have the raw hardcoded link.
                      These let an author jump straight to each occurrence to
                      swap it for the new <Url> reference by hand. */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginTop: "8px",
                    }}
                  >
                    {candidate.occurrences.map((occ, occIndex) => (
                      <button
                        key={`${occ.filePath}:${occ.line}:${occIndex}`}
                        type="button"
                        onClick={() =>
                          openInCMS({ source: "doc", filePath: occ.filePath })
                        }
                        title={`Edit ${occ.filePath}${occ.line ? ` (line ${occ.line})` : ""}`}
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "white",
                          color: "#0366d6",
                          border: "1px solid #d0d7de",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        ✎ {occ.filePath.split("/").pop()}
                        {occ.line ? ` (line ${occ.line})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          {!showMigrationDetails && migrationCandidates.length > 5 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "12px",
                color: "#656d76",
              }}
            >
              And {migrationCandidates.length - 5} more...
            </div>
          )}
        </div>
      )}

      {/* Centralized (in urls.json) but still hardcoded somewhere: the URL
          has been added, but nobody has swapped the raw link in these docs
          for a <Url> reference yet. No Centralize button here — there's
          nothing left to centralize — just the file shortcuts, so the doc
          side of the migration doesn't get lost track of. If the urls.json
          entry is later deleted, these links move back into Migration
          Candidates automatically next time the report is regenerated. */}
      {centralizedButHardcoded.length > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#24292e",
                margin: 0,
              }}
            >
              🔗 Centralized, Not Yet Updated in Docs (
              {centralizedButHardcoded.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                setShowCentralizedDocsDetails(!showCentralizedDocsDetails)
              }
              style={{
                padding: "4px 8px",
                backgroundColor: "transparent",
                color: "#0366d6",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {showCentralizedDocsDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
          <div
            style={{
              border: "1px solid #d0d7de",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {centralizedButHardcoded
              .slice(0, showCentralizedDocsDetails ? undefined : 5)
              .map((candidate, index) => (
                <div
                  key={candidate.url}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      index < centralizedButHardcoded.length - 1
                        ? "1px solid #d0d7de"
                        : "none",
                    backgroundColor: "#f6f8fa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#24292e",
                          marginBottom: "2px",
                        }}
                      >
                        {candidate.text || candidate.url}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "monospace",
                          color: "#656d76",
                          marginBottom: "2px",
                          wordBreak: "break-all",
                        }}
                      >
                        {candidate.url}
                      </div>
                      <div style={{ fontSize: "11px", color: "#656d76" }}>
                        Used in {candidate.occurrences.length} place
                        {candidate.occurrences.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#2da44e",
                        border: "1px solid #2da44e",
                        borderRadius: "12px",
                        padding: "3px 10px",
                        marginLeft: "12px",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ Centralized
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginTop: "8px",
                    }}
                  >
                    {candidate.occurrences.map((occ, occIndex) => (
                      <button
                        key={`${occ.filePath}:${occ.line}:${occIndex}`}
                        type="button"
                        onClick={() =>
                          openInCMS({ source: "doc", filePath: occ.filePath })
                        }
                        title={`Edit ${occ.filePath}${occ.line ? ` (line ${occ.line})` : ""}`}
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "white",
                          color: "#0366d6",
                          border: "1px solid #d0d7de",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        ✎ {occ.filePath.split("/").pop()}
                        {occ.line ? ` (line ${occ.line})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          {!showCentralizedDocsDetails &&
            centralizedButHardcoded.length > 5 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#656d76",
                }}
              >
                And {centralizedButHardcoded.length - 5} more...
              </div>
            )}
        </div>
      )}

      {/* Files with Broken Links */}
      {(() => {
        const filesWithProblemLinks = Object.entries(fileStats).filter(
          ([filePath]) => {
            const fileLinks = linksByFile[filePath] || [];
            return fileLinks.some(
              (link) => link.status === "broken" || link.status === "warning"
            );
          }
        );

        if (filesWithProblemLinks.length === 0) {
          return null;
        }

        return (
          <div style={{ marginBottom: "25px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#24292e",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                Files with Problem Links ({filesWithProblemLinks.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  color: "#0366d6",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            <div
              style={{
                border: "1px solid #d0d7de",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {filesWithProblemLinks
                .slice(0, showDetails ? undefined : 5)
                .map(([filePath, stats], index) => {
                  const fileName = stats.fileName;
                  const fileLinks = linksByFile[filePath] || [];
                  const brokenCount = fileLinks.filter(
                    (link) => link.status === "broken"
                  ).length;
                  const warningCount = fileLinks.filter(
                    (link) => link.status === "warning"
                  ).length;
                  const totalProblems = brokenCount + warningCount;

                  return (
                    <div
                      key={filePath}
                      style={{
                        padding: "12px 16px",
                        borderBottom:
                          index < filesWithProblemLinks.length - 1
                            ? "1px solid #d0d7de"
                            : "none",
                        backgroundColor:
                          brokenCount > 0 ? "#fff5f5" : "#fff8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "500",
                            fontSize: "14px",
                            color: "#24292e",
                            marginBottom: "2px",
                          }}
                        >
                          {stats.title || fileName}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#656d76",
                          }}
                        >
                          {stats.totalLinks} total links • {totalProblems}{" "}
                          problem{totalProblems !== 1 ? "s" : ""}
                          {brokenCount > 0 && (
                            <span
                              style={{ color: "#d73a49", marginLeft: "4px" }}
                            >
                              ({brokenCount} broken
                              {warningCount > 0
                                ? `, ${warningCount} warning`
                                : ""}
                              )
                            </span>
                          )}
                          {brokenCount === 0 && warningCount > 0 && (
                            <span
                              style={{ color: "#fb8500", marginLeft: "4px" }}
                            >
                              ({warningCount} warning)
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openInCMS({ source: "doc", filePath })}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#0366d6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          marginLeft: "12px",
                          flexShrink: 0,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  );
                })}
            </div>

            {!showDetails && filesWithProblemLinks.length > 5 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#656d76",
                }}
              >
                And {filesWithProblemLinks.length - 5} more files...
              </div>
            )}
          </div>
        );
      })()}

      {/* Health Status */}
      <div
        style={{
          padding: "15px",
          backgroundColor:
            stats.broken === 0 && (stats.warning || 0) === 0
              ? "#f6f8fa"
              : stats.broken === 0
                ? "#fff8f0"
                : "#fff5f5",
          border: `1px solid ${
            stats.broken === 0 && (stats.warning || 0) === 0
              ? "#28a745"
              : (stats.broken === 0)
                ? "#fb8500"
                : "#d73a49"
          }`,
          borderRadius: "6px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color:
              stats.broken === 0 && (stats.warning || 0) === 0
                ? "#28a745"
                : stats.broken === 0
                  ? "#fb8500"
                  : "#d73a49",
            marginBottom: "5px",
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            {stats.broken === 0 && (stats.warning || 0) === 0 ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                No broken links
              </>
            ) : stats.broken === 0 ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="m12 17 .01 0" />
                </svg>
                {stats.warning} unverified, none broken
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                {stats.broken} broken
                {(stats.warning || 0) > 0
                  ? ` and ${stats.warning} unverified`
                  : ""}
              </>
            )}
          </span>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#656d76",
          }}
        >
          {/* The time of the check, not of this render — those are not the
              same thing once the results come from a build artefact. */}
          {lastCheckedAt
            ? `Links checked on ${new Date(lastCheckedAt).toLocaleString()}`
            : "These links have not been checked yet"}
        </div>
      </div>
    </div>
  );
};

export default LinkHealthDashboard;
