import React, { useState, useEffect } from 'react';

const Dashboard2 = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - replace with real data fetching as needed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setDashboardData({
        inReview: 4,
        inTranslation: 2,
        approved: 28,
        needsUpdate: 6,
        published: 28,
        totalContent: 40,
        recentActivity: [
          { title: 'Getting Started Guide', action: 'Published', timestamp: new Date().toISOString() },
          { title: 'API Documentation', action: 'Under Review', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { title: 'Installation Guide', action: 'Draft Updated', timestamp: new Date(Date.now() - 172800000).toISOString() },
        ]
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
      setDashboardData({
        inReview: 3,
        inTranslation: 2,
        approved: 5,
        needsUpdate: 4,
        published: 18,
        totalContent: 32
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div>Loading Content Status Dashboard...</div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        <div>Error loading dashboard: {error}</div>
        <button 
          onClick={fetchDashboardData}
          style={{ 
            marginTop: '10px', 
            padding: '5px 10px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      inReview: '#f59e0b',
      inTranslation: '#06b6d4',
      approved: '#059669',
      needsUpdate: '#dc2626',
      published: '#7c3aed',
      totalContent: '#2563eb'
    };
    return colors[status] || '#6b7280';
  };

  const workflowItems = [
    { key: 'totalContent', label: 'Total Content', value: dashboardData?.totalContent || 0 },
    { key: 'published', label: 'Published', value: dashboardData?.published || 0 },
    { key: 'inReview', label: 'In Review', value: dashboardData?.inReview || 0 },
    { key: 'inTranslation', label: 'In Translation', value: dashboardData?.inTranslation || 0 },
    { key: 'approved', label: 'Approved', value: dashboardData?.approved || 0 },
    { key: 'needsUpdate', label: 'Needs Update', value: dashboardData?.needsUpdate || 0 }
  ];

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>📝 Content Status Dashboard</h3>
        <button 
          onClick={fetchDashboardData}
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
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fef3c7',
          borderRadius: '4px',
          marginBottom: '15px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          Warning: Using fallback data due to GraphQL error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        {workflowItems.map((item) => (
          <div 
            key={item.key}
            style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '6px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: getStatusColor(item.key)
            }}>
              {item.value}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Progress Bar */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>Content Workflow Progress</h4>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#666', minWidth: '80px' }}>Progress:</span>
            <div style={{ 
              flex: 1, 
              backgroundColor: '#f3f4f6', 
              borderRadius: '10px', 
              overflow: 'hidden',
              height: '20px',
              position: 'relative'
            }}>
              <div style={{ 
                width: `${dashboardData?.totalContent > 0 ? (dashboardData.published / dashboardData.totalContent * 100) : 0}%`,
                backgroundColor: '#059669',
                height: '100%',
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {dashboardData?.totalContent > 0 ? Math.round(dashboardData.published / dashboardData.totalContent * 100) : 0}%
              </div>
            </div>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {dashboardData?.published || 0}/{dashboardData?.totalContent || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard2;