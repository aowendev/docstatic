/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Minimal XLIFF 2.2 helpers for exporting/importing translation bundles
// Exports title and body as JSON string in <target> so MDX/React content is preserved.

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeXmlWithLineBreaks(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  // Normalize newlines
  let s = String(unsafe);
  // Match all common newline sequences (CRLF, CR, LF) and normalize to a
  // placeholder so we can safely escape XML and then restore XLIFF <lb/> tags.
  const LB = '___XLIFF_LB___';
  s = s.replace(/\r\n|\r|\n/g, LB);
  s = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  // restore real XLIFF line-break tags
  return s.replace(new RegExp(LB, 'g'), '<lb/>');
}

// Escape XML but preserve real newline characters so XLIFF consumers
// (and CAT tools like Swordfish) can round-trip actual line breaks.
function escapeXmlPreserveNewlines(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Annotate JSX component occurrences inside raw MDX/markdown strings so that
// stringy prop values and simple children are included in the exported
// source text (translators need to see prop text even when it's inside an
// attribute). This works on plain strings and is intentionally conservative —
// it only tries to extract simple quoted/templated prop values.
function annotateJsxPropsAndChildren(text) {
  if (!text || typeof text !== 'string') return text;

  // regex to capture simple prop string forms: "..." or '...' or `{`...`}` or {"..."}
  const propStringRe = /([a-zA-Z0-9_:-]+)=?(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\})/g;

  // 1) handle self-closing tags: <Comp prop="x" /> -> append annotation after tag
  text = text.replace(/<([A-Z][\w]*)\b([^>]*)\/>/g, (m, name, propsPart) => {
    const vals = [];
    let p;
    while ((p = propStringRe.exec(propsPart)) !== null) {
      const v = p[2] || p[3] || p[4] || p[5] || p[6] || '';
      if (v) vals.push(`${p[1]}:${v}`);
    }
    if (vals.length) return `${m} (${vals.join(', ')})`;
    return m;
  });

  // 2) handle open tags with attributes: <Comp prop="x"> -> inject annotation immediately after the opening tag
  text = text.replace(/<([A-Z][\w]*)\b([^>]*)>/g, (m, name, propsPart) => {
    // skip closing tags which also match pattern (they start with </)
    if (/^<\//.test(m)) return m;
    // skip tags that are clearly HTML tags (lowercase) by checking the captured name
    const vals = [];
    let p;
    while ((p = propStringRe.exec(propsPart)) !== null) {
      const v = p[2] || p[3] || p[4] || p[5] || p[6] || '';
      if (v) vals.push(`${p[1]}:${v}`);
    }
    if (vals.length) return `${m}${vals.length ? ' (' + vals.join(', ') + ')' : ''}`;
    return m;
  });

  return text;
}

// Also annotate marker-form components (jsx:... ) so prop annotations appear
// when we converted angle-brackets to marker form for CAT tools.
function annotateMarkerProps(text) {
  if (!text || typeof text !== 'string') return text;
  const propStringRe = /([a-zA-Z0-9_:-]+)=?(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{\s*"([^"}]*)"\s*\}|\{\s*'([^'}]*)'\s*\})/g;
  // self-closing marker: (jsx:Name prop="x"/)
  text = text.replace(/\(jsx:([A-Z][\w-]*)\b([^\)]*)\/\)/g, (m, name, propsPart) => {
    const vals = [];
    let p;
    while ((p = propStringRe.exec(propsPart)) !== null) {
      const v = p[2] || p[3] || p[4] || p[5] || p[6] || '';
      if (v) vals.push(`${p[1]}:${v}`);
    }
    if (vals.length) return `${m} (${vals.join(', ')})`;
    return m;
  });
  // open marker: (jsx:Name prop="x") -> append annotation after marker
  text = text.replace(/\(jsx:([A-Z][\w-]*)\b([^\)]*)\)/g, (m, name, propsPart) => {
    // skip closing markers which look like (/jsx:Name)
    if (/^\(\/jsx:/.test(m)) return m;
    const vals = [];
    let p;
    while ((p = propStringRe.exec(propsPart)) !== null) {
      const v = p[2] || p[3] || p[4] || p[5] || p[6] || '';
      if (v) vals.push(`${p[1]}:${v}`);
    }
    if (vals.length) return `${m}${vals.length ? ' (' + vals.join(', ') + ')' : ''}`;
    return m;
  });
  return text;
}

