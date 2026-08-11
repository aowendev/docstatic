/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useState } from "react";
// Relative, not the "@site" alias: this component is pulled into the Tina
// admin bundle, which esbuild builds without Docusaurus's path aliases.
import linkReport from "../../data/link-report.json";

/**
 * The results shown here are produced by `scripts/generate-link-report.js`, not
 * by this page.
 *
 * This dashboard used to check links itself, which it fundamentally could not
 * do: a browser fetching a third-party URL is making a cross-origin request, so
 * it is forced into `mode: "no-cors"` and gets back an opaque response whose
 * status is always 0. Every link that answered at all was reported "valid",
 * including 404s — the one thing a broken-link dashboard exists to catch.
 *
 * Node has no such restriction, so the check moved to `yarn check-links` and
 * this page renders what that recorded.
 */
const BrokenLinksDashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [_selectedFile, _setSelectedFile] = useState(null);

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

    const allLinks = (linkReport.links || []).map((link) => ({
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

    return {
      stats,
      fileStats: linkReport.files || {},
      linksByFile,
      allLinks,
      brokenLinks: allLinks.filter((link) => link.status === "broken"),
      warningLinks: allLinks.filter((link) => link.status === "warning"),
      generatedAt: linkReport.generatedAt,
      lastCheckedAt: linkReport.lastCheckedAt,
      uncheckedCount: linkReport.stats?.unchecked || 0,
    };
  }, []);

  // Function to open file in CMS editor
  const openInCMS = (filePath) => {
    // Extract relative path from full path
    const relativePath = filePath
      .replace(/^\/docs\//, "")
      .replace(/\.mdx?$/i, "");
    const cmsUrl = `/admin/index.html#/collections/edit/doc/${encodeURIComponent(relativePath)}`;
    window.open(cmsUrl, "_blank");
  };

  const {
    stats,
    fileStats,
    linksByFile,
    brokenLinks,
    warningLinks,
    lastCheckedAt,
    uncheckedCount,
  } = linkData;
  const problemLinks = [...(brokenLinks || []), ...(warningLinks || [])];

  return (
    <div
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
            Broken Links Dashboard
          </h2>
        </div>
        {/* No refresh control: these results come from `yarn check-links`,
            which this page cannot run. Showing the age of the data instead is
            the honest equivalent. */}
        <div className="text-right text-sm text-gray-500 whitespace-normal">
          {lastCheckedAt ? (
            <>
              Links last checked{" "}
              <strong className="text-gray-700">
                {new Date(lastCheckedAt).toLocaleString()}
              </strong>
            </>
          ) : (
            <strong className="text-gray-700">Links not checked yet</strong>
          )}
          <div className="text-xs text-gray-400">
            Run <code>yarn check-links</code> to update
          </div>
        </div>
      </div>

      {/* What the numbers below do and do not prove. */}
      {/* whitespace-normal: a Tina admin ancestor sets whitespace-nowrap, which
          this note would otherwise inherit and render as one long line. */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-6 text-sm text-blue-900 whitespace-normal">
        <strong>Broken means the server said so.</strong> Every external link is
        requested by <code>yarn check-links</code>, which reads the real HTTP
        status, so a 404 or 500 is reported as broken. Links that produced no
        answer at all — a DNS failure, a timeout, a 403 — are counted as
        unverified rather than broken, because the cause may be the machine that
        ran the check. Internal links are not requested here; the Docusaurus
        build already validates those against the real route table.
      </div>

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
            <p className="text-sm text-gray-500 font-medium">Not checked</p>
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
                    {link.filePath.split("/").pop()} (line {link.lineNumber}) -{" "}
                    {link.reason}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openInCMS(link.filePath)}
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
                        onClick={() => openInCMS(filePath)}
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

export default BrokenLinksDashboard;
