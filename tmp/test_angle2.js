import fs from 'fs';
import path from 'path';

function angleToMarker(source) {
  if (!source || typeof source !== 'string') return source;
  source = (function scanChildrenProps(s) {
    let out = '';
    let idx = 0;
    while (true) {
      const m = s.slice(idx).match(/<([A-Z][\w]*)\b[^>]*?\bchildren=\{/);
      if (!m) { out += s.slice(idx); break; }
      const matchIndex = idx + m.index;
      out += s.slice(idx, matchIndex);
      const tagStart = matchIndex;
      const bracePos = s.indexOf('{', tagStart + m[0].length - 1);
      if (bracePos === -1) { out += s.slice(matchIndex); break; }
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
      const children = s.slice(bracePos + 1, j - 1 + 1);
      const tagEnd = s.indexOf('>', j);
      if (tagEnd === -1) { out += s.slice(matchIndex); break; }
      const fullTag = s.slice(tagStart, tagEnd + 1);
      const withoutChildren = fullTag.replace(/\bchildren=\{[\s\S]*?\}/, '').replace(/\s+/g, ' ').trim();
      const selfClosing = /\/\>\s*$/.test(fullTag);
      const propsStr = withoutChildren.replace(/^<[^\s]+/, '').replace(/^[\s>]+|[\s>]+$/g, '').trim();
      const p = propsStr ? ' ' + propsStr : '';
      out += `(jsx:${m[1]}${p})${children}(/jsx:${m[1]})`;
      idx = tagEnd + 1;
    }
    return out;
  })(source);
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)\/\>/g, (_m, name, props) => {
    const p = props.trim().replace(/\s+/g, ' ');
    return `(jsx:${name}${p ? ' ' + p : ''}/)`;
  });
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)\bchildren=\{([\s\S]*?)\}([^>]*)\/?\>/g, (_m, name, before, child, after) => {
    const props = (before + ' ' + after).trim().replace(/\s+/g, ' ');
    const p = props ? ' ' + props : '';
    return `(jsx:${name}${p})${child}(/jsx:${name})`;
  });
  source = source.replace(/<([A-Z][\w-]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (_m, name, props, children) => {
    const p = props.trim().replace(/\s+/g, ' ');
    return `(jsx:${name}${p ? ' ' + p : ''})${children}(/jsx:${name})`;
  });
  return source;
}

(async ()=>{
  const mdx = fs.readFileSync(path.resolve('docs/guides/markdown-features/admonitions.mdx'), 'utf8');
  const body = (function extractBody(text){const m=String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n?/); if(!m) return text; return text.slice(m[0].length);} )(mdx);
  console.log('---Converted---');
  console.log(angleToMarker(body));
})();
