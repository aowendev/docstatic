import React, { useState, useEffect } from 'react';

/**
 * Media Dashboard Component
 * 
 * This component provides a dashboard interface for managing and viewing media files.
 * Currently uses static file discovery as a fallback, but is designed to integrate
 * with GraphQL when media queries become available.
 * 
 * Future GraphQL Integration:
 * When TinaCMS or custom media endpoints are available, this component can be extended
 * to use GraphQL queries like:
 * 
 * const mediaQuery = gql`
 *   query MediaConnection($first: Float, $after: String) {
 *     mediaConnection(first: $first, after: $after) {
 *       edges {
 *         node {
 *           id
 *           filename
 *           url
 *           src
 *           alt
 *           type
 *           size
 *           lastModified
 *         }
 *       }
 *       pageInfo {
 *         hasNextPage
 *         endCursor
 *       }
 *     }
 *   }
 * `;
 */

const MediaDashboard = () => {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [imageUsages, setImageUsages] = useState({});
  const [expandedFile, setExpandedFile] = useState(null);

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

  const testImageUsageQuery = async () => {
    try {
      const { client } = await import('../../../tina/__generated__/client');
      
      console.log('=== Testing GraphQL Query for docStaticDemo.jpg ===');
      
      // Fetch all documents
      const docsResult = await client.queries.docConnection({
        sort: 'title'
      });
      
      const docs = docsResult.data.docConnection.edges || [];
      console.log(`Found ${docs.length} total documents`);
      
      // Test specific documents that we know contain the image
      const testFiles = ['guides/markdown-features/figures.mdx', 'guides/markdown-features/assets.mdx'];
      
      for (const testFile of testFiles) {
        try {
          // Try to get individual document
          const docResult = await client.queries.doc({
            relativePath: testFile
          });
          
          const doc = docResult.data.doc;
          console.log(`\n--- Testing ${testFile} ---`);
          console.log('Available fields:', Object.keys(doc));
          
          // Check different content fields
          const contentFields = ['body', 'content', '_body', 'rawBody'];
          contentFields.forEach(field => {
            if (doc[field]) {
              const fieldValue = doc[field];
              const fieldType = typeof fieldValue;
              console.log(`${field} type:`, fieldType);
              
              if (fieldType === 'string') {
                console.log(`${field} length:`, fieldValue.length);
                
                // Check if it contains our target image
                if (fieldValue.includes('docStaticDemo.jpg')) {
                  console.log(`✓ Found docStaticDemo.jpg in ${field}!`);
                  console.log('Context:', fieldValue.substring(
                    Math.max(0, fieldValue.indexOf('docStaticDemo.jpg') - 50),
                    fieldValue.indexOf('docStaticDemo.jpg') + 100
                  ));
                } else {
                  console.log(`✗ docStaticDemo.jpg not found in ${field}`);
                }
              } else if (fieldType === 'object') {
                console.log(`${field} is an object with keys:`, Object.keys(fieldValue));
                
                // Extract text content from AST
                const extractedText = extractTextFromAST(fieldValue);
                console.log(`${field} extracted text length:`, extractedText.length);
                console.log(`${field} extracted text sample:`, extractedText.substring(0, 300));
                
                // Check if it contains our target image
                if (extractedText.includes('docStaticDemo.jpg')) {
                  console.log(`✓ Found docStaticDemo.jpg in ${field} AST!`);
                  const index = extractedText.indexOf('docStaticDemo.jpg');
                  console.log('Context:', extractedText.substring(
                    Math.max(0, index - 50),
                    index + 100
                  ));
                } else {
                  console.log(`✗ docStaticDemo.jpg not found in ${field} AST`);
                }
              } else {
                console.log(`${field} value:`, fieldValue);
              }
            }
          });
          
          // Test our patterns
          const targetImage = 'docStaticDemo.jpg';
          let content = '';
          
          // Try to get content as string from various sources
          const contentSources = [doc.body, doc.content, doc._body, doc.rawBody];
          for (const source of contentSources) {
            if (typeof source === 'string' && source.length > 0) {
              content = source;
              break;
            } else if (typeof source === 'object' && source !== null) {
              content = extractTextFromAST(source);
              break;
            }
          }
          
          console.log(`Using content source with length: ${content.length}`);
          
          const testPatterns = [
            { name: 'Figure component', pattern: new RegExp(`<Figure[^>]+img=['""]/img/${targetImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^>]*>`, 'gi') },
            { name: 'Standard markdown', pattern: new RegExp(`!\\[[^\\]]*\\]\\([^)]*${targetImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi') },
            { name: 'IMG attribute', pattern: new RegExp(`img=['""][^'"]*${targetImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"]`, 'gi') },
            { name: 'Any reference', pattern: new RegExp(targetImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') }
          ];
          
          testPatterns.forEach(({ name, pattern }) => {
            const matches = content.match(pattern);
            if (matches) {
              console.log(`✓ Pattern "${name}" matched:`, matches);
            } else {
              console.log(`✗ Pattern "${name}" no match`);
            }
          });
          
        } catch (err) {
          console.error(`Error fetching ${testFile}:`, err);
        }
      }
      
      // Also test the connection query to see what fields are available
      console.log('\n--- Connection Query Sample ---');
      if (docs.length > 0) {
        const sampleDoc = docs.find(edge => edge.node._sys.relativePath.includes('figures.mdx'));
        if (sampleDoc) {
          console.log('Sample doc fields:', Object.keys(sampleDoc.node));
          console.log('Sample doc relativePath:', sampleDoc.node._sys.relativePath);
          
          const contentFields = ['body', 'content', '_body'];
          contentFields.forEach(field => {
            if (sampleDoc.node[field]) {
              const fieldValue = sampleDoc.node[field];
              const fieldType = typeof fieldValue;
              console.log(`Sample ${field} type:`, fieldType);
              
              if (fieldType === 'string') {
                console.log(`Sample ${field} (first 200 chars):`, fieldValue.substring(0, 200));
              } else if (fieldType === 'object') {
                console.log(`Sample ${field} object keys:`, Object.keys(fieldValue));
                console.log(`Sample ${field} object:`, fieldValue);
              } else {
                console.log(`Sample ${field} value:`, fieldValue);
              }
            }
          });
        }
      }
      
    } catch (err) {
      console.error('Test GraphQL Query Error:', err);
    }
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
            new RegExp(`<Figure[^>]+img=['""]/img/${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^>]*>`, 'gi'),
            // Any img attribute with filename
            new RegExp(`img=['""][^'"]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"]`, 'gi'),
            // Static path references: /static/img/name
            new RegExp(`/static${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
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
      // Try to fetch media files using GraphQL first
      let mediaFiles = [];
      
      try {
        const { client } = await import('../../../tina/__generated__/client');
        
        // Since TinaCMS doesn't expose media files through GraphQL by default,
        // we'll need to use a custom approach or implement a server-side endpoint
        // For now, we'll use a hybrid approach: check for static files and simulate data
        
        // TODO: Implement server-side media endpoint or custom GraphQL resolver
        // const mediaResult = await client.queries.mediaConnection();
        // mediaFiles = mediaResult.data.mediaConnection.edges;
        
      } catch (graphqlError) {
        console.log('GraphQL media query not available, using fallback approach');
      }
      
      // Fallback: Use static file discovery
      // In a production environment, you would implement a server-side endpoint
      // to scan the static/img directory and return file metadata
      const staticMediaFiles = [
        {
          name: 'developers.jpg',
          path: '/img/developers.jpg',
          type: 'image',
          extension: '.jpg',
          size: '142 KB',
          lastModified: '2024-01-20T10:30:00Z',
          dimensions: '800x600',
          url: '/img/developers.jpg'
        },
        {
          name: 'docStaticDemo.jpg',
          path: '/img/docStaticDemo.jpg',
          type: 'image',
          extension: '.jpg',
          size: '95 KB',
          lastModified: '2024-01-18T14:22:00Z',
          dimensions: '1200x675',
          url: '/img/docStaticDemo.jpg'
        },
        {
          name: 'docstatic.png',
          path: '/img/docstatic.png',
          type: 'image',
          extension: '.png',
          size: '8 KB',
          lastModified: '2024-01-15T09:15:00Z',
          dimensions: '200x200',
          url: '/img/docstatic.png'
        },
        {
          name: 'users.jpg',
          path: '/img/users.jpg',
          type: 'image',
          extension: '.jpg',
          size: '128 KB',
          lastModified: '2024-01-19T16:45:00Z',
          dimensions: '800x533',
          url: '/img/users.jpg'
        },
        {
          name: 'writers.jpg',
          path: '/img/writers.jpg',
          type: 'image',
          extension: '.jpg',
          size: '156 KB',
          lastModified: '2024-01-17T11:20:00Z',
          dimensions: '800x600',
          url: '/img/writers.jpg'
        }
      ];

      // Use GraphQL data if available, otherwise use static discovery
      const finalMediaFiles = mediaFiles.length > 0 ? mediaFiles : staticMediaFiles;
      setMediaFiles(finalMediaFiles);
      
      const mediaStats = {
        total: finalMediaFiles.length,
        images: finalMediaFiles.filter(f => f.type === 'image').length,
        totalSize: finalMediaFiles.reduce((acc, file) => {
          const sizeInKB = parseFloat(file.size.replace(' KB', ''));
          return acc + sizeInKB;
        }, 0)
      };

      setMediaData({
        files: finalMediaFiles,
        stats: mediaStats
      });

      // Scan documents for image usage
      await scanDocumentsForImageUsage(finalMediaFiles);

    } catch (err) {
      console.error('Error fetching media files:', err);
      setError('Failed to load media files. Please try again.');
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

  const formatFileSize = (sizeStr) => {
    const sizeNum = parseFloat(sizeStr.replace(' KB', ''));
    if (sizeNum >= 1024) {
      return `${(sizeNum / 1024).toFixed(1)} MB`;
    }
    return sizeStr;
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
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

          {/* Test Controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={testImageUsageQuery}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Test GraphQL Query (Check Console)
            </button>
            <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              Click to test image detection in browser console
            </span>
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
                        alt={file.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #dee2e6'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      {file.extension.toUpperCase()}
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
                      {file.name}
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
                      {file.dimensions && <span>{file.dimensions}</span>}
                      <span>Modified: {formatDate(file.lastModified)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
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
                                  backgroundColor: '#ffc107',
                                  color: '#212529',
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e0a800'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ffc107'}
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
    </div>
  );
};

export default MediaDashboard;