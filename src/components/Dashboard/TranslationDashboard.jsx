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
          await client.request({
            query: `
              mutation CreateI18n($collection: String!, $relativePath: String!, $params: I18nMutation!) {
                createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
                  ... on I18n {
                    id
                    date
                  }
                }
              }
            `,
            variables: {
              collection: 'i18n',
              relativePath: `${lang}/docusaurus-plugin-content-docs/current/${item.file.replace(/^docs\//, '')}`,
              params: {
                i18n: {
                  title: item.title,
                  date: item.sourceLastMod && item.sourceLastMod !== 'No date' ? new Date(new Date(item.sourceLastMod).getTime() - 86400000).toISOString() : new Date(Date.now() - 86400000).toISOString(),
                  sourceId: item.file
                }
              }
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
      // Import TinaCMS client
      const { client } = await import('../../../tina/__generated__/client');
      
      // Get all docs from main collection
      const docsResult = await client.queries.docConnection({
        sort: 'title',
        first: 500  // Request more documents
      });

      const docs = docsResult.data.docConnection.edges || [];
      
      // Use all docs like Dashboard1 does - no filtering
      // Note: i18n/ is a source folder (internationalization docs), not translations
      const filteredDocs = docs;
      
      console.log(`Processing ${filteredDocs.length} source documents`);
      
      // Dynamically determine available languages from i18n collection
      let availableLanguages = [];
      try {
        const i18nQuery = await client.queries.i18nConnection({ sort: 'title' });
        const i18nDocs = i18nQuery.data?.i18nConnection?.edges || [];
        // Extract language codes from the relativePath (e.g., 'fr/filename.mdx' => 'fr')
        const langSet = new Set();
        for (const edge of i18nDocs) {
          const relPath = edge.node._sys?.relativePath || edge.node._sys?.filename || '';
          // Match language code at the start of the path (e.g., 'fr/...' or 'fr/docusaurus-plugin-content-docs/...')
          const match = relPath.match(/^([a-zA-Z0-9_-]+)\//);
          if (match && match[1]) {
            langSet.add(match[1]);
          }
        }
        availableLanguages = Array.from(langSet);
        if (availableLanguages.length === 0) {
          // Fallback to 'fr' if nothing found
          availableLanguages = ['fr'];
        }
      } catch (e) {
        console.warn('Could not dynamically determine available languages from i18n collection:', e.message);
        availableLanguages = ['fr'];
      }
      
      const results = {};

      // Initialize results for each language
      for (const lang of availableLanguages) {
        results[lang] = {
          outdated: [],
          missing: [],
          upToDate: [],
          orphaned: [],
          errors: [],
          total: 0
        };
      }

      // Process each source document
      for (const docEdge of filteredDocs) {
        const doc = docEdge.node;
        for (const lang of availableLanguages) {
          try {
            const sourceDate = doc.lastmod ? new Date(doc.lastmod) : null;
            const fileName = doc._sys.relativePath || doc._sys.filename;
            const title = doc.title || fileName;

            // Query the i18n collection directly since i18n is a separate GraphQL node
            let translationDoc = null;
            try {
              const i18nQuery = await client.queries.i18nConnection({ sort: 'title' });
              const i18nDocs = i18nQuery.data?.i18nConnection?.edges || [];
              // Clean up the fileName for matching
              const cleanFileName = fileName.replace(/^docs\//, '');
              const baseFileName = cleanFileName.replace(/\.(mdx|md)$/, '');

              // Look for matching translation in i18n collection for the specific language only
              const potentialTranslations = i18nDocs.filter(edge => {
                const doc = edge.node;
                const docPath = doc._sys?.relativePath || doc._sys?.filename || '';
                // Only match if the path starts with the language code
                if (!docPath.startsWith(`${lang}/`)) return false;
                // Get the path after the language code
                const afterLang = docPath.substring(lang.length + 1); // skip lang + '/'
                // Try to match by full relative path after lang, or by base filename
                return (
                  afterLang === cleanFileName ||
                  afterLang === baseFileName ||
                  afterLang.endsWith(`/${cleanFileName}`) ||
                  afterLang.endsWith(`/${baseFileName}`) ||
                  docPath.endsWith(cleanFileName) ||
                  docPath.endsWith(baseFileName) ||
                  (doc.title && title && doc.title === title)
                );
              });
              if (potentialTranslations.length > 0) {
                translationDoc = potentialTranslations[0].node;
              }
            } catch (e) {
              // Fallback: try querying all docs if i18n collection doesn't exist
              const allDocsQuery = await client.queries.docConnection({ 
                sort: 'title',
                first: 500  // Request more documents
              });
              const allDocs = allDocsQuery.data?.docConnection?.edges || [];
              const cleanFileName = fileName.replace(/^docs\//, '');
              // Filter for i18n documents in the correct language
              const i18nDocs = allDocs.filter(edge => {
                const path = edge.node._sys?.relativePath || '';
                return path.startsWith(`i18n/${lang}/`);
              });
              const potentialTranslations = i18nDocs.filter(edge => {
                const docPath = edge.node._sys?.relativePath || '';
                return docPath.endsWith(cleanFileName) || docPath.endsWith(baseFileName);
              });
              if (potentialTranslations.length > 0) {
                translationDoc = potentialTranslations[0].node;
              }
            }

            if (!translationDoc) {
              // No translation found in TinaCMS
              results[lang].missing.push({
                file: fileName,
                sourceLastMod: doc.lastmod || 'No date',
                title: title
              });
            } else {
              // Translation found, compare dates
              const translationDate = translationDoc.lastmod ? new Date(translationDoc.lastmod) : null;
              const translationDateString = translationDoc.lastmod || 'No date';
              if (!sourceDate && !translationDate) {
                results[lang].upToDate.push({
                  file: fileName,
                  sourceLastMod: 'No date',
                  translationLastMod: 'No date',
                  title: title
                });
              } else if (sourceDate && !translationDate) {
                results[lang].outdated.push({
                  file: fileName,
                  sourceLastMod: doc.lastmod,
                  translationLastMod: 'No date',
                  title: title
                });
              } else if (!sourceDate && translationDate) {
                results[lang].upToDate.push({
                  file: fileName,
                  sourceLastMod: 'No date',
                  translationLastMod: translationDateString,
                  title: title
                });
              } else {
                if (sourceDate > translationDate) {
                  const daysBehind = Math.ceil((sourceDate - translationDate) / (1000 * 60 * 60 * 24));
                  results[lang].outdated.push({
                    file: fileName,
                    sourceLastMod: doc.lastmod,
                    translationLastMod: translationDateString,
                    title: title,
                    daysBehind: daysBehind
                  });
                } else {
                  results[lang].upToDate.push({
                    file: fileName,
                    sourceLastMod: doc.lastmod,
                    translationLastMod: translationDateString,
                    title: title
                  });
                }
              }
            }
            results[lang].total++;
          } catch (fileError) {
            results[lang].errors.push({
              file: doc._sys.relativePath || doc._sys.filename,
              error: fileError.message
            });
          }
        }
      }

      // Process orphaned files (files in i18n that don't have corresponding source files)
      for (const lang of availableLanguages) {
        try {
          const i18nQuery = await client.queries.i18nConnection({ sort: 'title' });
          const i18nDocs = i18nQuery.data?.i18nConnection?.edges || [];
          
          // Get all i18n files for this language
          const langFiles = i18nDocs.filter(edge => {
            const docPath = edge.node._sys?.relativePath || edge.node._sys?.filename || '';
            // Only consider docs with docusaurus-plugin-content-docs in the path after the lang prefix
            if (!docPath.startsWith(`${lang}/`)) return false;
            const afterLang = docPath.substring(lang.length + 1); // skip lang + '/'
            return afterLang.startsWith('docusaurus-plugin-content-docs/');
          });
          
          // Check each i18n file to see if it has a corresponding source file
          for (const i18nEdge of langFiles) {
            const i18nDoc = i18nEdge.node;
            const i18nPath = i18nDoc._sys?.relativePath || i18nDoc._sys?.filename || '';
            const i18nTitle = i18nDoc.title || i18nPath;
            
            // Extract the file path after the language prefix
            const afterLang = i18nPath.substring(lang.length + 1); // skip lang + '/'
            const cleanPath = afterLang.replace(/^docusaurus-plugin-content-docs\/current\//, '');
            
            // Check if there's a corresponding source file
            let hasSourceFile = false;
            for (const docEdge of filteredDocs) {
              const sourceDoc = docEdge.node;
              const sourcePath = sourceDoc._sys?.relativePath || sourceDoc._sys?.filename || '';
              const cleanSourcePath = sourcePath.replace(/^docs\//, '');
              const baseSourcePath = cleanSourcePath.replace(/\.(mdx|md)$/, '');
              
              if (
                cleanPath === cleanSourcePath ||
                cleanPath === baseSourcePath ||
                cleanPath.endsWith(`/${cleanSourcePath}`) ||
                cleanPath.endsWith(`/${baseSourcePath}`) ||
                afterLang === cleanSourcePath ||
                afterLang === baseSourcePath ||
                (sourceDoc.title && i18nTitle && sourceDoc.title === i18nTitle)
              ) {
                hasSourceFile = true;
                break;
              }
            }
            
            if (!hasSourceFile) {
              results[lang].orphaned.push({
                file: i18nPath,
                translationLastMod: i18nDoc.lastmod || 'No date',
                title: i18nTitle
              });
            }
          }
        } catch (error) {
          console.warn(`Error detecting orphaned files for language ${lang}:`, error.message);
        }
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