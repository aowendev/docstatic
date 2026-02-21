import React, { useState } from 'react';

const DocumentMutationDashboard = () => {
  const [createTitle, setCreateTitle] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [updateId, setUpdateId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [status, setStatus] = useState('');
  const [documents, setDocuments] = useState([]);

  // Real mutation handlers
  // Use Tina client for GraphQL operations
  const handleListDocuments = async () => {
    setStatus('');
    setDocuments([]);
    try {
      const { client } = await import('../../../tina/__generated__/client');
      const docsResult = await client.queries.docConnection({ sort: 'title', first: 500 });
      const docs = docsResult.data.docConnection.edges || [];
      setDocuments(docs.map(edge => ({ id: edge.node._sys.filename, title: edge.node.title || edge.node._sys.filename })));
      setStatus('Listed documents');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setDocuments([]);
    }
  };

  const handleCreate = async () => {
    setStatus('');
    try {
      const { client } = await import('../../../tina/__generated__/client');
      const mutation = `
        mutation CreateDocument($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
          createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
            ... on Doc {
              id
              title
            }
          }
        }
      `;
        const variables = {
          collection: 'doc',
          relativePath: `${createTitle.replace(/\s+/g, '-')}.mdx`,
          params: { docs: { title: createTitle } }
      };
      const result = await client.request({ query: mutation, variables });
      setStatus(`Created document: ${result.data.createDocument.title}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
    setCreateTitle('');
  };

  const handleDelete = async () => {
    setStatus('');
    try {
      const { client } = await import('../../../tina/__generated__/client');
      const mutation = `
        mutation DeleteDocument($collection: String!, $relativePath: String!) {
          deleteDocument(collection: $collection, relativePath: $relativePath) {
            ... on Doc {
              id
            }
          }
        }
      `;
      const variables = {
        collection: 'doc',
        relativePath: `${deleteId}.mdx`
      };
      await client.request({ query: mutation, variables });
      setStatus(`Deleted document ID: ${deleteId}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
    setDeleteId('');
  };

  const handleUpdate = async () => {
    setStatus('');
    try {
      const { client } = await import('../../../tina/__generated__/client');
      const mutation = `
        mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
          updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
            ... on Doc {
              id
              title
            }
          }
        }
      `;
        const variables = {
          collection: 'doc',
          relativePath: `${updateId}.mdx`,
          params: { doc: { title: updateTitle } }
        };
      await client.request({ query: mutation, variables });
      setStatus(`Updated document ID: ${updateId} with title: ${updateTitle}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
    setUpdateId('');
    setUpdateTitle('');
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
      <h2>Document Mutation Dashboard</h2>
      <div style={{ marginBottom: '1rem' }}>
        <h4>Create Document</h4>
        <input
          type="text"
          placeholder="Title"
          value={createTitle}
          onChange={e => setCreateTitle(e.target.value)}
        />
        <button onClick={handleCreate} disabled={!createTitle}>Create</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h4>Delete Document</h4>
        <input
          type="text"
          placeholder="Document ID"
          value={deleteId}
          onChange={e => setDeleteId(e.target.value)}
        />
        <button onClick={handleDelete} disabled={!deleteId}>Delete</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h4>Update Document</h4>
        <input
          type="text"
          placeholder="Document ID"
          value={updateId}
          onChange={e => setUpdateId(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Title"
          value={updateTitle}
          onChange={e => setUpdateTitle(e.target.value)}
        />
        <button onClick={handleUpdate} disabled={!updateId || !updateTitle}>Update</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h4>List Documents</h4>
        <button onClick={handleListDocuments}>List Documents</button>
        {documents.length > 0 && (
          <ul style={{ marginTop: '1rem' }}>
            {documents.map(doc => (
              <li key={doc.id}>{doc.title} <span style={{ color: '#888' }}>({doc.id})</span></li>
            ))}
          </ul>
        )}
      </div>
      {status && <div style={{ color: 'green', marginTop: '1rem' }}>{status}</div>}
    </div>
  );
};

export default DocumentMutationDashboard;
