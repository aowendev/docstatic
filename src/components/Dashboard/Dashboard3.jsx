import React, { useState, useEffect } from 'react';
import docusaurusSettings from '../../../config/docusaurus/index.json';

const Dashboard3 = () => {
  const [connectionTests, setConnectionTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const testConnections = async () => {
    if (loading) return; // Prevent concurrent executions
    
    setLoading(true);
    const tests = [];

    try {
      // Test 1: Try the original GraphQL endpoint
      try {
        const response1 = await fetch('http://localhost:4001/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: '{ __typename }'
          }),
        });
        tests.push({
          name: 'http://localhost:4001/graphql',
          status: response1.ok ? 'SUCCESS' : `FAILED (${response1.status})`,
          details: response1.ok ? 'Connected successfully' : `HTTP ${response1.status}`,
          color: response1.ok ? '#059669' : '#dc2626'
        });
      } catch (err) {
        tests.push({
          name: 'http://localhost:4001/graphql',
          status: 'ERROR',
          details: err.message,
          color: '#dc2626'
        });
      }

      // Test 2: Check TinaCloud configuration
      try {
        const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
        
        if (!clientId) {
          tests.push({
            name: 'TinaCloud Configuration',
            status: 'CONFIG ERROR',
            details: 'NEXT_PUBLIC_TINA_CLIENT_ID is not set in environment variables',
            color: '#f59e0b'
          });
        } else {
          tests.push({
            name: 'TinaCloud Configuration',
            status: 'CONFIGURED',
            details: `Client ID configured. Note: TINA_TOKEN is server-side only (this is correct for security).`,
            color: '#059669'
          });
        }
      } catch (err) {
        tests.push({
          name: 'TinaCloud Configuration',
          status: 'ERROR',
          details: `Error checking configuration: ${err.message}`,
          color: '#dc2626'
        });
      }

      // Test 3: Try live site GraphQL endpoint (informational)
      try {
        const siteUrl = docusaurusSettings.url.siteUrl;
        const url = new URL(siteUrl);
        
        // According to Tina docs, the GraphQL API is at /admin/api/graphql
        const correctGraphQLUrl = `https://${url.hostname}/admin/api/graphql`;
        
        const response3 = await fetch(correctGraphQLUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' }),
        });
        tests.push({
          name: `Live Site GraphQL (${correctGraphQLUrl})`,
          status: response3.ok ? 'SUCCESS' : `FAILED (${response3.status})`,
          details: response3.ok ? 'Connected to live site GraphQL' : `HTTP ${response3.status} - This is normal for production sites`,
          color: response3.ok ? '#059669' : '#f59e0b'
        });
      } catch (err) {
        tests.push({
          name: 'Live Site GraphQL',
          status: 'EXPECTED',
          details: 'NetworkError is normal - Production sites typically block direct GraphQL access for security. Use TinaCloud API or generated client instead.',
          color: '#2563eb'
        });
      }
      // Test 4: Check if we can import the Tina client
      try {
        const { client } = await import('../../../tina/__generated__/client');
        if (client) {
          tests.push({
            name: 'Tina Generated Client',
            status: 'AVAILABLE',
            details: 'Client imported successfully',
            color: '#059669'
          });

          // Test 5: Try using the Tina client
          try {
            const result = await client.queries.docConnection();
            tests.push({
              name: 'Tina Client Query',
              status: 'SUCCESS',
              details: `Found ${result.data.docConnection.edges.length} documents`,
              color: '#059669'
            });
          } catch (clientErr) {
            tests.push({
              name: 'Tina Client Query',
              status: 'ERROR',
              details: clientErr.message,
              color: '#dc2626'
            });
          }
        }
      } catch (err) {
        tests.push({
          name: 'Tina Generated Client',
          status: 'NOT AVAILABLE',
          details: err.message,
          color: '#f59e0b'
        });
      }

      // Test 6: Environment detection and context
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProduction = process.env.NODE_ENV === 'production';
      const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
      
      tests.push({
        name: 'Environment Detection',
        status: 'INFO',
        details: `${isLocalDev ? '🏠 Local Development' : '☁️ Cloud/Production'} | Node ENV: ${process.env.NODE_ENV} | Client ID: ${clientId ? 'Set' : 'Not Set'}`,
        color: '#2563eb'
      });

      // Add environment-specific guidance
      if (isLocalDev) {
        tests.push({
          name: 'Local Development Notes',
          status: 'INFO',
          details: 'Localhost GraphQL should work. Live site tests will fail due to CORS (this is normal).',
          color: '#059669'
        });
      } else {
        tests.push({
          name: 'Production Notes',
          status: 'INFO',
          details: 'TinaCloud API should work if tokens are configured. Local GraphQL will fail (no dev server).',
          color: '#f59e0b'
        });
      }

      setConnectionTests(tests);
    } catch (globalErr) {
      console.error('Global test error:', globalErr);
      setConnectionTests([{
        name: 'Global Error',
        status: 'ERROR',
        details: globalErr.message,
        color: '#dc2626'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnections();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>🔌 GraphQL Connection Test</h3>
        <button 
          onClick={testConnections}
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
          {loading ? 'Testing...' : 'Retest'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '10px' }}>
        {connectionTests.map((test, index) => (
          <div 
            key={index}
            style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${test.color}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{test.name}</div>
              <div style={{ 
                color: test.color, 
                fontWeight: 'bold',
                fontSize: '12px',
                backgroundColor: `${test.color}20`,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {test.status}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {test.details}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#666'
        }}>
          Running connection tests...
        </div>
      )}
    </div>
  );
};

export default Dashboard3;