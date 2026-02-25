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

// Remove control characters that may be embedded in AST serializations
// (keep tab, LF, CR). This prevents NULs and other controls from
// corrupting XLIFF consumers or terminal output.
function stripControlChars(s) {
  if (s === null || s === undefined) return '';
  try {
    // Remove BOM and all Unicode C0/C1 control characters (U+0000..U+001F, U+007F..U+009F)
    // but keep tab (\x09), LF (\x0A), and CR (\x0D) so line breaks are preserved.
    // This avoids leaving high-bit control bytes that show up as M-^@ sequences
    // in some terminals or when processed by CAT tools.
    return String(s)
      .replace(/\uFEFF/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  } catch (e) {
    return String(s);
  }
}

// Apply a text-processing function only to content OUTSIDE fenced code
// blocks (``` or ~~~). This prevents link conversion, JSX marker conversion,
// and other transformations from modifying code examples.
function outsideCodeFences(fn) {
  return function (s) {
    if (!s || typeof s !== 'string') return fn(s);
    // Split on fenced code blocks (``` or ~~~). The regex captures the
    // complete fenced block (including opening/closing fences) so that
    // odd-numbered parts are code blocks and even-numbered parts are prose.
    const parts = s.split(/(^`{3,}[^\n]*\n[\s\S]*?^`{3,}\s*$|^~{3,}[^\n]*\n[\s\S]*?^~{3,}\s*$)/m);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Outside code fence – apply the transformation
        parts[i] = fn(parts[i]);
      }
      // Odd indices are fenced code blocks – leave them untouched
    }
    return parts.join('');
  };
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

