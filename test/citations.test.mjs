/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The Citation embed and the Bibliography collection offer CSL terms in
 * dropdowns. citeproc matches those terms literally, so a plausible-looking
 * misspelling ("sub verbo" for "sub-verbo") is silently accepted by the CMS and
 * only fails much later, at render. These tests check every offered value
 * against the vendored CSL schema instead.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import bibliography from "../reuse/bibliography/index.json" with {
  type: "json",
};
import {
  CONTRIBUTOR_FIELD_MAP,
  FIELD_VISIBILITY,
  isFieldVisible,
  KEY_PATTERN,
  LOCATOR_LABELS,
  NON_CSL_FIELDS,
  OMITTED_CSL_FIELDS,
  REFERENCE_FIELD_MAP,
  REFERENCE_TYPES,
  referenceTypeAt,
} from "../src/components/Cite/cslTerms.js";

const citationSchema = JSON.parse(
  readFileSync(new URL("../csl/csl-citation.json", import.meta.url), "utf8")
);
const dataSchema = JSON.parse(
  readFileSync(new URL("../csl/csl-data.json", import.meta.url), "utf8")
);

const cslItem = dataSchema.items;
const cslName = dataSchema.definitions["name-variable"].anyOf[0];

const citationItem = citationSchema.properties.citationItems.items;

test("every locator label is a CSL locator term", () => {
  const allowed = citationItem.properties.label.enum;
  for (const { value } of LOCATOR_LABELS) {
    assert.ok(
      allowed.includes(value),
      `"${value}" is not in the CSL label enum. Closest allowed: ${
        allowed
          .filter(
            (term) => term.replace(/-/g, " ") === value.replace(/-/g, " ")
          )
          .join(", ") || "none"
      }`
    );
  }
});

test("locator labels are unique and have a display label", () => {
  const values = LOCATOR_LABELS.map((entry) => entry.value);
  assert.equal(new Set(values).size, values.length, "duplicate locator value");
  for (const entry of LOCATOR_LABELS) {
    assert.ok(entry.label, `${entry.value} has no display label`);
  }
});

test("the props Cite maps to CSL are all permitted on a citation item", () => {
  // additionalProperties is false on citationItem, so anything the generator
  // emits that is not here will be rejected outright.
  const allowed = Object.keys(citationItem.properties);
  for (const field of [
    "id",
    "locator",
    "label",
    "prefix",
    "suffix",
    "suppress-author",
  ]) {
    assert.ok(
      allowed.includes(field),
      `${field} is not a valid citation item property`
    );
  }
  assert.equal(citationItem.additionalProperties, false);
  assert.deepEqual(citationItem.required, ["id"]);
});

test("every reference type is a CSL item type", () => {
  // Not a spelling heuristic: the enum contains legal_case, motion_picture and
  // personal_communication, so a "lowercase and hyphens" rule would reject
  // valid types. Check membership instead.
  const allowed = cslItem.properties.type.enum;
  for (const { value } of REFERENCE_TYPES) {
    assert.ok(allowed.includes(value), `"${value}" is not a CSL item type`);
  }
  const values = REFERENCE_TYPES.map((entry) => entry.value);
  assert.equal(new Set(values).size, values.length, "duplicate reference type");
});

test("every reference field maps onto a real CSL property", () => {
  // csl-data.json sets additionalProperties:false, so an unrecognised target
  // is not ignored - it invalidates the whole item.
  const allowed = Object.keys(cslItem.properties);
  for (const [stored, target] of Object.entries(REFERENCE_FIELD_MAP)) {
    assert.ok(
      allowed.includes(target),
      `${stored} maps to "${target}", which is not a CSL property`
    );
  }
  assert.equal(cslItem.additionalProperties, false);
  for (const required of cslItem.required) {
    assert.ok(
      Object.values(REFERENCE_FIELD_MAP).includes(required),
      `nothing maps to the required CSL property "${required}"`
    );
  }
});

test("every contributor field maps onto a real CSL name property", () => {
  const allowed = Object.keys(cslName.properties);
  for (const [stored, target] of Object.entries(CONTRIBUTOR_FIELD_MAP)) {
    assert.ok(
      allowed.includes(target),
      `${stored} maps to "${target}", which is not a CSL name property`
    );
  }
  assert.equal(cslName.additionalProperties, false);
});

test("Tina's own keys are marked for stripping before CSL validation", () => {
  // Tina writes _template into every list item, and cslJson is docStatic-only.
  // Both are rejected by additionalProperties:false, so the mapper has to drop
  // them rather than pass them through.
  const cslProperties = Object.keys(cslItem.properties);
  for (const field of NON_CSL_FIELDS) {
    assert.ok(
      !cslProperties.includes(field),
      `${field} is a real CSL property and should not be stripped`
    );
    assert.ok(
      !Object.values(REFERENCE_FIELD_MAP).includes(field),
      `${field} is marked for stripping but something maps to it`
    );
  }
  const stored = bibliography.bibliography;
  assert.ok(
    stored.some((entry) => "_template" in entry),
    "seed data should exercise the _template stripping path"
  );
});

