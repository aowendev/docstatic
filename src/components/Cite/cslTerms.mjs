/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * CSL vocabulary used by the Bibliography collection and the Citation embed.
 *
 * Framework-free so test/citations.test.mjs can check every value against the
 * vendored CSL schemas without a DOM or React renderer - template.jsx is the
 * only place these reach JSX. Values here are CSL terms and must be spelled
 * exactly as CSL spells them, because citeproc matches them literally: it is
 * "sub-verbo", not "sub-verbo".
 */

/**
 * CSL item types, limited to the ones documentation authors actually reach for.
 * Every value must appear in csl-data.json's type enum.
 */
export const REFERENCE_TYPES = [
  { value: "book", label: "Book" },
  { value: "chapter", label: "Book chapter" },
  { value: "article-journal", label: "Journal article" },
  { value: "article-magazine", label: "Magazine article" },
  { value: "article-newspaper", label: "Newspaper article" },
  { value: "paper-conference", label: "Conference paper" },
  { value: "thesis", label: "Thesis" },
  { value: "report", label: "Report" },
  { value: "webpage", label: "Web page" },
  { value: "post-weblog", label: "Blog post" },
  { value: "standard", label: "Standard" },
  { value: "patent", label: "Patent" },
  { value: "dataset", label: "Dataset" },
  { value: "software", label: "Software" },
  { value: "legislation", label: "Legislation" },
  { value: "speech", label: "Speech" },
  { value: "entry-encyclopedia", label: "Encyclopedia entry" },
  { value: "manuscript", label: "Manuscript" },
];

/**
 * CSL locator terms: what the locator on a citation is counting. Every value
 * must appear in the `label` enum of csl-citation.json. The full enum has 29
 * entries; the legal and scriptural ones (act, canon, rule, scene) are omitted
 * as noise for a documentation site. Add from the enum rather than inventing.
 */
export const LOCATOR_LABELS = [
  { value: "page", label: "Page" },
  { value: "chapter", label: "Chapter" },
  { value: "section", label: "Section" },
  { value: "paragraph", label: "Paragraph" },
  { value: "appendix", label: "Appendix" },
  { value: "figure", label: "Figure" },
  { value: "table", label: "Table" },
  { value: "equation", label: "Equation" },
  { value: "line", label: "Line" },
  { value: "note", label: "Note" },
  { value: "volume", label: "Volume" },
  { value: "issue", label: "Issue" },
  { value: "part", label: "Part" },
  { value: "book", label: "Book" },
  { value: "verse", label: "Verse" },
  { value: "column", label: "Column" },
  { value: "folio", label: "Folio" },
  { value: "supplement", label: "Supplement" },
  { value: "version", label: "Version" },
  { value: "timestamp", label: "Timestamp" },
  { value: "sub-verbo", label: "Sub verbo" },
];

/** Citation keys become CSL ids, so keep them free of anything needing escaping. */
export const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

/**
 * Reference field name -> CSL-JSON property.
 *
 * The stored shape diverges from CSL-JSON on purpose: Tina field names cannot
 * contain hyphens, because they become GraphQL field names, so "container-title"
 * is unrepresentable. csl-data.json sets additionalProperties:false, so the
 * generator's mapToCslJson() must emit exactly these names and nothing else -
 * in particular it must strip Tina's own "_template" keys and the docStatic-only
 * "cslJson" escape hatch, both of which would be rejected outright.
 */
