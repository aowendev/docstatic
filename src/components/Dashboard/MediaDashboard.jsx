/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';

const MediaDashboard = () => {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [imageUsages, setImageUsages] = useState({});
  const [expandedFile, setExpandedFile] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Helper: get extension from filename
  const getExtension = (filename) => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  };

  // Helper: guess type from extension
  const getType = (filename) => {
    const ext = getExtension(filename);
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "ico", "avif"].includes(ext)) return "image";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
    return "file";
  };

  const openLightbox = (file) => {
    setLightboxImage(file);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const extractTextFromAST = (node) => {
    if (!node) return '';
    
    let text = '';
    
    if (typeof node === 'string') {
      return node;
    }
    
    if (typeof node === 'object') {
      // Handle different node types
      if (node.type === 'text' && node.value) {
        text += node.value;
      }
      
      // Handle nodes with props (like Figure components)
      if (node.props) {
        // Extract props as text for searching
        text += JSON.stringify(node.props);
      }
      
      // Handle JSX elements
      if (node.type === 'element' && node.props) {
        text += JSON.stringify(node.props);
      }
      
      // Handle MDX JSX elements
      if (node.name === 'Figure' && node.props) {
        text += JSON.stringify(node.props);
        }
      
      // Recursively process children
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          text += extractTextFromAST(child);
        }
      }
      
      // Handle other array-like structures
      if (Array.isArray(node)) {
        for (const item of node) {
          text += extractTextFromAST(item);
        }
      }
    }
    
    return text;
  };

  const scanDocumentsForImageUsage = async (mediaFiles) => {
    try {
      const { client } = await import('../../../tina/__generated__/client');
      // Fetch all documents to scan for image usage using connection query
      const docsResult = await client.queries.docConnection({
        sort: 'title',
        first: 500  // Request more documents
      });
      const docs = docsResult.data.docConnection.edges || [];
      const usages = {};
      mediaFiles.forEach(file => { usages[file.path] = []; });
      docs.forEach(edge => {
        const node = edge.node;
        const title = node.title || node._sys.filename;
        const relativePath = node._sys.relativePath;
        let content = '';
        if (node.body && typeof node.body === 'object') {
          content = extractTextFromAST(node.body);
        } else if (typeof node.body === 'string') {
          content = node.body;
        }
        if (content && (relativePath.includes('figures.mdx') || relativePath.includes('assets.mdx'))) {
          console.log(`Main scan - ${relativePath}, content length: ${content.length}`);
        }
        mediaFiles.forEach(file => {
          if (content.includes(file.filename) || content.includes(file.path)) {
            usages[file.path].push({
              title,
              relativePath,
              filename: node._sys.filename,
              lastModified: node.lastmod || node._sys?.lastModified,
              editUrl: `/admin/#/collections/edit/doc/${relativePath.replace(/\.[^/.]+$/, '')}`
            });
          }
        });
      });
            setImageUsages(usages);
      return usages;
    } catch (err) {
      console.error('Error scanning documents for image usage:', err);
      return {};
    }
  };

  const fetchMediaFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { client } = await import('../../../tina/__generated__/client');
      // Query Tina's MediaCollection (reuse/media/index.json)
      const mediaResult = await client.queries.media({ relativePath: "index.json" });
      const mediaList = (mediaResult?.data?.media?.media) || [];
      // Add type, extension, url, and name fields for UI compatibility
      const files = mediaList.map((file) => {
        const ext = getExtension(file.filename);
        const type = getType(file.filename);
        // Use file.path for correct subfolder support
        const url = `/img/${file.path}`;
        return {
          ...file,
          name: file.filename,
          extension: ext,
          type,
          url,
          lastModified: file.lastModified || '',
          dimensions: file.dimensions || '',
        };
      });
      setMediaFiles(files);
      const mediaStats = {
        total: files.length,
        images: files.filter(f => f.type === 'image').length,
        totalSize: files.reduce((acc, file) => acc + (typeof file.size === 'number' ? file.size / 1024 : 0), 0),
      };
      setMediaData({
        files,
        stats: mediaStats
      });
      await scanDocumentsForImageUsage(files);
    } catch (err) {
      console.error('Error fetching media files:', err);
      setError('Failed to load media files from Tina MediaCollection.');
    } finally {
      setLoading(false);
    }
  };



  const getFilteredFiles = () => {
    if (filterType === 'all') return mediaFiles;
    return mediaFiles.filter(file => {
      switch (filterType) {
        case 'images':
          return file.type === 'image';
        case 'recent':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(file.lastModified) > oneWeekAgo;
        case 'used':
          return (imageUsages[file.path] || []).length > 0;
        case 'unused':
          return (imageUsages[file.path] || []).length === 0;
        default:
          return true;
      }
    });
  };

  const formatFileSize = (size) => {
    // size is in bytes (number)
    if (typeof size !== 'number') return size;
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${size} B`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Always show the heading and button row, but if not loaded, only show the Load button (no dashboard content)
  if (!mediaData && !loading && !error) {
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
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-3xl text-tina-orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </span>
            <h2 className="m-0 text-2xl font-bold text-gray-800">
              Media Usage Dashboard
            </h2>
          </div>
          <button
            onClick={fetchMediaFiles}
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
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>
    );
  }

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
            Loading media files...
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

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        borderBottom: '2px solid #d1d9e0',
        marginBottom: '32px'
      }}>
        <div style={{ 
          padding: '16px',
          backgroundColor: '#ffebee',
          borderLeft: '4px solid #d32f2f',
          borderRadius: '6px',
          color: '#d32f2f'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#d32f2f', fontSize: '16px' }}>Error</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!mediaData) {
    return null;
  }

  const filteredFiles = getFilteredFiles();

  return (
    <div style={{ 
      padding: '24px',
      borderBottom: '2px solid #d1d9e0',
      marginBottom: '32px'
    }}>
        {/* Header */}
        <div className="mb-6">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="text-3xl text-tina-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              </span>
              <h2 className="m-0 text-2xl font-bold text-gray-800">
                Media Usage Dashboard
              </h2>
            </div>
            <button
              onClick={fetchMediaFiles}
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
          
          {/* Media Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">Total Files</p>
                <p className="text-3xl font-bold text-blue-600">{mediaData.stats.total}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">Images</p>
                <p className="text-3xl font-bold text-purple-600">{mediaData.stats.images}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">Used</p>
                <p className="text-3xl font-bold text-green-600">{Object.values(imageUsages).filter(usages => usages.length > 0).length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m4.9 4.9 14.2 14.2"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">Unused</p>
                <p className="text-3xl font-bold text-red-600">{Object.values(imageUsages).filter(usages => usages.length === 0).length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6">
              <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">Total Size</p>
                <p className="text-sm font-medium text-orange-600">{mediaData.stats.totalSize.toFixed(1)} KB</p>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#586069', marginRight: '12px' }}>Filter:</span>
            {['all', 'images', 'recent', 'used', 'unused'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d9e0',
                  borderRadius: '6px',
                  backgroundColor: filterType === filter ? '#2563eb' : '#ffffff',
                  color: filterType === filter ? '#ffffff' : '#24292f',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: filterType === filter ? '500' : '400'
                }}
              >
                {filter === 'recent' ? 'Recent (7 days)' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Media Files List */}
        <div>
          {filteredFiles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#586069', 
              padding: '40px 20px',
              backgroundColor: '#f6f8fa',
              borderRadius: '6px'
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>No media files found for the current filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredFiles.map((file, index) => (
                <div 
                  key={index}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    border: '1px solid #d1d9e0',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f6f8fa';
                    e.currentTarget.style.borderColor = '#8c959f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#d1d9e0';
                  }}
                >
                  {/* File preview */}
                  <div style={{ 
                    marginRight: '15px',
                    flexShrink: 0
                  }}>
                    {file.type === 'image' ? (
                      <img 
                        src={file.url} 
                        alt={file.filename}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #dee2e6',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        onClick={() => openLightbox(file)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                      />
                    ) : null}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#f6f8fa',
                      borderRadius: '6px',
                      border: '1px solid #d1d9e0',
                      display: file.type === 'image' ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#656d76',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {file.extension ? file.extension.toUpperCase() : ''}
                    </div>
                  </div>

                  {/* File details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#24292f',
                      marginBottom: '4px'
                    }}>
                      {file.filename}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#656d76',
                      marginBottom: '8px'
                    }}>
                      {file.path}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      fontSize: '12px', 
                      color: '#656d76'
                    }}>
                      <span>{formatFileSize(file.size)}</span>
                      {file.extension === 'svg' ? (
                        <span>vector</span>
                      ) : (
                        file.dimensions && <span>{file.dimensions}</span>
                      )}
                      {file.lastModified && <span>Modified: {formatDate(file.lastModified)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: (imageUsages[file.path] || []).length > 0 ? '#28a745' : '#d1242f',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {(imageUsages[file.path] || []).length > 0 
                        ? `Used in ${(imageUsages[file.path] || []).length} docs` 
                        : 'Not used'}
                    </button>
                  </div>

                  {/* Usage Details - Expandable */}
                  {expandedFile === file.path && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '12px',
                      padding: '16px',
                      backgroundColor: '#f6f8fa',
                      borderRadius: '6px',
                      border: '1px solid #d1d9e0',
                      zIndex: 10,
                      boxShadow: '0 8px 24px rgba(140,149,159,0.2)'
                    }}>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        color: '#24292f',
                        fontWeight: '600'
                      }}>
                        Used in {(imageUsages[file.path] || []).length} document{(imageUsages[file.path] || []).length !== 1 ? 's' : ''}:
                      </h4>
                      
                      {(imageUsages[file.path] || []).length === 0 ? (
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#656d76',
                          fontStyle: 'italic'
                        }}>
                          This image is not currently used in any documents.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {(imageUsages[file.path] || []).map((usage, usageIndex) => (
                            <div
                              key={usageIndex}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #d1d9e0'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#24292f',
                                  marginBottom: '4px'
                                }}>
                                  {usage.title}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#656d76'
                                }}>
                                  {usage.relativePath}
                                  {usage.lastModified && (
                                    <span> • Modified: {formatDate(usage.lastModified)}</span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={usage.editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '6px 12px',
                                backgroundColor: '#f59e0b',
                                color: '#ffffff',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                              >
                                Edit
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
            ))}
            </div>
          )}
        </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={closeLightbox}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '8px'
              }}
            >
              ✕
            </button>
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.filename}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <div style={{
              color: 'white',
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '14px'
            }}>
              {lightboxImage.filename} {lightboxImage.dimensions ? `• ${lightboxImage.dimensions}` : ''} • {formatFileSize(lightboxImage.size)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDashboard;
