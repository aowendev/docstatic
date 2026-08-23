/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The one walk that decides note numbering.
 *
 * Both scripts/generate-citations.mjs and src/plugins/remark-citations.mjs use
 * this module. That is not tidiness - it is the invariant the whole design
 * rests on. The generator has to know each citation's note number *before* it
 * calls citeproc, because citeproc picks "Ibid." over a short form from
 * `citation.properties.noteIndex`. The plugin then has to arrive at exactly the
 * same numbers when it rewrites the page. Two walks that disagree would
 * mis-number every note after the first divergence, silently. So there is one
 * walk, here, and both import it.
 *
 * Node-only (it is used at build time by a script and by a remark plugin), so
 * it may use the full unified stack.
 */

import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

/** Components that participate in the note sequence. */
export const FOOTNOTE_TAG = "Footnote";
export const CITE_TAG = "Cite";

/**
 * The parser configuration, shared so the generator and the plugin see the same
 * tree. remark-mdx must be v3 to match the AST Docusaurus's own pipeline builds;
 * package.json pins it, because a hoisted v2 (Tina depends on one) produces a
 * different attribute shape.
 */
export function createProcessor() {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
}

/**
 * Parse a page body.
 *
 * Frontmatter is stripped first, not parsed. Docusaurus strips it before the
 * tree ever reaches a remark plugin, so leaving it in would make the generator
 * see a different document from the plugin. It would also simply fail: this
 * project writes `modifiedBy: aowendev <aowen@example.org>`, and MDX reads that
 * angle bracket as the start of a JSX tag.
 */
export function parseMdx(source) {
  return createProcessor().parse(matter(source).content);
}

function isJsxElement(node) {
  return node.type === "mdxJsxTextElement" || node.type === "mdxJsxFlowElement";
}

/**
 * Evaluate a literal estree expression - the `items={[...]}` on a citation.
 *
 * Deliberately not eval: the attribute is authored content, and a build step
 * that executes authored content is a foothold. Only literal data is
 * understood; anything else (a variable, a call, a spread) returns undefined,
 * and the caller reports it as an unreadable citation rather than guessing.
 */
export function literalFromEstree(node) {
  if (!node) return undefined;

  switch (node.type) {
    case "Literal":
      return node.value;
    case "ArrayExpression": {
      const out = [];
      for (const element of node.elements) {
        if (element === null) return undefined;
        const value = literalFromEstree(element);
        if (value === undefined) return undefined;
        out.push(value);
      }
      return out;
    }
    case "ObjectExpression": {
      const out = {};
      for (const property of node.properties) {
        if (property.type !== "Property" || property.computed) return undefined;
        const key =
          property.key.type === "Identifier"
            ? property.key.name
            : property.key.value;
        if (typeof key !== "string") return undefined;
        const value = literalFromEstree(property.value);
        if (value === undefined) return undefined;
        out[key] = value;
      }
      return out;
    }
    case "UnaryExpression": {
      const argument = literalFromEstree(node.argument);
      if (typeof argument !== "number") return undefined;
      return node.operator === "-" ? -argument : argument;
    }
    case "Identifier":
      return node.name === "undefined" ? null : undefined;
    default:
      return undefined;
  }
}

/** The `items` array authored on a <Cite>, or undefined if unreadable. */
export function readCiteItems(node) {
  const attribute = (node.attributes ?? []).find(
    (a) => a.type === "mdxJsxAttribute" && a.name === "items"
  );
  if (!attribute) return undefined;

  const estree = attribute.value?.data?.estree;
  const expression = estree?.body?.[0]?.expression;
  const value = literalFromEstree(expression);

  return Array.isArray(value) ? value : undefined;
}

/**
 * Walk a page in document order and assign note numbers.
 *
 * Returns entries in the order they appear, each carrying the note index it was
 * given. The rules, and why:
 *
 * - A <Footnote> always takes the next note number. Author footnotes exist
 *   independently of citation style.
 * - Under a note style, a top-level <Cite> takes the next note number too:
 *   Oxford and Chicago both number notes "consecutively throughout", and a
 *   citation in a note style *is* a note.
 * - A <Cite> inside a <Footnote> takes that footnote's number rather than a new
 *   one. Chicago: "When a note contains the source and substantive material,
 *   the source appears first" - one note, holding both.
 * - Under an in-text style a top-level <Cite> gets noteIndex 0, citeproc's
 *   value for "not in a note".
 */
export function collectNotes(tree, { noteStyle = false } = {}) {
  const entries = [];
  const seen = new Map();
  let noteCount = 0;

  const walk = (node, enclosingNote) => {
    if (isJsxElement(node) && node.name === FOOTNOTE_TAG) {
      const key = footnoteKey(node);
      const repeat = seen.has(key);
      if (!repeat) {
        noteCount += 1;
        seen.set(key, noteCount);
      }
      const noteIndex = seen.get(key);

      entries.push({ kind: "footnote", noteIndex, repeat, node });
      for (const child of node.children ?? []) walk(child, noteIndex);
      return;
    }

    if (isJsxElement(node) && node.name === CITE_TAG) {
      let noteIndex;
      if (enclosingNote != null) {
        noteIndex = enclosingNote;
      } else if (noteStyle) {
        noteCount += 1;
        noteIndex = noteCount;
      } else {
        noteIndex = 0;
      }

      entries.push({
        kind: "cite",
        noteIndex,
        nested: enclosingNote != null,
        items: readCiteItems(node),
        node,
      });
      return;
    }

    for (const child of node.children ?? []) walk(child, enclosingNote);
  };

  for (const child of tree.children ?? []) walk(child, null);

  return { entries, noteCount };
}

/**
 * A stable key for a footnote's content, so two identical footnotes share a
 * number.
 *
 * This preserves behaviour the footnotes guide documents ("If two footnotes
 * have the same content, they will only appear once in the footer and will
 * share a number") and that the previous client-side implementation provided
 * via generateFootnoteKey. Position data is dropped: the same words written in
 * two places are the same note, and their offsets in the file are not.
 *
 * Citations are deliberately excluded. A repeated citation is not a repeated
 * note - the style shortens the second one instead, which is a decision
 * citeproc makes from the note numbers.
 */
export function footnoteKey(node) {
  return JSON.stringify(node.children ?? [], (key, value) =>
    key === "position" ? undefined : value
  );
}

/** Citations only, in document order - the clusters citeproc is handed. */
export function citeEntries(entries) {
  return entries.filter((entry) => entry.kind === "cite");
}