// ---------------------------------------------------------------------------
// parseMarkdownToTinaAst – lightweight Markdown → Tina-compatible AST parser.
// Converts a Markdown string into the rich-text AST shape that TinaCMS
// expects for the `body` field so that headings, lists, code blocks,
// links, bold/italic/inline-code etc. are represented as proper nodes
// instead of being stuffed into raw text nodes (which Tina would then
// backslash-escape, destroying all formatting).
// ---------------------------------------------------------------------------
function parseMarkdownToTinaAst(md) {
  if (!md || typeof md !== 'string') {
    return { type: 'root', children: [{ type: 'p', children: [{ type: 'text', text: '' }] }] };
  }

  // ---- inline parser ----
  function parseInline(text) {
    if (!text) return [{ type: 'text', text: '' }];
    const nodes = [];
    let remaining = text;

    while (remaining.length > 0) {
      // Find the earliest inline pattern
      let earliest = null;
      let earliestIdx = remaining.length;

      // Inline JSX marker (paired): (jsx:Name props)content(/jsx:Name)
      const jsxInlinePairedRe = /\(jsx:([A-Z][\w-]*)\b([^)]*)\)([\s\S]*?)\(\/jsx:\1\)/;
      const jsxInlinePairedM = jsxInlinePairedRe.exec(remaining);
      if (jsxInlinePairedM && jsxInlinePairedM.index < earliestIdx) {
        earliest = { type: 'jsxPaired', match: jsxInlinePairedM };
        earliestIdx = jsxInlinePairedM.index;
      }

      // Inline JSX marker (self-closing): (jsx:Name props/)
      const jsxInlineSelfRe = /\(jsx:([A-Z][\w-]*)\b([^)]*)\/\)/;
      const jsxInlineSelfM = jsxInlineSelfRe.exec(remaining);
      if (jsxInlineSelfM && jsxInlineSelfM.index < earliestIdx) {
        earliest = { type: 'jsxSelf', match: jsxInlineSelfM };
        earliestIdx = jsxInlineSelfM.index;
      }

      // Markdown link: [text](url)
      const linkRe = /\[([^\]]*)\]\(([^)]*)\)/;
      const linkM = linkRe.exec(remaining);
      if (linkM && linkM.index < earliestIdx) {
        earliest = { type: 'link', match: linkM };
        earliestIdx = linkM.index;
      }

      // Inline code: `code`
      const codeRe = /`([^`]+)`/;
      const codeM = codeRe.exec(remaining);
      if (codeM && codeM.index < earliestIdx) {
        earliest = { type: 'code', match: codeM };
        earliestIdx = codeM.index;
      }

      // Bold: **text** or __text__
      const boldRe = /\*\*([^*]+)\*\*|__([^_]+)__/;
      const boldM = boldRe.exec(remaining);
      if (boldM && boldM.index < earliestIdx) {
        earliest = { type: 'bold', match: boldM };
        earliestIdx = boldM.index;
      }

      // Italic: *text* or _text_ (but not ** or __)
      const italicRe = /(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)|(?<!_)_(?!_)([^_]+)(?<!_)_(?!_)/;
      const italicM = italicRe.exec(remaining);
      if (italicM && italicM.index < earliestIdx) {
        earliest = { type: 'italic', match: italicM };
        earliestIdx = italicM.index;
      }

      // Strikethrough: ~~text~~
      const strikeRe = /~~([^~]+)~~/;
      const strikeM = strikeRe.exec(remaining);
      if (strikeM && strikeM.index < earliestIdx) {
        earliest = { type: 'strikethrough', match: strikeM };
        earliestIdx = strikeM.index;
      }

      // Inline image: ![alt](url)
      const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/;
      const imgM = imgRe.exec(remaining);
      if (imgM && imgM.index < earliestIdx) {
        earliest = { type: 'image', match: imgM };
        earliestIdx = imgM.index;
      }

      if (!earliest) {
        // No more inline patterns – rest is plain text
        if (remaining) nodes.push({ type: 'text', text: remaining });
        break;
      }

      // Push any text before the match
      if (earliestIdx > 0) {
        nodes.push({ type: 'text', text: remaining.slice(0, earliestIdx) });
      }

      const m = earliest.match;
      switch (earliest.type) {
        case 'jsxPaired':
        case 'jsxSelf': {
          const compName = m[1];
          let rawProps = (m[2] || '').trim();
          const innerText = earliest.type === 'jsxPaired' ? (m[3] || '') : '';

          // Unescape HTML entities in prop values that CAT tools may have introduced
          rawProps = rawProps.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

          // Parse simple props: key="value" or key='value' or key={value}
          // Also handle bare boolean props (e.g. `initcap` without =value)
          const props = {};
          const propRe = /([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
          let pm;
          while ((pm = propRe.exec(rawProps)) !== null) {
            const key = pm[1];
            // If no =value was matched, this is a bare boolean prop
            if (pm[2] === undefined && pm[3] === undefined && pm[4] === undefined) {
              props[key] = true;
              continue;
            }
            let val = pm[2] !== undefined ? pm[2] : pm[3] !== undefined ? pm[3] : pm[4];
            if (val !== undefined && /^[\[{]/.test(val)) {
              try { val = JSON.parse(val); } catch (e) { /* keep string */ }
            } else if (val === 'true') { val = true; }
            else if (val === 'false') { val = false; }
            // Unescape JSON string escapes (\n → newline, \t → tab, etc.)
            // that were introduced by JSON.stringify during export.
            if (typeof val === 'string' && val.includes('\\')) {
              try { val = JSON.parse('"' + val.replace(/"/g, '\\"') + '"'); } catch (e) { /* keep as-is */ }
            }
            props[key] = val;
          }

          // Build children prop as a Tina AST root node for paired elements
          if (innerText) {
            props.children = parseMarkdownToTinaAst(innerText);
          }

          nodes.push({
            type: 'mdxJsxTextElement',
            name: compName,
            children: [{ type: 'text', text: '' }],
            props
          });
          break;
        }
        case 'link': {
          const linkText = m[1] || '';
          const href = m[2] || '';
          const linkChildren = linkText ? [{ type: 'text', text: linkText }] : [];
          nodes.push({ type: 'a', url: href, title: null, children: linkChildren });
          break;
        }
        case 'code':
          nodes.push({ type: 'text', text: m[1], code: true });
          break;
        case 'bold':
          nodes.push({ type: 'text', text: m[1] || m[2], bold: true });
          break;
        case 'italic':
          nodes.push({ type: 'text', text: m[1] || m[2], italic: true });
          break;
        case 'strikethrough':
          nodes.push({ type: 'text', text: m[1], strikethrough: true });
          break;
        case 'image': {
          const imgAlt = m[1] || '';
          const imgSrc = m[2] || '';
          nodes.push({ type: 'image', alt: imgAlt, url: imgSrc });
          break;
        }
      }
      remaining = remaining.slice(earliestIdx + m[0].length);
    }
    return nodes.length ? nodes : [{ type: 'text', text: '' }];
  }

  // ---- block parser ----
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const rootChildren = [];
  let i = 0;

  // Consume consecutive list items of the same kind starting from line i.
  // Returns [listNode, nextIndex].
  // `sourceLines` allows recursive calls with de-indented sub-lists.
  function consumeList(startIdx, ordered, sourceLines) {
    const src = sourceLines || lines;
    const items = [];
    const marker = ordered ? /^(\d+)\.\s+(.*)$/ : /^[\*\-\+]\s+(.*)$/;
    let idx = startIdx;
    while (idx < src.length) {
      const line = src[idx];
      const m = marker.exec(line);
      if (!m) break;
      const content = ordered ? m[2] : m[1];
      const currentItem = {
        type: 'li',
        children: [{ type: 'lic', children: parseInline(content) }]
      };
      items.push(currentItem);
      idx++;
      // Absorb continuation lines (indented or non-blank, non-block-start)
      while (idx < src.length) {
        const next = src[idx];
        if (next === '') break;
        if (marker.test(next)) break; // next list item at same level

        // Detect indented nested list (2+ spaces followed by a list marker)
        const nestedOlMatch = next.match(/^\s{2,}(\d+)\.\s+(.*)$/);
        const nestedUlMatch = !nestedOlMatch ? next.match(/^\s{2,}[\*\-\+]\s+(.*)$/) : null;
        if (nestedOlMatch || nestedUlMatch) {
          // Gather all indented lines for the nested list, then strip
          // their leading whitespace and parse recursively.
          const nestedLines = [];
          const baseIndent = next.match(/^(\s+)/)[1].length;
          while (idx < src.length) {
            const nl = src[idx];
            if (nl === '') break;
            const indentMatch = nl.match(/^(\s+)/);
            if (!indentMatch || indentMatch[1].length < baseIndent) break;
            nestedLines.push(nl.slice(baseIndent));
            idx++;
          }
          const nestedIsOrdered = !!nestedOlMatch;
          const [nestedNode] = consumeList(0, nestedIsOrdered, nestedLines);
          currentItem.children.push(nestedNode);
          continue;
        }

        if (/^#{1,6}\s/.test(next)) break;
        if (/^```/.test(next)) break;
        if (/^---\s*$|^\*\*\*\s*$|^___\s*$/.test(next)) break;
        if (/^>\s/.test(next)) break;
        // Continuation of previous item – append to last lic's text
        const lastLic = currentItem.children[0];
        const lastChild = lastLic.children[lastLic.children.length - 1];
        if (lastChild && lastChild.type === 'text') {
          lastChild.text += '\n' + next.replace(/^\s+/, '');
        }
        idx++;
      }
    }
    return [{ type: ordered ? 'ol' : 'ul', children: items }, idx];
  }

  while (i < lines.length) {
    const line = lines[i];

    // Blank line – skip
    if (line.trim() === '') { i++; continue; }

    // Fenced code block: ``` or ~~~
    const fenceMatch = line.match(/^(`{3,}|~{3,})\s*(\S*)\s*$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2] || '';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      const value = codeLines.join('\n');
      rootChildren.push({
        type: 'code_block',
        lang: lang || undefined,
        value,
        children: codeLines.map(cl => ({
          type: 'code_line',
          children: [{ text: cl }]
        }))
      });
      continue;
    }

    // Heading: # … through ###### …
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      rootChildren.push({
        type: 'h' + depth,
        children: parseInline(headingMatch[2])
      });
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, ___
    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      rootChildren.push({ type: 'hr', children: [{ type: 'text', text: '' }] });
      i++;
      continue;
    }

    // Unordered list item: * , - , +
    if (/^[\*\-\+]\s+/.test(line)) {
      const [listNode, nextIdx] = consumeList(i, false);
      rootChildren.push(listNode);
      i = nextIdx;
      continue;
    }

    // Ordered list item: 1. , 2. , etc.
    if (/^\d+\.\s+/.test(line)) {
      const [listNode, nextIdx] = consumeList(i, true);
      rootChildren.push(listNode);
      i = nextIdx;
      continue;
    }

    // Blockquote: > text
    if (/^>\s?/.test(line)) {
      const bqLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      // Recursively parse blockquote content
      const inner = parseMarkdownToTinaAst(bqLines.join('\n'));
      // Tina expects blockquote children to be inline (text, a, etc.),
      // not block-level (p). Unwrap any p nodes produced by the recursive parse.
      const bqChildren = [];
      for (const child of (inner.children || [])) {
        if (child.type === 'p' && child.children) {
          bqChildren.push(...child.children);
        } else {
          bqChildren.push(child);
        }
      }
      rootChildren.push({
        type: 'blockquote',
        children: bqChildren.length ? bqChildren : [{ type: 'text', text: '' }]
      });
      continue;
    }

    // JSX/MDX marker-form flow element: (jsx:Name props)content(/jsx:Name)
    // or self-closing: (jsx:Name props/)
    // Detect on the current line and produce a proper mdxJsxFlowElement node.
    // Supports both single-line and multi-line paired elements.
    const jsxPairedRe = /^\(jsx:([A-Z][\w-]*)\b([^\)]*)\)([\s\S]*?)\(\/jsx:\1\)$/;
    const jsxSelfRe = /^\(jsx:([A-Z][\w-]*)\b([^\)]*)\/\)$/;
    const jsxPairedM = jsxPairedRe.exec(line);
    const jsxSelfM = !jsxPairedM ? jsxSelfRe.exec(line) : null;

    // Also detect multi-line paired JSX: opening tag on this line, closing
    // on a subsequent line.  (jsx:Name props) ... lines ... (/jsx:Name)
    const jsxOpenRe = /^\(jsx:([A-Z][\w-]*)\b([^\)]*)\)(.*)$/;
    const jsxOpenM = (!jsxPairedM && !jsxSelfM) ? jsxOpenRe.exec(line) : null;

    if (jsxPairedM || jsxSelfM) {
      // Single-line paired or self-closing
      const m = jsxPairedM || jsxSelfM;
      const compName = m[1];
      let rawProps = (m[2] || '').trim();
      const innerText = jsxPairedM ? (m[3] || '') : '';

      rawProps = rawProps.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

      // Parse simple props: key="value" or key={value} or bare boolean
      const props = {};
      const propRe = /([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
      let pm;
      while ((pm = propRe.exec(rawProps)) !== null) {
        const key = pm[1];
        // If no =value was matched, this is a bare boolean prop
        if (pm[2] === undefined && pm[3] === undefined && pm[4] === undefined) {
          props[key] = true;
          continue;
        }
        let val = pm[2] !== undefined ? pm[2] : pm[3] !== undefined ? pm[3] : pm[4];
        // Try to parse JSON-like values (arrays, bools, numbers)
        if (val !== undefined && /^[\[{]/.test(val)) {
          try { val = JSON.parse(val); } catch (e) { /* keep string */ }
        } else if (val === 'true') { val = true; }
        else if (val === 'false') { val = false; }
        // Unescape JSON string escapes (\n → newline, \t → tab, etc.)
        if (typeof val === 'string' && val.includes('\\')) {
          try { val = JSON.parse('"' + val.replace(/"/g, '\\"') + '"'); } catch (e) { /* keep as-is */ }
        }
        props[key] = val;
      }

      // Build children prop as a Tina AST root node
      if (innerText) {
        props.children = parseMarkdownToTinaAst(innerText);
      }

      rootChildren.push({
        type: 'mdxJsxFlowElement',
        name: compName,
        children: [{ type: 'text', text: '' }],
        props
      });
      i++;
      continue;
    }

    if (jsxOpenM) {
      // Multi-line paired JSX: opening tag on this line, gather content
      // until we find the matching closing tag (/jsx:Name).
      const compName = jsxOpenM[1];
      let rawProps = (jsxOpenM[2] || '').trim();
      const firstLineContent = jsxOpenM[3] || '';
      const closingTag = `(/jsx:${compName})`;
      const contentLines = [];
      if (firstLineContent) contentLines.push(firstLineContent);
      i++;
      while (i < lines.length) {
        const cur = lines[i];
        const closeIdx = cur.indexOf(closingTag);
        if (closeIdx !== -1) {
          // Found the closing tag – grab any text before it
          const before = cur.slice(0, closeIdx);
          if (before) contentLines.push(before);
          i++;
          break;
        }
        contentLines.push(cur);
        i++;
      }
      const innerText = contentLines.join('\n');

      rawProps = rawProps.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

      const props = {};
      const propRe = /([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
      let pm;
      while ((pm = propRe.exec(rawProps)) !== null) {
        const key = pm[1];
        // If no =value was matched, this is a bare boolean prop
        if (pm[2] === undefined && pm[3] === undefined && pm[4] === undefined) {
          props[key] = true;
          continue;
        }
        let val = pm[2] !== undefined ? pm[2] : pm[3] !== undefined ? pm[3] : pm[4];
        if (val !== undefined && /^[\[{]/.test(val)) {
          try { val = JSON.parse(val); } catch (e) { /* keep string */ }
        } else if (val === 'true') { val = true; }
        else if (val === 'false') { val = false; }
        // Unescape JSON string escapes (\n → newline, \t → tab, etc.)
        if (typeof val === 'string' && val.includes('\\')) {
          try { val = JSON.parse('"' + val.replace(/"/g, '\\"') + '"'); } catch (e) { /* keep as-is */ }
        }
        props[key] = val;
      }

      if (innerText) {
        props.children = parseMarkdownToTinaAst(innerText);
      }

      rootChildren.push({
        type: 'mdxJsxFlowElement',
        name: compName,
        children: [{ type: 'text', text: '' }],
        props
      });
      continue;
    }

    // Default: paragraph. Accumulate non-blank, non-block-start lines.
    const paraLines = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (cur.trim() === '') break;
      if (/^#{1,6}\s/.test(cur)) break;
      if (/^(`{3,}|~{3,})/.test(cur)) break;
      if (/^(---|\*\*\*|___)\s*$/.test(cur)) break;
      if (/^[\*\-\+]\s+/.test(cur)) break;
      if (/^\d+\.\s+/.test(cur)) break;
      if (/^>\s/.test(cur)) break;
      if (/^\(jsx:[A-Z]/.test(cur)) break;
      paraLines.push(cur);
      i++;
    }
    // Safety: if no lines were collected (e.g. unrecognised block-start
    // pattern) advance past the current line to prevent an infinite loop.
    if (paraLines.length === 0) {
      rootChildren.push({
        type: 'p',
        children: parseInline(lines[i] || '')
      });
      i++;
    } else {
      rootChildren.push({
        type: 'p',
        children: parseInline(paraLines.join('\n'))
      });
    }
  }

  return {
    type: 'root',
    children: rootChildren.length
      ? rootChildren
      : [{ type: 'p', children: [{ type: 'text', text: '' }] }]
  };
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
  // Tina AST sometimes uses typeless leaf objects like { text: "..." }
  // (e.g. inside code_line children). Handle them before the switch.
  if (!node.type && (node.text != null || node.value != null)) {
    return String(node.text ?? node.value ?? '');
  }
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
    case 'code':
    case 'code_block': {
      const lang = node.lang || '';
      // Prefer the flat `value` string when available; otherwise join
      // code_line children with newlines to reconstruct the block content.
      const content = node.value
        || (node.children || []).map(c => serializeRichTextToMarkdown(c)).join('\n');
      return '\n\n```' + (lang ? ' ' + lang : '') + '\n' + content + '\n```\n\n';
    }
    case 'code_line': {
      // Individual line inside a code_block – return its raw text content.
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
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
      if (node.code) txt = `\`${txt}\``;
      if (node.bold) txt = `**${txt}**`;
      if (node.italic) txt = `_${txt}_`;
      if (node.strikethrough) txt = `~~${txt}~~`;
      return txt;
    }
    case 'inlineCode':
      return `\`${(node.value || node.text || node.literal || '')}\``;
    case 'ol': {
      const indent = node._indent || '';
      return (node.children || []).map((li, idx) => {
        // Separate lic (inline content) from nested list children
        const licParts = [];
        const nestedLists = [];
        for (const child of (li.children || [])) {
          if (child.type === 'ol' || child.type === 'ul') {
            nestedLists.push(child);
          } else {
            licParts.push(child);
          }
        }
        const content = licParts.map(serializeRichTextToMarkdown).join('');
        let result = `${indent}${idx + 1}. ${content}`;
        // Render nested lists indented under the parent item
        for (const nested of nestedLists) {
          // 3-char indent to align under ordered list content ("1. ")
          const nestedCopy = Object.assign({}, nested, { _indent: indent + '   ' });
          result += '\n' + serializeRichTextToMarkdown(nestedCopy);
        }
        return result;
      }).join('\n');
    }
    case 'ul': {
      const indent = node._indent || '';
      return (node.children || []).map((li) => {
        const licParts = [];
        const nestedLists = [];
        for (const child of (li.children || [])) {
          if (child.type === 'ol' || child.type === 'ul') {
            nestedLists.push(child);
          } else {
            licParts.push(child);
          }
        }
        const content = licParts.map(serializeRichTextToMarkdown).join('');
        let result = `${indent}- ${content}`;
        for (const nested of nestedLists) {
          const nestedCopy = Object.assign({}, nested, { _indent: indent + '  ' });
          result += '\n' + serializeRichTextToMarkdown(nestedCopy);
        }
        return result;
      }).join('\n');
    }
    case 'li':
    case 'lic':
      return (node.children || []).map(serializeRichTextToMarkdown).join('');
    case 'link':
    case 'a': {
      const text = (node.children || []).map(serializeRichTextToMarkdown).join('') || node.title || '';
      const href = node.url || node.href || '';
      return href ? `[${text}](${href})` : text;
    }
    case 'img':
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

