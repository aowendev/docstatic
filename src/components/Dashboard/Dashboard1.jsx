import React, { useState, useEffect } from 'react';

const Dashboard1 = () => {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDocuments, setShowDocuments] = useState(null);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityPeriod, setActivityPeriod] = useState('week'); // 'week', 'month', 'all'

  const fetchContentOverview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { client } = await import('../../../tina/__generated__/client');
      
      // Fetch all docs from main collection
      const docsResult = await client.queries.docConnection({
        sort: 'title'
      });
      
      const docs = docsResult.data.docConnection.edges || [];
      
      // Store all docs for filtering
      setAllDocs(docs);
      
      // Analyze workflow status for docs
      const docStats = docs.reduce((acc, edge) => {
        const node = edge.node;
        acc.total++;
        
        if (node.draft) acc.draft++;
        if (node.review) acc.review++;
        if (node.translate) acc.translate++;
        if (node.approved) acc.approved++;
        if (node.published) acc.published++;
        if (node.unlisted) acc.unlisted++;
        
        return acc;
      }, { 
        total: 0, draft: 0, review: 0, translate: 0, 
        approved: 0, published: 0, unlisted: 0 
      });
      
      // Get recent activity with configurable filters
      // Only include docs that have a lastmod field set
      const now = new Date();
      const getTimePeriodFilter = () => {
        if (activityPeriod === 'week') {
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        } else if (activityPeriod === 'month') {
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        }
        return null; // No time filter for 'all'
      };
      
      const timeCutoff = getTimePeriodFilter();
      
      const recentActivity = docs
        .filter(edge => {
          const node = edge.node;
          if (!node.lastmod) return false; // Only include documents with a lastmod field
          
          if (timeCutoff) {
            const docDate = new Date(node.lastmod);
            return docDate >= timeCutoff;
          }
          
          return true;
        })
        .map(edge => {
          const node = edge.node;
          // Use lastmod as primary source, with system lastModified as fallback
          const timestamp = node.lastmod || node._sys?.lastModified;
          
          return {
            title: node.title || node._sys.filename,
            type: 'Documentation',
            status: getStatus(node),
            lastModified: timestamp,
            path: node._sys.relativePath,
            // Debug info
            debugInfo: {
              sysLastModified: node._sys?.lastModified,
              lastmod: node.lastmod,
              filename: node._sys.filename
            }
          };
        })
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, activityLimit);

      setContentData({
        docs: docStats,
        recentActivity,
        totalProgress: Math.round((docStats.published / docStats.total) * 100) || 0
      });
      
    } catch (err) {
      console.error('Failed to fetch content overview:', err);
      setError(err.message);
      
      // Fallback to simulated data for demo
      setContentData({
        docs: { total: 28, draft: 8, review: 4, translate: 2, approved: 3, published: 10, unlisted: 1 },
        recentActivity: [
          { title: 'Getting Started Guide', type: 'Documentation', status: 'Published', lastModified: new Date().toISOString(), path: 'getting-started.mdx' },
          { title: 'Installation Guide', type: 'Documentation', status: 'Draft', lastModified: new Date(Date.now() - 86400000).toISOString(), path: 'installation.mdx' }
        ],
        totalProgress: 36
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (node) => {
    if (node.published) return 'Published';
    if (node.approved) return 'Approved';
    if (node.translate) return 'Translate';
    if (node.review) return 'Review';
    if (node.draft) return 'Draft';
    if (node.unlisted) return 'Unlisted';
    return 'No Status';
  };

  const getStatusColor = (status) => {
    const colors = {
      'No Status': '#6b7280',
      'Draft': '#f59e0b',
      'Review': '#3b82f6',
      'Translate': '#8b5cf6',
      'Approved': '#10b981',
      'Published': '#059669',
      'Unlisted': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const filterDocumentsByStatus = (status) => {
    const filtered = allDocs.filter(edge => {
      const node = edge.node;
      switch (status.toLowerCase()) {
        case 'draft': return node.draft;
        case 'review': return node.review;
        case 'translate': return node.translate;
        case 'approved': return node.approved;
        case 'published': return node.published;
        case 'unlisted': return node.unlisted;
        default: return false;
      }
    });
    setFilteredDocs(filtered);
    setShowDocuments(status);
  };

  const getEditUrl = (doc) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const relativePath = doc._sys.relativePath;
    
    if (isLocal) {
      // Local Tina admin URL
      return `/admin/index.html#/collections/edit/doc/${relativePath.replace('.mdx', '').replace('.md', '')}`;
    } else {
      // Production Tina admin URL (TinaCloud)
      return `/admin/index.html#/collections/edit/doc/${relativePath.replace('.mdx', '').replace('.md', '')}`;
    }
  };

  useEffect(() => {
    fetchContentOverview();
  }, []);
  
  useEffect(() => {
    if (contentData) {
      fetchContentOverview(); // Refresh when filters change
    }
  }, [activityLimit, activityPeriod]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading content overview...</div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#666' }}>No content data available</div>
        {error && (
          <div style={{ color: '#d73a49', marginTop: '10px', fontSize: '14px' }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  const StatCard = ({ title, count, total, color, percentage, onClick }) => (
    <div 
      onClick={() => count > 0 && onClick && onClick(title)}
      style={{
        background: 'white',
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        padding: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: count > 0 ? 'pointer' : 'default',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        ':hover': count > 0 ? {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        } : {}
      }}
      onMouseEnter={(e) => {
        if (count > 0) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (count > 0) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: `${isNaN(percentage) ? 0 : percentage}%`,
        background: color,
        transition: 'width 0.3s ease'
      }}></div>
      <div style={{ fontSize: '24px', fontWeight: '600', color: color, marginBottom: '4px' }}>
        {count || 0}
      </div>
      <div style={{ fontSize: '12px', color: '#586069', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '10px', color: '#959da5' }}>
        {isNaN(percentage) ? '0' : percentage.toFixed(0)}% of {total}
        {count > 0 && <span style={{ display: 'block', marginTop: '2px', color: '#0969da' }}>Click to view</span>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e1e4e8'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#24292e' }}>
          📊 Content Overview
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', color: '#586069' }}>
            Overall Progress: <strong>{contentData.totalProgress}%</strong>
          </div>
          <button 
            onClick={fetchContentOverview}
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

      {/* Documentation Workflow */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#24292e' }}>
          📝 Documentation ({contentData.docs.total} topics)
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px',
          marginBottom: '12px'
        }}>
          <StatCard title="Draft" count={contentData.docs.draft || 0} total={contentData.docs.total} 
                   color="#f59e0b" percentage={((contentData.docs.draft || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
          <StatCard title="Review" count={contentData.docs.review || 0} total={contentData.docs.total} 
                   color="#3b82f6" percentage={((contentData.docs.review || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
          <StatCard title="Translate" count={contentData.docs.translate || 0} total={contentData.docs.total} 
                   color="#8b5cf6" percentage={((contentData.docs.translate || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
          <StatCard title="Approved" count={contentData.docs.approved || 0} total={contentData.docs.total} 
                   color="#10b981" percentage={((contentData.docs.approved || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
          <StatCard title="Published" count={contentData.docs.published || 0} total={contentData.docs.total} 
                   color="#059669" percentage={((contentData.docs.published || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
          <StatCard title="Unlisted" count={contentData.docs.unlisted || 0} total={contentData.docs.total} 
                   color="#6b7280" percentage={((contentData.docs.unlisted || 0) / contentData.docs.total) * 100 || 0} 
                   onClick={filterDocumentsByStatus} />
        </div>
      </div>

      {/* Document List Modal */}
      {showDocuments && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e1e4e8',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #e1e4e8',
              backgroundColor: '#f6f8fa'
            }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#24292e' }}>
                📄 {showDocuments} Documents ({filteredDocs.length})
              </h4>
              <button
                onClick={() => {
                  setShowDocuments(null);
                  setFilteredDocs([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#586069',
                  padding: '4px'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
            
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {filteredDocs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#586069' }}>
                  No documents found with {showDocuments.toLowerCase()} status
                </div>
              ) : (
                filteredDocs.map((edge, index) => {
                  const doc = edge.node;
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        borderBottom: index < filteredDocs.length - 1 ? '1px solid #f6f8fa' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#24292e', marginBottom: '4px' }}>
                          {doc.title || doc._sys.filename}
                        </div>
                        <div style={{ fontSize: '12px', color: '#586069' }}>
                          {doc._sys.relativePath}
                        </div>
                        {doc.description && (
                          <div style={{ fontSize: '12px', color: '#6a737d', marginTop: '2px', maxWidth: '300px' }}>
                            {doc.description.length > 100 ? doc.description.substring(0, 100) + '...' : doc.description}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          color: getStatusColor(getStatus(doc)),
                          backgroundColor: `${getStatusColor(getStatus(doc))}20`,
                          fontWeight: '500'
                        }}>
                          {getStatus(doc)}
                        </span>
                        
                        <a
                          href={getEditUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#0969da',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '3px',
                            fontWeight: '500'
                          }}
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#24292e' }}>
            ⚡ Recent Activity
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={activityPeriod}
              onChange={(e) => setActivityPeriod(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #e1e4e8',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#24292e'
              }}
            >
              <option value="all">All time</option>
              <option value="week">Last week</option>
              <option value="month">Last month</option>
            </select>
            <select
              value={activityLimit}
              onChange={(e) => setActivityLimit(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #e1e4e8',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#24292e'
              }}
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={15}>15 items</option>
              <option value={20}>20 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>
        </div>
        <div style={{
          background: 'white',
          border: '1px solid #e1e4e8',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {contentData.recentActivity.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#586069' }}>
              No recent activity found for the selected time period
            </div>
          ) : (
            contentData.recentActivity.map((item, index) => (
            <div 
              key={index}
              style={{
                padding: '12px 16px',
                borderBottom: index < contentData.recentActivity.length - 1 ? '1px solid #f6f8fa' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#24292e' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#586069', marginTop: '2px' }}>
                  <span style={{ 
                    backgroundColor: '#f6f8fa', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    marginRight: '8px'
                  }}>
                    {item.type}
                  </span>
                  {item.path}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  fontSize: '11px',
                  color: getStatusColor(item.status),
                  backgroundColor: `${getStatusColor(item.status)}20`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: '500'
                }}>
                  {item.status}
                </div>
                <div style={{ fontSize: '11px', color: '#959da5' }}>
                  {new Date(item.lastModified).toLocaleDateString()}
                </div>
                <a
                  href={getEditUrl({ _sys: { relativePath: item.path } })}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#0969da',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '3px',
                    fontWeight: '500'
                  }}
                >
                  Edit
                </a>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '6px',
          color: '#c53030',
          fontSize: '14px'
        }}>
          ⚠️ Some data may be simulated due to connection issues: {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard1;