export const REFERENCE_FIELD_MAP = {
  // Identity
  key: "id",
  type: "type",
  title: "title",
  titleShort: "title-short",
  originalTitle: "original-title",
  language: "language",

  // Creators
  authors: "author",
  editors: "editor",
  translators: "translator",
  containerAuthors: "container-author",
  collectionEditors: "collection-editor",

  // Dates
  issued: "issued",
  originalDate: "original-date",
  availableDate: "available-date",
  submitted: "submitted",
  accessed: "accessed",

  // Container and position within it
  containerTitle: "container-title",
  containerTitleShort: "container-title-short",
  collectionTitle: "collection-title",
  collectionNumber: "collection-number",
  volume: "volume",
  volumeTitle: "volume-title",
  volumeTitleShort: "volume-title-short",
  numberOfVolumes: "number-of-volumes",
  issue: "issue",
  chapterNumber: "chapter-number",
  section: "section",
  part: "part",
  page: "page",
  numberOfPages: "number-of-pages",

  // Publication
  publisher: "publisher",
  publisherPlace: "publisher-place",
  originalPublisher: "original-publisher",
  originalPublisherPlace: "original-publisher-place",
  edition: "edition",
  genre: "genre",
  number: "number",
  medium: "medium",
  version: "version",
  status: "status",

  // Events, for conference papers and speeches
  eventTitle: "event-title",
  eventPlace: "event-place",
  eventDate: "event-date",

  // Legal and official sources
  authority: "authority",
  jurisdiction: "jurisdiction",

  // Identifiers
  doi: "DOI",
  isbn: "ISBN",
  issn: "ISSN",
  pmid: "PMID",
  pmcid: "PMCID",
  url: "URL",

  // Archival sources, for manuscripts
  archive: "archive",
  archiveCollection: "archive_collection",
  archiveLocation: "archive_location",
  archivePlace: "archive-place",
  callNumber: "call-number",

  // Free text
  abstract: "abstract",
  note: "note",
};

/**
 * CSL properties deliberately not offered in the form.
 *
 * citeproc computes citation-number, citation-label, year-suffix and
 * first-reference-note-number while rendering; an author-supplied value would
 * be overwritten at best and corrupt the numbering at worst. The rest are
 * either deprecated, non-rendering metadata, or specific to item types the
 * type dropdown does not offer. "custom" is an object, so it stays behind the
 * cslJson escape hatch.
 */
export const OMITTED_CSL_FIELDS = [
  // Set per citation on <Cite>, not per source - see csl-citation.json
  "locator",
  "citation-number",
  "citation-label",
  "year-suffix",
  "first-reference-note-number",
  "page-first",
  "event",
  "categories",
  "keyword",
  "source",
  "annote",
  "references",
  "custom",
  "citation-key",
  "journalAbbreviation",
  "shortTitle",
  "dimensions",
  "scale",
  "printing",
  "division",
  "part-title",
  "supplement",
  "reviewed-author",
  "reviewed-genre",
  "reviewed-title",
  "chair",
  "compiler",
  "composer",
  "contributor",
  "curator",
  "director",
  "editorial-director",
  "executive-producer",
  "guest",
  "host",
  "illustrator",
  "interviewer",
  "narrator",
  "organizer",
  "original-author",
  "performer",
  "producer",
  "recipient",
  "script-writer",
  "series-creator",
];

/** Contributor field name -> CSL name-variable property. */
export const CONTRIBUTOR_FIELD_MAP = {
  family: "family",
  given: "given",
  literal: "literal",
  suffix: "suffix",
  droppingParticle: "dropping-particle",
  nonDroppingParticle: "non-dropping-particle",
};

/** Keys the generator must drop before validating against csl-data.json. */
export const NON_CSL_FIELDS = ["_template", "cslJson"];

/**
 * Which reference types each field is relevant to.
 *
 * CSL defines 103 item properties and the form offers 57 of them, but no single
 * source uses more than a handful: an ISSN is meaningless on a thesis and a
 * jurisdiction is meaningless on a book. A field listed here appears only for
 * the types named; a field not listed here is always shown.
 *
 * Kept as data, and paired with isFieldVisible() below, so the rule is unit
 * testable rather than buried in a Tina ui.component closure.
 */
