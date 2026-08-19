/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { TextField } from "tinacms";
import bibliographyData from "../../../reuse/bibliography/index.json";
import HelpButton from "../HelpButton";
import {
  isFieldVisible,
  KEY_PATTERN,
  LOCATOR_LABELS,
  REFERENCE_TYPES,
  referenceTypeAt,
} from "./cslTerms";

const HELP_URL =
  "https://docstatic.com/docs/guides/markdown-features/citations";

/**
 * The library is imported at Tina schema-build time to populate the key
 * dropdown, so an absent or malformed file would take down the whole schema
 * build rather than just this field. Scaffolded sites are exactly where the
 * file may be missing, so never map over it unguarded.
 */
function bibliographyEntries() {
  return Array.isArray(bibliographyData?.bibliography)
    ? bibliographyData.bibliography
    : [];
}

function citeKeyOptions() {
  return bibliographyEntries()
    .filter((entry) => entry?.key)
    .map((entry) => ({
      label: entry.title ? `${entry.key} - ${entry.title}` : entry.key,
      value: entry.key,
    }));
}

/**
 * Show a reference field only when it is relevant to the chosen item type.
 *
 * Same shape as showWhenLinkIs in Settings/template.jsx: read the sibling value
 * out of the form, and render nothing when it does not match. The path walk is
 * guarded there because an incomplete path used to throw and take the whole
 * form down, and the same applies here - fields are edited inside a list, so
 * the parent object briefly does not exist while a row is being added.
 */
const showForType = (fieldName, Field) => (props) => {
  const type = React.useMemo(
    () => referenceTypeAt(props.field.name, props.tinaForm.values),
    [props.tinaForm.values, props.field.name]
  );

  if (!isFieldVisible(fieldName, type)) {
    return null;
  }

  return Field(props);
};

export const ContributorTemplate = {
  name: "contributor",
  label: "Contributor",
  ui: {
    itemProps: (item) => ({
      label:
        item?.literal ||
        [item?.family, item?.given].filter(Boolean).join(", ") ||
        "Contributor",
    }),
  },
  fields: [
    {
      type: "string",
      name: "family",
      label: "Family name",
      description:
        "Surname. Leave empty and use Literal name for organisations.",
    },
    {
      type: "string",
      name: "given",
      label: "Given name",
      description: "Forenames or initials.",
    },
    {
      type: "string",
      name: "literal",
      label: "Literal name",
      description:
        'For corporate or organisational authors that must not be split into given and family names, such as "World Health Organization".',
    },
    {
      type: "string",
      name: "suffix",
      label: "Suffix",
      description: 'Generational or honorific suffix, such as "Jr." or "III".',
    },
    {
      type: "string",
      name: "nonDroppingParticle",
      label: "Non-dropping particle",
      description:
        'Particle kept when the name is cited by family name alone: the "van" in "van Gogh", the "de la" in "de la Cruz".',
    },
    {
      type: "string",
      name: "droppingParticle",
      label: "Dropping particle",
      description:
        'Particle dropped when the name is cited by family name alone: the "von" in "Ludwig von Mises", cited as "Mises".',
    },
  ],
};

