/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { client } from '../../../tina/__generated__/client';

// --- AST utilities ---

function extractPlainText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node)) return node.map(extractPlainText).filter(Boolean).join(' ');
  if (Array.isArray(node.children)) return node.children.map(extractPlainText).filter(Boolean).join(' ');
  return '';
}

function extractInlineCode(node, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (Array.isArray(node)) { node.forEach(n => extractInlineCode(n, results)); return results; }
  if (node.name === 'CodeSnippet') return results; // already a proper snippet
  if (node.code === true && typeof node.text === 'string' && node.text.trim().length > 1) {
    results.push(node.text.trim());
  }
  if ((node.type === 'code_block' || node.type === 'code') && typeof node.value === 'string' && node.value.trim()) {
    results.push(node.value.trim());
  }
  if (Array.isArray(node.children)) node.children.forEach(c => extractInlineCode(c, results));
  return results;
}

function extractParagraphTexts(node, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (Array.isArray(node)) { node.forEach(n => extractParagraphTexts(n, results)); return results; }
  if (node.type === 'p' || node.type === 'paragraph') {
    const text = extractPlainText(node).trim();
    if (text.length >= 60) results.push(text);
  } else if (Array.isArray(node.children)) {
    node.children.forEach(c => extractParagraphTexts(c, results));
  }
  return results;
}

function computeSuggestions(docBodies, glossaryTermsData, variableSetsData) {
  // 1. Inline code blocks that could be snippets
  const codeValueMap = {};
  for (const { path, body } of docBodies) {
    if (!body) continue;
    for (const code of extractInlineCode(body)) {
      if (!codeValueMap[code]) codeValueMap[code] = [];
      if (!codeValueMap[code].includes(path)) codeValueMap[code].push(path);
    }
  }
  const codeSnippets = Object.entries(codeValueMap)
    .map(([value, paths]) => ({ value, paths }))
    .filter(s => s.value.length > 2)
    .sort((a, b) => b.paths.length - a.paths.length);

  // 2. Glossary terms appearing as plain text (not via GlossaryTerm component)
  const termText = [];
  for (const term of glossaryTermsData) {
    if (!term.termText) continue;
    const plainPaths = [];
    for (const { path, body } of docBodies) {
      if (!body || term.usedIn.includes(path)) continue;
      if (extractPlainText(body).toLowerCase().includes(term.termText.toLowerCase())) plainPaths.push(path);
    }
    if (plainPaths.length > 0) termText.push({ key: term.key, termText: term.termText, paths: plainPaths });
  }

  // 3. Text blocks appearing in 2+ docs that could be snippets
  const paraMap = {};
  for (const { path, body } of docBodies) {
    if (!body) continue;
    for (const para of extractParagraphTexts(body)) {
      const normalized = para.trim().toLowerCase().replace(/\s+/g, ' ');
      if (!paraMap[normalized]) paraMap[normalized] = { original: para, paths: [] };
      if (!paraMap[normalized].paths.includes(path)) paraMap[normalized].paths.push(path);
    }
  }
  const duplicateText = Object.values(paraMap)
    .filter(({ paths }) => paths.length >= 2)
    .sort((a, b) => b.paths.length - a.paths.length);

  // 4. Variable values appearing as plain text (not via VariableSet component)
  const variables = [];
  for (const vs of variableSetsData) {
    for (const variable of (vs.variableItems || [])) {
      for (const translation of (variable.translations || [])) {
        if (translation.lang !== 'en' || !translation.value || translation.value.length < 3) continue;
        const value = translation.value;
        const plainPaths = [];
        for (const { path, body } of docBodies) {
          if (!body) continue;
          if (extractPlainText(body).includes(value)) plainPaths.push(path);
        }
        if (plainPaths.length > 0) variables.push({ setName: vs.name, key: variable.key, value, paths: plainPaths });
      }
    }
  }

  return { codeSnippets, termText, duplicateText, variables };
}

// --- Data fetching ---

