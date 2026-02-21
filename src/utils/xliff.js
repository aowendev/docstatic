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
  let s = String(unsafe).replace(/\r\n?/g, '\n');
  // Use placeholder to avoid escaping our <lb/> marker
  const LB = '___XLIFF_LB___';
  s = s.replace(/\n/g, LB);
  s = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  // restore real XLIFF line-break tags
  return s.replace(new RegExp(LB, 'g'), '<lb/>');
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
            try {
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

        // 1) children
        if (node.children && node.children.length) {
          const props = propsToString(node.attributes);
          const open = node.name ? (props ? `<${node.name} ${props}>` : `<${node.name}>`) : '';
          const children = tryChildren(node.children);
          const close = node.name ? `</${node.name}>` : '';
          return `${open}${children}${close}`;
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

        // last resort: emit empty element with props preserved
        if (node.name) {
          const props = propsToString(node.attributes);
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

  // build units for all source keys that are present in translationsMap
  const units = [];
  for (const key of Object.keys(sourceMap)) {
    const src = sourceMap[key];
    if (!translationsMap[key]) continue;
    const tr = translationsMap[key];
    // Prefer raw MDX if available so exported <source> contains original headings
    // and full MDX/React component contents. Fall back to AST -> Markdown.
    let sourceBody = '';
    if (src.raw) {
      sourceBody = src.raw;
    } else if (src.body && typeof src.body === 'object') {
      try {
        sourceBody = serializeRichTextToMarkdown(src.body);
      } catch (e) {
        sourceBody = JSON.stringify(src.body);
      }
    } else {
      sourceBody = src.body || '';
    }

    // For target prefer raw translated MDX if present (tr.raw or tr._values),
    // otherwise try AST -> Markdown or fallback to plain values.
    let targetBody = '';
    if (tr.raw) {
      targetBody = tr.raw;
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
    units.push({ id: key, sourceTitle, targetTitle, sourceBody, targetBody });
  }

  // build XLIFF 2.2 document
  const header = `<?xml version="1.0" encoding="utf-8"?>\n<xliff version="2.2" xmlns="urn:oasis:names:tc:xliff:document:2.2">\n`;
  let body = '';
  // group by file attribute (we'll use language as file id)
  body += `  <file id="${escapeXml(language)}" original="docstatic-export">\n`;
  for (const u of units) {
    body += `    <unit id="${escapeXml(u.id)}">\n`;
    body += `      <notes><note>title:${escapeXml(u.sourceTitle)}</note></notes>\n`;
    body += `      <segment>\n`;
    body += `        <source>${escapeXmlWithLineBreaks(u.sourceBody)}</source>\n`;
    body += `        <target>${escapeXmlWithLineBreaks(u.targetBody)}</target>\n`;
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
    const titleNote = notes && notes[0] ? notes[0].textContent.replace(/^title:/, '') : null;
    const rawTarget = targetEl ? targetEl.textContent : '';
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

    // Build relativePath used by Tina
    const rel = `${language}/docusaurus-plugin-content-docs/current/${id}`;

    try {
      // updateI18n mutation
      await client.request(`
        mutation UpdateI18n($relativePath: String!, $params: I18nMutation!) {
          updateI18n(relativePath: $relativePath, params: $params) { id }
        }
      `, { relativePath: rel, params: { i18n: { title: titleNote || undefined, body: parsedBody } } });
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