export const ReferenceTemplate = {
  name: "reference",
  label: "Reference",
  ui: {
    itemProps: (item) => ({
      label: item?.key ? `${item.key} - ${item.title || ""}` : "New reference",
    }),
  },
  fields: [
    {
      type: "string",
      name: "key",
      label: "Citation key",
      isTitle: true,
      required: true,
      description:
        "How citations refer to this source, for example smith2020. Letters, digits, dot, colon, hyphen and underscore. Changing it breaks every citation that uses it.",
      ui: {
        validate: (value, allValues) => {
          if (!value) return "A citation key is required";
          if (!KEY_PATTERN.test(value)) {
            return "Use letters, digits, dot, colon, hyphen or underscore, starting with a letter or digit";
          }
          const entries = Array.isArray(allValues?.bibliography)
            ? allValues.bibliography
            : [];
          const uses = entries.filter((entry) => entry?.key === value).length;
          if (uses > 1) return `The key "${value}" is already used`;
        },
      },
    },
    {
      type: "string",
      name: "type",
      label: "Type",
      required: true,
      options: REFERENCE_TYPES,
      ui: {
        component: "select",
        description: "The kind of source. Styles format each type differently.",
      },
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      required: true,
    },
    {
      type: "string",
      name: "titleShort",
      label: "Short title",
      description: "Shortened form used by note styles for repeat citations.",
    },
    {
      type: "string",
      name: "originalTitle",
      label: "Original title",
      description: "Title of the work this is a translation or reprint of.",
      ui: { component: showForType("originalTitle", TextField) },
    },
    {
      type: "string",
      name: "language",
      label: "Language",
      description: "Language code of the source, such as fr or ja.",
    },
    {
      type: "object",
      name: "authors",
      label: "Authors",
      list: true,
      templates: [ContributorTemplate],
    },
    {
      type: "object",
      name: "editors",
      label: "Editors",
      list: true,
      templates: [ContributorTemplate],
    },
    {
      type: "object",
      name: "translators",
      label: "Translators",
      list: true,
      templates: [ContributorTemplate],
    },
    {
      type: "object",
      name: "containerAuthors",
      label: "Container authors",
      list: true,
      templates: [ContributorTemplate],
    },
    {
      type: "object",
      name: "collectionEditors",
      label: "Series editors",
      list: true,
      templates: [ContributorTemplate],
    },
    {
      type: "string",
      name: "issued",
      label: "Date published",
      description:
        "Year, year-month, or full date: 2020, 2020-05, or 2020-05-01.",
    },
    {
      type: "string",
      name: "originalDate",
      label: "Original date",
      description:
        "Year, year-month, or full date: 2020, 2020-05, or 2020-05-01.",
      ui: { component: showForType("originalDate", TextField) },
    },
    {
      type: "string",
      name: "availableDate",
      label: "Date available",
      description:
        "Year, year-month, or full date: 2020, 2020-05, or 2020-05-01.",
      ui: { component: showForType("availableDate", TextField) },
    },
    {
      type: "string",
      name: "submitted",
      label: "Date submitted",
      description:
        "Year, year-month, or full date: 2020, 2020-05, or 2020-05-01.",
      ui: { component: showForType("submitted", TextField) },
    },
    {
      type: "string",
      name: "accessed",
      label: "Date accessed",
      description:
        "Year, year-month, or full date: 2020, 2020-05, or 2020-05-01.",
    },
    {
      type: "string",
      name: "containerTitle",
      label: "Container title",
      description: "The larger work: the journal, book, website or newspaper.",
      ui: { component: showForType("containerTitle", TextField) },
    },
    {
      type: "string",
      name: "containerTitleShort",
      label: "Container short title",
      description: "Journal abbreviation, such as J. Doc. Pract.",
      ui: { component: showForType("containerTitleShort", TextField) },
    },
    {
      type: "string",
      name: "collectionTitle",
      label: "Series title",
      ui: { component: showForType("collectionTitle", TextField) },
    },
    {
      type: "string",
      name: "collectionNumber",
      label: "Series number",
      ui: { component: showForType("collectionNumber", TextField) },
    },
    {
      type: "string",
      name: "volume",
      label: "Volume",
      ui: { component: showForType("volume", TextField) },
    },
    {
      type: "string",
      name: "volumeTitle",
      label: "Volume title",
      ui: { component: showForType("volumeTitle", TextField) },
    },
    {
      type: "string",
      name: "volumeTitleShort",
      label: "Volume short title",
      ui: { component: showForType("volumeTitleShort", TextField) },
    },
    {
      type: "string",
      name: "numberOfVolumes",
      label: "Number of volumes",
      ui: { component: showForType("numberOfVolumes", TextField) },
    },
    {
      type: "string",
      name: "issue",
      label: "Issue",
      ui: { component: showForType("issue", TextField) },
    },
    {
      type: "string",
      name: "chapterNumber",
      label: "Chapter number",
      ui: { component: showForType("chapterNumber", TextField) },
    },
    {
      type: "string",
      name: "section",
      label: "Section",
      description: "Newspaper or report section.",
      ui: { component: showForType("section", TextField) },
    },
    {
      type: "string",
      name: "part",
      label: "Part",
      ui: { component: showForType("part", TextField) },
    },
    {
      type: "string",
      name: "page",
      label: "Pages",
      description: "Extent of the whole work, for example 112-134.",
      ui: { component: showForType("page", TextField) },
    },
    {
      type: "string",
      name: "numberOfPages",
      label: "Number of pages",
      description: "Total length of a book.",
      ui: { component: showForType("numberOfPages", TextField) },
    },
    {
      type: "string",
      name: "publisher",
      label: "Publisher",
      ui: { component: showForType("publisher", TextField) },
    },
    {
      type: "string",
      name: "publisherPlace",
      label: "Place of publication",
      ui: { component: showForType("publisherPlace", TextField) },
    },
    {
      type: "string",
      name: "originalPublisher",
      label: "Original publisher",
      ui: { component: showForType("originalPublisher", TextField) },
    },
    {
      type: "string",
      name: "originalPublisherPlace",
      label: "Original place of publication",
      ui: { component: showForType("originalPublisherPlace", TextField) },
    },
    {
      type: "string",
      name: "edition",
      label: "Edition",
      ui: { component: showForType("edition", TextField) },
    },
    {
      type: "string",
      name: "genre",
      label: "Genre",
      description:
        "The kind of work in the source's own words: PhD thesis, technical report, working paper.",
      ui: { component: showForType("genre", TextField) },
    },
    {
      type: "string",
      name: "number",
      label: "Number",
      description: "Report, standard or patent number.",
      ui: { component: showForType("number", TextField) },
    },
    {
      type: "string",
      name: "medium",
      label: "Medium",
      description: "Format or carrier: PDF, CD-ROM, video.",
      ui: { component: showForType("medium", TextField) },
    },
    {
      type: "string",
      name: "version",
      label: "Version",
      description: "Version of software, a dataset or a standard.",
      ui: { component: showForType("version", TextField) },
    },
    {
      type: "string",
      name: "status",
      label: "Status",
      description: "Publication status, such as forthcoming or in press.",
      ui: { component: showForType("status", TextField) },
    },
    {
      type: "string",
      name: "eventTitle",
      label: "Event title",
      description: "Conference or meeting the paper was presented at.",
      ui: { component: showForType("eventTitle", TextField) },
    },
    {
      type: "string",
      name: "eventPlace",
      label: "Event place",
      ui: { component: showForType("eventPlace", TextField) },
    },
    {
      type: "string",
      name: "eventDate",
      label: "Event date",
      ui: { component: showForType("eventDate", TextField) },
    },
    {
      type: "string",
      name: "authority",
      label: "Authority",
      description: "Issuing body: the court, legislature or patent office.",
      ui: { component: showForType("authority", TextField) },
    },
    {
      type: "string",
      name: "jurisdiction",
      label: "Jurisdiction",
      ui: { component: showForType("jurisdiction", TextField) },
    },
    {
      type: "string",
      name: "doi",
      label: "DOI",
      description: "Bare identifier, without the https://doi.org/ prefix.",
      ui: { component: showForType("doi", TextField) },
    },
    {
      type: "string",
      name: "isbn",
      label: "ISBN",
      ui: { component: showForType("isbn", TextField) },
    },
    {
      type: "string",
      name: "issn",
      label: "ISSN",
      ui: { component: showForType("issn", TextField) },
    },
    {
      type: "string",
      name: "pmid",
      label: "PMID",
      ui: { component: showForType("pmid", TextField) },
    },
    {
      type: "string",
      name: "pmcid",
      label: "PMCID",
      ui: { component: showForType("pmcid", TextField) },
    },
    {
      type: "string",
      name: "url",
      label: "URL",
    },
    {
      type: "string",
      name: "archive",
      label: "Archive",
      description: "Repository holding the original.",
      ui: { component: showForType("archive", TextField) },
    },
    {
      type: "string",
      name: "archiveCollection",
      label: "Archive collection",
      ui: { component: showForType("archiveCollection", TextField) },
    },
    {
      type: "string",
      name: "archiveLocation",
      label: "Location in archive",
      ui: { component: showForType("archiveLocation", TextField) },
    },
    {
      type: "string",
      name: "archivePlace",
      label: "Archive place",
      ui: { component: showForType("archivePlace", TextField) },
    },
    {
      type: "string",
      name: "callNumber",
      label: "Call number",
      ui: { component: showForType("callNumber", TextField) },
    },
    {
      type: "string",
      name: "abstract",
      label: "Abstract",
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "note",
      label: "Note",
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "cslJson",
      label: "Raw CSL-JSON override",
      description:
        "Advanced. Valid CSL-JSON for this entry, used instead of the fields above when filled in. For sources the fields above cannot express. The citation key is always taken from the Citation key field.",
      ui: {
        component: "textarea",
        validate: (value) => {
          if (!value) return;
          try {
            const parsed = JSON.parse(value);
            if (
              typeof parsed !== "object" ||
              parsed === null ||
              Array.isArray(parsed)
            ) {
              return "Enter a single CSL-JSON object, not an array or a bare value";
            }
          } catch (error) {
            return `Not valid JSON: ${error.message}`;
          }
        },
      },
    },
  ],
};