async function fetchReuseData() {
  const glossaryConn = await client.queries.glossaryTermsConnection({ first: 100 });
  const variableSetsConn = await client.queries.variableSetsConnection({ first: 100 });

  let snippets = [];
  if (client.queries.snippetsConnection) {
    const snippetsConn = await client.queries.snippetsConnection({ first: 100 });
    snippets = (snippetsConn.data?.snippetsConnection?.edges || []).map(edge => ({
      name: edge.node._sys?.filename,
      path: edge.node._sys?.relativePath,
      description: edge.node.description || ''
    }));
  } else {
    snippets = [{ name: 'example.mdx', path: 'reuse/snippets/example.mdx', description: 'Snippets Example' }];
  }

  const codeSnippets = [{ name: 'example.xml', path: 'reuse/code/example.xml' }];

  const docsResult = await client.queries.docConnection({ first: 1000 });
  const docs = docsResult.data?.docConnection?.edges || [];
  const docBodies = docs.map((edge) => ({
    path: edge.node._sys?.relativePath || edge.node._sys?.filename,
    body: edge.node.body || null
  }));

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

  const glossaryTermsData = (glossaryConn.data?.glossaryTermsConnection?.edges || []).map((edge) => {
    const item = edge.node.glossaryTerms?.[0] || edge.node;
    return {
      key: item.key,
      termText: item.translations?.find(t => t.lang === 'en')?.term || item.key,
      definition: item.translations?.[0]?.definition || '',
      usedIn: findComponentUsage('GlossaryTerm', 'termKey', (val) => val === item.key)
    };
  });

  const variableSetsData = (variableSetsConn.data?.variableSetsConnection?.edges || []).map((edge) => {
    const item = edge.node.variableSets?.[0] || edge.node;
    return {
      name: item.name,
      variables: item.variables?.length || 0,
      variableItems: item.variables || [],
      usedIn: findComponentUsage('VariableSet', 'variableSelection', (val) => typeof val === 'string' && (val === item.name || val.startsWith(item.name + '_')))
    };
  });

  const suggestions = computeSuggestions(docBodies, glossaryTermsData, variableSetsData);

  return {
    codeSnippets: codeSnippets.map((item) => ({
      ...item,
      usedIn: findComponentUsage('CodeSnippet', 'filepath', (val) => typeof val === 'string' && val.includes(item.name))
    })),
    glossaryTerms: glossaryTermsData,
    snippets: snippets.map((item) => ({
      ...item,
      usedIn: findComponentUsage('Snippet', 'filepath', (val) => typeof val === 'string' && val.includes(item.name))
    })),
    variableSets: variableSetsData,
    suggestions
  };
}

// --- UI helpers ---

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

