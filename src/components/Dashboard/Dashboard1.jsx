/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
        sort: 'title',
        first: 500  // Request more documents
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
          const relativePath = node._sys.relativePath;
          
          // Skip documents without lastmod field
          if (!node.lastmod) return false;
          
          // Apply time filter if specified
          if (timeCutoff) {
            const docDate = new Date(node.lastmod);
            if (docDate < timeCutoff) return false;
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
      <div style={{
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
          <div className="font-bold text-gray-800 text-xl mb-2">
            Loading Dashboard
          </div>
          <div className="font-medium text-gray-600 text-base mb-4">
            Loading content overview...
          </div>
          
          {/* Progress Bar for Loading */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              borderRadius: '3px',
              animation: 'indeterminate 2s ease-in-out infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
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

  const StatCard = ({ title, count, total, color, percentage, onClick }) => {
    const getStatusIcon = (status) => {
      const icons = {
        'Draft': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="9" x2="15" y1="15" y2="15"/>
            <line x1="9" x2="12" y1="18" y2="18"/>
          </svg>
        ),
        'Review': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ), 
        'Translate': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" x2="22" y1="12" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        ),
        'Approved': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1 1 3 3 3s3-2 3-3-1-3-3-3-3 2-3 3"/>
            <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
          </svg>
        ),
        'Published': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
          </svg>
        ),
        'Unlisted': (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )
      };
      return icons[status] || icons['Draft'];
    };

    const getBackgroundColor = (status) => {
      const backgrounds = {
        'Draft': 'bg-orange-100',
        'Review': 'bg-blue-100',
        'Translate': 'bg-purple-100',
        'Approved': 'bg-green-100',
        'Published': 'bg-emerald-100',
        'Unlisted': 'bg-gray-100'
      };
      return backgrounds[status] || 'bg-gray-100';
    };

    return (
      <div 
        onClick={() => count > 0 && onClick && onClick(title)}
        className={`bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6 transition-all duration-200 ${
          count > 0 ? 'cursor-pointer hover:shadow-md' : 'cursor-default opacity-60'
        }`}
      >
        <div className={`${getBackgroundColor(title)} p-3 rounded-lg flex-shrink-0`}>
          <div style={{ color }}>{getStatusIcon(title)}</div>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{count || 0}</p>
          <p className="text-xs text-gray-400">
            {isNaN(percentage) ? '0' : percentage.toFixed(0)}% of {total}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '24px',
      borderBottom: '2px solid #d1d9e0',
      marginBottom: '32px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-3xl text-tina-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <path d="M9 9h6v6H9z"></path>
              <path d="m16 3-4 4-4-4"></path>
              <path d="M21 16.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5.7 1.5 1.5 1.5 1.5-.7 1.5-1.5z"></path>
              <path d="M3 7.5C3 6.7 3.7 6 4.5 6S6 6.7 6 7.5 5.3 9 4.5 9 3 8.3 3 7.5z"></path>
            </svg>
          </span>
          <h2 className="m-0 text-2xl font-bold text-gray-800">
            Content Overview Dashboard
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#656d76' }}>
            Overall Progress: <strong style={{ color: '#24292f' }}>{contentData.totalProgress}%</strong>
          </div>
          <button 
            onClick={fetchContentOverview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#374151';
            }}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Documentation Workflow */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="9" x2="15" y1="15" y2="15"></line>
            <line x1="9" x2="12" y1="18" y2="18"></line>
          </svg>
          Documentation ({contentData.docs.total} topics)
        </h3>       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <h4 style={{ margin: 0, fontSize: '14px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                {showDocuments} Documents ({filteredDocs.length})
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
          <h3 style={{ margin: 0, fontSize: '16px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Recent Activity
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="m12 17 .01 0"></path>
            </svg>
            Some data may be simulated due to connection issues: {error}
          </span>
        </div>
      )}
    </div>
  );
};

export default Dashboard1;