import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface Document {
  _sys: {
    relativePath: string;
    filename: string;
  };
  title: string;
  lastmod?: string;
  body: string;
  description?: string;
  tags?: string[];
  draft?: boolean;
  published?: boolean;
  _values?: any;
}

interface DocumentConnection {
  edges: {
    node: Document;
  }[];
}

class DocStaticMCPServer {
  private graphqlUrl: string;
  private server: Server;

  constructor(graphqlUrl = 'http://localhost:4001/graphql') {
    this.graphqlUrl = graphqlUrl;
    
    this.server = new Server(
      {
        name: 'docstatic-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async executeGraphQL(query: string, variables?: any): Promise<any> {
    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL execution error:', error);
      throw error;
    }
  }

  private async searchDocuments(query: string, limit = 20): Promise<Document[]> {
    const graphqlQuery = `
      query SearchDocuments($first: Float) {
        docConnection(first: $first, sort: "title") {
          edges {
            node {
              _sys {
                relativePath
                filename
              }
              title
              lastmod
              body
              _values
            }
          }
        }
      }
    `;

    const data = await this.executeGraphQL(graphqlQuery, { first: limit });
    const documents = data.docConnection.edges.map((edge: any) => edge.node);

    // Filter documents by search query
    const searchTerm = query.toLowerCase();
    return documents.filter((doc: Document) => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.body.toLowerCase().includes(searchTerm) ||
      (doc._values && JSON.stringify(doc._values).toLowerCase().includes(searchTerm))
    );
  }

  private async getDocument(relativePath: string): Promise<Document | null> {
    const graphqlQuery = `
      query GetDocument($relativePath: String!) {
        doc(relativePath: $relativePath) {
          _sys {
            relativePath
            filename
          }
          title
          lastmod
          body
          _values
        }
      }
    `;

    try {
      const data = await this.executeGraphQL(graphqlQuery, { relativePath });
      return data.doc;
    } catch (error) {
      console.error(`Failed to get document ${relativePath}:`, error);
      return null;
    }
  }

  private async getAllDocuments(): Promise<Document[]> {
    const graphqlQuery = `
      query AllDocuments {
        docConnection(first: 1000, sort: "title") {
          edges {
            node {
              _sys {
                relativePath
                filename
              }
              title
              lastmod
              body
              _values
            }
          }
        }
      }
    `;

    const data = await this.executeGraphQL(graphqlQuery);
    return data.docConnection.edges.map((edge: any) => edge.node);
  }

  private async getDocumentsByTag(tag: string): Promise<Document[]> {
    const documents = await this.getAllDocuments();
    return documents.filter((doc: Document) => {
      const values = doc._values || {};
      const tags = values.tags || [];
      return tags.includes(tag);
    });
  }

  private extractMDXComponents(content: string): string[] {
    const componentMatches = content.match(/<[A-Z][a-zA-Z0-9]*[^>]*>/g) || [];
    const uniqueComponents = [...new Set(componentMatches.map(match => {
      const componentName = match.match(/<([A-Z][a-zA-Z0-9]*)/)?.[1];
      return componentName;
    }).filter(Boolean))];
    
    return uniqueComponents as string[];
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_documents',
            description: 'Search through docStatic documentation using keywords',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to find relevant documents',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 20)',
                  default: 20,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_document',
            description: 'Get a specific document by its relative path',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path to the document (e.g., "installation.mdx")',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'list_all_documents',
            description: 'List all available documents with metadata',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_documents_by_tag',
            description: 'Get documents filtered by a specific tag',
            inputSchema: {
              type: 'object',
              properties: {
                tag: {
                  type: 'string',
                  description: 'Tag to filter documents by',
                },
              },
              required: ['tag'],
            },
          },
          {
            name: 'analyze_mdx_components',
            description: 'Analyze MDX components used in a document',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path to the document to analyze',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'check_server_status',
            description: 'Check if the GraphQL server is running and accessible',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'search_documents': {
            const { query, limit = 20 } = args as { query: string; limit?: number };
            const results = await this.searchDocuments(query, limit);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    query,
                    resultCount: results.length,
                    documents: results.map(doc => ({
                      path: doc._sys.relativePath,
                      title: doc.title,
                      lastModified: doc.lastmod,
                      preview: doc.body.substring(0, 200) + '...',
                    })),
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_document': {
            const { path } = args as { path: string };
            const document = await this.getDocument(path);
            
            if (!document) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Document not found: ${path}`,
                  },
                ],
              };
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    path: document._sys.relativePath,
                    title: document.title,
                    lastModified: document.lastmod,
                    content: document.body,
                    metadata: document._values,
                  }, null, 2),
                },
              ],
            };
          }

          case 'list_all_documents': {
            const documents = await this.getAllDocuments();
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    totalDocuments: documents.length,
                    documents: documents.map(doc => ({
                      path: doc._sys.relativePath,
                      title: doc.title,
                      lastModified: doc.lastmod,
                      wordCount: doc.body.split(' ').length,
                    })),
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_documents_by_tag': {
            const { tag } = args as { tag: string };
            const documents = await this.getDocumentsByTag(tag);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    tag,
                    documentCount: documents.length,
                    documents: documents.map(doc => ({
                      path: doc._sys.relativePath,
                      title: doc.title,
                      lastModified: doc.lastmod,
                    })),
                  }, null, 2),
                },
              ],
            };
          }

          case 'analyze_mdx_components': {
            const { path } = args as { path: string };
            const document = await this.getDocument(path);
            
            if (!document) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Document not found: ${path}`,
                  },
                ],
              };
            }

            const components = this.extractMDXComponents(document.body);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    path: document._sys.relativePath,
                    title: document.title,
                    mdxComponents: components,
                    componentCount: components.length,
                  }, null, 2),
                },
              ],
            };
          }

          case 'check_server_status': {
            try {
              const query = `query { __typename }`;
              await this.executeGraphQL(query);
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      status: 'connected',
                      endpoint: this.graphqlUrl,
                      message: 'GraphQL server is running and accessible',
                    }, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      status: 'error',
                      endpoint: this.graphqlUrl,
                      message: error instanceof Error ? error.message : 'Unknown error',
                    }, null, 2),
                  },
                ],
              };
            }
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'docstatic://documents',
            name: 'All Documents',
            description: 'Complete list of all documentation files',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'docstatic://documents') {
        const documents = await this.getAllDocuments();
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(documents, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('docStatic MCP server running on stdio');
  }
}

// Create and run the server
const server = new DocStaticMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});