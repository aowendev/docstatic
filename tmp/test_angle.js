import fs from 'fs';
import path from 'path';
(async ()=>{
  const xliff = await import(path.resolve('src/utils/xliff.js'));
  const mdx = fs.readFileSync(path.resolve('docs/guides/markdown-features/admonitions.mdx'), 'utf8');
  const body = (function extractBody(text){const m=String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n?/); if(!m) return text; return text.slice(m[0].length);} )(mdx);
  const conv = xliff.angleToMarker ? xliff.angleToMarker(body) : xliff.default.angleToMarker(body);
  console.log('---Converted---');
  console.log(conv);
})().catch(e=>{console.error(e); process.exit(1);});
