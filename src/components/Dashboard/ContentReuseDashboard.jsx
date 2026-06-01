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
  const docBodies = docs.map((edge) => ({
    path: edge.node._sys?.relativePath || edge.node._sys?.filename,
    body: edge.node.body || null
  }));

  // Search the AST for a specific component + prop combination rather than doing
  // free-text search. Free-text matching causes false positives when, for example,
  // a glossary term key ("single-sourcing") is a substring of a variable set's
  // variableSelection prop ("writing-terms_single-sourcing").
  function bodyContainsComponent(node, componentName, propName, matchFn) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(n => bodyContainsComponent(n, componentName, propName, matchFn));
    if (node.name === componentName && node.props) {
      const val = node.props[propName];
      if (matchFn(val)) return true;
    }
    if (Array.isArray(node.children)) {
      return node.children.some(child => bodyContainsComponent(child, componentName, propName, matchFn));
    }
    return false;
  }

  function findComponentUsage(componentName, propName, matchFn) {
    return docBodies
      .filter(({ body }) => bodyContainsComponent(body, componentName, propName, matchFn))
      .map(({ path }) => path);
  }

  return {
    codeSnippets: codeSnippets.map((item) => ({
      ...item,
      usedIn: findComponentUsage('CodeSnippet', 'filepath', (val) => typeof val === 'string' && val.includes(item.name))
    })),
    glossaryTerms: (glossaryConn.data?.glossaryTermsConnection?.edges || []).map((edge) => {
      const item = edge.node.glossaryTerms?.[0] || edge.node;
      return {
        key: item.key,
        definition: item.translations?.[0]?.definition || '',
        // Exact match on termKey — avoids substring collisions with variable set names
        usedIn: findComponentUsage('GlossaryTerm', 'termKey', (val) => val === item.key)
      };
    }),
    snippets: snippets.map((item) => ({
      ...item,
      usedIn: findComponentUsage('Snippet', 'filepath', (val) => typeof val === 'string' && val.includes(item.name))
    })),
    variableSets: (variableSetsConn.data?.variableSetsConnection?.edges || []).map((edge) => {
      const item = edge.node.variableSets?.[0] || edge.node;
      return {
        name: item.name,
        variables: item.variables?.length || 0,
        // variableSelection is "setName_varKey" — match any usage of this set
        usedIn: findComponentUsage('VariableSet', 'variableSelection', (val) => typeof val === 'string' && (val === item.name || val.startsWith(item.name + '_')))
      };
    })
  };
}

const getEditUrl = (relativePath) => {
  const clean = relativePath.replace(/\.(mdx?|md)$/, '');
  return `/admin/index.html#/collections/edit/doc/${clean}`;
};

const CATEGORIES = [
  {
    type: 'codeSnippets',
    label: 'Code Snippets',
    color: '#3b82f6',
    bgClass: 'bg-blue-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    sectionIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    )
  },
  {
    type: 'glossaryTerms',
    label: 'Glossary Terms',
    color: '#10b981',
    bgClass: 'bg-green-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
      </svg>
    ),
    sectionIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
      </svg>
    )
  },
  {
    type: 'snippets',
    label: 'Snippets',
    color: '#f59e0b',
    bgClass: 'bg-orange-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <path d="M12 11h4"></path>
        <path d="M12 16h4"></path>
        <path d="M8 11h.01"></path>
        <path d="M8 16h.01"></path>
      </svg>
    ),
    sectionIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      </svg>
    )
  },
  {
    type: 'variableSets',
    label: 'Variable Sets',
    color: '#8b5cf6',
    bgClass: 'bg-purple-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
        <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path>
      </svg>
    ),
    sectionIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
        <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path>
      </svg>
    )
  }
];

