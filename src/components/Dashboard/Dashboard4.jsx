import React, { useState, useEffect } from 'react';

const Dashboard4 = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate analytics data fetching
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const data = {
        pageViews: 8500 + Math.floor(Math.random() * 1000),
        uniqueVisitors: 2800 + Math.floor(Math.random() * 300),
        bounceRate: 25 + Math.floor(Math.random() * 10),
        avgSessionDuration: '2:34',
        topPages: [
          { path: '/docs/introduction', views: 1234 },
          { path: '/docs/getting-started', views: 987 },
          { path: '/docs/installation', views: 756 },
          { path: '/docs/configuration', views: 543 },
          { path: '/blog/hybrid', views: 321 }
        ]
      };
      
      setPerformanceData(data);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError(err.message);
      // Fallback to simulated data
      setPerformanceData({
        pageViews: 8500,
        uniqueVisitors: 2800,
        bounceRate: 25,
        avgSessionDuration: '2:34',
        topPages: [
          { path: '/docs/introduction', views: 1234 },
          { path: '/docs/getting-started', views: 987 },
          { path: '/docs/installation', views: 756 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading performance metrics...</div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#666' }}>No performance data available</div>
        {error && (
          <div style={{ color: '#d73a49', marginTop: '10px', fontSize: '14px' }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  const MetricCard = ({ title, value, unit, trend }) => (
    <div style={{
      background: 'white',
      border: '1px solid #e1e4e8',
      borderRadius: '6px',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontSize: '14px', color: '#586069', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#24292e' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span style={{ fontSize: '14px', color: '#586069' }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ fontSize: '12px', color: trend > 0 ? '#28a745' : '#d73a49', marginTop: '4px' }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
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
          📊 Performance Dashboard
        </h2>
        <button 
          onClick={fetchPerformanceData}
          style={{
            padding: '6px 12px',
            border: '1px solid #e1e4e8',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          disabled={loading}
        >
          {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard title="Page Views" value={performanceData.pageViews} trend={12} />
        <MetricCard title="Unique Visitors" value={performanceData.uniqueVisitors} trend={8} />
        <MetricCard title="Bounce Rate" value={performanceData.bounceRate} unit="%" trend={-5} />
        <MetricCard title="Avg. Session" value={performanceData.avgSessionDuration} />
      </div>

      {/* Top Pages */}
      <div style={{
        background: 'white',
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#24292e' }}>
          Top Pages
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e1e4e8', fontSize: '12px', color: '#586069' }}>
                  Page
                </th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e1e4e8', fontSize: '12px', color: '#586069' }}>
                  Views
                </th>
              </tr>
            </thead>
            <tbody>
              {performanceData.topPages.map((page, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f6f8fa', fontSize: '14px' }}>
                    <code style={{ background: '#f6f8fa', padding: '2px 4px', borderRadius: '3px', fontSize: '12px' }}>
                      {page.path}
                    </code>
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f6f8fa', fontSize: '14px', textAlign: 'right' }}>
                    {page.views.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default Dashboard4;