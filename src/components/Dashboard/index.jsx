import React, { useState, useEffect } from 'react';
import { useTina } from 'tinacms/dist/react';

const DashboardField = (props) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract dashboard name from the form data
  const dashboardName = props.input.value || '';

  useEffect(() => {
    setIsEnabled(!!props.input.value);
  }, [props.input.value]);

  const toggleDashboard = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    props.input.onChange(newValue);
  };

  const fetchDashboardData = async () => {
    if (!isEnabled || !dashboardName) return;
    
    setLoading(true);
    try {
      // Use Tina's GraphQL client to fetch data
      // This is a placeholder for your actual GraphQL queries
      const query = `
        query {
          docConnection {
            edges {
              node {
                id
                title
                draft
                review
                published
              }
            }
          }
        }
      `;
      
      // This would be your actual GraphQL client call
      // For demo purposes, we'll simulate data
      setTimeout(() => {
        if (dashboardName.includes('analytics')) {
          setDashboardData({
            totalDocs: 25,
            publishedDocs: 18,
            draftDocs: 7,
            viewsThisMonth: 1250
          });
        } else if (dashboardName.includes('content-status')) {
          setDashboardData({
            inReview: 3,
            inTranslation: 2,
            approved: 5,
            needsUpdate: 4
          });
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEnabled) {
      fetchDashboardData();
    } else {
      setDashboardData(null);
    }
  }, [isEnabled, dashboardName]);

  const renderAnalyticsDashboard = (data) => (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginTop: '10px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Analytics Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {data.totalDocs}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Documents</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            {data.publishedDocs}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Published</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {data.draftDocs}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Drafts</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
            {data.viewsThisMonth}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Views This Month</div>
        </div>
      </div>
    </div>
  );

  const renderContentStatusDashboard = (data) => (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginTop: '10px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📝 Content Status Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {data.inReview}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>In Review</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
            {data.inTranslation}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>In Translation</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            {data.approved}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Approved</div>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {data.needsUpdate}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Needs Update</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={toggleDashboard}
            style={{ margin: 0 }}
          />
          <span>Enable Dashboard</span>
        </label>
        {loading && <span style={{ color: '#666' }}>Loading...</span>}
      </div>
      
      {isEnabled && dashboardData && (
        dashboardName.includes('analytics') 
          ? renderAnalyticsDashboard(dashboardData)
          : dashboardName.includes('content-status')
          ? renderContentStatusDashboard(dashboardData)
          : (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔧 Custom Dashboard</h3>
              <p>Dashboard data will be displayed here when properly configured.</p>
            </div>
          )
      )}
    </div>
  );
};

export default DashboardField;