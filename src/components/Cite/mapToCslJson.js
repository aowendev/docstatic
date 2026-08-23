/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Bibliography entry -> CSL-JSON item.
 *
 * The stored shape is Tina-typed: field names cannot contain hyphens, because
 * they become GraphQL field names, so "containerTitle" stands in for
 * "container-title". csl-data.json sets additionalProperties:false, so anything
 * emitted here that is not a real CSL property invalidates the whole item and
 * citeproc silently drops it - hence the strict rename-or-drop rule below.
 *
 * Framework-free, like cslTerms.js, so test/ can reach it without a DOM.
 */

import {
  CONTRIBUTOR_FIELD_MAP,
  NON_CSL_FIELDS,
  REFERENCE_FIELD_MAP,
} from "./cslTerms.js";

/**
 * Fields holding a list of contributors. Each becomes a CSL name variable, an
 * array of {family, given} or {literal} objects.
 */
const CONTRIBUTOR_FIELDS = [
  "authors",
  "editors",
  "translators",
  "containerAuthors",
  "collectionEditors",
];

/**
 * Fields holding a date. CSL wants {"date-parts": [[y, m, d]]}, never the bare
 * string the CMS stores, so these are converted rather than copied.
 */
const DATE_FIELDS = [
  "issued",
  "originalDate",
  "availableDate",
  "submitted",
  "accessed",
];

/** Dates are stored as YYYY, YYYY-MM or YYYY-MM-DD - the shape the tests enforce. */
const DATE_PATTERN = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

/**
 * "2020-05-01" -> {"date-parts": [[2020, 5, 1]]}.
 *
 * Returns null for anything unparseable so the caller can drop the field
 * instead of handing citeproc a date it will render as garbage. Partial dates
 * are legal and common - a book has a year, a journal issue has a month.
 */
export function toCslDate(value) {
  if (typeof value !== "string") return null;
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;

  const parts = [Number(match[1])];
  if (match[2] !== undefined) parts.push(Number(match[2]));
  if (match[3] !== undefined) parts.push(Number(match[3]));

  return { "date-parts": [parts] };
}

/**
 * One CMS contributor row -> one CSL name variable.
 *
 * A corporate author carries "literal" and no family/given; a personal author
 * carries the reverse. Rows that are entirely empty - Tina leaves them behind
 * when an author is added and then cleared - map to null and are dropped.
 */
export function toCslName(contributor) {
  if (!contributor || typeof contributor !== "object") return null;

  const name = {};
  for (const [field, cslProperty] of Object.entries(CONTRIBUTOR_FIELD_MAP)) {
    const value = contributor[field];
    if (typeof value === "string" && value.trim() !== "") {
      name[cslProperty] = value.trim();
    }
  }

  return Object.keys(name).length > 0 ? name : null;
}

/**
 * One bibliography entry -> one CSL-JSON item.
 *
 * The cslJson escape hatch, when present and parseable, replaces every mapped
 * field. The key still wins over any id inside it: the key is what <Cite>
 * refers to, so letting the override rename the item would break every citation
 * of it.
 */
export function mapToCslJson(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.key !== "string" || entry.key.trim() === "") return null;

  const id = entry.key.trim();

  const override = parseCslJsonOverride(entry.cslJson);
  if (override) return { ...override, id };

  const item = { id };

  for (const [field, value] of Object.entries(entry)) {
    if (NON_CSL_FIELDS.includes(field)) continue;
    if (field === "key") continue;

    const cslProperty = REFERENCE_FIELD_MAP[field];
    if (!cslProperty) continue;

    if (CONTRIBUTOR_FIELDS.includes(field)) {
      if (!Array.isArray(value)) continue;
      const names = value.map(toCslName).filter(Boolean);
      if (names.length > 0) item[cslProperty] = names;
      continue;
    }

    if (DATE_FIELDS.includes(field)) {
      const date = toCslDate(value);
      if (date) item[cslProperty] = date;
      continue;
    }

    if (typeof value === "string") {
      if (value.trim() !== "") item[cslProperty] = value.trim();
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      item[cslProperty] = value;
    }
  }

  return item;
}

/**
 * Parse the raw CSL-JSON textarea. Invalid JSON is ignored rather than thrown:
 * the field is an escape hatch an author may be midway through editing, and
 * losing the whole build over it would be worse than falling back to the mapped
 * fields. The generator validates the result either way.
 */
function parseCslJsonOverride(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    for (const field of NON_CSL_FIELDS) delete parsed[field];
    return parsed;
  } catch {
    return null;
  }
}

/** Whole library -> CSL-JSON items, keyed by id, ready for citeproc. */
export function mapLibraryToCslJson(bibliography) {
  if (!Array.isArray(bibliography)) return {};

  const items = {};
  for (const entry of bibliography) {
    const item = mapToCslJson(entry);
    if (item) items[item.id] = item;
  }
  return items;
}
