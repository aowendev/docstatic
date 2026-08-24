---
modifiedBy: aowendev <aowen@translationcommons.org>
lastmod: '2026-08-24T09:02:40.409Z'
---

# CSL schemas and styles

Vendored files from the [Citation Style Language](https://citationstyles.org/)
project. Treat everything here as upstream: do not hand-edit, and record the
provenance of anything added.

| File | Upstream | Purpose |
|---|---|---|
| `csl-citation.json` | [citation-style-language/schema](https://github.com/citation-style-language/schema) | JSON Schema for citation clusters. Governs the `items` array on `<Cite>` - the `label` enum is the authority for the locator dropdown. |
| `csl-data.json` | [citation-style-language/schema](https://github.com/citation-style-language/schema) | JSON Schema for item data. The authority for the reference `type` dropdown and for every property name `mapToCslJson()` may emit. |

`test/citations.test.mjs` checks the dropdowns and the field maps in
`src/components/Cite/cslTerms.mjs` against both files, so replacing them with a
newer upstream version will fail the tests rather than silently drift.

Both schemas set `additionalProperties: false`. Anything the generator emits
that is not in them invalidates the whole item, which is why
`NON_CSL_FIELDS` exists - Tina writes `_template` into every list item, and
`cslJson` is docStatic-only.

## Styles

From [citation-style-language/styles](https://github.com/citation-style-language/styles),
pinned at commit `0819c0e0b7d4a0301ff063521f91818cb697ca5b`. Each is
`https://raw.githubusercontent.com/citation-style-language/styles/<commit>/<file>`.

| File | Class | Style |
|---|---|---|
| `styles/chicago-author-date.csl` | `in-text` | Chicago Manual of Style 18th edition (author-date) |
| `styles/chicago-notes-bibliography.csl` | `note` | Chicago Manual of Style 18th edition (notes and bibliography) |
| `styles/harvard-cite-them-right.csl` | `in-text` | Cite Them Right 12th edition (author-date/Harvard) |
| `styles/ieee.csl` | `in-text` | IEEE Reference Guide |
| `styles/oxford-guide-to-style-notes.csl` | `note` | Oxford Guide to Style (notes) |

`class` decides where a citation goes: `in-text` puts it in the running text,
`note` puts it in a footnote. Both produce a reference list.
`test/bibliography.test.mjs` asserts the class of each file, so a re-vendor that
changes one fails the tests rather than silently moving every citation on the
site into a footnote.

`Settings -> Citations -> Citation style` offers exactly these filenames, and
`scripts/generate-bibliography.mjs` fails the build on a style it cannot find.

## Locales

From [citation-style-language/locales](https://github.com/citation-style-language/locales),
pinned at commit `c8b03ca9535a8613f191c91dd51f4b36c0656523`:
`locales-en-GB.xml`, `locales-en-US.xml`, `locales-de-DE.xml`,
`locales-es-ES.xml`, `locales-fr-FR.xml`, `locales-ja-JP.xml`.

citeproc requires a locale even for English, and the locale is what supplies
quotation marks, date order and terms like "accessed" - which is how the
generated page comes out right in all five site languages without any of it
going through translation.

## Adding a site language

A language the site supports needs its CSL locale vendored here, or its
citations render with English terms, English date order and English quotation
marks. `scripts/generate-citations.mjs` warns when one is missing and names the
file to add.

1. Take `locales-<xx-XX>.xml` from the pinned locales commit above.
2. Drop it in `csl/locales/`. No code change: `localeFor` derives the
   conventional name from the language code, so `it` finds `locales-it-IT.xml`.
   A language whose CSL locale does not follow that pattern needs an entry in
   `CSL_LOCALES` in `scripts/lib/csl.mjs`.
3. Optionally set the references page title for that language in
   `Settings -> Citations -> References page title`. Without one it falls back
   to the English title, since the built-in titles cover only the five languages
   this site ships with.

Both English locales are vendored because only `oxford-guide-to-style-notes`
declares a `default-locale`; the rest declare none, so citeproc falls back to
en-US and renders US dates even under a style that expects day-first ones, such
as Cite Them Right. The `Settings -> Citations -> English variant` field forces
a locale when that matters.

## The engine

citeproc runs at **build time only**, in `scripts/generate-bibliography.mjs`,
and is a devDependency. Formatted strings are written to `src/data/citations.json`
and to the generated page; nothing downstream links the engine. That is
deliberate - see Licensing.

## Licensing

CSL **styles and locales** are CC BY-SA 3.0, confirmed from the README of each
upstream repository. That is not docStatic's MIT licence, so the root `LICENSE`
carries a carve-out for `csl/**`. Keep the attribution inside each file intact.
Any modification to a `.csl` file must stay CC BY-SA - which is a reason not to
modify them: prefer a differently-named local style over editing a vendored one.

The **citeproc** npm package is `CPAL-1.0 OR AGPL-1.0`. Both are copyleft. It is
used unmodified, as a build-time devDependency, and is never redistributed or
linked by anything docStatic ships. **Do not modify or bundle it.**

This is why the generator precomputes: anything consuming citations downstream -
the PDF tool included - reads finished strings from `src/data/citations.json`
and never links citeproc. Keeping that boundary intact is what keeps the
copyleft on this side of it.

Confirm the schema repository's own licence before relying on it commercially -
it is separate from the styles repository. None of this is legal advice; the
commercial position is worth a proper review before release.