const ContentReuseDashboard = () => {
  const [reuseData, setReuseData] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchReuseData()
      .then((data) => {
        setReuseData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load content reuse data');
        setLoading(false);
      });
  };

  const headerButtons = (label) => (
    <button
      onClick={loadData}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', borderRadius: '6px',
        border: '1px solid #d1d5db', backgroundColor: '#ffffff',
        color: '#374151', cursor: 'pointer', fontSize: '14px',
        fontWeight: '500', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1f2937'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#374151'; }}
      disabled={loading}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M8 16H3v5"></path>
      </svg>
      {label}
    </button>
  );

  const dashboardHeader = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="text-3xl text-tina-orange">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
          </svg>
        </span>
        <h2 className="m-0 text-2xl font-bold text-gray-800">Content Reuse Dashboard</h2>
      </div>
      {headerButtons(loading ? 'Loading...' : reuseData ? 'Refresh' : 'Load')}
    </div>
  );

  if (!reuseData && !loading && !error) {
    return (
      <div style={{ padding: '24px', borderBottom: '2px solid #d1d9e0', marginBottom: '32px' }}>
        {dashboardHeader}
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
          <div className="font-bold text-gray-800 text-xl mb-2">Loading Dashboard</div>
          <div className="font-medium text-gray-600 text-base mb-4">Loading content reuse data...</div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
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
      <div style={{ padding: '24px', borderBottom: '2px solid #d1d9e0', marginBottom: '32px' }}>
        <div style={{
          padding: '12px',
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '6px',
          color: '#c53030',
          fontSize: '14px'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const activeCategory = CATEGORIES.find((c) => c.type === detailType);

  const renderDetailRows = () => {
    if (!detailType || !reuseData[detailType]) return null;
    const items = reuseData[detailType];

    return items.map((item, i) => {
      const name = item.key || item.name;
      const subtitle = item.definition || item.description || item.path || '';
      const usedIn = item.usedIn || [];
      const isLast = i === items.length - 1;

      return (
        <div key={i} style={{
          padding: '12px 16px',
          borderBottom: isLast ? 'none' : '1px solid #f6f8fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#24292e', marginBottom: '2px' }}>
                {name}
                {item.variables != null && (
                  <span style={{ fontSize: '12px', color: '#586069', fontWeight: 400, marginLeft: '8px' }}>
                    {item.variables} variable{item.variables !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {subtitle && (
                <div style={{ fontSize: '12px', color: '#586069', marginBottom: '4px' }}>
                  {subtitle.length > 120 ? subtitle.substring(0, 120) + '…' : subtitle}
                </div>
              )}
              {usedIn.length > 0 && (
                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {usedIn.map((path, j) => (
                    <a
                      key={j}
                      href={getEditUrl(path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        backgroundColor: '#f6f8fa',
                        border: '1px solid #d1d9e0',
                        borderRadius: '3px',
                        color: '#0969da',
                        textDecoration: 'none'
                      }}
                    >
                      {path}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <span style={{
              flexShrink: 0,
              marginLeft: '12px',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              color: activeCategory.color,
              backgroundColor: `${activeCategory.color}20`,
              fontWeight: '500'
            }}>
              Used in {usedIn.length} topic{usedIn.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ padding: '24px', borderBottom: '2px solid #d1d9e0', marginBottom: '32px' }}>
      {dashboardHeader}

      {/* Section header */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        </svg>
        Reusable Content
      </h3>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CATEGORIES.map((cat) => {
          const count = reuseData[cat.type]?.length ?? 0;
          return (
            <div
              key={cat.type}
              onClick={() => setDetailType(detailType === cat.type ? null : cat.type)}
              className={`bg-white rounded-xl border shadow-sm flex items-center gap-4 p-6 transition-all duration-200 ${
                detailType === cat.type
                  ? 'border-gray-400 shadow-md cursor-pointer'
                  : count > 0
                  ? 'border-gray-200 cursor-pointer hover:shadow-md'
                  : 'border-gray-200 cursor-default opacity-60'
              }`}
            >
              <div className={`${cat.bgClass} p-3 rounded-lg flex-shrink-0`}>
                <div style={{ color: cat.color }}>{cat.icon}</div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">{cat.label}</p>
                <p className="text-3xl font-bold" style={{ color: cat.color }}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {detailType && activeCategory && (
        <div style={{ background: 'white', border: '1px solid #e1e4e8', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #e1e4e8',
            backgroundColor: '#f6f8fa'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: activeCategory.color }}>{activeCategory.sectionIcon}</span>
              {activeCategory.label} ({reuseData[detailType]?.length ?? 0})
            </h4>
            <button
              onClick={() => setDetailType(null)}
              style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#586069', padding: '4px' }}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {(reuseData[detailType]?.length ?? 0) === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#586069' }}>
                No {activeCategory.label.toLowerCase()} found
              </div>
            ) : (
              renderDetailRows()
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ContentReuseDashboard;
