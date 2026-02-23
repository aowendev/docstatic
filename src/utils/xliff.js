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
      let txt = node.text || node.value || '';
      if (node.bold) txt = `**${txt}**`;
      if (node.italic) txt = `_${txt}_`;
      return txt;
    }
    case 'inlineCode':
      return `\`${(node.value || node.text || node.literal || '')}\``;
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
        // Emit marker-form components (jsx:Name ...) so CAT tools see them
        const propsToString = (pairs) => {
          if (!pairs || !pairs.length) return '';
          return pairs.map(attr => {
            const name = attr.name || attr.key || '';
            const value = attr.hasOwnProperty('value') ? attr.value : attr.val || attr.v;
            if (!name) return '';
            if (value === true || value === undefined) return name;
            if (typeof value === 'string') return `${name}=${JSON.stringify(value)}`;
            try {
              return `${name}={${JSON.stringify(value)}}`;
            } catch (e) {
              return `${name}=${JSON.stringify(String(value))}`;
            }
          }).filter(Boolean).join(' ');
        };

        // Determine children content (prefer explicit children array).
        // If not present, attempt a deep extraction from nested shapes
        // (GraphQL/Tina may return varying AST shapes).
        const deepSerialize = (obj) => {
          if (obj === null || obj === undefined) return '';
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.map(deepSerialize).join('');
          if (typeof obj === 'object') {
            // If this looks like a node, let serializer handle it
            if (obj.type) return serializeRichTextToMarkdown(obj);
            // common text fields
            if (obj.value || obj.text || obj.literal) return String(obj.value || obj.text || obj.literal);
            // children-like containers
            if (obj.children) return deepSerialize(obj.children);
            if (obj._values) return deepSerialize(obj._values);
            // otherwise inspect own properties
            const parts = [];
            for (const k of Object.keys(obj)) {
              try {
                parts.push(deepSerialize(obj[k]));
              } catch (e) {}
            }
            return parts.join('');
          }
          return String(obj);
        };

        let children = '';
        if (node.children && node.children.length) {
          children = node.children.map(serializeRichTextToMarkdown).join('');
        } else if (node.attributes && node.attributes.length) {
          const childAttr = node.attributes.find(a => a.name === 'children' && (a.value !== undefined && a.value !== null));
          if (childAttr) {
            children = typeof childAttr.value === 'string' ? childAttr.value : deepSerialize(childAttr.value);
          }
        } else if (node.props && node.props.children) {
          children = typeof node.props.children === 'string' ? node.props.children : deepSerialize(node.props.children);
        } else if (node._values && node._values.children) {
          children = typeof node._values.children === 'string' ? node._values.children : deepSerialize(node._values.children);
        } else {
          // final attempt: scan the whole node for nested text
          children = deepSerialize(node);
        }

        // If children derived from node.children was empty, prefer any
        // explicit `props.children` or `_values.children` which may contain
        // meaningful content (some AST shapes put the real child inside props).
        if ((!children || String(children).trim() === '')) {
          if (node.props && node.props.children) {
            children = typeof node.props.children === 'string' ? node.props.children : deepSerialize(node.props.children);
          } else if (node._values && node._values.children) {
            children = typeof node._values.children === 'string' ? node._values.children : deepSerialize(node._values.children);
          }
        }

        // collect attribute pairs from various node shapes
        let attrPairs = [];
        if (node.attributes && Array.isArray(node.attributes) && node.attributes.length) {
          attrPairs = node.attributes
            .filter(a => a && a.name && String(a.name).toLowerCase() !== 'children')
            .map(a => ({ name: a.name, value: a.value }));
        } else if (node.props && typeof node.props === 'object') {
          attrPairs = Object.keys(node.props).filter(k => k !== 'children').map(k => ({ name: k, value: node.props[k] }));
        } else if (node._values && typeof node._values === 'object') {
          attrPairs = Object.keys(node._values).filter(k => k !== 'children').map(k => ({ name: k, value: node._values[k] }));
        }
        const props = propsToString(attrPairs);
        const p = props ? ' ' + props : '';
        if (children && children.length) {
          return `(jsx:${node.name}${p})${children}(/jsx:${node.name})`;
        }
        // Prefer exposing a primary prop value (common keys like title,
        // summary or caption) as the visible child text when no children
        // are present. This gives translators the actual text they need
        // rather than a machine-readable parenthetical list.
        const preferred = ['title', 'summary', 'caption', 'alt', 'label', 'termKey', 'text'];
        let primary = null;
        for (const k of preferred) {
          const found = (attrPairs || []).find(a => a && String(a.name) === k && typeof a.value === 'string' && String(a.value).trim());
          if (found) { primary = String(found.value); break; }
        }
        if (primary) {
          return `(jsx:${node.name}${p})${primary}(/jsx:${node.name})`;
        }
        // Fallback: expose a compact parenthetical annotation containing
        // simple prop values so translators can still see translatable
        // strings when no obvious primary prop exists.
        const annParts = (attrPairs || []).map(a => {
          const v = a && a.value;
          if (v === undefined || v === null) return '';
          if (typeof v === 'string') return `${a.name}:${v}`;
          try { return `${a.name}:${JSON.stringify(v)}`; } catch (e) { return `${a.name}:${String(v)}`; }
        }).filter(Boolean);
        if (annParts.length) {
          const ann = `(${annParts.join(', ')})`;
          return `(jsx:${node.name}${p})${ann}(/jsx:${node.name})`;
        }
        return `(jsx:${node.name}${p}/)`;
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
        // Support several shapes: _values.body may be a string or an AST-like
        // object. Prefer serializing AST shapes to Markdown when possible.
        if (src._values.body && typeof src._values.body === 'object') {
          try { sourceBody = serializeRichTextToMarkdown(src._values.body); } catch (e) { sourceBody = JSON.stringify(src._values.body); }
        } else if (src._values.body && typeof src._values.body === 'string') {
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

    // Cloud-only export: do NOT attempt filesystem fallbacks here.
    // The exporter should rely exclusively on data returned by GraphQL/Tina.
    // Any previous server-side filesystem fallbacks have been removed to
    // ensure exports generated in cloud environments do not access local disk.
    

    // For target prefer raw translated MDX if present (tr.raw), otherwise
    // handle common shapes returned by GraphQL/Tina. When translation content
    // is provided as an AST-like object (for example in `tr._values.body` or
    // `tr.body`), serialize it to Markdown so the XLIFF target is human-
    // readable rather than a JSON blob.
    let targetBody = '';
    let targetMeta = {};
    if (tr.raw) {
      const parsedT = extractFrontmatter(tr.raw);
      targetMeta = parsedT.metadata || {};
      targetBody = parsedT.body || '';
    } else if (tr._values && typeof tr._values === 'object') {
      // Prefer AST in tr._values.body when available
      if (tr._values.body && typeof tr._values.body === 'object') {
        try { targetBody = serializeRichTextToMarkdown(tr._values.body); } catch (e) { targetBody = JSON.stringify(tr._values.body); }
      } else if (tr._values.body && typeof tr._values.body === 'string') {
        targetBody = tr._values.body;
      } else {
        try { targetBody = JSON.stringify(tr._values); } catch (e) { targetBody = String(tr._values); }
      }
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

    // Cloud-only export: do not attempt any additional filesystem fallback
    // here. If GraphQL/Tina returns an empty or incomplete shape for the
    // source, retain what we have rather than attempting to read local files.

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
    // Cloud-only export: do not attempt to read local docs files by unit id.
    // If GraphQL did not provide content, leave the placeholder rather than
    // trying to access disk in cloud environments.
    // Annotate JSX props/children so prop string values appear in the exported
    // source text (they are appended as visible annotations and will be
    // escaped into the XML target). This ensures translators can translate
    // values stored inside component props.
    try {
      // Normalize encoded angle brackets so stored entities like &lt;Details&gt;
      // are also converted to marker form. Do not unescape &amp; here to avoid
      // mangling other entities.
      let conv = String(safeSource).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      // Convert angle-bracket JSX to marker form for CAT tools; do not
      // append parenthetical annotations here to avoid duplicate prop
      // annotations in the exported XLIFF. Translators will see props
      // inside the marker form itself.
      conv = angleToMarker(conv);
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
