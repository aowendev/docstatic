import React, { useState, useEffect } from 'react';

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
        for (const item of missing) {
          // copy full metadata and body from sourceNode when available
          const sourceNode = item.sourceNode || null;
          const relPath = `${lang}/docusaurus-plugin-content-docs/current/${item.file.replace(/^docs\//, '')}`;
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
          // ensure created translations start as drafts
          paramsBody.draft = true;
          // set lastmod to one day earlier than source (or yesterday)
          const lastmodSource = sourceNode && sourceNode.lastmod ? new Date(sourceNode.lastmod) : null;
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
        }
        setStatus(`Added ${missing.length} missing topics for ${lang}`);
        await scanTranslations();
      } catch (err) {
        setStatus(`Error: ${err.message}`);
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
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

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
      const translationsMap = {}; // canonical -> { node, originalPath }
      for (const edge of i18nEdges) {
        const node = edge.node;
        const relPath = node._sys?.relativePath || node._sys?.filename || '';
        const m = relPath.match(/^([a-zA-Z0-9_-]+)\/(.*)$/);
        if (!m) continue;
        const lang = m[1];
        if (lang !== selectedLanguage) continue;
        const after = m[2];
        const prefix = 'docusaurus-plugin-content-docs/current/';
        if (!after.startsWith(prefix)) continue;
        const cleanAfter = after.replace(new RegExp(`^${prefix}`), '');
        // skip generated or excluded doc areas (api, wiki)
        if (cleanAfter.startsWith('api/') || cleanAfter.startsWith('wiki/')) continue;
        const canonical = canonicalize(cleanAfter);
        // handle duplicate canonical keys (e.g., index/readme variants)
        if (translationsMap[canonical]) {
          const existing = translationsMap[canonical];
          const isExistingIndex = /(?:^|\/)index$|(?:^|\/)readme$/i.test(existing.originalPath || '');
          const isNewIndex = /(?:^|\/)index$|(?:^|\/)readme$/i.test(cleanAfter);
          // prefer non-index/readme over index/readme
          if (isExistingIndex && !isNewIndex) {
            translationsMap[canonical] = { node, originalPath: cleanAfter };
          } else {
            // otherwise, keep the one with the latest lastmod
            try {
              const existingDate = existing.node?.lastmod ? new Date(existing.node.lastmod) : null;
              const newDate = node?.lastmod ? new Date(node.lastmod) : null;
              if (newDate && (!existingDate || newDate > existingDate)) {
                translationsMap[canonical] = { node, originalPath: cleanAfter };
              } else {
                // keep existing
              }
            } catch (e) {
              // fallback: keep existing
            }
          }
        } else {
          translationsMap[canonical] = { node, originalPath: cleanAfter };
        }
      }

      // Compare sets
      const sourceKeys = new Set(Object.keys(sourceMap));
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
          missing.push({ file: `docs/${key}`, sourceLastMod: src.lastmod || 'No date', title });
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
          const orig = entry.originalPath || key;
          orphaned.push({ file: `${selectedLanguage}/docusaurus-plugin-content-docs/current/${orig}`, translationLastMod: node.lastmod || 'No date', title: node.title || orig });
        }
      }

      results[selectedLanguage] = {
        missing,
        outdated,
        upToDate,
        orphaned,
        errors: [],
        total: Object.keys(sourceMap).length
      };

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
      case 'outdated': return '#ff4757';
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
        total: data.missing.length + data.outdated.length + data.upToDate.length,
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
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        marginTop: 0,
        marginBottom: '32px',
        marginLeft: '16px',
        marginRight: '16px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '10px',
          gap: '16px' // Restore original gap between title and button
        }}>
          <h3 className="font-sans text-2xl text-tina-orange" style={{ margin: 0 }}>
            🌍 Translations
          </h3>
          <button
            onClick={scanTranslations}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: '8px' // Extra gap for safety
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '12px'
          }} />
          <div style={{ fontWeight: 500, color: '#2563eb', fontSize: '16px', marginBottom: '2px' }}>
            Scanning translations...
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>This may take a moment</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ff4757',
        borderRadius: '8px',
        backgroundColor: '#ffe0e0',
        color: '#d63031'
      }}>
        <strong>Error:</strong> {error}
        <button
          onClick={scanTranslations}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            border: '1px solid #d63031',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!translationData) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          No translation data available
        </div>
      </div>
    );
  }

  const totalCounts = getTotalCounts();
  const languages = Object.keys(translationData);

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      marginTop: 0,
      marginBottom: '32px',
      marginLeft: '16px',
      marginRight: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '10px',
        gap: '16px'
      }}>
        <h3 className="font-sans text-2xl text-tina-orange">
          🌍 Translations
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={scanTranslations}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            disabled={loading}
          >
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
            Delete Orphan Topics
          </button>
          <button
            onClick={handleAddMissingTopics}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            disabled={loading}
          >
            Add Missing Topics
          </button>
        </div>
      </div>
  {status && <div style={{ color: 'green', marginBottom: '1rem' }}>{status}</div>}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {(() => {
          const counts = totalCounts[selectedLanguage];
          if (!counts) return null;

          return (
            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#2c3e50',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {selectedLanguage}
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <div style={{ color: getStatusColor('upToDate') }}>
                  ✅ Up to date: <strong>{counts.upToDate}</strong>
                </div>
                <div style={{ color: getStatusColor('outdated') }}>
                  ⏰ Outdated: <strong>{counts.outdated}</strong>
                </div>
                <div style={{ color: getStatusColor('missing') }}>
                  ❌ Missing: <strong>{counts.missing}</strong>
                </div>
                <div style={{ color: getStatusColor('orphaned') }}>
                  🔗 Orphan topics: <strong>{counts.orphaned}</strong>
                </div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                  📊 Total: <strong>{counts.total}</strong> files
                </div>
              </div>
            </div>
          );
        })()}
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
                <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>
                  ❌ Missing Translations ({data.missing.length})
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
                <h4 style={{ color: '#f39c12', marginBottom: '10px' }}>
                  ⏰ Outdated Translations ({data.outdated.length})
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
                            backgroundColor: '#2563eb',
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
                <h4 style={{ color: '#27ae60', marginBottom: '10px' }}>
                  ✅ Up to Date Translations ({data.upToDate.length})
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
                <h4 style={{ color: '#9c88ff', marginBottom: '10px' }}>
                  🔗 Orphan Topics ({data.orphaned.length})
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
                <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>
                  ⚠️ Errors ({data.errors.length})
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