// Convert angle-bracket JSX/MDX to a robust marker form that begins with
// `(jsx:` so CAT tools like Swordfish won't treat tags as HTML and drop the
// component name. Examples:
//   <Figure img="x" caption="y" />  -> (jsx:Figure img="x" caption="y"/)
//   <Comp prop="v">child</Comp>     -> (jsx:Comp prop="v")child(/jsx:Comp)
function angleToMarker(source) {
  if (!source || typeof source !== 'string') return source;
  // Robust pass: convert tags that include a children={...} prop where the
  // prop value may contain nested braces or newlines. Regex alone can fail
  // on nested braces, so scan for balanced braces and replace each occurrence.
  source = (function scanChildrenProps(s) {
    let out = '';
    let idx = 0;
    while (true) {
      const m = s.slice(idx).match(/<([A-Z][\w-]*)\b[^>]*?\bchildren=\{/);
      if (!m) { out += s.slice(idx); break; }
      const matchIndex = idx + m.index;
      out += s.slice(idx, matchIndex);
      const tagStart = matchIndex;
      // find position of '{' that starts the children value
      const bracePos = s.indexOf('{', tagStart + m[0].length - 1);
      if (bracePos === -1) { out += s.slice(matchIndex); break; }
      // scan for matching closing '}' with nesting
      let depth = 0;
      let j = bracePos;
      for (; j < s.length; j++) {
        const ch = s[j];
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) { j++; break; }
        }
      }
      if (depth !== 0) { out += s.slice(matchIndex); break; }
      const children = s.slice(bracePos + 1, j - 1 + 1); // content inside braces
      // now find end of tag '>' after the children prop
      const tagEnd = s.indexOf('>', j);
      if (tagEnd === -1) { out += s.slice(matchIndex); break; }
      const fullTag = s.slice(tagStart, tagEnd + 1);
      // remove the children={...} piece from fullTag
      const withoutChildren = fullTag.replace(/\bchildren=\{[\s\S]*?\}/, '').replace(/\s+/g, ' ').trim();
      // determine if it was self-closing
      const selfClosing = /\/>\s*$/.test(fullTag);
      const propsStr = withoutChildren.replace(/^<[^\s]+/, '').replace(/^[\s>]+|[\s>]+$/g, '').trim();
      const p = propsStr ? ' ' + propsStr : '';
      out += `(jsx:${m[1]}${p})${children}(/jsx:${m[1]})`;
      idx = tagEnd + 1;
    }
    return out;
  })(source);
  // self-closing
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)\/>/g, (_m, name, props) => {
    const p = props.trim().replace(/\s+/g, ' ');
    return `(jsx:${name}${p ? ' ' + p : ''}/)`;
  });
  // tags that pass content via a children={...} prop (no inner text)
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)\bchildren=\{([\s\S]*?)\}([^>]*)\/?>/g, (_m, name, before, child, after) => {
    // merge remaining props (before + after) and trim
    const props = (before + ' ' + after).trim().replace(/\s+/g, ' ');
    const p = props ? ' ' + props : '';
    return `(jsx:${name}${p})${child}(/jsx:${name})`;
  });
  // paired tags (non-greedy children)
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (_m, name, props, children) => {
    const p = props.trim().replace(/\s+/g, ' ');
    return `(jsx:${name}${p ? ' ' + p : ''})${children}(/jsx:${name})`;
  });
  return source;
}

