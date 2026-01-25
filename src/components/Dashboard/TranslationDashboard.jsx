import React, { useState, useEffect } from 'react';

const TranslationDashboard = () => {
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
        sort: 'title'
      });

      const docs = docsResult.data.docConnection.edges || [];
      
      // Use all docs like Dashboard1 does - no filtering
      // Note: i18n/ is a source folder (internationalization docs), not translations
      const filteredDocs = docs;
      
      console.log(`Processing ${filteredDocs.length} source documents`);
      
      // Available languages (this could be made dynamic)
      const availableLanguages = ['fr'];
      
      const results = {};

      // Initialize results for each language
      for (const lang of availableLanguages) {
        results[lang] = {
          outdated: [],
          missing: [],
          upToDate: [],
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
              try {
                let translationDoc = null;
                
                // Try to query i18n collection directly
                try {
                  const i18nQuery = await client.queries.i18nConnection({
                    sort: 'title'
                  });
                  
                  const i18nDocs = i18nQuery.data?.i18nConnection?.edges || [];
                  console.log(`\n=== I18N COLLECTION (${i18nDocs.length} total) ===`);
                  
                  if (i18nDocs.length > 0) {
                    // Show first few i18n documents to understand structure
                    i18nDocs.slice(0, 5).forEach((edge, index) => {
                      const doc = edge.node;
                      console.log(`  ${index + 1}. Path: ${doc._sys?.relativePath || doc._sys?.filename || 'NO_PATH'}`);
                      console.log(`      Title: ${doc.title || 'NO_TITLE'}`);
                      console.log(`      Properties: ${Object.keys(doc).join(', ')}`);
                    });
                  }
                  
                  // Clean up the fileName for matching
                  const cleanFileName = fileName.replace(/^docs\//, '');
                  const baseFileName = cleanFileName.replace('.mdx', '').replace('.md', '');
                  
                  console.log(`Looking for translation of: ${fileName}`);
                  console.log(`Clean filename: ${cleanFileName}`);
                  console.log(`Base filename: ${baseFileName}`);
                  
                  // Look for matching translation in i18n collection
                  const potentialTranslations = i18nDocs.filter(edge => {
                    const doc = edge.node;
                    const docPath = doc._sys?.relativePath || doc._sys?.filename || '';
                    
                    // Try different matching patterns for i18n collection
                    const isMatch = (
                      // Direct filename match
                      docPath === cleanFileName ||
                      docPath.endsWith(cleanFileName) ||
                      docPath.endsWith(`/${cleanFileName}`) ||
                      
                      // Language-specific paths
                      docPath === `${lang}/${cleanFileName}` ||
                      docPath === `${lang}/docusaurus-plugin-content-docs/current/${cleanFileName}` ||
                      docPath.endsWith(`/${lang}/${cleanFileName}`) ||
                      
                      // Base filename matching
                      docPath.includes(baseFileName) ||
                      
                      // Title matching (if available)
                      (doc.title && title && doc.title === title)
                    );
                    
                    return isMatch;
                  });
                  
                  if (potentialTranslations.length > 0) {
                    translationDoc = potentialTranslations[0].node;
                    console.log(`Found translation match: ${translationDoc._sys?.relativePath}`);
                  } else {
                    console.log(`No translation found in i18n collection for ${fileName}`);
                    
                    // Show what's actually available for debugging
                    if (i18nDocs.length > 0) {
                      const availablePaths = i18nDocs.map(edge => 
                        edge.node._sys?.relativePath || edge.node._sys?.filename || 'NO_PATH'
                      );
                      console.log(`Available i18n paths:`, availablePaths.slice(0, 10));
                    }
                  }
                  
                } catch (e) {
                  console.log(`Error querying i18n collection:`, e.message);
                  
                  // Fallback: try querying all docs if i18n collection doesn't exist
                  console.log('Falling back to doc collection...');
                  
                  const allDocsQuery = await client.queries.docConnection({
                    sort: 'title'
                  });
                  
                  const allDocs = allDocsQuery.data?.docConnection?.edges || [];
                  const cleanFileName = fileName.replace(/^docs\//, '');
                  
                  // Filter for i18n documents
                  const i18nDocs = allDocs.filter(edge => {
                    const path = edge.node._sys?.relativePath || '';
                    return path.includes('i18n') || path.includes(`/${lang}/`);
                  });
                  
                  console.log(`Found ${i18nDocs.length} i18n documents in doc collection`);
                  
                  const potentialTranslations = i18nDocs.filter(edge => {
                    const docPath = edge.node._sys?.relativePath || '';
                    return docPath.endsWith(cleanFileName) || docPath.includes(cleanFileName);
                  });
                  
                  if (potentialTranslations.length > 0) {
                    translationDoc = potentialTranslations[0].node;
                    console.log(`Found fallback translation: ${translationDoc._sys?.relativePath}`);
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
                // Translation found - let's debug what we actually got
                console.log(`\n=== TRANSLATION FOUND for ${fileName} ===`);
                console.log(`Translation path: ${translationDoc._sys?.relativePath}`);
                console.log(`Translation lastmod: ${translationDoc.lastmod}`);
                console.log(`Source lastmod: ${doc.lastmod}`);
                console.log(`Translation doc keys:`, Object.keys(translationDoc));
                console.log(`Translation _sys keys:`, translationDoc._sys ? Object.keys(translationDoc._sys) : 'NO _sys');
                
                // Translation found, compare dates
                const translationDate = translationDoc.lastmod ? new Date(translationDoc.lastmod) : null;
                const translationDateString = translationDoc.lastmod || 'No date';
                
                console.log(`Parsed translation date:`, translationDate);
                console.log(`Source date:`, sourceDate);
                console.log(`=== END TRANSLATION DEBUG ===\n`);
                
                if (!sourceDate && !translationDate) {
                  // Both have no dates - consider up to date
                  results[lang].upToDate.push({
                    file: fileName,
                    sourceLastMod: 'No date',
                    translationLastMod: 'No date',
                    title: title
                  });
                } else if (sourceDate && !translationDate) {
                  // Source has date but translation doesn't - outdated
                  results[lang].outdated.push({
                    file: fileName,
                    sourceLastMod: doc.lastmod,
                    translationLastMod: 'No date',
                    title: title
                  });
                } else if (!sourceDate && translationDate) {
                  // Translation has date but source doesn't - up to date
                  results[lang].upToDate.push({
                    file: fileName,
                    sourceLastMod: 'No date',
                    translationLastMod: translationDateString,
                    title: title
                  });
                } else {
                  // Both have dates - compare them
                  if (sourceDate > translationDate) {
                    // Translation is outdated
                    const daysBehind = Math.ceil((sourceDate - translationDate) / (1000 * 60 * 60 * 24));
                    results[lang].outdated.push({
                      file: fileName,
                      sourceLastMod: doc.lastmod,
                      translationLastMod: translationDateString,
                      title: title,
                      daysBehind: daysBehind
                    });
                  } else {
                    // Translation is up to date
                    results[lang].upToDate.push({
                      file: fileName,
                      sourceLastMod: doc.lastmod,
                      translationLastMod: translationDateString,
                      title: title
                    });
                  }
                }
              }
            } catch (queryError) {
              console.error(`Error querying translations for ${fileName}:`, queryError);
              results[lang].errors.push({
                file: fileName,
                error: `GraphQL query failed: ${queryError.message}`
              });
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

      setTranslationData(results);
    } catch (error) {
      console.error('Error scanning translations:', error);
      setError(`Failed to scan translations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanTranslations();
  }, []);

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
        errors: data.errors.length
      };
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ marginBottom: '10px' }}>🔄 Scanning translations...</div>
          <div style={{ fontSize: '14px' }}>This may take a moment</div>
        </div>
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
        margin: '20px 0',
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
      margin: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '10px'
      }}>
        <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '24px' }}>
          🌍 Translations
        </h2>
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
        </div>
      </div>

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
                  padding: '15px'
                }}>
                  {data.outdated.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < data.outdated.length - 1 ? '1px solid #ffcc02' : 'none'
                    }}>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.file}
                        </div>
                        {item.daysBehind && (
                          <div style={{ fontSize: '11px', color: '#e67e22' }}>
                            {item.daysBehind} days behind
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                        <div>Source: {formatDate(item.sourceLastMod)}</div>
                        <div>Translation: {formatDate(item.translationLastMod)}</div>
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