const SUGGESTION_CATEGORIES = [
  {
    type: 'codeSnippets',
    label: 'Possible Snippets',
    description: 'Inline code blocks that could become snippets',
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
    type: 'termText',
    label: 'Possible Terms',
    description: 'Plain text glossary terms',
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
    type: 'duplicateText',
    label: 'Possible Snippets',
    description: 'Text blocks appearing in two or more topics',
    color: '#f59e0b',
    bgClass: 'bg-orange-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </svg>
    ),
    sectionIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </svg>
    )
  },
  {
    type: 'variables',
    label: 'Possible Variables',
    description: 'Plain text variable values',
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

// --- Component ---

const ContentReuseDashboard = () => {
  const [reuseData, setReuseData] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [suggestionDetailType, setSuggestionDetailType] = useState(null);
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
  const activeSuggestionCategory = SUGGESTION_CATEGORIES.find((c) => c.type === suggestionDetailType);

  const pathChips = (paths) => (
    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {paths.map((path, j) => (
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
  );

  const renderDetailRows = () => {
    if (!detailType || !reuseData[detailType]) return null;
    const items = reuseData[detailType];

    return items.map((item, i) => {
      const name = item.key || item.name;
      const subtitle = item.definition || item.description || item.path || '';
      const usedIn = item.usedIn || [];
      const isLast = i === items.length - 1;

      return (
        <div key={i} style={{ padding: '12px 16px', borderBottom: isLast ? 'none' : '1px solid #f6f8fa' }}>
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
              {usedIn.length > 0 && pathChips(usedIn)}
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

  const renderSuggestionRows = () => {
    if (!suggestionDetailType || !reuseData.suggestions[suggestionDetailType]) return null;
    const items = reuseData.suggestions[suggestionDetailType];
    const cat = activeSuggestionCategory;

    return items.map((item, i) => {
      const isLast = i === items.length - 1;
      let label, subtitle, paths;

      if (suggestionDetailType === 'codeSnippets') {
        label = item.value.length > 80 ? item.value.substring(0, 80) + '…' : item.value;
        subtitle = 'Inline code block';
        paths = item.paths;
      } else if (suggestionDetailType === 'termText') {
        label = item.termText;
        subtitle = `Key: ${item.key}`;
        paths = item.paths;
      } else if (suggestionDetailType === 'duplicateText') {
        label = item.original.length > 100 ? item.original.substring(0, 100) + '…' : item.original;
        subtitle = null;
        paths = item.paths;
      } else if (suggestionDetailType === 'variables') {
        label = item.value;
        subtitle = `${item.setName} › ${item.key}`;
        paths = item.paths;
      }

      return (
        <div key={i} style={{ padding: '12px 16px', borderBottom: isLast ? 'none' : '1px solid #f6f8fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#24292e', marginBottom: '2px', fontFamily: suggestionDetailType === 'codeSnippets' ? 'monospace' : undefined }}>
                {label}
              </div>
              {subtitle && (
                <div style={{ fontSize: '12px', color: '#586069', marginBottom: '4px' }}>{subtitle}</div>
              )}
              {paths.length > 0 && pathChips(paths)}
            </div>
            <span style={{
              flexShrink: 0,
              marginLeft: '12px',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              color: cat.color,
              backgroundColor: `${cat.color}20`,
              fontWeight: '500'
            }}>
              {paths.length} topic{paths.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    });
  };

  const renderDetailPanel = (type, items, category, onClose, emptyLabel) => (
    <div style={{ background: 'white', border: '1px solid #e1e4e8', borderRadius: '6px', overflow: 'hidden', marginTop: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e1e4e8',
        backgroundColor: '#f6f8fa'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: category.color }}>{category.sectionIcon}</span>
          {category.label} ({items?.length ?? 0})
        </h4>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#586069', padding: '4px' }}
          title="Close"
        >
          ✕
        </button>
      </div>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {(items?.length ?? 0) === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#586069' }}>No {emptyLabel} found</div>
        ) : (
          type === 'suggestion' ? renderSuggestionRows() : renderDetailRows()
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', borderBottom: '2px solid #d1d9e0', marginBottom: '32px' }}>
      {dashboardHeader}

      {/* Reusable Content section */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        </svg>
        Reusable Content
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CATEGORIES.map((cat) => {
          const count = reuseData[cat.type]?.length ?? 0;
          return (
            <div
              key={cat.type}
              onClick={() => { setDetailType(detailType === cat.type ? null : cat.type); setSuggestionDetailType(null); }}
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

      {detailType && activeCategory && renderDetailPanel(
        'reuse',
        reuseData[detailType],
        activeCategory,
        () => setDetailType(null),
        activeCategory.label.toLowerCase()
      )}

      {/* Suggestions section */}
      <h3 style={{ margin: '24px 0 4px 0', fontSize: '16px', color: '#24292e', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        Suggestions
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#586069' }}>
        Content that could be converted to reusable components.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {SUGGESTION_CATEGORIES.map((cat) => {
          const count = reuseData.suggestions[cat.type]?.length ?? 0;
          return (
            <div
              key={cat.type}
              onClick={() => { setSuggestionDetailType(suggestionDetailType === cat.type ? null : cat.type); setDetailType(null); }}
              className={`bg-white rounded-xl border shadow-sm flex items-center gap-4 p-6 transition-all duration-200 ${
                suggestionDetailType === cat.type
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
                <p className="text-xs text-gray-400 mt-1" style={{ lineHeight: '1.3' }}>{cat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {suggestionDetailType && activeSuggestionCategory && renderDetailPanel(
        'suggestion',
        reuseData.suggestions[suggestionDetailType],
        activeSuggestionCategory,
        () => setSuggestionDetailType(null),
        activeSuggestionCategory.label.toLowerCase()
      )}

    </div>
  );
};

export default ContentReuseDashboard;
