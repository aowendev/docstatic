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
      // The connection query provides the AST body structure we need
      const docsResult = await client.queries.docConnection({
        sort: 'title'
      });
      
      const docs = docsResult.data.docConnection.edges || [];
      const usages = {};
      
      // Initialize usage tracking for each media file
      mediaFiles.forEach(file => {
        usages[file.path] = [];
      });
      
      // Scan each document for image references using the connection query data
      // (which already includes the body AST that we need)
      docs.forEach(edge => {
        const node = edge.node;
        const title = node.title || node._sys.filename;
        const relativePath = node._sys.relativePath;
        
        // Extract content from AST body (which we know works from the test)
        let content = '';
        if (node.body && typeof node.body === 'object') {
          content = extractTextFromAST(node.body);
        } else if (typeof node.body === 'string') {
          content = node.body;
        }
        
        // Debug: Log for specific files we know should work
        if (content && (relativePath.includes('figures.mdx') || relativePath.includes('assets.mdx'))) {
          console.log(`Main scan - ${relativePath}, content length: ${content.length}`);
          console.log('Content sample:', content.substring(0, 200));
        }
        
        // Look for various image reference patterns
        mediaFiles.forEach(file => {
          const imagePath = file.path;
          const imageName = file.name;
          
          // Check for different image reference patterns
          const patterns = [
            // Standard markdown: ![alt](path)
            new RegExp(`!\\[[^\\]]*\\]\\(${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi'),
            // Standard markdown: ![alt](/static/img/name)
            new RegExp(`!\\[[^\\]]*\\]\\(/static${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi'),
            // Standard markdown with just filename: ![alt](name)
            new RegExp(`!\\[[^\\]]*\\]\\([^)]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi'),
            // HTML img tag: <img src="path">
            new RegExp(`<img[^>]+src=['""][^'"]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"][^>]*>`, 'gi'),
            // HTML img tag src attribute: src="path"
            new RegExp(`src=['""]${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'gi'),
            // Figure component: <Figure img="path">
            new RegExp(`<Figure[^>]+img=['""]${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^>]*>`, 'gi'),
            // Figure component with filename only: <Figure img="/img/name">
            new RegExp(`<Figure[^>]+img=['""]/img/[^'"]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^>]*>`, 'gi'),
            // Figure component with subfolder path: <Figure img="/img/docs/name">
            new RegExp(`<Figure[^>]+img=['""]${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^>]*>`, 'gi'),
            // Any img attribute with filename
            new RegExp(`img=['""][^'"]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"]`, 'gi'),
            // Static path references: /static/img/name
            new RegExp(`/static${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
            // Subfolder references in markdown: ![alt](subfolder/name)
            new RegExp(`!\\[[^\\]]*\\]\\([^)]*${imagePath.replace(/^\/img\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi'),
            // Simple filename match (most permissive)
            new RegExp(imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          ];
          
          let found = false;
          patterns.forEach((pattern, patternIndex) => {
            if (pattern.test(content)) {
              found = true;
              // Debug: Log successful matches for our test image
              if (imageName === 'docStaticDemo.jpg') {
                console.log(`Main scan - Found ${imageName} in ${relativePath} using pattern ${patternIndex}`);
              }
            }
          });
          
          if (found) {
            usages[imagePath].push({
              title,
              relativePath,
              filename: node._sys.filename,
              lastModified: node.lastmod || node._sys?.lastModified,
              editUrl: `/admin#/edit/${relativePath}`
            });
          }
        });
      });
      
      console.log('Final usage results:', usages);
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

  useEffect(() => {
    fetchMediaFiles();
  }, []);

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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          border: '2px solid #f0f0f0', 
          borderRadius: '8px', 
          padding: '40px',
          color: '#666'
        }}>
          Loading media files...
        </div>
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
    <div style={{ padding: '20px' }}>
      <div style={{ 
        border: '2px solid #e0e0e0', 
        borderRadius: '12px', 
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Media Library
          </h2>
          
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