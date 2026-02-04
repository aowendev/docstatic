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
      const docsResult = await client.queries.docConnection({ sort: 'title' });
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
              editUrl: `/admin#/edit/${relativePath}`
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
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        marginTop: 0,
        marginBottom: '32px',
        marginLeft: '16px',
        marginRight: '16px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '10px',
          gap: '16px' // Restore original gap between title and button
        }}>
          <h3 className="font-sans text-2xl text-tina-orange" style={{ margin: 0 }}>
            🏞️ Media Reuse
          </h3>
          <button
            onClick={fetchMediaFiles}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: '8px' // Extra gap for safety
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '12px'
          }} />
          <div style={{ fontWeight: 500, color: '#2563eb', fontSize: '16px', marginBottom: '2px' }}>
            Loading media files...
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>This may take a moment</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          border: '2px solid #ffebee', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fafafa',
          color: '#d32f2f'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!mediaData) {
    return null;
  }

  const filteredFiles = getFilteredFiles();

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ 
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',

      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 class="font-sans text-2xl text-tina-orange" style={{ margin: 0 }}>
              🏞️ Media Reuse
            </h3>
            <button
              onClick={fetchMediaFiles}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '10px'
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #e1e4e8', margin: '10px 0 20px 0' }} />
          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#2c3e50' }}>{mediaData.stats.total}</strong> total files
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#2c3e50' }}>{mediaData.stats.images}</strong> images
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#28a745' }}>
                {Object.values(imageUsages).filter(usages => usages.length > 0).length}
              </strong> used
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#dc3545' }}>
                {Object.values(imageUsages).filter(usages => usages.length === 0).length}
              </strong> unused
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#2c3e50' }}>{mediaData.stats.totalSize.toFixed(1)} KB</strong> total size
            </div>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666', marginRight: '10px' }}>Filter:</span>
            {['all', 'images', 'recent', 'used', 'unused'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: filterType === filter ? '#007bff' : '#ffffff',
                  color: filterType === filter ? '#ffffff' : '#333',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {filter === 'recent' ? 'Recent (7 days)' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Media Files List */}
        <div style={{ padding: '20px' }}>
          {filteredFiles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: '40px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>No media files found for the current filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {filteredFiles.map((file, index) => (
                <div 
                  key={index}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: '#fdfdfd',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#dee2e6'
                    }
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
                      backgroundColor: '#e9ecef',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6',
                      display: file.type === 'image' ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      {file.extension ? file.extension.toUpperCase() : ''}
                    </div>
                  </div>

                  {/* File details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#2c3e50',
                      marginBottom: '4px'
                    }}>
                      {file.filename}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#6c757d',
                      marginBottom: '8px'
                    }}>
                      {file.path}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      fontSize: '12px', 
                      color: '#868e96'
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
                        backgroundColor: (imageUsages[file.path] || []).length > 0 ? '#28a745' : '#dc3545',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
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
                      marginTop: '10px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        color: '#495057',
                        fontWeight: '600'
                      }}>
                        Used in {(imageUsages[file.path] || []).length} document{(imageUsages[file.path] || []).length !== 1 ? 's' : ''}:
                      </h4>
                      
                      {(imageUsages[file.path] || []).length === 0 ? (
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#6c757d',
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
                                padding: '8px 12px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#2c3e50',
                                  marginBottom: '2px'
                                }}>
                                  {usage.title}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#6c757d'
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
                                  padding: '4px 8px',
                                backgroundColor: '#007bff',
                                color: '#ffffff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
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
