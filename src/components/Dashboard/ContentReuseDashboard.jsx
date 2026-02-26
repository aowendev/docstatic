/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { client } from '../../../tina/__generated__/client';

async function fetchReuseData() {
  // Fetch glossary terms via connection
  const glossaryConn = await client.queries.glossaryTermsConnection({ first: 100 });
  // Fetch variable sets via connection
  const variableSetsConn = await client.queries.variableSetsConnection({ first: 100 });
  // Fetch snippets via connection (if available)
  let snippets = [];
  if (client.queries.snippetsConnection) {
    const snippetsConn = await client.queries.snippetsConnection({ first: 100 });
    snippets = (snippetsConn.data?.snippetsConnection?.edges || []).map(edge => ({
      name: edge.node._sys?.filename,
      path: edge.node._sys?.relativePath,
      description: edge.node.description || ''
    }));
  } else {
    snippets = [
      { name: 'example.mdx', path: 'reuse/snippets/example.mdx', description: 'Snippets Example' }
    ];
  }
  // Fetch code files (simulate as 1 file for now)
  const codeSnippets = [
    { name: 'example.xml', path: 'reuse/code/example.xml' }
  ]; // TODO: query if more

  // Fetch all docs (MDX files)
  const docsResult = await client.queries.docConnection({ first: 1000 });
  const docs = docsResult.data?.docConnection?.edges || [];
  // Extract path and body text for each doc
  const mdxContents = docs.map((edge) => {
    const node = edge.node;
    let content = '';
    if (node.body && typeof node.body === 'object' && node.body.children) {
      // Tina rich-text AST: flatten to string
      content = node.body.children.map((c) => (typeof c.text === 'string' ? c.text : '')).join(' ');
    } else if (typeof node.body === 'string') {
      content = node.body;
    }
    return {
      path: node._sys?.relativePath || node._sys?.filename,
      content: content || ''
    };
  });

  function findUsageInMdxFiles(matchStr) {
    return mdxContents.filter((f) => f.content.includes(matchStr)).map((f) => f.path);
  }

  return {
    codeSnippets: codeSnippets.map((item) => ({
      ...item,
      usedIn: findUsageInMdxFiles(item.name)
    })),
    glossaryTerms: (glossaryConn.data?.glossaryTermsConnection?.edges || []).map((edge) => {
      const item = edge.node.glossaryTerms?.[0] || edge.node;
      return {
        key: item.key,
        definition: item.translations?.[0]?.definition || '',
        usedIn: findUsageInMdxFiles(item.key)
      };
    }),
    snippets: snippets.map((item) => ({
      ...item,
      usedIn: findUsageInMdxFiles(item.name)
    })),
    variableSets: (variableSetsConn.data?.variableSetsConnection?.edges || []).map((edge) => {
      const item = edge.node.variableSets?.[0] || edge.node;
      return {
        name: item.name,
        variables: item.variables?.length || 0,
        usedIn: findUsageInMdxFiles(item.name)
      };
    })
  };
}

const lozengeStyle = (color) => ({
  display: 'inline-block',
  minWidth: 32,
  padding: '6px 12px',
  borderRadius: 16,
  background: color,
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  textAlign: 'center',
  cursor: 'pointer',
  marginRight: 12
});

const detailBoxStyle = {
  background: '#fff',
  border: '1px solid #e1e4e8',
  borderRadius: 6,
  marginTop: 16,
  padding: 16,
  maxWidth: 600
};


const ContentReuseDashboard = () => {
  const [reuseData, setReuseData] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchReuseData()
      .then((data) => {
        setReuseData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load content reuse data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading content reuse data...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  if (!reuseData) return null;

  const lozenges = [
    { label: 'Code Snippets', count: reuseData.codeSnippets.length, color: '#3b82f6', type: 'codeSnippets' },
    { label: 'Glossary Terms', count: reuseData.glossaryTerms.length, color: '#10b981', type: 'glossaryTerms' },
    { label: 'Snippets', count: reuseData.snippets.length, color: '#f59e0b', type: 'snippets' },
    { label: 'Variable Sets', count: reuseData.variableSets.length, color: '#8b5cf6', type: 'variableSets' }
  ];

  const renderDetails = () => {
    switch (detailType) {
      case 'codeSnippets':
        return (
          <div style={detailBoxStyle}>
            <h4>Code Snippets</h4>
            <ul>
              {reuseData.codeSnippets.map((item, i) => (
                <li key={i}>
                  {item.name} <span style={{ color: '#959da5' }}>({item.path})</span>
                  <br />
                  <span style={{ fontSize: 13, color: '#2563eb' }}>Used in:
                    <ul style={{ margin: '4px 0 8px 16px' }}>
                      {item.usedIn.length === 0 ? <li>—</li> : item.usedIn.map((mdx, j) => <li key={j}>{mdx}</li>)}
                    </ul>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'glossaryTerms':
        return (
          <div style={detailBoxStyle}>
            <h4>Glossary Terms</h4>
            <ul>
              {reuseData.glossaryTerms.map((item, i) => (
                <li key={i}>
                  <b>{item.key}</b>: {item.definition}
                  <br />
                  <span style={{ fontSize: 13, color: '#2563eb' }}>Used in:
                    <ul style={{ margin: '4px 0 8px 16px' }}>
                      {item.usedIn.length === 0 ? <li>—</li> : item.usedIn.map((mdx, j) => <li key={j}>{mdx}</li>)}
                    </ul>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'snippets':
        return (
          <div style={detailBoxStyle}>
            <h4>Snippets</h4>
            <ul>
              {reuseData.snippets.map((item, i) => (
                <li key={i}>
                  {item.name} <span style={{ color: '#959da5' }}>({item.path})</span> - {item.description}
                  <br />
                  <span style={{ fontSize: 13, color: '#2563eb' }}>Used in:
                    <ul style={{ margin: '4px 0 8px 16px' }}>
                      {item.usedIn.length === 0 ? <li>—</li> : item.usedIn.map((mdx, j) => <li key={j}>{mdx}</li>)}
                    </ul>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'variableSets':
        return (
          <div style={detailBoxStyle}>
            <h4>Variable Sets</h4>
            <ul>
              {reuseData.variableSets.map((item, i) => (
                <li key={i}>
                  <b>{item.name}</b> ({item.variables} variables)
                  <br />
                  <span style={{ fontSize: 13, color: '#2563eb' }}>Used in:
                    <ul style={{ margin: '4px 0 8px 16px' }}>
                      {item.usedIn.length === 0 ? <li>—</li> : item.usedIn.map((mdx, j) => <li key={j}>{mdx}</li>)}
                    </ul>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, background: '#fafafa', margin: 16 }}>
      <h3 className="font-sans text-2xl text-tina-orange">♻️ Content Reuse</h3>
      <hr style={{ border: 'none', borderTop: '1px solid #e1e4e8', margin: '10px 0 20px 0' }} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {lozenges.map((l) => (
          <div key={l.type} style={lozengeStyle(l.color)} onClick={() => setDetailType(l.type)}>
            {l.count} <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{l.label}</span>
          </div>
        ))}
      </div>
      {detailType && (
        <div>
          <button style={{ marginBottom: 8, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }} onClick={() => setDetailType(null)}>&larr; Back</button>
          {renderDetails()}
        </div>
      )}
    </div>
  );
};

export default ContentReuseDashboard;
