# MCP Augmented Search

MCP Augmented Search is a Model Context Protocol (MCP) server that integrates [SearXNG](https://docs.searxng.org) with hybrid retrieval, semantic caching, and structured thinking framework. It transforms a self-hosted SearXNG search engine into an enhanced search module for AI assistants. The core approach uses local hybrid retrieval and semantic caching to "purify" and deduplicate massive, unstable web search results, injecting only the most relevant, high-quality information into the AI context. Additionally, it provides a structured thinking tool that forces the model to bind reasoning with information sources, forming a traceable search chain. The economic efficiency of the entire module is built on the premise that computational tasks like embedding models run completely locally with near-zero marginal cost, thereby achieving the fusion of general-purpose large models with precise, controllable information acquisition capabilities.

Forked from [ihor-sokoliuk/mcp-searxng](https://github.com/ihor-sokoliuk/mcp-searxng).

[中文文档](./README_CN.md) | [详细配置](./CONFIGURATION.md)

## Quick Start

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

## Core Features

### Hybrid Retrieval
- **BM25 + Embedding**: Combines sparse (keyword) and dense (semantic) retrieval
- **Smart Ranking**: 30% BM25 + 70% semantic similarity for better results
- **Top-K Control**: Returns only most relevant results to save tokens

### Semantic Caching
- **Similarity Threshold**: 0.95 for intelligent cache hits
- **Multi-Level Cache**: URLs, search results, and embeddings
- **Session Isolation**: Independent history per conversation
- **Auto Cleanup**: TTL-based expiration

### Content Reading
- **Auto Fallback**: Fetch → Puppeteer when JavaScript rendering needed
- **Content Extraction**: Mozilla Readability removes noise
- **HTML to Markdown**: Automatic conversion
- **Chunk Reading**: Split large documents into parts

### Structured Thinking
- **Step-by-Step Guide**: Guides models through research process
- **Evidence Tracking**: Links conclusions to information sources
- **Flexible Workflow**: Supports revisions and branching

## Tools

### `search` (formerly `searxng_web_search`)

Use SearXNG to search

**Parameters:**
- `query` (string, required): Search query
- `pageno` (number, optional): Page number (default: 1)
- `time_range` (string, optional): "day", "month", or "year"
- `language` (string, optional): Language code (e.g., "en", "zh")
- `safesearch` (number, optional): 0 (none), 1 (moderate), 2 (strict)
- `sessionId` (string, optional): Session identifier for tracking

**Returns:**
- Up to 5 search results with:
  - URL, title, snippet
  - Cache hit information
  - Semantic similarity scores

**Example:**
```json
{
  "query": "machine learning tutorials",
  "language": "en",
  "time_range": "month"
}
```

### `read` (formerly `web_url_read`)

Read URL content

**Parameters:**
- `url` (string, required): URL to read
- `startChar` (number, optional): Start position (default: 0)
- `maxLength` (number, optional): Max characters to return
- `section` (string, optional): Extract content under specific heading
- `paragraphRange` (string, optional): Paragraph range (e.g., "1-5", "3")
- `readHeadings` (boolean, optional): Return only headings list
- `timeoutMs` (number, optional): Request timeout in ms (default: 30000)
- `sessionId` (string, optional): Session identifier

**Features:**
- **Auto Puppeteer Fallback**: Renders JavaScript when fetch fails
- **Content Extraction**: Removes navigation, ads, and noise
- **Chunk Reading**: Read large documents in parts
- **Section Filtering**: Get content under specific headings
- **robots.txt Checking**: Respects website rules (optional)

**Example:**
```json
{
  "url": "https://example.com/article",
  "maxLength": 2000,
  "section": "Introduction"
}
```

### `research`

Structured thinking framework for research planning

**Parameters:**
- `thought` (string, required): Current thinking step
- `nextThoughtNeeded` (boolean, required): Whether another thought step is needed
- `thoughtNumber` (number, required): Current thought number
- `totalThoughts` (number, required): Estimated total thoughts needed
- `isRevision` (boolean, optional): Whether revising previous thought
- `revisesThought` (number, optional): Which thought step to revise
- `branchFromThought` (number, optional): Branch starting point
- `branchId` (string, optional): Branch identifier
- `needsMoreThoughts` (boolean, optional): Whether more thoughts needed
- `informationSummary` (string, optional): Evidence supporting current conclusion
- `searchedKeywords` (array, optional): List of searched keywords

**Features:**
- **Step-by-Step Guide**: Structured research process
- **Evidence Tracking**: Links conclusions to sources
- **Flexible Workflow**: Supports revisions and branching

**Example:**
```json
{
  "thought": "Research quantum computing applications in AI",
  "nextThoughtNeeded": true,
  "thoughtNumber": 1,
  "totalThoughts": 5
}
```

## Installation

### NPX (Recommended)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

### NPM

```bash
npm install -g mcp-searxng
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

### Docker

**Without Puppeteer (Recommended, Smaller Image):**
```bash
docker build -t mcp-searxng:latest .
```

**With Puppeteer (For JavaScript Rendering):**
```bash
docker build --build-arg ENABLE_PUPPETEER=true -t mcp-searxng:latest-puppeteer .
```

**Using Pre-built Image:**
```bash
docker pull isokoliuk/mcp-searxng:latest
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

### Docker Compose

```yaml
services:
  mcp-searxng:
    image: isokoliuk/mcp-searxng:latest
    stdin_open: true
    environment:
      - SEARXNG_URL=http://localhost:8080
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker-compose",
      "args": ["run", "--rm", "mcp-searxng"]
    }
  }
}
```

## Configuration

For detailed configuration options, see [CONFIGURATION.md](./CONFIGURATION.md).

### Quick Configuration

**Required:**
- `SEARXNG_URL`: Your SearXNG instance URL

**Optional:**
- `ENABLE_EMBEDDING`: Enable hybrid retrieval (default: `false`)
- `ENABLE_CACHE`: Enable caching (default: `false`)
- `OLLAMA_HOST`: Ollama server URL (default: `http://localhost:11434`)
- `EMBEDDING_MODEL`: Embedding model (default: `nomic-embed-text`)

**Full configuration:** [CONFIGURATION.md](./CONFIGURATION.md)

## Architecture

### Hybrid Retrieval

```
Query
  ├─→ BM25 (Sparse) ──→ Keyword Matches
  └─→ Embedding (Dense) ──→ Semantic Matches
           ↓
      Merge (30%:70%)
           ↓
      Ranked Results
```

### Content Reading

```
URL Request
    ↓
Try Fetch API
    ↓
Success? ──No──→ Puppeteer Rendering
    ↓ Yes              ↓
Extract Content    Wait for JS
    ↓                  ↓
Readability     Final HTML
    ↓                  ↓
Markdown ←────────────┘
```

### Caching

```
Request
    ↓
Check Cache (Semantic + TTL)
    ↓
Hit? ──Yes──→ Return Cached
    ↓ No
Fetch/Process
    ↓
Store in Cache
    ↓
Return Result
```

## Development

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/mcp-searxng.git
cd mcp-searxng
npm install
```

### Development Mode

```bash
npm run watch    # Watch mode with auto-rebuild
npm run build    # Build once
npm test        # Run tests
```

### Testing

```bash
npm test                    # Run all tests
npm run test:coverage      # Generate coverage report
npm run inspector          # Test with MCP inspector
```

## Links

- [Upstream Repository](https://github.com/ihor-sokoliuk/mcp-searxng)
- [MCP Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
- [Jina AI Reader](https://github.com/jina-ai/reader)
- [MCP Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [SearXNG Documentation](https://docs.searxng.org)
- [MCP Protocol](https://modelcontextprotocol.io/introduction)
- [Ollama Documentation](https://ollama.com)
- [Detailed Configuration](./CONFIGURATION.md)
