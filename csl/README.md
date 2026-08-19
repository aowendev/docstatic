---
modifiedBy: aowendev <aowen@translationcommons.org>
lastmod: '2026-08-19T14:48:59.816Z'
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
`src/components/Cite/cslTerms.js` against both files, so replacing them with a
newer upstream version will fail the tests rather than silently drift.

Both schemas set `additionalProperties: false`. Anything the generator emits
that is not in them invalidates the whole item, which is why
`NON_CSL_FIELDS` exists - Tina writes `_template` into every list item, and
`cslJson` is docStatic-only.

## Still to vendor

The generator slice adds:

- The `.csl` style sheets (Oxford, Harvard) and a `locales-*.xml`, both from
  [citation-style-language/styles](https://github.com/citation-style-language/styles)
  and [.../locales](https://github.com/citation-style-language/locales).

## Licensing

CSL **styles and locales** are CC BY-SA 3.0, which is not docStatic's MIT
licence. When they are vendored, record each file's upstream URL and pinned
commit here, keep their attribution intact, and note in the root `LICENSE` that
`csl/**` is not covered by the MIT grant. Modifications to a `.csl` file must
stay CC BY-SA.

Confirm the schema repository's own licence before relying on it commercially -
it is separate from the styles repository.