export const FIELD_VISIBILITY = {
  // Container and position within it
  containerTitle: [
    "article-journal",
    "article-magazine",
    "article-newspaper",
    "chapter",
    "entry-encyclopedia",
    "paper-conference",
    "post-weblog",
    "webpage",
  ],
  containerTitleShort: ["article-journal", "article-magazine"],
  collectionTitle: ["book", "chapter", "report", "standard"],
  collectionNumber: ["book", "chapter", "report", "standard"],
  volume: ["article-journal", "book", "chapter", "entry-encyclopedia"],
  volumeTitle: ["book", "chapter"],
  volumeTitleShort: ["book", "chapter"],
  numberOfVolumes: ["book", "chapter"],
  issue: ["article-journal", "article-magazine", "article-newspaper"],
  chapterNumber: ["chapter"],
  section: ["article-newspaper", "report"],
  part: ["legislation", "patent"],
  page: [
    "article-journal",
    "article-magazine",
    "article-newspaper",
    "chapter",
    "entry-encyclopedia",
    "paper-conference",
  ],
  numberOfPages: ["book", "report", "thesis"],

  // Publication
  publisher: [
    "book",
    "chapter",
    "dataset",
    "entry-encyclopedia",
    "manuscript",
    "report",
    "software",
    "standard",
    "thesis",
  ],
  publisherPlace: [
    "book",
    "chapter",
    "entry-encyclopedia",
    "manuscript",
    "report",
    "thesis",
  ],
  originalPublisher: ["book", "chapter"],
  originalPublisherPlace: ["book", "chapter"],
  edition: ["book", "chapter", "entry-encyclopedia", "software", "standard"],
  genre: ["dataset", "manuscript", "report", "software", "speech", "thesis"],
  number: ["legislation", "patent", "report", "standard"],
  medium: ["dataset", "manuscript", "software", "speech"],
  version: ["dataset", "software", "standard"],
  status: [
    "article-journal",
    "article-magazine",
    "article-newspaper",
    "book",
    "chapter",
    "legislation",
    "patent",
  ],

  // Events
  eventTitle: ["paper-conference", "speech"],
  eventPlace: ["paper-conference", "speech"],
  eventDate: ["paper-conference", "speech"],

  // Legal and official sources
  authority: ["legislation", "patent", "standard"],
  jurisdiction: ["legislation", "patent"],

  // Identifiers
  doi: [
    "article-journal",
    "article-magazine",
    "book",
    "chapter",
    "dataset",
    "paper-conference",
    "report",
    "software",
  ],
  isbn: ["book", "chapter", "entry-encyclopedia"],
  issn: ["article-journal", "article-magazine"],
  pmid: ["article-journal"],
  pmcid: ["article-journal"],

  // Reprints and translations
  originalTitle: ["book", "chapter", "article-journal"],
  originalDate: ["book", "chapter", "legislation"],

  // Archival sources
  archive: ["manuscript", "dataset", "thesis"],
  archiveCollection: ["manuscript"],
  archiveLocation: ["manuscript", "dataset"],
  archivePlace: ["manuscript"],
  callNumber: ["manuscript", "thesis"],

  // Other dates
  availableDate: ["article-journal", "dataset", "software"],
  submitted: ["article-journal", "manuscript", "thesis"],
};

/**
 * Should a reference field be shown for the given item type?
 *
 * Unlisted fields are always visible, and so is everything while no type has
 * been chosen - a brand new entry showing three fields would look broken.
 */
export function isFieldVisible(fieldName, type) {
  const types = FIELD_VISIBILITY[fieldName];
  if (!types) return true;
  if (!type) return true;
  return types.includes(type);
}

/**
 * Read the item type of the reference a field belongs to, out of Tina's form
 * values.
 *
 * Tina names fields by their full path, so "bibliography.3.issn" has to walk to
 * "bibliography.3" to find its sibling type. The walk is guarded at every step:
 * fields live inside a list, so the parent object does not exist yet while a
 * row is being added, and an unguarded walk there took the whole Settings form
 * down once already.
 */
export function referenceTypeAt(fieldName, formValues) {
  if (typeof fieldName !== "string" || !fieldName) return undefined;
  const lastDot = fieldName.lastIndexOf(".");
  const parentPath = lastDot === -1 ? fieldName : fieldName.slice(0, lastDot);
  const parent = parentPath
    .split(".")
    .reduce(
      (value, key) => (value == null ? undefined : value[key]),
      formValues
    );
  return parent?.type;
}
