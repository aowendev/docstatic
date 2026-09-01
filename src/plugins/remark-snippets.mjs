/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Inline <Snippet> into the page at build time.
 *
 * The component this replaces resolved its file in a useEffect, so every
 * served page carried the string "Loading snippet..." where the reused text
 * should have been. The text reached the reader only after hydration, which
 * put it in no static page and in no search index - on the one feature whose
 * whole purpose is that a paragraph written once appears everywhere.
 *
 * Inlining rather than a build-time import
 * ---------------------------------------
 * Turning the snippet into a static `import` would also have produced static
 * HTML, but the snippet would stay a separate compilation: its headings would
 * carry no anchors and miss the page's table of contents, its admonitions and
 * relative links would resolve against nothing, and a <Cite> or <Footnote>
 * inside it would number itself independently of the page it sits in.
 * Splicing the snippet's nodes into the page's own tree means the rest of the
 * pipeline cannot tell inlined content from authored content, so all of that
 * falls out for free.
 *
 * That is also why this must run as a `beforeDefaultRemarkPlugins` entry.
 * Docusaurus runs user `remarkPlugins` *after* its own defaults, so a snippet
 * spliced from there would arrive too late for headings, toc, admonitions and
 * the image and link transforms - the very things that make it page content.
 * Running first is the point; see docusaurus.config.ts.
 *
 * The parser is the page's own
 * ----------------------------
 * `processor.parse` is the host processor, already configured with every
 * micromark extension this site parses with - MDX, GFM, directives, math,
 * frontmatter. Re-declaring that stack here would work today and drift the
 * first time the site adds a remark plugin, leaving snippets parsing by
 * subtly different rules than the pages that include them.
 *
 * Liveness
 * --------
 * Inlined content is baked into the compiled page, so the bundler has no
 * reason to recompile a page when a snippet it uses changes. That is what
 * src/plugins/docusaurus-plugin-snippets.js exists to restore: it registers
 * the snippet directories as webpack dependencies of any page that mentions a
 * snippet, so a CMS edit still reaches the browser without a restart.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "@docusaurus/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");
const SITE_CONFIG = path.join(ROOT, "config/docusaurus/index.json");

/** The component this plugin consumes; still registered in MDXComponents. */
const TAG = "Snippet";

let defaultLocaleCache;

function defaultLocale() {
  if (defaultLocaleCache) return defaultLocaleCache;
  try {
    const data = JSON.parse(fs.readFileSync(SITE_CONFIG, "utf8"));
    defaultLocaleCache = data.languages?.default || "en";
  } catch {
    defaultLocaleCache = "en";
  }
  return defaultLocaleCache;
}

/**
 * The locale the current compilation is *for*, which is not the same as the
 * locale of the file being compiled: a page that has not been translated yet
 * is compiled from docs/ during a translated build, and still has to reach
 * for the translated snippet. Reading the env var rather than deriving a
 * locale from the file path is the build-time equivalent of what the old
 * component did when it read `document.documentElement.lang`.
 *
 * `docusaurus start` with no --locale assigns undefined to the variable, which
 * process.env stringifies; that means the default locale.
 */
function currentLocale() {
  const locale = process.env.DOCUSAURUS_CURRENT_LOCALE;
  return locale && locale !== "undefined" ? locale : defaultLocale();
}

/**
 * Where a snippet may be read from, in precedence order. Translations win, and
 * English remains the fallback, which is the behaviour authors already had.
 */
export function snippetDirs(locale = currentLocale()) {
  const dirs = [];
  if (locale !== defaultLocale()) {
    dirs.push(path.join(ROOT, "i18n", locale, "snippets"));
  }
  dirs.push(path.join(ROOT, "reuse/snippets"));
  return dirs;
}

/**
 * `filepath` comes from a content file, so it is checked to stay inside the
 * directory it is resolved against rather than trusted to be a bare name.
 */
function within(dir, filepath) {
  const resolved = path.resolve(dir, filepath);
  const rel = path.relative(dir, resolved);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return resolved;
}

function resolveSnippet(filepath, locale) {
  for (const dir of snippetDirs(locale)) {
    const candidate = within(dir, filepath);
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** The authored `filepath`, or null if this node is not a resolvable snippet. */
function snippetPath(node) {
  if (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement") {
    return null;
  }
  if (node.name !== TAG) return null;

  const attr = node.attributes?.find(
    (a) => a.type === "mdxJsxAttribute" && a.name === "filepath"
  );
  return typeof attr?.value === "string" ? attr.value : null;
}

/** A snippet file's own frontmatter is metadata for the CMS, not content. */
function stripFrontmatter(children) {
  let i = 0;
  while (
    i < children.length &&
    (children[i].type === "yaml" || children[i].type === "toml")
  ) {
    i += 1;
  }
  return children.slice(i);
}

/**
 * A snippet used mid-sentence is nearly always a phrase, so a single paragraph
 * is unwrapped to its inline children and joins the sentence instead of
 * splitting it in two. Anything longer is spliced whole - the same shape the
 * client-side component used to render there.
 */
function forInlineUse(children) {
  const blocks = children.filter((n) => n.type !== "mdxjsEsm");
  return blocks.length === 1 && blocks[0].type === "paragraph"
    ? blocks[0].children
    : children;
}

/** Docusaurus's own logger, so a snippet problem reads like every other
 * build warning rather than a stray console line. */
function warn(message, file) {
  const page = file?.path ? path.relative(ROOT, file.path) : "unknown file";
  logger.warn(`Snippet: ${message} (in ${page})`);
}

export default function remarkSnippets() {
  return (tree, file) => {
    const locale = currentLocale();

    // Two snippets on one page may each carry the same import. MDX puts ESM at
    // the top level of the compiled module, where a repeated declaration is a
    // build error rather than a duplicate.
    const seenEsm = new Set();

    /**
     * A snippet file parsed as if its text had been typed into this page.
     * `this` is the host processor - the arrow chain keeps it in scope - so
     * the snippet is parsed by the page's own configuration.
     */
    const parseSnippet = (absPath, stack) => {
      const root = this.parse(fs.readFileSync(absPath, "utf8"));
      const children = stripFrontmatter(root.children);
      // A snippet may include a snippet; resolve those before splicing.
      const holder = { children };
      transform(holder, stack);
      return holder.children;
    };

    const transform = (parent, stack) => {
      if (!Array.isArray(parent.children)) return;
      const out = [];

      const emit = (nodes) => {
        for (const node of nodes) {
          if (node.type === "mdxjsEsm") {
            if (seenEsm.has(node.value)) continue;
            seenEsm.add(node.value);
          }
          out.push(node);
        }
      };

      for (const child of parent.children) {
        if (child.name !== TAG) {
          transform(child, stack);
          out.push(child);
          continue;
        }

        const filepath = snippetPath(child);

        // Anything left unresolved keeps its node, and the Snippet component
        // renders the same NOT FOUND marker a missing glossary term or
        // citation does - in place, without failing the build.
        if (!filepath) {
          warn(`<Snippet> needs a literal filepath`, file);
          out.push(child);
          continue;
        }

        const absPath = resolveSnippet(filepath, locale);
        if (!absPath) {
          warn(`snippet not found: ${filepath}`, file);
          out.push(child);
          continue;
        }
        if (stack.includes(absPath)) {
          warn(`snippet includes itself: ${filepath}`, file);
          out.push(child);
          continue;
        }

        const children = parseSnippet(absPath, [...stack, absPath]);
        emit(
          child.type === "mdxJsxTextElement" ? forInlineUse(children) : children
        );
      }

      parent.children = out;
    };

    transform(tree, []);
  };
}
