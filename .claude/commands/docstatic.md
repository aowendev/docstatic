Write or edit a docStatic MDX file following this format exactly.

## Frontmatter (required)

```yaml
---
lastmod: '2026-01-24T11:43:34.275Z'
title: Your Page Title
description: >-
  Brief description for SEO and previews.
tags:
  - software
  - software_content-management-systems_tinacms
draft: false
review: false
translate: false
approved: false
published: true
unlisted: false
---
```

## Components

**Admonitions** (types: `note`, `tip`, `info`, `caution`, `danger`):
```jsx
<Admonition type="tip" title="Title">Content</Admonition>
```

**Figures** (use instead of `![alt](src)` for captioned images):
```jsx
<Figure img="/img/screenshot.png" caption="Caption text" size="75" align="center" />
```

**Details** (collapsible):
```jsx
<Details summary="Click to expand">Hidden content</Details>
```

**Footnotes**:
```jsx
<Footnote summary="Title">Detailed explanation</Footnote>
```

**Comments** (CMS-only, not published):
```jsx
<Comment reviewer="Name" comment="Editorial note" />
```

**CodeSnippet** (embed source files — not for inline examples):
```jsx
<CodeSnippet filename="src/foo.jsx" language="javascript" title="Title" />
```

**Tabs**:
```jsx
<Tabs>
  <TabItem value="mac" label="macOS">Content</TabItem>
  <TabItem value="win" label="Windows">Content</TabItem>
</Tabs>
```

**Other components**: `<ConditionalText conditions="">`, `<Snippet snippet="">`, `<GlossaryTerm term="">SSG</GlossaryTerm>`, `<VariableSet variables="">`, `<Passthrough type="html|jsx" string="" summary="">`

## Rules

- Use `<Admonition>` not `:::note` or `> **Note:**`
- Use `<Footnote>` not `[^1]` footnote syntax
- Use `<Figure>` for documentation images that need captions; plain `![alt](src)` is fine for inline icons/decorative elements
- Use `<CodeSnippet>` only to embed actual project source files; use fenced code blocks for inline examples
- Capitalize component names, close self-closing tags, quote all attribute values
- File locations: `/docs/`, `/blog/`, `/src/pages/`, `/i18n/{locale}/`
