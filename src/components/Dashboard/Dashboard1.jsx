import React, { useState, useEffect } from 'react';
import { client } from '../../../tina/__generated__/client';

const Dashboard1 = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Tina's GraphQL client properly
      const result = await client.queries.docConnection({
        sort: 'title',
      });

      const docs = result.data.docConnection.edges;
      const totalDocs = docs.length;
      const publishedDocs = docs.filter(edge => edge.node.published).length;
      const draftDocs = docs.filter(edge => edge.node.draft).length;
      const reviewDocs = docs.filter(edge => edge.node.review).length;

      setDashboardData({
        totalDocs,
        publishedDocs,
        draftDocs,
        reviewDocs,
        viewsThisMonth: Math.floor(Math.random() * 2000) + 500 // Simulated for demo
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
      // Fallback to simulated data for demo
      setDashboardData({
        totalDocs: 25,
        publishedDocs: 18,
        draftDocs: 7,
        reviewDocs: 3,
        viewsThisMonth: 1250
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
        <div>Loading Analytics Dashboard...</div>
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

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>📊 Analytics Dashboard</h3>
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
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {dashboardData?.totalDocs || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Documents</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            {dashboardData?.publishedDocs || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Published</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {dashboardData?.draftDocs || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Drafts</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {dashboardData?.reviewDocs || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>In Review</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
            {dashboardData?.viewsThisMonth || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Views This Month</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;