// Convert HTML anchor tags (including entity-escaped ones) into Markdown
// links so hrefs are preserved in XLIFF text exports. This is a best-effort
// conversion for stringy bodies that may contain raw HTML.
function htmlAnchorsToMarkdown(s) {
  if (!s || typeof s !== 'string') return s;
  try {
    // Unescape common &lt; &gt; entities so regex can match tags
    let work = String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Replace anchor tags with Markdown links; capture href in single/double/no-quotes
    work = work.replace(/<a\b[^>]*href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi, (m, g1, g2, g3, inner) => {
      const href = g1 || g2 || g3 || '';
      // strip any nested tags inside link text
      const innerStr = inner.replace(/<[^>]+>/g, '').trim();
      // If inner already contains a markdown-style link like [text](url),
      // avoid producing nested markdown. Prefer an inline form: "text <href>".
      const mdMatch = innerStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mdMatch) {
        const display = mdMatch[1] || innerStr;
        const u = href || (mdMatch[2] || '').trim();
        return u ? `${display} <${u}>` : display;
      }
      return href ? `[${innerStr}](${href})` : innerStr;
    });
    // Convert bare URLs into Markdown links: https://example.com -> [example.com](https://example.com)
    // Avoid autolinking URLs that are already part of a markdown link or
    // are inside angle brackets/parentheses/brackets to prevent nested links.
    //
    // Strategy: temporarily replace existing markdown links with placeholders
    // so the autolink regexes cannot match text inside them, then restore.
    // Re-protect after each pass so newly created links are also shielded.
    // Also protect angle-bracket URLs (<https://...>) from inner matching.
    const _mdLinkSlots = [];
    const _protect = (s) => {
      // protect markdown links [text](url)
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m) => {
        const idx = _mdLinkSlots.length;
        _mdLinkSlots.push(m);
        return `___MDLINK_${idx}___`;
      });
      // protect angle-bracket URLs <https://...>
      s = s.replace(/<(https?:\/\/[^>]+)>/gi, (m) => {
        const idx = _mdLinkSlots.length;
        _mdLinkSlots.push(m);
        return `___MDLINK_${idx}___`;
      });
      return s;
    };
    work = _protect(work);
    work = work.replace(/(?<![\]\(<\[])\bhttps?:\/\/[^\s)<>]+/gi, (m) => {
      try {
        const url = m;
        // use hostname or full url for link text
        let text;
        try { text = (new URL(url)).hostname; } catch (e) { text = url; }
        return `[${text}](${url})`;
      } catch (e) {
        return m;
      }
    });
    // Re-protect newly created markdown links before next pass
    work = _protect(work);
    // Autolink www. and common TLDs without scheme (e.g. www.example.com or example.com)
    // Avoid cases already wrapped in markdown or angle brackets.
    work = work.replace(/(?<![\]\(<\[])(?<!:\/\/)\bwww\.[^\s)<>]+/gi, (m) => {
      const url = m.startsWith('http') ? m : `https://${m}`;
      let text;
      try { text = (new URL(url)).hostname; } catch (e) { text = url; }
      return `[${text}](${url})`;
    });
    work = _protect(work);
    work = work.replace(/(?<![\]\(<\[])(?<!:\/\/)\b[A-Za-z0-9.-]+\.(com|org|net|io|dev|ai|tech|app|gov|edu)(?:\/[^(\s)]*)?/gi, (m) => {
      // Avoid converting markdown-wrapped links or already-handled anchors
      if (/^\[.*\]\(.*\)$/.test(m)) return m;
      const url = m.startsWith('http') ? m : `https://${m}`;
      let text;
      try { text = (new URL(url)).hostname; } catch (e) { text = url; }
      return `[${text}](${url})`;
    });
    // Restore all protected markdown links
    work = work.replace(/___MDLINK_(\d+)___/g, (m, idx) => _mdLinkSlots[parseInt(idx, 10)] || m);
    return work;
  } catch (e) {
    return s;
  }
}