// Convert marker form back to angle-bracket JSX/MDX
function markerToAngle(source) {
  if (!source || typeof source !== 'string') return source;
  // paired tags first
  source = source.replace(/\(jsx:([A-Z][\w-]*)\b([^\)]*)\)([\s\S]*?)\(\/jsx:\1\)/g, (_m, name, props, children) => {
    const p = props.trim();
    return `<${name}${p ? ' ' + p : ''}>${children}</${name}>`;
  });
  // self-closing marker
  // self-closing marker
  source = source.replace(/\(jsx:([A-Z][\w-]*)\b([^\)]*)\/\)/g, (_m, name, props) => {
    const p = props.trim();
    return `<${name}${p ? ' ' + p : ''} />`;
  });
  // alternate self-closing without extra paren (from earlier replacement)
  source = source.replace(/\(jsx:([A-Z][\w-]*)\b([^\)]*)\/\)/g, (_m, name, props) => {
    const p = props.trim();
    return `<${name}${p ? ' ' + p : ''} />`;
  });
  return source;
}

// Read an XML element while treating XLIFF <lb/> elements as newline characters.
function readElementTextPreservingLineBreaks(el) {
  if (!el) return '';
  let s = '';
  const nodes = Array.from(el.childNodes || []);
  for (const node of nodes) {
    if (node.nodeType === 3) {
      s += node.nodeValue || '';
    } else if (node.nodeType === 1) {
      const tag = (node.tagName || '').toLowerCase();
      if (tag === 'lb') s += '\n';
      else s += node.textContent || '';
    }
  }
  return s;
}

function extractFrontmatter(text) {
  if (!text) return { metadata: {}, body: text || '' };
  const m = String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { metadata: {}, body: text };
  const fmRaw = m[1];
  const body = text.slice(m[0].length);
  const metadata = {};
  fmRaw.split(/\n/).forEach((line) => {
    const kv = line.match(/^([A-Za-z0-9_\-]+):\s*(?:"([^"]+)"|'([^']+)'|(.+))?$/);
    if (kv) {
      metadata[kv[1]] = (kv[2] || kv[3] || (kv[4] || '')).trim();
    }
  });
  return { metadata, body };
}

