import React, { useState, useEffect } from 'react';

const Dashboard1 = () => {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      // Get recent activity (last 8 updated docs)
      const recentActivity = docs
        .filter(edge => edge.node._sys?.lastModified)
        .sort((a, b) => new Date(b.node._sys.lastModified) - new Date(a.node._sys.lastModified))
        .slice(0, 8)
        .map(edge => ({
          title: edge.node.title || edge.node._sys.filename,
          type: 'Documentation',
          status: getStatus(edge.node),
          lastModified: edge.node._sys.lastModified,
          path: edge.node._sys.relativePath
        }));

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
    if (node.translate) return 'In Translation';
    if (node.review) return 'In Review';
    if (node.draft) return 'Draft';
    return 'Planning';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': '#6b7280',
      'Draft': '#f59e0b',
      'In Review': '#3b82f6',
      'In Translation': '#8b5cf6',
      'Approved': '#10b981',
      'Published': '#059669'
    };
    return colors[status] || '#6b7280';
  };

  useEffect(() => {
    fetchContentOverview();
  }, []);

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

  const StatCard = ({ title, count, total, color, percentage }) => (
    <div style={{
      background: 'white',
      border: '1px solid #e1e4e8',
      borderRadius: '6px',
      padding: '16px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
                   color="#f59e0b" percentage={((contentData.docs.draft || 0) / contentData.docs.total) * 100 || 0} />
          <StatCard title="Review" count={contentData.docs.review || 0} total={contentData.docs.total} 
                   color="#3b82f6" percentage={((contentData.docs.review || 0) / contentData.docs.total) * 100 || 0} />
          <StatCard title="Translate" count={contentData.docs.translate || 0} total={contentData.docs.total} 
                   color="#8b5cf6" percentage={((contentData.docs.translate || 0) / contentData.docs.total) * 100 || 0} />
          <StatCard title="Approved" count={contentData.docs.approved || 0} total={contentData.docs.total} 
                   color="#10b981" percentage={((contentData.docs.approved || 0) / contentData.docs.total) * 100 || 0} />
          <StatCard title="Published" count={contentData.docs.published || 0} total={contentData.docs.total} 
                   color="#059669" percentage={((contentData.docs.published || 0) / contentData.docs.total) * 100 || 0} />
          <StatCard title="Unlisted" count={contentData.docs.unlisted || 0} total={contentData.docs.total} 
                   color="#6b7280" percentage={((contentData.docs.unlisted || 0) / contentData.docs.total) * 100 || 0} />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#24292e' }}>
          ⚡ Recent Activity
        </h3>
        <div style={{
          background: 'white',
          border: '1px solid #e1e4e8',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {contentData.recentActivity.map((item, index) => (
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
              </div>
            </div>
          ))}
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