test("seeded bibliography entries are well formed", () => {
  const entries = bibliography.bibliography;
  assert.ok(Array.isArray(entries) && entries.length > 0);

  const types = new Set(REFERENCE_TYPES.map((entry) => entry.value));
  const keys = new Set();

  for (const entry of entries) {
    assert.match(entry.key, KEY_PATTERN, `bad citation key: ${entry.key}`);
    assert.ok(!keys.has(entry.key), `duplicate citation key: ${entry.key}`);
    keys.add(entry.key);

    assert.ok(
      types.has(entry.type),
      `${entry.key} has unoffered type ${entry.type}`
    );
    assert.ok(entry.title, `${entry.key} has no title`);

    for (const contributor of entry.authors ?? []) {
      assert.ok(
        contributor.family || contributor.literal,
        `${entry.key} has a contributor with neither a family nor a literal name`
      );
    }

    // Dates are stored as ISO strings and mapped to CSL date-parts later, so
    // partial dates must stay parseable by that mapping.
    for (const field of ["issued", "accessed"]) {
      if (entry[field]) {
        assert.match(
          entry[field],
          /^\d{4}(-\d{2}(-\d{2})?)?$/,
          `${entry.key}.${field} is not a year, year-month or full date`
        );
      }
    }
  }
});

test("every deliberately omitted field is a real CSL property", () => {
  // Guards against the list rotting: a typo here would silently stop covering
  // the property it was meant to exclude.
  const allowed = Object.keys(cslItem.properties);
  for (const field of OMITTED_CSL_FIELDS) {
    assert.ok(allowed.includes(field), `"${field}" is not a CSL property`);
  }
});

test("mapped and omitted fields together account for every CSL property", () => {
  // The point of the pairing: a new CSL property added upstream shows up here
  // as an unclassified field rather than being quietly unavailable to authors.
  const mapped = new Set(Object.values(REFERENCE_FIELD_MAP));
  const omitted = new Set(OMITTED_CSL_FIELDS);
  const unclassified = Object.keys(cslItem.properties).filter(
    (field) => !mapped.has(field) && !omitted.has(field)
  );
  assert.deepEqual(
    unclassified,
    [],
    `CSL properties neither offered nor deliberately omitted: ${unclassified.join(", ")}`
  );
});

test("citeproc-computed fields are never author-editable", () => {
  // These are written by citeproc during rendering. Offering them in the form
  // would let an author corrupt the numbering.
  for (const computed of [
    "citation-number",
    "citation-label",
    "year-suffix",
    "first-reference-note-number",
  ]) {
    assert.ok(
      OMITTED_CSL_FIELDS.includes(computed),
      `${computed} must stay out of the form`
    );
    assert.ok(
      !Object.values(REFERENCE_FIELD_MAP).includes(computed),
      `${computed} is mapped but must not be`
    );
  }
});

test("every conditionally shown field is a real reference field", () => {
  // A typo here fails open: the field would simply always show, which is easy
  // to miss because nothing looks broken.
  const known = Object.keys(REFERENCE_FIELD_MAP);
  for (const field of Object.keys(FIELD_VISIBILITY)) {
    assert.ok(known.includes(field), `"${field}" is not a reference field`);
  }
});

test("every type named in the visibility map is offered", () => {
  const offered = new Set(REFERENCE_TYPES.map((entry) => entry.value));
  for (const [field, types] of Object.entries(FIELD_VISIBILITY)) {
    assert.ok(
      types.length > 0,
      `${field} lists no types, so it can never show`
    );
    for (const type of types) {
      assert.ok(offered.has(type), `${field} names unoffered type "${type}"`);
    }
    assert.equal(
      new Set(types).size,
      types.length,
      `${field} lists a duplicate type`
    );
  }
});

test("core fields stay visible for every type", () => {
  // These identify the source or are needed to cite it at all. If one ever
  // acquires a visibility rule, this fails rather than silently hiding it.
  const core = [
    "key",
    "type",
    "title",
    "titleShort",
    "authors",
    "issued",
    "url",
    "accessed",
    "note",
  ];
  for (const field of core) {
    for (const { value: type } of REFERENCE_TYPES) {
      assert.ok(
        isFieldVisible(field, type),
        `${field} should be visible for ${type}`
      );
    }
  }
});

test("an unchosen type shows everything rather than an empty form", () => {
  for (const field of Object.keys(REFERENCE_FIELD_MAP)) {
    assert.ok(isFieldVisible(field, undefined), `${field} hidden with no type`);
    assert.ok(isFieldVisible(field, ""), `${field} hidden with empty type`);
  }
});

test("fields are hidden for the types they do not apply to", () => {
  // Spot checks of the cases that motivated this: an ISSN on a thesis, a
  // jurisdiction on a book, a chapter number on a journal article.
  assert.equal(isFieldVisible("issn", "thesis"), false);
  assert.equal(isFieldVisible("issn", "article-journal"), true);
  assert.equal(isFieldVisible("jurisdiction", "book"), false);
  assert.equal(isFieldVisible("jurisdiction", "legislation"), true);
  assert.equal(isFieldVisible("chapterNumber", "article-journal"), false);
  assert.equal(isFieldVisible("chapterNumber", "chapter"), true);
  assert.equal(isFieldVisible("eventTitle", "book"), false);
  assert.equal(isFieldVisible("eventTitle", "paper-conference"), true);
  assert.equal(isFieldVisible("version", "book"), false);
  assert.equal(isFieldVisible("version", "software"), true);
  assert.equal(isFieldVisible("archiveCollection", "webpage"), false);
  assert.equal(isFieldVisible("archiveCollection", "manuscript"), true);
});