export const BibliographyCollection = {
  label: "Bibliography",
  name: "bibliography",
  path: "reuse/bibliography",
  format: "json",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => <HelpButton url={HELP_URL} {...props} />,
      },
    },
    {
      type: "object",
      name: "bibliography",
      label: "References",
      list: true,
      templates: [ReferenceTemplate],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

export const CiteItemTemplate = {
  name: "item",
  label: "Source",
  ui: {
    itemProps: (item) => ({
      label: item?.locator
        ? `${item.key} (${item.locator})`
        : item?.key || "Source",
    }),
  },
  fields: [
    {
      name: "key",
      label: "Source",
      type: "string",
      isTitle: true,
      required: true,
      options: citeKeyOptions(),
      ui: {
        component: "select",
        description: "Select a source from the Bibliography collection",
      },
    },
    {
      name: "locator",
      label: "Locator",
      type: "string",
      description:
        'The part being cited, as a bare value: 14, 14-16, vii. Do not type "p." - the citation style adds it.',
    },
    {
      name: "label",
      label: "Locator type",
      type: "string",
      options: LOCATOR_LABELS,
      ui: {
        component: "select",
        description: "What the locator counts. Defaults to page.",
      },
    },
    {
      name: "prefix",
      label: "Prefix",
      type: "string",
      description: 'Text before the citation, for example "see also".',
    },
    {
      name: "suffix",
      label: "Suffix",
      type: "string",
      description: "Text after the citation.",
    },
    {
      name: "suppressAuthor",
      label: "Suppress author",
      type: "boolean",
      description:
        'Omit the author, for when the sentence already names them: "Smith (2020) argued...".',
    },
  ],
};

export const CiteBlockTemplate = {
  name: "Cite",
  label: "Citation",
  inline: true,
  ui: {
    itemProps: (item) => {
      const items = Array.isArray(item?.items) ? item.items : [];
      const keys = items.map((entry) => entry?.key).filter(Boolean);
      if (keys.length === 0) return { label: "Citation" };
      return {
        label:
          keys.length === 1 ? keys[0] : `${keys[0]} +${keys.length - 1} more`,
      };
    },
  },
  fields: [
    {
      type: "object",
      name: "items",
      label: "Sources",
      list: true,
      required: true,
      templates: [CiteItemTemplate],
      description:
        "One citation may cite several sources. Listing them together lets the citation style combine them, for example as [1-3] or (Smith 2020a, 2020b).",
      ui: {
        validate: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            return "A citation needs at least one source";
          }
        },
      },
    },
  ],
};
