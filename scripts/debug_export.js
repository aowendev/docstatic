// Debug script: run GraphQL exporter and list unit ids
(async () => {
  try {
    const fs = await import('fs');
    const clientPath = 'tina/__generated__/client.js';
    const clientJs = fs.readFileSync(clientPath, 'utf8');
    const urlMatch = clientJs.match(/url:\s*"([^"]+)"/);
    const tokenMatch = clientJs.match(/token:\s*"([^"]+)"/);
    const url = urlMatch ? urlMatch[1] : null;
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!url) throw new Error('Could not extract GraphQL URL from tina/__generated__/client.js');

    const types = await import('../tina/__generated__/types.js');
    const { getSdk } = types;

    const fetch = (await import('node-fetch')).default;

    const requester = async (doc, variables) => {
      const body = { query: doc.loc && doc.loc.source && doc.loc.source.body ? doc.loc.source.body : String(doc), variables };
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      return res.json();
    };

    const sdk = getSdk(requester);
    const xliffMod = await import('../src/utils/xliff.js');
    const lang = process.argv[2] || 'fr';

    // Fetch all docs
    let docs = [];
    let after = null;
    while (true) {
      const resp = await sdk.docConnection({ sort: 'title', first: 100, after });
      const chunk = resp?.data?.docConnection?.edges || resp?.docConnection?.edges || [];
      docs = docs.concat(chunk.map(e => e.node));
      const pageInfo = resp?.data?.docConnection?.pageInfo || resp?.docConnection?.pageInfo;
      if (!pageInfo || !pageInfo.hasNextPage) break;
      after = pageInfo.endCursor;
    }

    // Fetch all i18n
    let i18n = [];
    after = null;
    while (true) {
      const resp = await sdk.i18nConnection({ sort: 'title', first: 100, after });
      const chunk = resp?.data?.i18nConnection?.edges || resp?.i18nConnection?.edges || [];
      i18n = i18n.concat(chunk.map(e => e.node));
      const pageInfo = resp?.data?.i18nConnection?.pageInfo || resp?.i18nConnection?.pageInfo;
      if (!pageInfo || !pageInfo.hasNextPage) break;
      after = pageInfo.endCursor;
    }

    const canonicalize = (p) => {
      if (!p) return p;
      let s = p.replace(/\.mdx?$|\.md$/i, '');
      s = s.replace(/\/(index|readme)$/i, '');
      if (s.startsWith('/')) s = s.slice(1);
      return s;
    };

    const sourceMap = {};
    for (const node of docs) {
      const rel = node._sys?.relativePath || node._sys?.filename || '';
      let clean = rel;
      if (rel.startsWith('docs/')) clean = rel.replace(/^docs\//, '');
      if (clean.startsWith('api/')) continue;
      sourceMap[canonicalize(clean)] = node;
    }

    const translationsMap = {};
    for (const node of i18n) {
      const relPath = node._sys?.relativePath || node._sys?.filename || '';
      const m = relPath.match(/^([a-zA-Z0-9_-]+)\/(.*)$/);
      if (!m) continue;
      const langTag = m[1];
      if (langTag !== lang) continue;
      const afterPart = m[2];
      const prefix = 'docusaurus-plugin-content-docs/current/';
      if (!afterPart.startsWith(prefix)) continue;
      const cleanAfter = afterPart.replace(new RegExp(`^${prefix}`), '');
      if (cleanAfter.startsWith('api/') || cleanAfter.startsWith('wiki/')) continue;
      translationsMap[canonicalize(cleanAfter)] = node;
    }

    // Determine out-of-date keys (from raw query comparison)
    const outKeys = [];
    for (const key of Object.keys(sourceMap)) {
      const src = sourceMap[key];
      const tr = translationsMap[key];
      if (!tr) continue;
      const srcDate = src && src.lastmod ? new Date(src.lastmod) : null;
      const trDate = tr && tr.lastmod ? new Date(tr.lastmod) : null;
      const isOutOfDate = srcDate && (!trDate || trDate < srcDate);
      if (isOutOfDate) outKeys.push(key);
    }

    console.log('Detected out-of-date count:', outKeys.length);
    console.log(outKeys.join('\n'));

    // Dump the source node for a problematic key for inspection
    const probe = 'guides/markdown-features/assets';
    if (sourceMap[probe]) {
      console.log('\n--- SOURCE NODE DUMP for', probe, '---');
      try {
        console.log(JSON.stringify(sourceMap[probe], Object.keys(sourceMap[probe]).sort(), 2));
      } catch (e) { console.log('error printing node', e); }
    }

      // Try fetching the single doc via SDK doc() to compare
      try {
        const relPath = 'docs/' + probe + '.mdx';
        const single = await sdk.doc({ relativePath: relPath });
        console.log('\n--- SDK doc() result for', relPath, '---');
        console.log(JSON.stringify(single, null, 2).slice(0,2000));
      } catch (e) {
        console.log('sdk.doc() fetch failed:', e && e.message ? e.message : e);
      }

    // Now run the actual exporter function to see which units it emits
    const clientWrapper = { queries: { docConnection: (vars) => sdk.docConnection(vars), i18nConnection: (vars) => sdk.i18nConnection(vars) }, request: async (q, vars) => {
      // generic requester using SDK if needed
      // fallback: use fetch
      try {
        // If q is a string mutation, post directly
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ query: q, variables: vars }) });
        return res.json();
      } catch (e) { return {}; }
    } };

    const xliffText = await xliffMod.exportOutOfDateAsXliff(clientWrapper, lang);
    // write current export to a temp file for inspection
    try {
      const fss = await import('fs');
      fss.writeFileSync('/tmp/export_now.xlf', xliffText, 'utf8');
    } catch (e) {
      // ignore write errors
    }
    const re = /<unit\s+id="([^"]+)"/g;
    const emitted = [];
    let mm;
    while ((mm = re.exec(xliffText)) !== null) emitted.push(mm[1]);

    console.log('\nExporter emitted count:', emitted.length);
    console.log(emitted.join('\n'));

    // Show difference
    const missing = outKeys.filter(k => !emitted.includes(k));
    const extra = emitted.filter(k => !outKeys.includes(k));
    console.log('\nMissing from exporter (expected but not emitted):', missing.length);
    console.log(missing.join('\n'));
    console.log('\nExtra emitted (not expected):', extra.length);
    console.log(extra.join('\n'));

  } catch (e) {
    console.error('Error running debug export:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
