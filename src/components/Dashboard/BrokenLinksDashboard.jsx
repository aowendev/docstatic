import React, { useState, useEffect } from 'react';

const BrokenLinksDashboard = () => {
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to extract links from MDX content
  const extractLinksFromContent = (content, filePath) => {
    const links = [];
    
    // Regex for markdown links [text](url)
    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    // Regex for HTML links <a href="url">
    const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    // Regex for reference links [text][ref] and [ref]: url
    const refLinkRegex = /\[([^\]]+)\]\[([^\]]*)\]/g;
    const refDefRegex = /^\[([^\]]+)\]:\s*(.+)$/gm;
    
    let match;
    
    // Extract markdown links
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2].trim(),
        type: 'markdown',
        filePath,
        lineNumber: content.substring(0, match.index).split('\n').length
      });
    }
    
    // Extract HTML links
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      links.push({
        text: match[0],
        url: match[1].trim(),
        type: 'html',
        filePath,
        lineNumber: content.substring(0, match.index).split('\n').length
      });
    }
    
    // Extract reference definitions
    const refDefs = {};
    while ((match = refDefRegex.exec(content)) !== null) {
      refDefs[match[1].toLowerCase()] = match[2].trim();
    }
    
    // Extract reference links
    while ((match = refLinkRegex.exec(content)) !== null) {
      const refKey = (match[2] || match[1]).toLowerCase();
      if (refDefs[refKey]) {
        links.push({
          text: match[1],
          url: refDefs[refKey],
          type: 'reference',
          filePath,
          lineNumber: content.substring(0, match.index).split('\n').length
        });
      }
    }
    
    return links;
  };

  // Function to validate a single link
  const validateLink = async (link) => {
    try {
      const url = link.url.trim();
      
      // Skip anchors, mailto, and tel links
      if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return { ...link, status: 'skipped', reason: 'Not validated (anchor/mailto/tel)' };
      }
      
      // Handle relative/internal links
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Check if it's a relative link to another doc
        if (url.endsWith('.mdx') || url.endsWith('.md')) {
          return { ...link, status: 'valid', reason: 'Internal doc link (assumed valid)' };
        }
        return { ...link, status: 'valid', reason: 'Internal link (assumed valid)' };
      }
      
      // Validate external links with timeout - use original no-cors approach first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // Primary approach: Use no-cors mode (original working method)
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; docStatic Link Checker/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        // With no-cors mode, if no error is thrown, assume link is reachable
        return { ...link, status: 'valid', reason: 'Link is reachable' };
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return { ...link, status: 'broken', reason: 'Timeout (>8s)' };
        }
        
        // Fallback: Check if this might be a CORS/CORP issue for known problematic domains
        const urlObj = new URL(url);
        const knownCorsDomains = [
          'docs.github.com',
          'support.microsoft.com',
          'docs.microsoft.com',
          'developer.mozilla.org'
        ];
        
        const isKnownCorsDomain = knownCorsDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        
        if (isKnownCorsDomain) {
          return { 
            ...link, 
            status: 'warning', 
            reason: 'CORS/CORP policy prevents validation - manual check required' 
          };
        }
        
        // For other errors, use original logic
        if (fetchError.message.includes('network') || fetchError.message.includes('fetch')) {
          return { ...link, status: 'broken', reason: 'Network error or unreachable' };
        }
        
        // For other errors, assume CORS restrictions but link might be valid
        return { ...link, status: 'warning', reason: 'CORS restricted (unable to verify)' };
      }
    } catch (error) {
      return { ...link, status: 'broken', reason: error.message };
    }
  };

  // Function to open file in CMS editor
  const openInCMS = (filePath) => {
    // Extract relative path from full path
    const relativePath = filePath.replace(/^\/docs\//, '').replace(/\.mdx?$/i, '');
    const cmsUrl = `/admin/index.html#/collections/edit/doc/${encodeURIComponent(relativePath)}`;
    window.open(cmsUrl, '_blank');
  };

  // Function to scan docs directory for MDX files using GraphQL
  const scanDocsForLinks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Import the Tina client
      const { client } = await import('../../../tina/__generated__/client');
      
      // Fetch all docs from the main collection
      const docsResult = await client.queries.docConnection({
        sort: 'title'
      });
      
      const docs = docsResult.data.docConnection.edges || [];
      
      const allLinks = [];
      const fileStats = {};
      
      // Process each document
      for (const edge of docs) {
        const node = edge.node;
        const fileName = `${node._sys.filename}.mdx`;
        const filePath = `/docs/${node._sys.relativePath}`;
        
        // Get the document body content
        let content = '';
        if (node.body) {
          // Extract text content from rich text blocks
          content = extractTextFromBody(node.body);
        }
        
        // Add title content if available
        if (node.title) {
          content = `# ${node.title}\n\n${content}`;
        }
        
        const links = extractLinksFromContent(content, filePath);
        
        fileStats[filePath] = {
          totalLinks: links.length,
          fileName: fileName,
          title: node.title || node._sys.filename,
          relativePath: node._sys.relativePath
        };
        
        allLinks.push(...links);
      }
      
      // Validate all links
      const validatedLinks = [];
      for (const link of allLinks) {
        const validatedLink = await validateLink(link);
        validatedLinks.push(validatedLink);
      }
      
      // Calculate statistics
      const stats = validatedLinks.reduce((acc, link) => {
        acc.total++;
        if (link.status === 'valid') acc.valid++;
        else if (link.status === 'broken') acc.broken++;
        else if (link.status === 'warning') acc.warning++;
        else if (link.status === 'skipped') acc.skipped++;
        return acc;
      }, { total: 0, valid: 0, broken: 0, warning: 0, skipped: 0 });
      
      // Group by file
      const linksByFile = {};
      validatedLinks.forEach(link => {
        const fileName = link.filePath.split('/').pop();
        if (!linksByFile[fileName]) {
          linksByFile[fileName] = [];
        }
        linksByFile[fileName].push(link);
      });
      
      setLinkData({
        stats,
        fileStats,
        linksByFile,
        allLinks: validatedLinks,
        brokenLinks: validatedLinks.filter(link => link.status === 'broken'),
        warningLinks: validatedLinks.filter(link => link.status === 'warning'),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setError(error.message);
      console.error('Error scanning for broken links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract text content from Tina CMS rich text body
  const extractTextFromBody = (body) => {
    if (!body || !body.children) return '';
    
    const extractFromChildren = (children) => {
      return children.map(child => {
        if (child.type === 'text') {
          return child.text || '';
        }
        if (child.type === 'a' && child.url) {
          const text = child.children ? extractFromChildren(child.children) : '';
          return `[${text}](${child.url})`;
        }
        if (child.children) {
          return extractFromChildren(child.children);
        }
        return '';
      }).join('');
    };
    
    return extractFromChildren(body.children);
  };

  useEffect(() => {
    scanDocsForLinks();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: '16px', 
          color: '#666',
          marginBottom: '10px'
        }}>
          Scanning docs for links and validating...
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0066cc',
            animation: 'loading 2s infinite'
          }}></div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#d73a49' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          ⚠️ Error
        </div>
        <div>{error}</div>
        <button 
          onClick={scanDocsForLinks}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#0066cc',
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

  if (!linkData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No data available
      </div>
    );
  }

  const { stats, fileStats, linksByFile, brokenLinks, warningLinks } = linkData;
  const problemLinks = [...(brokenLinks || []), ...(warningLinks || [])];

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      margin: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '10px'
      }}>
        <h3 class="font-sans text-2xl text-tina-orange">
          🔗 Broken Links
        </h3>
        <button 
          onClick={scanDocsForLinks}
          style={{
            padding: '5px 10px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#0366d6' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            Total Links
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745' }}>
            {stats.valid}
          </div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            Valid Links
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#d73a49' }}>
            {stats.broken}
          </div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            Broken Links
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#fb8500' }}>
            {stats.warning || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            Warning Links
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#6f42c1' }}>
            {Object.keys(fileStats).length}
          </div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            Files Scanned
          </div>
        </div>
      </div>

      {/* Broken Links Section */}
      {problemLinks.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#d73a49',
            marginBottom: '15px'
          }}>
            🚨 Problem Links ({problemLinks.length})
          </h3>
          <div style={{
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {problemLinks.map((link, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < problemLinks.length - 1 ? '1px solid #d0d7de' : 'none',
                  backgroundColor: link.status === 'broken' ? '#fff5f5' : '#fff8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '4px',
                    color: '#24292e'
                  }}>
                    {link.status === 'broken' ? '🚫' : '⚠️'} {link.text || 'No text'}
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    marginBottom: '4px'
                  }}>
                    {link.url.startsWith('http://') || link.url.startsWith('https://') ? (
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: link.status === 'broken' ? '#d73a49' : '#fb8500',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'none'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'underline'}
                      >
                        {link.url}
                      </a>
                    ) : (
                      <span style={{ 
                        color: link.status === 'broken' ? '#d73a49' : '#fb8500'
                      }}>
                        {link.url}
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '11px',
                    color: '#656d76'
                  }}>
                    {link.filePath.split('/').pop()} (line {link.lineNumber}) - {link.reason}
                  </div>
                </div>
                <button 
                  onClick={() => openInCMS(link.filePath)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0366d6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '12px',
                    flexShrink: 0
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files with Broken Links */}
      {(() => {
        const filesWithProblemLinks = Object.entries(fileStats).filter(([filePath, stats]) => {
          const fileName = stats.fileName;
          const fileLinks = linksByFile[fileName] || [];
          return fileLinks.some(link => link.status === 'broken' || link.status === 'warning');
        });

        if (filesWithProblemLinks.length === 0) {
          return null;
        }

        return (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#24292e',
                margin: 0
              }}>
                📄 Files with Problem Links ({filesWithProblemLinks.length})
              </h3>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: '#0366d6',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <div style={{
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              {filesWithProblemLinks.slice(0, showDetails ? undefined : 5).map(([filePath, stats], index) => {
                const fileName = stats.fileName;
                const fileLinks = linksByFile[fileName] || [];
                const brokenCount = fileLinks.filter(link => link.status === 'broken').length;
                const warningCount = fileLinks.filter(link => link.status === 'warning').length;
                const totalProblems = brokenCount + warningCount;
                
                return (
                  <div 
                    key={filePath}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < filesWithProblemLinks.length - 1 ? '1px solid #d0d7de' : 'none',
                      backgroundColor: brokenCount > 0 ? '#fff5f5' : '#fff8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#24292e',
                        marginBottom: '2px'
                      }}>
                        {stats.title || fileName}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#656d76'
                      }}>
                        {stats.totalLinks} total links • {totalProblems} problem{totalProblems !== 1 ? 's' : ''}
                        {brokenCount > 0 && (
                          <span style={{ color: '#d73a49', marginLeft: '4px' }}>
                            ({brokenCount} broken{warningCount > 0 ? `, ${warningCount} warning` : ''})
                          </span>
                        )}
                        {brokenCount === 0 && warningCount > 0 && (
                          <span style={{ color: '#fb8500', marginLeft: '4px' }}>
                            ({warningCount} warning)
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => openInCMS(filePath)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0366d6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginLeft: '12px',
                        flexShrink: 0
                      }}
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>

            {!showDetails && filesWithProblemLinks.length > 5 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '10px',
                fontSize: '12px',
                color: '#656d76'
              }}>
                And {filesWithProblemLinks.length - 5} more files...
              </div>
            )}
          </div>
        );
      })()}

      {/* Health Status */}
      <div style={{
        padding: '15px',
        backgroundColor: (stats.broken === 0 && (stats.warning || 0) === 0) ? '#f6f8fa' : 
                         (stats.broken === 0) ? '#fff8f0' : '#fff5f5',
        border: `1px solid ${(stats.broken === 0 && (stats.warning || 0) === 0) ? '#28a745' : 
                             (stats.broken === 0) ? '#fb8500' : '#d73a49'}`,
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '16px',
          fontWeight: '600',
          color: (stats.broken === 0 && (stats.warning || 0) === 0) ? '#28a745' : 
                 (stats.broken === 0) ? '#fb8500' : '#d73a49',
          marginBottom: '5px'
        }}>
          {(stats.broken === 0 && (stats.warning || 0) === 0) ? '✅ All Links Valid!' : 
           stats.broken === 0 ? `⚠️ ${stats.warning} Warning Links` : 
           `❌ ${stats.broken} Broken Links${(stats.warning || 0) > 0 ? ` and ${stats.warning} Warnings` : ''}`}
        </div>
        <div style={{ 
          fontSize: '12px',
          color: '#656d76'
        }}>
          Link validation completed on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default BrokenLinksDashboard;