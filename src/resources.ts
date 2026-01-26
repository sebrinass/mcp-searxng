import { getCurrentLogLevel } from "./logging.js";
import { packageVersion } from "./index.js";

export function createConfigResource() {
  const config = {
    serverInfo: {
      name: "ihor-sokoliuk/mcp-searxng",
      version: packageVersion,
      description: "MCP server for SearXNG integration"
    },
    environment: {
      searxngUrl: process.env.SEARXNG_URL || "(not configured)",
      hasAuth: !!(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD),
      hasProxy: !!(process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy),
      hasNoProxy: !!(process.env.NO_PROXY || process.env.no_proxy),
      nodeVersion: process.version,
      currentLogLevel: getCurrentLogLevel()
    },
    capabilities: {
      tools: ["search", "read"],
      prompts: true,
      logging: true,
      resources: true,
      transports: process.env.MCP_HTTP_PORT ? ["stdio", "http"] : ["stdio"]
    }
  };

  return JSON.stringify(config, null, 2);
}

export function createHelpResource() {
  return `# MCP Augmented Search Server Help

## Overview
This is a Model Context Protocol (MCP) server that provides intelligent web search capabilities with built-in research planning and URL content reading functionality.

## Available Tools

### 1. search
Performs intelligent web searches with built-in research planning and multi-step thinking.

**Parameters:**
- \`thought\` (required): Description of current thinking step
- \`thoughtNumber\` (required): Current thinking step number (e.g., 1, 2, 3)
- \`totalThoughts\` (required): Expected total number of thinking steps (e.g., 5, 10)
- \`nextThoughtNeeded\` (required): Whether to continue thinking
- \`searchedKeywords\` (optional): Array of keywords to search (max 5). Each keyword should be an independent entity. Automatically executes searches when provided.
- \`informationSummary\` (optional): Key findings from previous step
- \`site\` (optional): Limit search to a specific website. Useful when search results reveal knowledge bases or project documentation sites.
- \`isRevision\` (optional): Whether this is a revision of a previous thought
- \`revisesThought\` (optional): Which thought number to revise
- \`branchFromThought\` (optional): Branch from which thought step
- \`branchId\` (optional): Branch identifier
- \`needsMoreThoughts\` (optional): Whether more thoughts are needed

**Returns:**
- \`thoughtStatus\`: Thinking status (step number, whether to continue, etc.)
- \`searchResults\`: Search results for each keyword (includes URLs for further reading)

**Usage:**
1. Fill in \`thought\` to describe current thinking
2. Fill in \`searchedKeywords\` to specify keywords to search (max 5, auto-executed)
3. Decide next step based on returned search results
4. Use \`read\` tool to deep-dive into specific web pages

**Notes:**
- Each keyword should be an independent entity, avoid combined queries
- Search results are sorted by relevance
- URLs in results can be used with \`read\` tool for deeper reading

### 2. read
Reads and converts web page content to Markdown format.

**Parameters:**
- \`url\` (optional): Single URL to read
- \`urls\` (optional): Array of URLs to read in batch (alternative to single url parameter)
- \`startChar\` (optional): Starting character position for content extraction (default: 0, minimum: 0)
- \`maxLength\` (optional): Maximum number of characters to return per URL (minimum: 1)
- \`section\` (optional): Extract content under a specific heading (searches for heading text)
- \`paragraphRange\` (optional): Return specific paragraph ranges (e.g., '1-5', '3', '10-')
- \`readHeadings\` (optional): Return only a list of headings instead of full content
- \`timeoutMs\` (optional): Request timeout in milliseconds (default: 30000, minimum: 1000)

**Note:** Either \`url\` or \`urls\` parameter must be provided.

## Available Prompts

### 1. search
Network search tool with built-in research planning.

**Usage:**
- Directly execute search and return results
- For deep research, set \`totalThoughts > 1\`
- Max 5 keywords per step
- Automatically summarize key findings per step

### 2. read
Web page content reading tool.

**Usage:**
- Extract complete main content from web pages
- Supports batch reading (via \`urls\` parameter)
- Can limit extraction range (\`section\`, \`paragraphRange\`)
- Can limit length (\`maxLength\`)
- Returns plain text format

## Configuration

### Required Environment Variables
- \`SEARXNG_URL\`: URL of your SearXNG instance (e.g., http://localhost:8080)

### Optional Environment Variables
- \`AUTH_USERNAME\` & \`AUTH_PASSWORD\`: Basic authentication for SearXNG
- \`HTTP_PROXY\` / \`HTTPS_PROXY\`: Proxy server configuration
- \`NO_PROXY\` / \`no_proxy\`: Comma-separated list of hosts to bypass proxy
- \`MCP_HTTP_PORT\`: Enable HTTP transport on specified port

## Transport Modes

### STDIO (Default)
Standard input/output transport for desktop clients like Claude Desktop.

### HTTP (Optional)
RESTful HTTP transport for web applications. Set \`MCP_HTTP_PORT\` to enable.

## Usage Examples

### Quick search (single step)
\`\`\`
Tool: search
Args: {
  "thought": "Search for latest AI developments",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "searchedKeywords": ["latest AI developments"]
}
\`\`\`

### Deep research (multi-step)
\`\`\`
Tool: search
Args: {
  "thought": "First step: understand basics of quantum computing",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true,
  "searchedKeywords": ["quantum computing basics", "qubit", "superposition"]
}
\`\`\`

### Read a specific article
\`\`\`
Tool: read
Args: {
  "url": "https://example.com/article"
}
\`\`\`

### Batch read multiple URLs
\`\`\`
Tool: read
Args: {
  "urls": ["https://example.com/article1", "https://example.com/article2"],
  "maxLength": 5000
}
\`\`\`

### Read specific section
\`\`\`
Tool: read
Args: {
  "url": "https://example.com/article",
  "section": "Introduction"
}
\`\`\`

### Read specific paragraph range
\`\`\`
Tool: read
Args: {
  "url": "https://example.com/article",
  "paragraphRange": "1-5"
}
\`\`\`

## Troubleshooting

1. **"SEARXNG_URL not set"**: Configure the SEARXNG_URL environment variable
2. **Network errors**: Check if SearXNG is running and accessible
3. **Empty results**: Try different search terms or check SearXNG instance
4. **Timeout errors**: The server has a configurable timeout for URL fetching (default: 30000ms)

Use logging level "debug" for detailed request information.

## Current Configuration
See the "Current Configuration" resource for live settings.
`;
}
