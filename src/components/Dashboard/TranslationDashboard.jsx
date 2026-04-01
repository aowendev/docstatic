/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import * as xliffUtils from '../../utils/xliff';
import docusaurusData from '../../../config/docusaurus/index.json';

const TranslationDashboard = () => {
  const [status, setStatus] = useState('');
    // Delete all orphan topics
    const handleDeleteOrphanTopics = async () => {
      setStatus('');
      try {
        const { client } = await import('../../../tina/__generated__/client');
        const lang = selectedLanguage;
        const orphaned = translationData && translationData[lang] ? translationData[lang].orphaned : [];
        for (const item of orphaned) {
          await client.request({
            query: `
              mutation DeleteI18n($collection: String!, $relativePath: String!) {
                deleteDocument(collection: $collection, relativePath: $relativePath) {
                  ... on I18n {
                    id
                  }
                }
              }
            `,
            variables: {
              collection: 'i18n',
              relativePath: item.file
            }
          });
        }
        setStatus(`Deleted ${orphaned.length} orphan topics for ${lang}`);
        await scanTranslations();
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    };

    // Add all missing topics
    const handleAddMissingTopics = async () => {
      setStatus('');
      try {
        const { client } = await import('../../../tina/__generated__/client');
        const lang = selectedLanguage;
        const missing = translationData && translationData[lang] ? translationData[lang].missing : [];
        if (!missing || missing.length === 0) {
          setStatus('No missing topics to add');
          return;
        }
        setAdding(true);
        setAddProgress(0);
        for (const [idx, item] of missing.entries()) {
          // copy full metadata and body from sourceNode when available
          const sourceNode = item.sourceNode || null;
          const baseFile = item.file.replace(/^docs\//, '');
          const hasExt = /\.(mdx?|MDX?)$/.test(baseFile);
          const relPath = `${lang}/docusaurus-plugin-content-docs/current/${baseFile}${hasExt ? '' : '.mdx'}`;
          const paramsBody = {};
          if (sourceNode) {
            // copy known i18n fields from source node
            paramsBody.title = sourceNode.title || item.title;
            if (sourceNode.body) paramsBody.body = sourceNode.body;
            if (sourceNode.modifiedBy) paramsBody.modifiedBy = sourceNode.modifiedBy;
            if (sourceNode.help !== undefined) paramsBody.help = sourceNode.help;
            if (sourceNode.slug) paramsBody.slug = sourceNode.slug;
            if (sourceNode.tags) paramsBody.tags = sourceNode.tags;
            if (sourceNode.draft !== undefined) paramsBody.draft = sourceNode.draft;
            if (sourceNode.review !== undefined) paramsBody.review = sourceNode.review;
            if (sourceNode.translate !== undefined) paramsBody.translate = sourceNode.translate;
            if (sourceNode.approved !== undefined) paramsBody.approved = sourceNode.approved;
            if (sourceNode.published !== undefined) paramsBody.published = sourceNode.published;
            if (sourceNode.unlisted !== undefined) paramsBody.unlisted = sourceNode.unlisted;
          } else {
            paramsBody.title = item.title;
          }
          // ensure created translations start with required workflow metadata
          paramsBody.draft = false;
          paramsBody.review = false;
          paramsBody.translate = true;
          paramsBody.approved = false;
          paramsBody.published = false;
          paramsBody.unlisted = true;
          // set lastmod to one day earlier than source (or yesterday)
          let lastmodSource = null;
          if (sourceNode && sourceNode.lastmod) {
            lastmodSource = new Date(sourceNode.lastmod);
          } else if (item.sourceLastMod && item.sourceLastMod !== 'No date') {
            try {
              const parsed = new Date(item.sourceLastMod);
              if (!isNaN(parsed.getTime())) lastmodSource = parsed;
            } catch (e) {
              // ignore parse errors
            }
          }
          paramsBody.lastmod = lastmodSource ? new Date(lastmodSource.getTime() - 86400000).toISOString() : new Date(Date.now() - 86400000).toISOString();

          await client.request({
            query: `
              mutation CreateI18n($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
                createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
                  ... on I18n {
                    id
                  }
                }
              }
            `,
            variables: {
              collection: 'i18n',
              relativePath: relPath,
              params: { i18n: paramsBody }
            }
          });

          // update progress
          try {
            const pct = missing.length > 0 ? Math.round(((idx + 1) / missing.length) * 100) : 100;
            setAddProgress(pct);
            setStatus(`Adding ${idx + 1}/${missing.length} translations (${pct}%)`);
          } catch (e) {
            // ignore progress errors
          }
        }
        setStatus(`Added ${missing.length} missing topics for ${lang}`);
        await scanTranslations();
        setAddProgress(100);
        setTimeout(() => setAddProgress(null), 800);
        setAdding(false);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
        setAdding(false);
        setAddProgress(null);
      }
    };

    // Edit out-of-date doc
    const handleEditOutOfDateDoc = (file) => {
      const cleanFile = file.replace(/^docs\//, '').replace(/\.mdx$/, '').replace(/\.md$/, '');
      window.open(`/admin#/collections/edit/i18n/${selectedLanguage}/docusaurus-plugin-content-docs/current/${cleanFile}`, '_blank');
    };
  const [translationData, setTranslationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addProgress, setAddProgress] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  // Handle Import button: open file picker and run verbose GraphQL import
  const handleImportClick = async () => {
    try {
      setImporting(true);
      setImportProgress(null);
      const input = document.getElementById('xliff-upload');
      if (!input) return;
      input.value = '';
      input.click();
      const file = await new Promise((resolve) => {
        const onChange = () => {
          input.removeEventListener('change', onChange);
          const f = input.files && input.files[0];
          resolve(f);
        };
        input.addEventListener('change', onChange);
      });
      if (!file) return;
      setStatus(`Importing: ${file.name}`);
      const text = await file.text();
      const { client } = await import('../../../tina/__generated__/client');
      console.log('[debug-import] reading file', file.name, file.size);
      const results = await xliffUtils.importXliffBundle(client, text, selectedLanguage, (p) => {
        console.log('[debug-import] progress', p);
        if (p && p.id) setStatus(`Import ${p.id}: ${p.status}${p.error ? ' - ' + p.error : ''}`);
        if (p && p.progress !== undefined) setImportProgress(p.progress);
      });
      console.log('[debug-import] results', results);
      setStatus('Import complete');
      setImportProgress(100);
      setTimeout(() => setImportProgress(null), 800);
      setImporting(false);
      await scanTranslations();
    } catch (err) {
      console.error('[import] error', err);
      setStatus(`Import error: ${err && err.message ? err.message : String(err)}`);
      setImporting(false);
      setImportProgress(null);
    }
  };

  // (removed separate debug-upload handler) single Import button handles import

  const scanTranslations = async () => {
      setLoading(true);
      setError(null);
      try {
      // Build results container
      const results = {};
      const { client } = await import('../../../tina/__generated__/client');

      // Helper to normalize paths for comparison (strip extensions and index/readme)
      const canonicalize = (p) => {
        if (!p) return p;
        let s = p.replace(/\.mdx?$|\.md$/i, '');
        s = s.replace(/\/(index|readme)$/i, '');
        if (s.startsWith('/')) s = s.slice(1);
        return s;
      };

      // Fetch docs (source files) with pagination
      let docsEdges = [];
      let docsAfter = null;
      while (true) {
        const docsResult = await client.queries.docConnection({ sort: 'title', first: 100, after: docsAfter });
        const chunk = docsResult.data?.docConnection?.edges || [];
        docsEdges = docsEdges.concat(chunk);
        const pageInfo = docsResult.data?.docConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        docsAfter = pageInfo.endCursor;
      }
      const sourceMap = {}; // canonical -> node
      for (const edge of docsEdges) {
        const node = edge.node;
        const rel = node._sys?.relativePath || node._sys?.filename || '';
        // derive clean path by removing only a leading 'docs/' prefix
        let clean = rel;
        if (rel.startsWith('docs/')) {
          clean = rel.replace(/^docs\//, '');
        }
        // exclude generated API folder
        if (clean.startsWith('api/')) continue;
        const canonical = canonicalize(clean || rel);
        sourceMap[canonical] = node;
      }

      

      // Fetch translations and build map for the selected language with pagination
      let i18nEdges = [];
      let i18nAfter = null;
      while (true) {
        const i18nResult = await client.queries.i18nConnection({ sort: 'title', first: 100, after: i18nAfter });
        const chunk = i18nResult.data?.i18nConnection?.edges || [];
        i18nEdges = i18nEdges.concat(chunk);
        const pageInfo = i18nResult.data?.i18nConnection?.pageInfo;
        if (!pageInfo || !pageInfo.hasNextPage) break;
        i18nAfter = pageInfo.endCursor;
      }
      // Build translation maps grouped by language
      const translationsByLang = {}; // lang -> { canonical -> { node, originalPath, rawPath } }
      for (const edge of i18nEdges) {
        const node = edge.node;
        const relPath = node._sys?.relativePath || node._sys?.filename || '';
        const m = relPath.match(/^([a-zA-Z0-9_-]+)\/(.*)$/);
        if (!m) continue;
        const lang = m[1];
        const after = m[2];
        const prefix = 'docusaurus-plugin-content-docs/current/';
        if (!after.startsWith(prefix)) continue;
        let cleanAfter = after.replace(new RegExp(`^${prefix}`), '');
        // Keep the raw path (before stripping docs/) for Tina API operations
        const rawPath = cleanAfter;
        // Strip leading 'docs/' to match source doc paths
        if (cleanAfter.startsWith('docs/')) {
          cleanAfter = cleanAfter.replace(/^docs\//, '');
        }
        if (cleanAfter.startsWith('api/') || cleanAfter.startsWith('wiki/')) continue;
        const canonical = canonicalize(cleanAfter);

        translationsByLang[lang] = translationsByLang[lang] || {};
        const translationsMap = translationsByLang[lang];

        if (translationsMap[canonical]) {
          const existing = translationsMap[canonical];
          const isExistingIndex = /(?:^|\/)index$|(?:^|\/)readme$/i.test(existing.originalPath || '');
          const isNewIndex = /(?:^|\/)index$|(?:^|\/)readme$/i.test(cleanAfter);
          if (isExistingIndex && !isNewIndex) {
            translationsMap[canonical] = { node, originalPath: cleanAfter, rawPath };
          } else {
            try {
              const existingDate = existing.node?.lastmod ? new Date(existing.node.lastmod) : null;
              const newDate = node?.lastmod ? new Date(node.lastmod) : null;
              if (newDate && (!existingDate || newDate > existingDate)) {
                translationsMap[canonical] = { node, originalPath: cleanAfter, rawPath };
              }
            } catch (e) {
              // keep existing on errors
            }
          }
        } else {
          translationsMap[canonical] = { node, originalPath: cleanAfter, rawPath };
        }
      }

      // For each language, compare with source map and build results
      const sourceKeys = new Set(Object.keys(sourceMap));
      // Pre-build a 'missing all' list so empty languages can be shown
      const missingAll = [];
      for (const key of sourceKeys) {
        const src = sourceMap[key];
        const title = src.title || key;
        missingAll.push({ file: `docs/${key}`, sourceLastMod: src.lastmod || 'No date', title, sourceNode: src });
      }
      for (const lang of Object.keys(translationsByLang)) {
        const translationsMap = translationsByLang[lang] || {};
        const translationKeys = new Set(Object.keys(translationsMap));

        const missing = [];
        const outdated = [];
        const upToDate = [];
        const orphaned = [];

        for (const key of sourceKeys) {
          const src = sourceMap[key];
          const srcDate = src.lastmod ? new Date(src.lastmod) : null;
          const title = src.title || key;
          if (!translationKeys.has(key)) {
            missing.push({ file: `docs/${key}`, sourceLastMod: src.lastmod || 'No date', title, sourceNode: src });
            continue;
          }
          const tr = translationsMap[key].node;
          const trDate = tr.lastmod ? new Date(tr.lastmod) : null;
          if (!srcDate && !trDate) {
            upToDate.push({ file: `docs/${key}`, sourceLastMod: 'No date', translationLastMod: 'No date', title });
          } else if (srcDate && !trDate) {
            outdated.push({ file: `docs/${key}`, sourceLastMod: src.lastmod, translationLastMod: 'No date', title });
          } else if (!srcDate && trDate) {
            upToDate.push({ file: `docs/${key}`, sourceLastMod: 'No date', translationLastMod: tr.lastmod, title });
          } else {
            if (trDate >= srcDate) {
              upToDate.push({ file: `docs/${key}`, sourceLastMod: src.lastmod, translationLastMod: tr.lastmod, title });
            } else {
              outdated.push({ file: `docs/${key}`, sourceLastMod: src.lastmod, translationLastMod: tr.lastmod, title, daysBehind: Math.ceil((srcDate - trDate) / (1000*60*60*24)) });
            }
          }
        }

        for (const key of translationKeys) {
          if (!sourceKeys.has(key)) {
            const entry = translationsMap[key];
            const node = entry.node;
            const orig = entry.rawPath || entry.originalPath || key;
            orphaned.push({ file: `${lang}/docusaurus-plugin-content-docs/current/${orig}`, translationLastMod: node.lastmod || 'No date', title: node.title || orig });
          }
        }

        results[lang] = {
          missing,
          outdated,
          upToDate,
          orphaned,
          errors: [],
          total: Object.keys(sourceMap).length
        };
      }

      // Get supported languages from the imported docusaurus config, excluding
      // the default locale and any English variants (en-*).
      const supported = docusaurusData.languages?.supported || [];
      const defaultLocale = docusaurusData.languages?.default || 'en';
      const langsFromConfig = supported
        .filter(l => l.code !== defaultLocale && !l.code.startsWith('en'))
        .map(l => ({ code: l.code, label: l.label }));

      for (const langEntry of langsFromConfig) {
        const fsLang = langEntry.code;
        if (!results[fsLang]) {
          results[fsLang] = {
            missing: missingAll.slice(),
            outdated: [],
            upToDate: [],
            orphaned: [],
            errors: [],
            total: Object.keys(sourceMap).length
          };
        }
      }

      // If no translations found at all, ensure we still populate selectedLanguage key so UI remains consistent
      if (Object.keys(results).length === 0) {
        results[selectedLanguage] = {
          missing: [],
          outdated: [],
          upToDate: [],
          orphaned: [],
          errors: [],
          total: Object.keys(sourceMap).length
        };
      }

      // Ensure selectedLanguage is present in results (pick first available if not)
      const langsFound = Object.keys(results);
      if (langsFound.length > 0 && !results[selectedLanguage]) {
        setSelectedLanguage(langsFound[0]);
      }

      setTranslationData(results);
    } catch (error) {
      console.error('Error scanning translations:', error);
      setError(`Failed to scan translations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'outdated': return '#f59e0b';
      case 'missing': return '#ff6b6b';
      case 'upToDate': return '#2ed573';
      case 'orphaned': return '#9c88ff';
      default: return '#747d8c';
    }
  };

  const getTotalCounts = () => {
    if (!translationData) return {};
    
    return Object.keys(translationData).reduce((acc, lang) => {
      const data = translationData[lang];
      acc[lang] = {
        total: data.total || (data.missing.length + data.outdated.length + data.upToDate.length),
        missing: data.missing.length,
        outdated: data.outdated.length,
        upToDate: data.upToDate.length,
        orphaned: data.orphaned.length,
        errors: data.errors.length
      };
      return acc;
    }, {});
  };


  // Always show the heading and button row, but if not loaded, only show the Load button (no dashboard content)
  if (!translationData && !loading && !error) {
    return (
      <div style={{
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="text-3xl text-tina-orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </span>
            <h2 className="m-0 text-2xl font-bold text-gray-800">
              Translation Dashboard
            </h2>
          </div>
          <button
            onClick={scanTranslations}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#374151';
            }}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
          <div className="font-bold text-gray-800 text-xl mb-2">
            Loading Dashboard
          </div>
          <div className="font-medium text-gray-600 text-base mb-4">
            Scanning translations...
          </div>
          
          {/* Progress Bar for Loading */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              borderRadius: '3px',
              animation: 'indeterminate 2s ease-in-out infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#ffebee',
          borderLeft: '4px solid #d32f2f',
          borderRadius: '6px',
          color: '#d32f2f'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={scanTranslations}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#f59e0b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!translationData) {
    return (
      <div style={{
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px'
      }}>
        <div style={{ textAlign: 'center', color: '#656d76', fontSize: '16px' }}>
          No translation data available
        </div>
      </div>
    );
  }

  const totalCounts = getTotalCounts();
  const languages = Object.keys(translationData);

  return (
    <div style={{
      padding: '24px',
      borderBottom: '2px solid #d1d9e0',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-3xl text-tina-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" x2="22" y1="12" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </span>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            Translation Dashboard
          </h2>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={scanTranslations}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#374151';
            }}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleDeleteOrphanTopics}
            style={{
              padding: '5px 10px',
              backgroundColor: '#9c88ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            disabled={loading}
          >
            Remove Orphan Topics
          </button>
          <button
            onClick={handleAddMissingTopics}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: adding ? 'default' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={loading || adding}
          >
            {adding && (
              <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="39 25" />
                </g>
              </svg>
            )}
            {adding ? (addProgress !== null ? `Adding (${addProgress}%)` : 'Adding...') : 'Add Missing Topics'}
          </button>
          <button
            onClick={async () => {
              setStatus('Exporting via GraphQL...');
              try {
                const { client } = await import('../../../tina/__generated__/client');
                const text = await xliffUtils.exportOutOfDateAsXliff(client, selectedLanguage);
                const blob = new Blob([text], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedLanguage}-translations.xlf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setStatus('Export complete');
              } catch (err) {
                setStatus(`Export error: ${err.message}`);
              }
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2d8cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            disabled={loading}
          >
            Export XLIFF
          </button>
          <input type="file" accept=".xlf,.xliff,application/xml,text/xml" id="xliff-upload" style={{ display: 'none' }} />
          <button
            onClick={handleImportClick}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: importing ? 'default' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={loading || importing}
          >
            {importing && (
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="39 25" />
                </g>
              </svg>
            )}
            {importing ? (importProgress !== null ? `Importing (${importProgress}%)` : 'Importing...') : 'Import XLIFF'}
          </button>
          {/* Debug import now runs immediately when a file is selected via Import XLIFF */}
          
        </div>
      </div>
  {status && <div style={{ color: 'green', marginBottom: '1rem' }}>{status}</div>}

      {/* Progress Bars for Async Operations */}
      {addProgress !== null && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
            Adding Missing Topics: {addProgress}%
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${addProgress}%`,
              height: '100%',
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {importProgress !== null && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
            Importing XLIFF: {importProgress}%
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${importProgress}%`,
              height: '100%',
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
            Scanning translations...
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              borderRadius: '3px',
              animation: 'indeterminate 1.5s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Translation Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(() => {
          const counts = totalCounts[selectedLanguage];
          if (!counts) return null;

          return [
            {
              label: 'Up to Date',
              value: counts.upToDate,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              ),
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600',
              textColor: 'text-green-600'
            },
            {
              label: 'Outdated',
              value: counts.outdated,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
              ),
              bgColor: 'bg-orange-100',
              iconColor: 'text-orange-600',
              textColor: 'text-orange-600'
            },
            {
              label: 'Missing',
              value: counts.missing,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" x2="9" y1="9" y2="15"/>
                  <line x1="9" x2="15" y1="9" y2="15"/>
                </svg>
              ),
              bgColor: 'bg-red-100',
              iconColor: 'text-red-600',
              textColor: 'text-red-600'
            },
            {
              label: 'Orphaned',
              value: counts.orphaned,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              ),
              bgColor: 'bg-purple-100',
              iconColor: 'text-purple-600', 
              textColor: 'text-purple-600'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className={`${stat.bgColor} p-3 rounded-lg flex-shrink-0`}>
                <div className={`${stat.iconColor}`}>{stat.icon}</div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {languages.map(lang => {
              const configEntry = (docusaurusData.languages?.supported || []).find(l => l.code === lang);
              const label = configEntry ? `${lang.toUpperCase()} - ${configEntry.label}` : lang.toUpperCase();
              return <option key={lang} value={lang}>{label}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Detailed View */}
      {(() => {
        const data = translationData[selectedLanguage];
        if (!data) return null;

        return (
          <div style={{ marginBottom: '30px' }}>

            {/* Missing Files */}
            {data.missing.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                  Missing Translations ({data.missing.length})
                </h4>
                <div style={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: '4px',
                  padding: '15px'
                }}>
                  {data.missing.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < data.missing.length - 1 ? '1px solid #ffcdd2' : 'none'
                    }}>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.file}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Source: {formatDate(item.sourceLastMod)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outdated Files */}
            {data.outdated.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#f39c12', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  Outdated Translations ({data.outdated.length})
                </h4>
                <div style={{
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ffcc02',
                  borderRadius: '4px',
                  padding: '6px'
                }}>
                  {data.outdated.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderBottom: index < data.outdated.length - 1 ? '1px solid #ffcc02' : 'none',
                      padding: '4px 0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontWeight: 'bold' }}>{item.title}</span>
                        <button
                          onClick={() => handleEditOutOfDateDoc(item.file)}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        <span>{item.file}</span>
                        <span>Source: {formatDate(item.sourceLastMod)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        <span>{item.daysBehind ? `${item.daysBehind} days behind` : ''}</span>
                        <span>Translation: {formatDate(item.translationLastMod)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Up to Date Files */}
            {data.upToDate.length > 0 && selectedLanguage !== 'all' && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#27ae60', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Up to Date Translations ({data.upToDate.length})
                </h4>
                <div style={{
                  backgroundColor: '#e8f5e8',
                  border: '1px solid #c3e6c3',
                  borderRadius: '4px',
                  padding: '15px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {data.upToDate.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: index < data.upToDate.length - 1 ? '1px solid #c3e6c3' : 'none'
                    }}>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.file}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatDate(item.translationLastMod)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orphaned Files */}
            {data.orphaned.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#9c88ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Orphan Topics ({data.orphaned.length})
                </h4>
                <div style={{
                  backgroundColor: '#f4f2ff',
                  border: '1px solid #d4c5ff',
                  borderRadius: '4px',
                  padding: '15px'
                }}>
                  {data.orphaned.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < data.orphaned.length - 1 ? '1px solid #d4c5ff' : 'none'
                    }}>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.file}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8b7dd6' }}>
                          Translation exists but no source file found
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Translation: {formatDate(item.translationLastMod)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {data.errors.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="m12 17 .01 0"></path>
                  </svg>
                  Errors ({data.errors.length})
                </h4>
                <div style={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: '4px',
                  padding: '15px'
                }}>
                  {data.errors.map((item, index) => (
                    <div key={index} style={{
                      padding: '6px 0',
                      borderBottom: index < data.errors.length - 1 ? '1px solid #ffcdd2' : 'none'
                    }}>
                      <div style={{ fontSize: '14px' }}><strong>{item.file}</strong></div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default TranslationDashboard;