function serializeRichTextToMarkdown(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(serializeRichTextToMarkdown).join('');
  const type = node.type;
  switch (type) {
    case 'root':
      return (node.children || []).map(serializeRichTextToMarkdown).join('\n\n');
    case 'p':
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const depth = parseInt(type.slice(1), 10) || 1;
      const prefix = '#'.repeat(Math.max(1, Math.min(6, depth)));
      const content = (node.children || []).map(serializeRichTextToMarkdown).join('');
      return `${prefix} ${content}`;
    }
    case 'heading': {
      const depth = node.depth || 1;
      const prefix = '#'.repeat(Math.max(1, Math.min(6, depth)));
      const content = (node.children || []).map(serializeRichTextToMarkdown).join('');
      return `${prefix} ${content}`;
    }
    case 'code': {
      const lang = node.lang || '';
      const content = node.value || (node.children || []).map(serializeRichTextToMarkdown).join('');
      return '\n\n```' + (lang ? ' ' + lang : '') + '\n' + content + '\n```\n\n';
    }
    case 'hr':
      return '\n\n---\n\n';
    case 'break':
      // represent an explicit hard line-break within a paragraph
      return '\n';
    case 'blockquote': {
      const content = (node.children || []).map(serializeRichTextToMarkdown).join('\n');
      return content.split('\n').map(line => `> ${line}`).join('\n');
    }
    case 'text': {
      let txt = node.text || '';
      if (node.bold) txt = `**${txt}**`;
      if (node.italic) txt = `_${txt}_`;
      return txt;
    }
    case 'inlineCode':
      return `\`${node.value || node.text || ''}\``;
    case 'ol': {
      return (node.children || []).map((li, idx) => {
        const content = (li.children || []).map(serializeRichTextToMarkdown).join('');
        return `${idx + 1}. ${content}`;
      }).join('\n');
    }
    case 'ul': {
      return (node.children || []).map((li) => {
        const content = (li.children || []).map(serializeRichTextToMarkdown).join('');
        return `- ${content}`;
      }).join('\n');
    }
    case 'li':
    case 'lic':
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
    case 'link': {
      const text = (node.children || []).map(serializeRichTextToMarkdown).join('') || node.title || '';
      const href = node.url || node.href || '';
      return href ? `[${text}](${href})` : text;
    }
    case 'image': {
      const alt = node.alt || node.title || '';
      const src = node.url || node.src || '';
      return `![${alt}](${src})`;
    }
    case 'jsx':
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement': {
        // prefer verbatim value if present
        if (node.value) return node.value;

        // helper to serialize attributes into tag props string
        const propsToString = (attrs) => {
          if (!attrs || !attrs.length) return '';
          return attrs.map(attr => {
            if (attr.value === true || attr.value === undefined) return attr.name;
            // If value is a simple string, keep it quoted
            if (typeof attr.value === 'string') return `${attr.name}=${JSON.stringify(attr.value)}`;
            // If value looks like a small AST/MDX node, try to serialize its children
            try {
              if (Array.isArray(attr.value)) return `${attr.name}={${attr.value.map(serializeRichTextToMarkdown).join('')}}`;
              if (attr.value && typeof attr.value === 'object') {
                if (attr.value.children) return `${attr.name}={${serializeRichTextToMarkdown(attr.value)}}`;
                if (attr.value.value && typeof attr.value.value === 'string') return `${attr.name}=${JSON.stringify(attr.value.value)}`;
              }
              return `${attr.name}=${JSON.stringify(attr.value)}`;
            } catch (e) {
              return `${attr.name}=${String(attr.value)}`;
            }
          }).join(' ');
        };

        // Try several places where inner content may be stored:
        // 1. node.children (usual mdx AST)
        // 2. node.attributes entry named 'children' (Tina templates sometimes store nested rich-text here)
        // 3. node._values or node.raw/_raw which may contain serialized content
        const tryChildren = (candidate) => {
          if (!candidate) return '';
          // candidate might be an array, a root-like object, or a simple string
          if (typeof candidate === 'string') return candidate;
          if (Array.isArray(candidate)) return candidate.map(serializeRichTextToMarkdown).join('');
          if (candidate.type === 'root' || candidate.children) return serializeRichTextToMarkdown(candidate);
          // fallback: try JSON string
          try { return JSON.stringify(candidate); } catch (e) { return String(candidate); }
        };

        // 1) children — but if children serialize to an empty string, prefer
        // attribute/props-based serialization so components that store props
        // (e.g. `Figure` with `caption`) aren't dropped when the AST contains
        // an empty text child.
        if (node.children && node.children.length) {
          const children = tryChildren(node.children);
          if (String(children || '').trim()) {
            const props = propsToString(node.attributes);
            const open = node.name ? (props ? `<${node.name} ${props}>` : `<${node.name}>`) : '';
            const close = node.name ? `</${node.name}>` : '';
            return `${open}${children}${close}`;
          }
          // else fall through and allow props/attributes to provide content
        }

        // 2) attributes with name 'children'
        if (node.attributes && node.attributes.length) {
          const childAttr = node.attributes.find(a => a.name === 'children' && (a.value !== undefined && a.value !== null));
          if (childAttr) {
            const props = propsToString(node.attributes.filter(a => a.name !== 'children'));
            const open = node.name ? (props ? `<${node.name} ${props}>` : `<${node.name}>`) : '';
            const children = tryChildren(childAttr.value);
            const close = node.name ? `</${node.name}>` : '';
            return `${open}${children}${close}`;
          }
        }

        // 2b) Tina AST may put JSX props under `props` instead of `attributes`.
        // Support `node.props.children` which often contains a nested AST.
        if (node.props && node.props.children) {
          const props = propsToString(Object.keys(node.props).map(k => ({ name: k, value: node.props[k] })));
          const open = node.name ? (props ? `<${node.name} ${props}>` : `<${node.name}>`) : '';
          const children = tryChildren(node.props.children);
          const close = node.name ? `</${node.name}>` : '';
          return `${open}${children}${close}`;
        }

        // 3) _values/raw/_raw
        if (node._values) {
          const inner = tryChildren(node._values.children || node._values);
          if (inner) {
            const props = propsToString(node.attributes);
            const open = node.name ? (props ? `<${node.name} ${props}>` : `<${node.name}>`) : '';
            const close = node.name ? `</${node.name}>` : '';
            return `${open}${inner}${close}`;
          }
        }
        if (node.raw || node._raw) {
          return String(node._raw || node.raw);
        }

        // last resort: emit empty element with props preserved. Prefer
        // `node.props` (Tina AST) when available, otherwise fall back to
        // `node.attributes` (mdx AST). This makes the handling generic for
        // any component (Figure, DocCardList, Passthrough, CodeSnippet, etc.).
        if (node.name) {
          let props = propsToString(node.attributes);
          if ((!props || !String(props).trim()) && node.props) {
            props = propsToString(Object.keys(node.props).map(k => ({ name: k, value: node.props[k] })));
          }
          return props ? `<${node.name} ${props}></${node.name}>` : `<${node.name}></${node.name}>`;
        }
        return '';
    }
    default:
      // Fallback: serialize children
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
  }
}