function escapeRegExpFor(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Walk an AST-like object (various shapes from Tina) and gather link
// nodes as {text, href} pairs. This is a best-effort extractor that
// recognizes common shapes used by serializeRichTextToMarkdown.
function gatherLinkPairsFromAst(node, out) {
  out = out || [];
  if (!node) return out;
  if (typeof node === 'string') return out;
  if (Array.isArray(node)) {
    for (const c of node) gatherLinkPairsFromAst(c, out);
    return out;
  }
  if (typeof node === 'object') {
    const type = node.type || node._type || node.name || node.tagName;
    if (type && String(type).toLowerCase() === 'link') {
      const text = (node.children || []).map(n => (typeof n === 'string' ? n : (n.text || n.value || ''))).join('') || node.title || node.text || '';
      const href = node.url || node.href || node.destination || '';
      if (text && href) out.push({ text: String(text).trim(), href: String(href).trim() });
    }
    // also inspect known prop shapes that may contain links
    if (node.url && (node.title || node.text)) {
      out.push({ text: String(node.title || node.text).trim(), href: String(node.url).trim() });
    }
    // recursively inspect properties
    for (const k of Object.keys(node)) {
      try { gatherLinkPairsFromAst(node[k], out); } catch (e) {}
    }
  }
  return out;
}

// If serialized text lost hrefs, use the source AST to re-insert inline
// URLs for known link texts. This attempts to avoid replacing when the
// href is already present in the conv text.
function repairLinksFromAst(conv, srcNode) {
  try {
    if (!conv || typeof conv !== 'string') return conv;
    if (!srcNode) return conv;
    // if conv already contains an explicit url, skip repair
    if (/https?:\/\//.test(conv) || /<https?:\/\//.test(conv)) return conv;
    const pairs = gatherLinkPairsFromAst(srcNode, []);
    if (!pairs || !pairs.length) return conv;
    let out = String(conv);
    for (const p of pairs) {
      if (!p.text || !p.href) continue;
      if (out.includes(p.href)) continue;
      const re = new RegExp('\\b' + escapeRegExpFor(p.text) + '\\b');
      if (re.test(out)) {
        out = out.replace(re, `${p.text} <${p.href}>`);
      }
    }
    return out;
  } catch (e) {
    return conv;
  }
}

// Extract any URLs present anywhere in a source object by stringifying
// and matching common URL patterns. Returns array of urls in appearance order.
function findUrlsInObject(obj) {
  try {
    const txt = JSON.stringify(obj || {}, null, 0);
    const re = /https?:\/\/[^"'\\\s,<>]*/gi;
    const out = [];
    let m;
    while ((m = re.exec(txt)) !== null) {
      out.push(m[0]);
    }
    return out;
  } catch (e) {
    return [];
  }
}

// Append extracted URLs to plain list items when link pairs aren't available.
function appendUrlsToListItems(conv, urls) {
  if (!conv || !urls || !urls.length) return conv;
  const lines = String(conv).split(/\r?\n/);
  let i = 0;
  for (let li = 0; li < lines.length && i < urls.length; li++) {
    const line = lines[li];
    if (/^\s*-\s+/.test(line) && !/https?:\/\//.test(line) && !/<https?:\/\//.test(line)) {
      lines[li] = line + ' <' + urls[i] + '>';
      i++;
    }
  }
  return lines.join('\n');
}

// Preserve Markdown inline links [text](url) as-is. Previously this function
// converted them to "text <url>" inline form for CAT tools, but the angle
// brackets get XML-escaped in the XLIFF output and are not reliably
// round-tripped — CAT tools and the import path have no inverse conversion,
// causing URLs to be silently lost. Keeping standard Markdown link syntax
// is more robust; the placeholder protection in htmlAnchorsToMarkdown
// prevents downstream autolinking from mangling them.
function markdownLinksToInlineUrl(s) {
  return s;
}

// Collapse nested markdown links like [[text](url1)](url2) to a single
// markdown link using the inner URL (url1). This avoids producing
// malformed or duplicated links during subsequent conversions.
function normalizeNestedMarkdownLinks(s) {
  if (!s || typeof s !== 'string') return s;
  try {
    return String(s).replace(/\[\[([^\]]+)\]\(([^)]+)\)\]\(([^)]+)\)/g, (m, innerText, innerUrl, outerUrl) => {
      // prefer the inner URL as it is usually the intended target
      return `[${innerText}](${innerUrl})`;
    });
  } catch (e) {
    return s;
  }
}

