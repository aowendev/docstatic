# docStatic MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with structured access to your docStatic documentation through the TinaCMS GraphQL endpoint.

## Overview

This MCP server connects to your local TinaCMS GraphQL endpoint (`http://localhost:4001/graphql`) and provides tools for:

- Searching documentation content
- Retrieving specific documents
- Listing all available documents
- Filtering documents by tags
- Analyzing MDX components usage
- Checking server connectivity

## Setup

### 1. Install Dependencies

From the main docStatic directory:

```bash
npm install
# This will automatically install MCP server dependencies via postinstall hook
```

Or manually:

```bash
cd mcp-server
npm install
```

### 2. Build the Server

```bash
npm run mcp:build
```

### 3. Start Your docStatic Dev Server

The MCP server requires the TinaCMS GraphQL endpoint to be running:

```bash
npm run dev
```

This starts TinaCMS with Docusaurus at:
- Docusaurus: http://localhost:3000
- GraphQL endpoint: http://localhost:4001/graphql
- Tina Admin: http://localhost:3000/admin

### 4. Run the MCP Server

In a separate terminal:

```bash
npm run mcp:start
```

## Available Tools

### `search_documents`
Search through documentation using keywords.

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Max results (default: 20)

**Example:**
```json
{
  "query": "installation",
  "limit": 10
}
```

### `get_document`
Retrieve a specific document by path.

**Parameters:**
- `path` (required): Relative path to document

**Example:**
```json
{
  "path": "installation.mdx"
}
```

### `list_all_documents`
Get a list of all available documents with metadata.

### `get_documents_by_tag`
Filter documents by a specific tag.

**Parameters:**
- `tag` (required): Tag to filter by

**Example:**
```json
{
  "tag": "software_content-management-systems_tinacms"
}
```

### `analyze_mdx_components`
Analyze which MDX components are used in a document.

**Parameters:**
- `path` (required): Relative path to document

### `check_server_status`
Verify GraphQL server connectivity.

## Usage with Claude Desktop

Add this configuration to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "docstatic": {
      "command": "node",
      "args": ["/path/to/docstatic/mcp-server/dist/server.js"],
      "cwd": "/path/to/docstatic"
    }
  }
}
```

## Development

### Watch Mode
For active development, use watch mode to automatically rebuild on changes:

```bash
cd mcp-server
npm run watch
```

### Manual Build and Run
```bash
npm run mcp:build  # Build TypeScript
npm run mcp:start  # Start the server
```

### Development with Auto-restart
```bash
npm run mcp:dev    # Build and start in one command
```

## Troubleshooting

### Common Issues

1. **"GraphQL server is not running"**
   - Ensure `npm run dev` is running in the main directory
   - Check that http://localhost:4001/graphql is accessible

2. **"Connection refused"**
   - Verify TinaCMS is properly started
   - Check if port 4001 is blocked by firewall

3. **"Document not found"**
   - Ensure the document exists in the `docs/` directory
   - Use relative paths like `installation.mdx`, not `/docs/installation.mdx`

### Testing the Server

Test GraphQL connectivity:

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

Expected response:
```json
{"data":{"__typename":"Query"}}
```

## Architecture

```
docStatic Project
├── docs/               # MDX documentation files
├── mcp-server/         # MCP server implementation
│   ├── src/server.ts   # Main server logic
│   ├── package.json    # MCP dependencies
│   └── dist/           # Compiled JavaScript
└── tina/               # TinaCMS configuration
    └── config.jsx      # GraphQL schema definition
```

The MCP server:
1. Connects to TinaCMS GraphQL endpoint
2. Executes GraphQL queries to fetch document data
3. Provides structured responses via MCP protocol
4. Handles error cases and connectivity issues

## Integration with AI Assistants

This MCP server enables AI assistants to:

- **Understand your documentation structure**
- **Search for specific topics or concepts**
- **Access complete document content**
- **Analyze MDX component usage patterns**
- **Provide context-aware assistance** based on your actual documentation

The server understands your docStatic-specific format including:
- Frontmatter metadata
- MDX component usage (`<Admonition>`, `<Figure>`, etc.)
- Hierarchical tag structure
- TinaCMS workflow states