test("every offered type has a usable set of fields", () => {
  // A type that hides almost everything would be unfillable. Each must keep a
  // reasonable working set beyond the always-visible core.
  const fields = Object.keys(REFERENCE_FIELD_MAP);
  for (const { value: type } of REFERENCE_TYPES) {
    const visible = fields.filter((field) => isFieldVisible(field, type));
    assert.ok(
      visible.length >= 15,
      `${type} shows only ${visible.length} fields, which is probably a mistake`
    );
    assert.ok(
      visible.length < fields.length,
      `${type} hides nothing, so it gains no benefit from the rules`
    );
  }
});

test("the visibility rules actually shorten the form", () => {
  const fields = Object.keys(REFERENCE_FIELD_MAP);
  const counts = REFERENCE_TYPES.map(
    ({ value }) => fields.filter((field) => isFieldVisible(field, value)).length
  );
  const worst = Math.max(...counts);
  assert.ok(
    worst < fields.length * 0.75,
    `the longest form still shows ${worst} of ${fields.length} fields`
  );
});

/**
 * The showForType wrapper in template.jsx is a thin shell over these two
 * functions: it reads the sibling type with referenceTypeAt and renders nothing
 * when isFieldVisible says no. Testing the pair against realistic Tina form
 * values covers the wrapper's whole behaviour without a DOM.
 */
const formValues = {
  bibliography: [
    { key: "smith2020", type: "book", title: "A book" },
    { key: "jones2019", type: "article-journal", title: "An article" },
    { key: "draft" },
  ],
};

test("referenceTypeAt finds the sibling type from a Tina field path", () => {
  assert.equal(referenceTypeAt("bibliography.0.issn", formValues), "book");
  assert.equal(
    referenceTypeAt("bibliography.1.issn", formValues),
    "article-journal"
  );
});

test("referenceTypeAt survives paths that do not resolve", () => {
  // A row mid-creation, a stale path after a delete, a malformed name: all of
  // these hit the form on real edits and none may throw.
  for (const path of [
    "bibliography.9.issn",
    "bibliography.0.nested.deep.issn",
    "nonexistent.0.issn",
    "issn",
    "",
    "...",
  ]) {
    assert.doesNotThrow(
      () => referenceTypeAt(path, formValues),
      `threw on ${path}`
    );
    assert.equal(
      referenceTypeAt(path, formValues),
      undefined,
      `resolved ${path}`
    );
  }
  assert.doesNotThrow(() => referenceTypeAt("bibliography.0.issn", undefined));
  assert.equal(referenceTypeAt("bibliography.0.issn", undefined), undefined);
  assert.equal(referenceTypeAt(undefined, formValues), undefined);
});

test("a row with no type chosen yet shows every field", () => {
  const type = referenceTypeAt("bibliography.2.issn", formValues);
  assert.equal(type, undefined);
  for (const field of Object.keys(REFERENCE_FIELD_MAP)) {
    assert.ok(isFieldVisible(field, type), `${field} hidden on a new row`);
  }
});

test("the wrapper hides and shows the right fields on real form values", () => {
  // End to end through both functions, as showForType runs them.
  const decide = (path, field) =>
    isFieldVisible(field, referenceTypeAt(path, formValues));

  // Row 0 is a book: ISBN yes, ISSN no, jurisdiction no.
  assert.equal(decide("bibliography.0.isbn", "isbn"), true);
  assert.equal(decide("bibliography.0.issn", "issn"), false);
  assert.equal(decide("bibliography.0.jurisdiction", "jurisdiction"), false);

  // Row 1 is a journal article: the reverse.
  assert.equal(decide("bibliography.1.isbn", "isbn"), false);
  assert.equal(decide("bibliography.1.issn", "issn"), true);
  assert.equal(decide("bibliography.1.pmid", "pmid"), true);

  // A field with no rule is visible on both.
  assert.equal(decide("bibliography.0.title", "title"), true);
  assert.equal(decide("bibliography.1.title", "title"), true);
});

test("changing the type changes which fields show", () => {
  // The behaviour the feature exists for: editing type re-decides every field.
  const values = { bibliography: [{ key: "x", type: "book" }] };
  const visible = () =>
    Object.keys(REFERENCE_FIELD_MAP).filter((field) =>
      isFieldVisible(field, referenceTypeAt("bibliography.0.any", values))
    );

  const asBook = visible();
  values.bibliography[0].type = "software";
  const asSoftware = visible();

  assert.notDeepEqual(asBook, asSoftware);
  assert.ok(asBook.includes("isbn") && !asSoftware.includes("isbn"));
  assert.ok(asSoftware.includes("version") && !asBook.includes("version"));
});
