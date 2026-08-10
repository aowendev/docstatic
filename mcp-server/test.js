#!/usr/bin/env node

/**
 * Test script for the docStatic MCP Server
 * This script verifies the server can connect to GraphQL and retrieve documents
 *
 * Reports via exit code and a thrown error, not stdout:
 *   exit 0  prerequisites are met
 *   exit 1  GraphQL unreachable or the document query failed
 */

const GRAPHQL_URL = "http://localhost:4001/graphql";

async function testGraphQLConnection() {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ __typename }" }),
  }).catch((error) => {
    throw new Error(
      `Cannot reach the GraphQL server at ${GRAPHQL_URL}. Run "npm run dev" in the main docstatic directory first. (${error.message})`
    );
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL server at ${GRAPHQL_URL} responded with ${response.status}`
    );
  }
}

async function testDocumentQuery() {
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(
      `GraphQL query failed: ${JSON.stringify(result.errors, null, 2)}`
    );
  }

  const documents = result.data?.docConnection?.edges;
  if (!Array.isArray(documents)) {
    throw new Error(
      "Document query returned no docConnection — check the TinaCMS configuration"
    );
  }
}

async function runTests() {
  await testGraphQLConnection();
  await testDocumentQuery();
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  process.exit(0);
});

runTests().catch((error) => {
  process.exitCode = 1;
  throw error;
});
