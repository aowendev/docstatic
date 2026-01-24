import React, { useState, useEffect } from 'react';

const TranslationDashboard = () => {
  const [translationData, setTranslationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

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
      for (const docEdge of docs) {
        const doc = docEdge.node;
        
        // Skip if no lastmod in source (not trackable)
        if (!doc.lastmod) {
          continue;
        }

        for (const lang of availableLanguages) {
          try {
            // For demonstration, we'll create sample data
            // In reality, you would need to query the translated collections
            // or check the i18n folder structure
            
            const sourceDate = new Date(doc.lastmod);
            const fileName = doc._sys.relativePath || doc._sys.filename;
            const title = doc.title || fileName;
            
            // Simulate translation status (you would replace this with actual translation data)
            const translationExists = Math.random() > 0.3; // 70% chance translation exists
            
            if (!translationExists) {
              // Missing translation
              results[lang].missing.push({
                file: fileName,
                sourceLastMod: doc.lastmod,
                title: title
              });
            } else {
              // Simulate translation date (you would get this from actual translation data)
              const daysOffset = Math.floor(Math.random() * 60) - 30; // Random offset from source date
              const translationDate = new Date(sourceDate);
              translationDate.setDate(translationDate.getDate() + daysOffset);
              
              if (translationDate < sourceDate) {
                // Translation is outdated
                const daysBehind = Math.ceil((sourceDate - translationDate) / (1000 * 60 * 60 * 24));
                results[lang].outdated.push({
                  file: fileName,
                  sourceLastMod: doc.lastmod,
                  translationLastMod: translationDate.toISOString(),
                  title: title,
                  daysBehind: daysBehind
                });
              } else {
                // Translation is up to date
                results[lang].upToDate.push({
                  file: fileName,
                  sourceLastMod: doc.lastmod,
                  translationLastMod: translationDate.toISOString(),
                  title: title
                });
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
          🌍 Translation Dashboard
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
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={scanTranslations}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
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
        {(selectedLanguage === 'all' ? languages : [selectedLanguage]).map(lang => {
          const counts = totalCounts[lang];
          if (!counts) return null;

          return (
            <div key={lang} style={{
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
                {lang}
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
        })}
      </div>

      {/* Detailed View */}
      {(selectedLanguage === 'all' ? languages : [selectedLanguage]).map(lang => {
        const data = translationData[lang];
        if (!data) return null;

        return (
          <div key={lang} style={{ marginBottom: '30px' }}>
            {selectedLanguage === 'all' && (
              <h3 style={{
                color: '#2c3e50',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                marginBottom: '20px'
              }}>
                {lang.toUpperCase()} Details
              </h3>
            )}

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
      })}
    </div>
  );
};

export default TranslationDashboard;