// Convert JSX/marker forms that include link-like props (href, url, to, link)
// into explicit Markdown links so hrefs survive export. Handles both
// angle-bracket JSX and marker-form `(jsx:...)` forms.
function convertJsxPropLinksToMarkdown(s) {
  if (!s || typeof s !== 'string') return s;
  let out = String(s);
  try {
    // 1) Handle marker-form paired elements: (jsx:Name props...)children(/jsx:Name)
    out = out.replace(/\(jsx:([A-Z][\w-]*)([^\)]*)\)([\s\S]*?)\(\/jsx:\1\)/g, (m, name, props, children) => {
      const hrefMatch = String(props).match(/(?:href|url|to|link)=(?:"([^"]*)"|'([^']*)'|([^\s)]+))/i);
      if (hrefMatch) {
        const href = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
        const text = (children && String(children).trim()) ? String(children).trim() : (String(props).match(/(?:title|caption|alt)=?(?:"([^"]*)"|'([^']*)'|([^\s)]+))/i) || [])[1] || href;
        if (href) return `[${text}](${href})`;
      }
      return m;
    });

    // 2) Handle angle-bracket paired JSX: <Name ... href="...">children</Name>
    out = out.replace(/<([A-Z][\w-]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (m, name, props, children) => {
      const hrefMatch = String(props).match(/(?:href|url|to|link)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      if (hrefMatch) {
        const href = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
        const text = (children && String(children).trim()) ? String(children).trim() : (String(props).match(/(?:title|caption|alt)=?(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i) || [])[1] || href;
        if (href) return `[${text}](${href})`;
      }
      return m;
    });

    // 3) Handle self-closing marker or angle forms with href prop: (jsx:Name href="...") or <Name href="..." />
    out = out.replace(/\(jsx:([A-Z][\w-]*)([^\)]*)\/\)/g, (m, name, props) => {
      const hrefMatch = String(props).match(/(?:href|url|to|link)=(?:"([^"]*)"|'([^']*)'|([^\s)]+))/i);
      if (hrefMatch) {
        const href = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
        const textMatch = String(props).match(/(?:title|caption|alt)=?(?:"([^"]*)"|'([^']*)'|([^\s)]+))/i);
        const text = (textMatch && (textMatch[1]||textMatch[2]||textMatch[3])) ? (textMatch[1]||textMatch[2]||textMatch[3]) : href;
        if (href) return `[${text}](${href})`;
      }
      return m;
    });
    out = out.replace(/<([A-Z][\w-]*)\b([^>]*)\/\>/g, (m, name, props) => {
      const hrefMatch = String(props).match(/(?:href|url|to|link)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      if (hrefMatch) {
        const href = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
        const textMatch = String(props).match(/(?:title|caption|alt)=?(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const text = (textMatch && (textMatch[1]||textMatch[2]||textMatch[3])) ? (textMatch[1]||textMatch[2]||textMatch[3]) : href;
        if (href) return `[${text}](${href})`;
      }
      return m;
    });

  } catch (e) {
    return s;
  }
  return out;
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
      // First convert any HTML anchors to Markdown so hrefs are preserved
      // in the exported XLIFF text. Then normalize encoded angle brackets so
      // stored entities like &lt;Details&gt; are also converted to marker
      // form. Do not unescape &amp; here to avoid mangling other entities.
      // Normalize nested markdown links, convert to inline form so hrefs
      // survive CAT-tool round-trips, then convert HTML anchors and JSX prop
      // links.
      let conv = outsideCodeFences(normalizeNestedMarkdownLinks)(String(safeSource));
      conv = outsideCodeFences(markdownLinksToInlineUrl)(conv);
      conv = outsideCodeFences(htmlAnchorsToMarkdown)(conv);
      // Extra debug output for specific problematic document
      try {
        if (DEBUG && u && String(u.id) === 'Getting-started---working-in-the-cloud') {
          console.error('[xliff-debug-unit] id=' + u.id + ' serializedSourceLen=' + String((safeSource||'').length));
          console.error('[xliff-debug-unit] after normalizeNestedMarkdownLinks:\n' + normalizeNestedMarkdownLinks(String(safeSource)).slice(0,2000));
          console.error('[xliff-debug-unit] after markdownLinksToInlineUrl:\n' + markdownLinksToInlineUrl(normalizeNestedMarkdownLinks(String(safeSource))).slice(0,2000));
          console.error('[xliff-debug-unit] after htmlAnchorsToMarkdown:\n' + htmlAnchorsToMarkdown(markdownLinksToInlineUrl(normalizeNestedMarkdownLinks(String(safeSource)))).slice(0,2000));
        }
      } catch (e) {}
      // If conversion appears to have lost hrefs, attempt AST-based repair
      try {
        if ((!/https?:\/\//.test(conv) || /\[.*\]\(/.test(safeSource)) && src && src._values) {
          conv = repairLinksFromAst(conv, src._values.body || src._values);
          // If repair didn't find pairs, try extracting raw URLs from the
          // source object and append them to list items in order.
          if ((!/https?:\/\//.test(conv) || !/</.test(conv)) ) {
            try {
              const urls = findUrlsInObject(src._values);
              if (urls && urls.length) conv = appendUrlsToListItems(conv, urls);
            } catch (e) {}
          }
        }
      } catch (e) {}
      // Convert JSX/marker props that look like links into explicit markdown
      // prior to angle->marker conversion so hrefs are visible to translators.
      conv = outsideCodeFences(convertJsxPropLinksToMarkdown)(conv);
      conv = outsideCodeFences(s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>'))(conv);
      // Convert angle-bracket JSX to marker form for CAT tools; do not
      // append parenthetical annotations here to avoid duplicate prop
      // annotations in the exported XLIFF. Translators will see props
      // inside the marker form itself.
      conv = outsideCodeFences(angleToMarker)(conv);
      safeSource = conv;
    } catch (e) {
      // ignore and fall back to raw source
    }
    // sanitize control chars before emitting
    const sanitizedSource = stripControlChars(safeSource);
    body += `        <source xml:space="preserve">${escapeXmlPreserveNewlines(sanitizedSource)}</source>\n`;
    // Ensure target text also preserves anchor hrefs and markdown links.
    // Convert markdown links to inline form and convert any HTML anchors
    // or JSX-prop links so hrefs are visible in the exported XLIFF target.
    let safeTarget = outsideCodeFences(normalizeNestedMarkdownLinks)(String(u.targetBody || ''));
    safeTarget = outsideCodeFences(markdownLinksToInlineUrl)(safeTarget);
    safeTarget = outsideCodeFences(htmlAnchorsToMarkdown)(safeTarget);
    safeTarget = outsideCodeFences(convertJsxPropLinksToMarkdown)(safeTarget);
    const sanitizedTarget = stripControlChars(safeTarget);
    body += `        <target xml:space="preserve">${escapeXmlPreserveNewlines(sanitizedTarget)}</target>\n`;
    body += `      </segment>\n`;
    body += `    </unit>\n`;
  }
  body += '  </file>\n';
  const footer = '</xliff>\n';
  return header + body + footer;
}

export async function importXliffBundle(client, xliffText, language, onProgress) {
  // Surface an immediate progress signal so UI knows the import started
  try { if (onProgress) onProgress({ id: null, status: 'started' }); } catch (e) {}
  // Parse XLIFF using DOMParser
  let doc;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xliffText, 'application/xml');
  } catch (parseErr) {
    try { console.error && console.error('[xliff] parse error', parseErr); } catch (e) {}
    if (onProgress) onProgress({ id: null, status: 'error', error: 'XLIFF parse error: ' + (parseErr && parseErr.message ? parseErr.message : String(parseErr)) });
    return [{ id: null, status: 'error', error: 'XLIFF parse error' }];
  }
  // Be tolerant: XLIFF variants (or CAT tools like Swordfish) may wrap
  // units differently or add extra container tags. Try several fallbacks
  // to locate translation units: <unit> (XLIFF2), <trans-unit> (XLIFF1.2)
  // or fall back to scanning for <segment> elements and their parent
  // <unit> or <file> identifiers. Use a namespace-robust discovery.
  const allEls = Array.from(doc.getElementsByTagName('*'));
  let units = allEls.filter(el => {
    const ln = (el.localName || el.tagName || '').toLowerCase();
    return ln === 'unit' || ln === 'trans-unit';
  });
  if (!units || units.length === 0) {
    // find <segment> and use its ancestor as a unit-like container
    const segs = allEls.filter(el => (el.localName || el.tagName || '').toLowerCase() === 'segment');
    units = segs.map(s => {
      // prefer parent unit/trans-unit, otherwise parent node
      if (!s) return s;
      const p = s.parentNode;
      if (!p) return s;
      const pln = (p.localName || p.tagName || '').toLowerCase();
      if (pln === 'unit' || pln === 'trans-unit') return p;
      return s;
    });
  }
  // make unique (segments map could include duplicates)
  units = units.filter((v, i, a) => a.indexOf(v) === i);
  // diagnostic: report how many units were discovered
  try { console.log && console.log('[xliff] discovered units:', units.length); } catch (e) {}
  // inform UI of discovered unit count
  try { if (onProgress) onProgress({ id: null, status: 'discovered', count: units.length }); } catch (e) {}
  const results = [];
  for (const unit of units) {
    try { console.debug && console.debug('[xliff] processing unit element', unit && (unit.getAttribute ? unit.getAttribute('id') : null)); } catch (e) {}
    // Try to determine an id for this unit. If unit lacks an explicit id,
    // attempt to find one on ancestor elements or derive one from a
    // `path:` note emitted by our exporter.
    const canonicalize = (p) => {
      if (!p) return p;
      let s = String(p);
      // if path contains language + plugin prefix, strip language and prefix
      const m = s.match(/^[a-zA-Z0-9_-]+\/(.*)$/);
      if (m) s = m[1];
      s = s.replace(/^docusaurus-plugin-content-docs\/current\//, '');
      s = s.replace(/\.mdx?$|\.md$/i, '');
      s = s.replace(/\/(?:index|readme)$/i, '');
      if (s.startsWith('/')) s = s.slice(1);
      return s;
    };

    let id = null;
    if (unit.getAttribute && unit.getAttribute('id')) id = unit.getAttribute('id');
    // try ancestor nodes for id
    if (!id) {
      let p = unit.parentNode;
      while (p) {
        if (p.getAttribute && p.getAttribute('id')) { id = p.getAttribute('id'); break; }
        p = p.parentNode;
      }
    }
    // Try to find source/target elements in this unit (tolerant of extra wrapper tags)
    const sourceEl = unit.getElementsByTagName ? (unit.getElementsByTagName('source')[0] || null) : null;
    const targetEl = unit.getElementsByTagName ? (unit.getElementsByTagName('target')[0] || null) : null;
    const notes = unit.getElementsByTagName ? Array.from(unit.getElementsByTagName('note')) : [];
    // Find a note that starts with 'title:' (robust to ordering and whitespace)
    let titleNote = null;
    if (notes && notes.length) {
      for (const n of notes) {
        const t = readElementTextPreservingLineBreaks(n) || '';
        const m = t.match(/^\s*title:\s*(.*)$/i);
        if (m && m[1]) { titleNote = m[1].trim(); break; }
      }
    }
    // if no id yet, look for a note that begins with 'path:' which our exporter
    // includes and derive id/relative path from it. Prefer preserving the
    // original filename (including extension) for GraphQL relativePath so we
    // don't lose the .mdx extension required by the API.
    let rawPathFromNote = null;
    if (notes && notes.length) {
      for (const n of notes) {
        const t = readElementTextPreservingLineBreaks(n) || '';
        const m = t.match(/^path:\s*(.*)$/i);
        if (m && m[1]) {
          rawPathFromNote = m[1].trim();
          // use canonicalized id (without extensions) for unit id if id missing
          const cand = canonicalize(rawPathFromNote);
          if (!id && cand) id = cand;
          break;
        }
      }
    }

    // Extract visible text from the target while ignoring decorative XML tags
    const extractVisible = (el) => {
      if (!el) return '';
      if (el.nodeType === 3) return el.nodeValue || '';
      let out = '';
      const nodes = Array.from(el.childNodes || []);
      for (const n of nodes) {
        if (n.nodeType === 3) {
          out += n.nodeValue || '';
        } else if (n.nodeType === 1) {
          const tag = (n.tagName || '').toLowerCase();
          if (tag === 'lb' || tag === 'br') {
            out += '\n';
          } else if (tag === 'a') {
            // preserve links as Markdown [text](href)
            const href = n.getAttribute && (n.getAttribute('href') || n.getAttribute('xlink:href') || n.getAttribute('data-href')) || '';
            const inner = extractVisible(n) || '';
            if (href) out += `[${inner}](${href})`;
            else out += inner;
          } else {
            out += extractVisible(n);
          }
        }
      }
      return out;
    };

    let rawTarget = targetEl ? extractVisible(targetEl) : '';
    // If XML target contains JSON (export previously stored JSON), parse it;
    // otherwise treat as markdown/plain text and send through as-is.
    // Quick normalization: undo some remaining escape sequences that CAT
    // tools leave behind and normalize bullet characters. This helps when
    // translators escape list markers ("\\- item") or the export wrapped
    // links in anchor tags which we just reconstructed above.
    try {
      // Remove backslashes that CAT tools (e.g. Swordfish) insert before
      // markdown-significant characters. This must be done before we parse
      // the markdown into a Tina AST. The pattern covers:
      //   \# \* \- \+ \[ \] \( \) \> \` \_ \! \| \~ \. \: \\
      // Note: \\n is left as-is (actual escaped newline) so we only strip
      // backslash when followed by a non-alphanumeric, non-space character
      // commonly used as a markdown control character.
      rawTarget = rawTarget.replace(/\\([#\*\-\+\[\]\(\)>`_~!|:\.\\])/g, '$1');
      // Undo escaped ordered-list dot: "1\. " -> "1. " (already covered by
      // the general pattern above, but keep for clarity)
      // Convert dash bullets to asterisk bullets for consistency with Tina
      // Preserve leading whitespace (indentation) for nested lists.
      // Only convert outside fenced code blocks so YAML/shell dashes are kept.
      rawTarget = outsideCodeFences(s => s.replace(/(^|\n)(\s*)-\s+/g, '$1$2* '))(rawTarget);
      // Trim accidental trailing whitespace per-line
      rawTarget = rawTarget.split('\n').map(l => l.replace(/\s+$/,'')).join('\n');
    } catch (e) {}

    // Targets exported by older flows may be JSON blobs; try to parse
    // JSON when it looks like a JSON object, otherwise keep string.
    let parsedBody = rawTarget;
    if (rawTarget && typeof rawTarget === 'string' && rawTarget.trim().startsWith('{')) {
      try { parsedBody = JSON.parse(rawTarget); } catch (e) { parsedBody = rawTarget; }
    }
    // Convert angle-bracket JSX (e.g. <Footnote summary="1">...</Footnote>
    // or <Footnote ... />) to marker form so the parser handles them
    // uniformly. CAT tools like Swordfish may convert marker-form JSX to
    // HTML-entity angle brackets which extractVisible decodes back to real
    // angle brackets. We must NOT touch JSX inside fenced code blocks.
    try {
      // Split on fenced code block boundaries, convert only outside fences
      const fenceParts = rawTarget.split(/(^```[\s\S]*?^```)/m);
      for (let fp = 0; fp < fenceParts.length; fp++) {
        if (fp % 2 === 0) {
          // Outside fenced code – convert angle-bracket JSX to marker form
          // Paired: <Name props>content</Name>
          fenceParts[fp] = fenceParts[fp].replace(/<([A-Z][\w-]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, '(jsx:$1$2)$3(/jsx:$1)');
          // Self-closing: <Name props />
          fenceParts[fp] = fenceParts[fp].replace(/<([A-Z][\w-]*)\b([^>]*)\s*\/>/g, '(jsx:$1$2/)');
        }
      }
      rawTarget = fenceParts.join('');
    } catch (e) {}
    // The parseMarkdownToTinaAst parser handles marker-form JSX directly
    // and creates proper mdxJsxFlowElement/mdxJsxTextElement nodes,
    // avoiding the problem where angle-bracket JSX in text nodes gets
    // backslash-escaped by Tina.

    // Build relativePath used by Tina
    // compute relativePath used by Tina update mutation. Prefer the raw path
    // emitted in notes (which contains filename + extension). If that's not
    // available, fall back to `id` and append `.mdx` to satisfy the API.
    let rel = null;
    if (rawPathFromNote) {
      let cleaned = rawPathFromNote.replace(/^docs\//, '');
      rel = `${language}/docusaurus-plugin-content-docs/current/${cleaned}`;
    } else if (id) {
      // ensure extension present
      const withExt = /\.[a-zA-Z0-9]+$/.test(id) ? id : `${id}.mdx`;
      rel = `${language}/docusaurus-plugin-content-docs/current/${withExt}`;
    } else {
      rel = null;
    }
    if (!rel) {
      const errMsg = `missing unit id`;
      try { console.warn && console.warn('[xliff] skipping unit without id'); } catch (e) {}
      results.push({ id: id || null, status: 'error', error: errMsg });
      if (onProgress) onProgress({ id: id || null, status: 'error', error: errMsg });
      continue;
    }

    try {
      // Use the same request shape the rest of the dashboard uses.
      const mutation = `
        mutation UpdateI18n($relativePath: String!, $params: I18nMutation!) {
          updateI18n(relativePath: $relativePath, params: $params) { id }
        }
      `;
        // Build variables matching the UpdateI18n mutation: `params` must be
        // an `I18nMutation` object (not wrapped under `i18n`).
        // Ensure body is a JSON object as expected by the I18nMutation schema.
        // If parsedBody is a plain string (markdown/plain text), preserve
        // its newlines and common Markdown constructs rather than collapsing
        // them to single-line paragraphs. Also attempt to undo some CAT-tool
        // escapes and normalize empty paired JSX tags into self-closing form.
        let bodyPayload = parsedBody;
        if (typeof parsedBody === 'string') {
          try {
            // Collapse empty paired JSX tags like `<Comp ...></Comp>` -> `<Comp ... />`
            parsedBody = parsedBody.replace(/<([A-Z][\\w-]*)([^>]*)>\s*<\/\1>/g, '<$1$2 />');
          } catch (e) {
            /* ignore */
          }
          try {
            // Comprehensive backslash-unescape for markdown control characters
            // that CAT tools may have inserted. The first rawTarget cleanup
            // handles the bulk, but if parsedBody went through JSON-parse or
            // markerToAngle it may have re-introduced some escapes.
            parsedBody = parsedBody.replace(/\\([#\*\-\+\[\]\(\)>`_~!|:\.\\])/g, '$1');
            // Some CAT tools encode '#' as HTML entity; unescape common ones
            parsedBody = parsedBody.replace(/&#35;|&num;/g, '#');
          } catch (e) {}

          // Preserve full markdown text by parsing it into the structured
          // Tina AST that TinaCMS expects for the `body` field. Previously
          // the code split on double-newlines and wrapped each chunk in a
          // bare { type: 'p', children: [{ type: 'text', text: ... }] } node
          // which caused Tina's serializer to backslash-escape every Markdown
          // control character (headings, list markers, backticks, etc.).
          bodyPayload = parseMarkdownToTinaAst(String(parsedBody || ''));
        }

      // Seed metadata from <note> entries as a fallback when the source
      // doc cannot be fetched (TinaCloud may reject doc queries).
      let sourceMetaParams = {};
      try {
        const noteMeta = {};
        if (notes && notes.length) {
          for (const n of notes) {
            const t = readElementTextPreservingLineBreaks(n) || '';
            const m = t.match(/^\s*([^:]+):\s*([\s\S]*)$/);
            if (!m) continue;
            const k = String(m[1] || '').trim();
            const vRaw = (m[2] || '').trim();
            if (!k) continue;
            const lk = k.toLowerCase();
            if (lk === 'path') { noteMeta.path = vRaw; continue; }
            if (lk === 'title') { noteMeta.title = vRaw; continue; }
            if (lk === 'description') { noteMeta.description = vRaw; continue; }
            if (lk === 'tags') {
              let vals = null;
              try { if (/^[\[\{]/.test(vRaw)) vals = JSON.parse(vRaw); } catch (e) { vals = null; }
              if (!vals) vals = vRaw.split(/\s*,\s*/).filter(Boolean);
              noteMeta.tags = Array.isArray(vals) ? vals : [String(vals)];
              continue;
            }
            if (['draft','review','translate','approved','published','unlisted'].includes(lk)) {
              noteMeta[lk] = (/^(true|1|yes)$/i).test(vRaw);
              continue;
            }
            if (lk === 'conditions') {
              let vals = null;
              try { if (/^[\[]/.test(vRaw)) vals = JSON.parse(vRaw); } catch (e) { vals = null; }
              if (!vals) vals = vRaw.split(/\s*,\s*/).filter(Boolean);
              noteMeta.conditions = Array.isArray(vals) ? vals : [String(vals)];
              continue;
            }
            noteMeta[k] = vRaw;
          }
        }
        sourceMetaParams = Object.assign({}, noteMeta);
      } catch (e) {
        /* ignore note parsing errors */
      }

      // Try to clone metadata from the source doc via GraphQL if available.
      try {
        let sourceDocRel = null;
        if (rawPathFromNote) {
          let rp = String(rawPathFromNote || '').replace(/^\/?/, '');
          // Normalize several common shapes and map them to the plugin-relative
          // path used by the GraphQL `doc` query: `docusaurus-plugin-content-docs/current/...`.
          if (rp.startsWith('docusaurus-plugin-content-docs/current/')) {
            sourceDocRel = rp;
          } else if (rp.startsWith('docs/')) {
            const stripped = rp.replace(/^docs\//, '');
            sourceDocRel = `docusaurus-plugin-content-docs/current/${stripped}`;
          } else if (rp.indexOf('docusaurus-plugin-content-docs/current/') !== -1) {
            const extracted = rp.replace(/^.*?(docusaurus-plugin-content-docs\/current\/)/, '$1');
            sourceDocRel = extracted;
          } else {
            sourceDocRel = `docusaurus-plugin-content-docs/current/${rp}`;
          }
        } else if (id) {
          const cleaned = String(id).replace(/^\//, '').replace(/\.mdx?$|\.md$/i, '');
          sourceDocRel = `docusaurus-plugin-content-docs/current/${cleaned}.mdx`;
        }
        if (sourceDocRel) {
          // Normalize accidental double-prefixes like "docs/docs/..." and
          // strip leading slashes so queries target the expected relativePath.
          try {
            sourceDocRel = String(sourceDocRel || '').replace(/^\//, '').replace(/^docs\/+/, 'docs/');
          } catch (e) {}
          try { console.debug && console.debug('[xliff] sourceDocRel normalized to', sourceDocRel); } catch (e) {}
          try {
            const docQuery = await client.queries.doc({ relativePath: sourceDocRel });
            const sdoc = docQuery && docQuery.data && docQuery.data.doc ? docQuery.data.doc : null;
            if (sdoc) {
              // Dynamically copy all non-null fields from the source doc,
              // skipping internal/GraphQL fields and body/lastmod.
              const skipKeys = new Set(['__typename', '_sys', '_values', 'id', 'body', 'lastmod']);
              for (const k of Object.keys(sdoc)) {
                if (skipKeys.has(k)) continue;
                if (sdoc[k] != null) {
                  sourceMetaParams[k] = Array.isArray(sdoc[k]) ? sdoc[k].slice() : sdoc[k];
                }
              }
            }
          } catch (dqErr) {
            try { console.warn && console.warn('[xliff] source doc query failed for', sourceDocRel, dqErr && dqErr.message); } catch (e) {}
          }
        }
      } catch (metaErr) {
        try { console.warn && console.warn('[xliff] metadata clone failed', metaErr && metaErr.message); } catch (e) {}
      }

      // Build final params.
      // Prefer preserving an existing translation's frontmatter (except lastmod).
      // If a translation doc exists at `rel`, clone its metadata and replace
      // the `body` with the imported content. If no translation exists,
      // fall back to source-cloned metadata (or notes) and the title note.
      let paramsObj = {};
      try {
        let existingTranslation = null;
        try {
          const trQuery = await client.queries.i18n({ relativePath: rel });
          existingTranslation = trQuery && trQuery.data && trQuery.data.i18n ? trQuery.data.i18n : null;
        } catch (e) {
          // If fetching the existing translation fails (cloud permissions),
          // we'll fall back to source metadata parsed from notes or cloned source.
          existingTranslation = null;
        }

        if (existingTranslation) {
          // Retain whatever metadata is present in the existing translation.
          // Skip internal/GraphQL fields and lastmod/body (we set those below).
          const skipKeys = new Set(['__typename', '_sys', '_values', 'id', 'body', 'lastmod']);
          for (const k of Object.keys(existingTranslation)) {
            if (skipKeys.has(k)) continue;
            if (existingTranslation[k] != null) {
              paramsObj[k] = Array.isArray(existingTranslation[k]) ? existingTranslation[k].slice() : existingTranslation[k];
            }
          }
        } else {
          // No existing translation: use cloned source metadata (from notes or
          // source doc) as a starting point. Only include keys with meaningful values.
          for (const k of Object.keys(sourceMetaParams || {})) {
            if (sourceMetaParams[k] != null) paramsObj[k] = sourceMetaParams[k];
          }
          if (titleNote) paramsObj.title = titleNote;
        }
      } catch (buildErr) {
        // Fallback to source-cloned metadata if anything unexpected fails.
        // Only include keys with meaningful values.
        for (const k of Object.keys(sourceMetaParams || {})) {
          if (sourceMetaParams[k] != null) paramsObj[k] = sourceMetaParams[k];
        }
        if (titleNote) paramsObj.title = titleNote;
      }

      // Always replace the body with the imported payload and set new lastmod
      paramsObj.body = bodyPayload;
      paramsObj.lastmod = (new Date()).toISOString();
      // Sanitize params: strip internal/GraphQL keys and null/undefined values
      const internalKeys = new Set(['__typename', '_sys', '_values', 'id']);
      const sanitized = {};
      for (const k of Object.keys(paramsObj)) {
        if (internalKeys.has(k)) continue;
        if (paramsObj[k] != null) sanitized[k] = paramsObj[k];
      }
      const variables = { relativePath: rel, params: sanitized };
      // client.request in the dashboard expects an object with query/variables
      try { console.debug && console.debug('[xliff] sending update for', rel); } catch (e) {}
      // Send request and inspect response for GraphQL errors. Some client
      // implementations return a response object rather than throwing on
      // GraphQL errors, so we must explicitly check `errors` to avoid
      // reporting success when nothing changed.
      let resp;
      try {
        resp = await client.request({ query: mutation, variables });
      } catch (requestErr) {
        const emsg = requestErr && requestErr.message ? requestErr.message : String(requestErr);
        try { console.warn && console.warn('[xliff] request threw for', rel, emsg); } catch (e) {}
        results.push({ id, status: 'error', error: emsg });
        if (onProgress) onProgress({ id, status: 'error', error: emsg });
        continue;
      }

      // The generated Tina requester may return { data, errors } or the raw
      // GraphQL data. Inspect both shapes and ensure updateI18n succeeded.
      const respErrors = resp && (resp.errors || (resp.data && resp.data.errors)) || null;
      if (respErrors && respErrors.length) {
        const msg = (respErrors.map && respErrors.map(e => (e && e.message) ? e.message : String(e)).join('; ')) || 'GraphQL errors';
        try { console.warn && console.warn('[xliff] update failed for', rel, msg, resp); } catch (e) {}
        results.push({ id, status: 'error', error: msg, response: resp });
        if (onProgress) onProgress({ id, status: 'error', error: msg, response: resp });
        continue;
      }

      // If no explicit errors, ensure the mutation returned a valid payload.
      const data = resp && (resp.data || resp);
      const updated = data && (data.updateI18n || (data.updateI18n === null ? null : (Object.values(data).find(v => v && v.id))));
      if (!updated) {
        // If updateI18n is absent or null, surface the whole response for diagnosis
        const msg = 'No update returned from server';
        try { console.warn && console.warn('[xliff] no update for', rel, resp); } catch (e) {}
        results.push({ id, status: 'error', error: msg, response: resp });
        if (onProgress) onProgress({ id, status: 'error', error: msg, response: resp });
      } else {
        try { console.debug && console.debug('[xliff] update successful for', rel, updated); } catch (e) {}
        results.push({ id, status: 'updated' });
        if (onProgress) onProgress({ id, status: 'updated' });
      }
    } catch (err) {
      const errMsg = err && err.message ? err.message : String(err);
      results.push({ id, status: 'error', error: errMsg });
      if (onProgress) onProgress({ id, status: 'error', error: errMsg });
    }
  }
  return results;
}

export default { exportOutOfDateAsXliff, importXliffBundle };