export async function exportOutOfDateAsXliff(client, language) {
  // Fetch docs and i18n similar to scanTranslations and build units for outdated
  const canonicalize = (p) => {
    if (!p) return p;
    let s = p.replace(/\.mdx?$|\.md$/i, '');
    s = s.replace(/\/(index|readme)$/i, '');
    if (s.startsWith('/')) s = s.slice(1);
    return s;
  };

  // load all docs and translations
  const docsResult = await client.queries.docConnection({ sort: 'title', first: 1000 });
  const docsEdges = docsResult.data?.docConnection?.edges || [];
  const sourceMap = {};
  for (const edge of docsEdges) {
    const node = edge.node;
    const rel = node._sys?.relativePath || node._sys?.filename || '';
    let clean = rel;
    if (rel.startsWith('docs/')) clean = rel.replace(/^docs\//, '');
    if (clean.startsWith('api/')) continue;
    sourceMap[canonicalize(clean)] = node;
  }

  const i18nResult = await client.queries.i18nConnection({ sort: 'title', first: 1000 });
  const i18nEdges = i18nResult.data?.i18nConnection?.edges || [];
  const translationsMap = {};
  for (const edge of i18nEdges) {
    const node = edge.node;
    const relPath = node._sys?.relativePath || node._sys?.filename || '';
    const m = relPath.match(/^([a-zA-Z0-9_-]+)\/(.*)$/);
    if (!m) continue;
    const lang = m[1];
    if (lang !== language) continue;
    const after = m[2];
    const prefix = 'docusaurus-plugin-content-docs/current/';
    if (!after.startsWith(prefix)) continue;
    const cleanAfter = after.replace(new RegExp(`^${prefix}`), '');
    const canonical = canonicalize(cleanAfter);
    translationsMap[canonical] = node;
  }

  // build units only for out-of-date source keys (translation older than source)
  const units = [];
  for (const key of Object.keys(sourceMap)) {
    const src = sourceMap[key];
    if (!translationsMap[key]) continue;
    const tr = translationsMap[key];
    // Determine lastmod dates consistent with scanTranslations rules
    const srcDate = src && src.lastmod ? new Date(src.lastmod) : null;
    const trDate = tr && tr.lastmod ? new Date(tr.lastmod) : null;
    // Include only when source has a date and translation is missing or older
    const isOutOfDate = srcDate && (!trDate || trDate < srcDate);
    if (!isOutOfDate) continue;
    // Prefer raw MDX if available so exported <source> contains original headings
    // and full MDX/React component contents. Strip YAML frontmatter and capture
    // metadata separately so it can be emitted as <note> elements.
    let sourceBody = '';
    let sourceMeta = {};
    // Try several common places where Tina may store raw or rich content
    if (src.raw) {
      const parsed = extractFrontmatter(src.raw);
      sourceMeta = parsed.metadata || {};
      sourceBody = parsed.body || '';
    } else if (src._raw) {
      const parsed = extractFrontmatter(src._raw);
      sourceMeta = parsed.metadata || {};
      sourceBody = parsed.body || '';
    } else if (src._values && typeof src._values === 'string') {
      const parsed = extractFrontmatter(src._values);
      sourceMeta = parsed.metadata || {};
      sourceBody = parsed.body || '';
    } else if (src._values && typeof src._values === 'object') {
      if (src._values.body && typeof src._values.body === 'string') {
        sourceBody = src._values.body;
      } else if (src._values.children) {
        try { sourceBody = serializeRichTextToMarkdown(src._values); } catch (e) { sourceBody = JSON.stringify(src._values); }
      } else {
        try { sourceBody = JSON.stringify(src._values); } catch (e) { sourceBody = String(src._values); }
      }
    } else if (src.body && typeof src.body === 'object') {
      try {
        sourceBody = serializeRichTextToMarkdown(src.body);
      } catch (e) {
        sourceBody = JSON.stringify(src.body);
      }
    } else if (typeof src.body === 'string') {
      const parsed = extractFrontmatter(src.body);
      sourceMeta = parsed.metadata || {};
      sourceBody = parsed.body || src.body;
    } else {
      sourceBody = src.body || '';
    }

    // optional debug helper
    const DEBUG = (typeof process !== 'undefined' && process && process.env && process.env.XLIFF_DEBUG === '1') || (typeof globalThis !== 'undefined' && globalThis && globalThis.__XLIFF_DEBUG);
    const debug = (...args) => { if (DEBUG) try { console.error('[xliff-debug]', ...args); } catch (e) {} };

    // emit debug info about which path we used to populate sourceBody
    try {
      if (DEBUG) {
        const srcTypes = [];
        if (src.raw) srcTypes.push('raw');
        if (src._raw) srcTypes.push('_raw');
        if (src._values) srcTypes.push('_values');
        if (src.body && typeof src.body === 'object') srcTypes.push('body(AST)');
        if (typeof src.body === 'string') srcTypes.push('body(string)');
        if (src._sys && (src._sys.relativePath || src._sys.filename)) srcTypes.push('has _sys');
        debug('unit', key, 'srcTypes=' + srcTypes.join(',') + ' sourceBodyLen=' + String(sourceBody || '').length);
      }
    } catch (e) {}

    // If we still have no source text, and we're running in Node (server-side),
    // try to read the raw MDX from the local filesystem as a fallback. This
    // keeps the browser/dashboard flow GraphQL-only while allowing server-side
    // scripts (and local debug runs) to recover missing raw content.
    // Treat some placeholder serialized values as effectively empty so we
    // attempt the filesystem fallback when GraphQL gave us an empty object.
    let isEmptySource = false;
    if (!sourceBody) isEmptySource = true;
    else {
      const s = String(sourceBody).trim();
      if (!s) isEmptySource = true;
      if (s === '{}' || s === '[]' || s === '[object Object]') isEmptySource = true;
    }

    if (isEmptySource && typeof window === 'undefined') {
      try {
        // require guarded to avoid bundler/runtime issues in the browser
        const fs = require('fs');
        const path = require('path');
        let rel = src._sys && (src._sys.relativePath || src._sys.filename) ? (src._sys.relativePath || src._sys.filename) : null;
        // If the GraphQL node didn't include _sys paths, derive from the canonical key
        if (!rel && typeof key === 'string' && key) {
          // try likely file candidates under docs/
          const tryPaths = [path.join('docs', `${key}.mdx`), path.join('docs', `${key}.md`)];
          for (const p of tryPaths) {
            const abs = path.resolve(process.cwd(), p);
            if (fs.existsSync(abs)) {
              const raw = fs.readFileSync(abs, 'utf8');
              const parsed = extractFrontmatter(raw);
              sourceMeta = Object.assign({}, sourceMeta, parsed.metadata || {});
              sourceBody = parsed.body || sourceBody;
              rel = p;
              break;
            }
          }
        } else if (rel) {
          let filePath = rel;
          if (!filePath.startsWith('docs/')) {
            filePath = path.join('docs', filePath);
          }
          const abs = path.resolve(process.cwd(), filePath);
          if (fs.existsSync(abs)) {
            const raw = fs.readFileSync(abs, 'utf8');
            const parsed = extractFrontmatter(raw);
            sourceMeta = Object.assign({}, sourceMeta, parsed.metadata || {});
            sourceBody = parsed.body || sourceBody;
          }
        }
      } catch (e) {
        // ignore filesystem fallback errors — continue with whatever we have
      }
    }
    

    // For target prefer raw translated MDX if present (tr.raw or tr._values),
    // otherwise try AST -> Markdown or fallback to plain values.
    let targetBody = '';
    let targetMeta = {};
    if (tr.raw) {
      const parsedT = extractFrontmatter(tr.raw);
      targetMeta = parsedT.metadata || {};
      targetBody = parsedT.body || '';
    } else if (tr._values) {
      // some Tina responses embed raw content in _values
      targetBody = typeof tr._values === 'string' ? tr._values : JSON.stringify(tr._values);
    } else if (tr.body && typeof tr.body === 'object') {
      try {
        targetBody = serializeRichTextToMarkdown(tr.body);
      } catch (e) {
        targetBody = JSON.stringify(tr.body);
      }
    } else {
      targetBody = tr.body || '';
    }
    const sourceTitle = src.title || '';
    const targetTitle = tr.title || '';

    // As a last-resort server-side fallback, try reading the file by canonical
    // key from the local `docs/` tree if the source body is still empty.
    try {
      const s = String(sourceBody || '').trim();
      if ((s === '' || s === '{}' || s === '[]' || s === '[object Object]') && typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const tryPaths = [path.join('docs', `${key}.mdx`), path.join('docs', `${key}.md`)];
        for (const p of tryPaths) {
          const abs = path.resolve(process.cwd(), p);
          if (fs.existsSync(abs)) {
            try {
              console.error('[xliff] filesystem fallback reading', abs);
            } catch (e) {}
            const raw = fs.readFileSync(abs, 'utf8');
            const parsed = extractFrontmatter(raw);
            sourceMeta = Object.assign({}, sourceMeta, parsed.metadata || {});
            sourceBody = parsed.body || sourceBody;
            try {
              console.error('[xliff] filesystem fallback populated sourceBody length', String(sourceBody || '').length);
            } catch (e) {}
            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // capture an explicit source path (if available) so we can store it as
    // a note for downstream tools (Swordfish may replace unit ids with
    // numeric placeholders; keeping the original path in notes preserves it).
    const sourcePath = (src && src._sys && (src._sys.relativePath || src._sys.filename)) || (typeof key === 'string' ? `docs/${key}.mdx` : '');
    units.push({ id: key, sourceTitle, targetTitle, sourceBody, targetBody, sourceMeta, targetMeta, sourcePath });
  }

  // build XLIFF 2.2 document
  const header = `<?xml version="1.0" encoding="utf-8"?>\n<xliff version="2.2" xmlns="urn:oasis:names:tc:xliff:document:2.2">\n`;
  let body = '';
  // group by file attribute (we'll use language as file id)
  body += `  <file id="${escapeXml(language)}" original="docstatic-export">\n`;
  for (const u of units) {
    body += `    <unit id="${escapeXml(u.id)}">\n`;
    // Build notes for metadata. Include title and any frontmatter keys we captured.
    const notes = [];
    // store original source file path to aid tools that replace unit ids
    notes.push(`path:${u.sourcePath || ''}`);
    notes.push(`title:${u.sourceTitle || u.targetTitle || ''}`);
    // source metadata
    if (u.sourceMeta) {
      for (const k of Object.keys(u.sourceMeta)) {
        if (k === 'title') continue;
        notes.push(`${k}:${u.sourceMeta[k]}`);
      }
    }
    // target metadata (prefix keys with 't.' to avoid collisions)
    if (u.targetMeta) {
      for (const k of Object.keys(u.targetMeta)) {
        if (k === 'title') continue;
        notes.push(`t.${k}:${u.targetMeta[k]}`);
      }
    }
    body += `      <notes>`;
    for (const n of notes) {
      body += `<note>${escapeXmlPreserveNewlines(n)}</note>`;
    }
    body += `</notes>\n`;
    body += `      <segment>\n`;
    // Ensure source is never empty: insert a visible placeholder if needed
    let safeSource = (u.sourceBody || '').toString().trim() ? u.sourceBody : '(no source content)';
    // Last-resort server-side attempt: read the local docs file by unit id
    if (safeSource === '(no source content)' && typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const tryPaths = [path.join('docs', `${u.id}.mdx`), path.join('docs', `${u.id}.md`)];
        for (const p of tryPaths) {
          const abs = path.resolve(process.cwd(), p);
          if (fs.existsSync(abs)) {
            const raw = fs.readFileSync(abs, 'utf8');
            const parsed = extractFrontmatter(raw);
            safeSource = parsed.body || safeSource;
            break;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    // Annotate JSX props/children so prop string values appear in the exported
    // source text (they are appended as visible annotations and will be
    // escaped into the XML target). This ensures translators can translate
    // values stored inside component props.
    try {
      // Normalize encoded angle brackets so stored entities like &lt;Details&gt;
      // are also converted to marker form. Do not unescape &amp; here to avoid
      // mangling other entities.
      let conv = String(safeSource).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      conv = angleToMarker(conv);
      conv = annotateJsxPropsAndChildren(conv);
      conv = annotateMarkerProps(conv);
      safeSource = conv;
    } catch (e) {
      // ignore and fall back to raw source
    }
    body += `        <source xml:space="preserve">${escapeXmlPreserveNewlines(safeSource)}</source>\n`;
    body += `        <target xml:space="preserve">${escapeXmlPreserveNewlines(u.targetBody)}</target>\n`;
    body += `      </segment>\n`;
    body += `    </unit>\n`;
  }
  body += '  </file>\n';
  const footer = '</xliff>\n';
  return header + body + footer;
}

export async function importXliffBundle(client, xliffText, language, onProgress) {
  // Parse XLIFF using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(xliffText, 'application/xml');
  const units = Array.from(doc.getElementsByTagName('unit'));
  const results = [];
  for (const unit of units) {
    const id = unit.getAttribute('id');
    const sourceEl = unit.getElementsByTagName('source')[0];
    const targetEl = unit.getElementsByTagName('target')[0];
    const notes = unit.getElementsByTagName('note');
    const titleNote = notes && notes[0] ? readElementTextPreservingLineBreaks(notes[0]).replace(/^title:/, '') : null;
    const rawTarget = targetEl ? readElementTextPreservingLineBreaks(targetEl) : '';
    // If XML target contains JSON (export previously stored JSON), parse it;
    // otherwise treat as markdown/plain text and send through as-is.
    let parsedBody = rawTarget;
    if (rawTarget && rawTarget.trim().startsWith('{')) {
      try {
        parsedBody = JSON.parse(rawTarget);
      } catch (e) {
        parsedBody = rawTarget;
      }
    }
    // If translators used the marker form, convert it back to JSX angle
    // brackets before storing. Only do this for string payloads.
    if (typeof parsedBody === 'string') {
      try { parsedBody = markerToAngle(parsedBody); } catch (e) { /* ignore */ }
    }

    // Build relativePath used by Tina
    const rel = `${language}/docusaurus-plugin-content-docs/current/${id}`;

    try {
      // updateI18n mutation
      // set lastmod to the current time so imported translations are
      // marked as freshly updated.
      await client.request(`
        mutation UpdateI18n($relativePath: String!, $params: I18nMutation!) {
          updateI18n(relativePath: $relativePath, params: $params) { id }
        }
      `, { relativePath: rel, params: { i18n: { title: titleNote || undefined, body: parsedBody, lastmod: (new Date()).toISOString() } } });
      
      results.push({ id, status: 'updated' });
      if (onProgress) onProgress({ id, status: 'updated' });
    } catch (err) {
      results.push({ id, status: 'error', error: err.message });
      if (onProgress) onProgress({ id, status: 'error', error: err.message });
    }
  }
  return results;
}

export default { exportOutOfDateAsXliff, importXliffBundle };
