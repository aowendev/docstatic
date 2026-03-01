#!/usr/bin/env node

/**
 * Test script for the docStatic MCP Server
 * This script verifies the server can connect to GraphQL and retrieve documents
 */

const GRAPHQL_URL = 'http://localhost:4001/graphql';

async function testGraphQLConnection() {
  console.log('🔍 Testing GraphQL connection...');
  
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __typename }'
      }),
    });

    if (response.ok) {
      console.log('✅ GraphQL server is running');
      return true;
    } else {
      console.log(`❌ GraphQL server responded with ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to GraphQL server');
    console.log('   Make sure to run "npm run dev" in the main directory');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDocumentQuery() {
  console.log('📄 Testing document query...');
  
  try {
    const query = `
      query TestDocuments {
        docConnection(first: 5, sort: "title") {
          edges {
            node {
              _sys {
                relativePath
                filename
              }
              title
              lastmod
            }
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.log('❌ GraphQL query failed:');
      console.log(JSON.stringify(result.errors, null, 2));
      return false;
    }

    const documents = result.data.docConnection.edges;
    console.log(`✅ Found ${documents.length} documents`);
    
    documents.forEach(({ node }) => {
      console.log(`   - ${node.title} (${node._sys.relativePath})`);
    });

    return true;
  } catch (error) {
    console.log('❌ Document query failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing docStatic MCP Server prerequisites...\n');
  
  const graphqlOk = await testGraphQLConnection();
  console.log();
  
  if (!graphqlOk) {
    console.log('🛑 Cannot proceed - GraphQL server is not available');
    console.log('\n📝 To fix this:');
    console.log('   1. Run "npm run dev" in the main docstatic directory');
    console.log('   2. Wait for "TinaCMS is running" message');
    console.log('   3. Then run "npm run mcp:start" to start the MCP server');
    process.exit(1);
  }

  const documentsOk = await testDocumentQuery();
  console.log();

  if (documentsOk) {
    console.log('🎉 All tests passed! MCP server should work correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Build the MCP server: npm run mcp:build');
    console.log('   2. Start the MCP server: npm run mcp:start');
    console.log('   3. Configure your AI assistant to use the MCP server');
  } else {
    console.log('⚠️  Document query failed - check TinaCMS configuration');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

runTests().catch(console.error);