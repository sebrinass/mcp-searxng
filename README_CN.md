# MCP Augmented Search 服务器

MCP Augmented Search 是一个 MCP 增强搜索插件。它将自托管的 SearXNG 搜索引擎转化为 AI 助手的增强搜索模块。核心通过本地的混合检索和语义缓存，对海量、不稳定的网络搜索结果进行"提纯"与去重，仅将最相关的少数优质信息注入 AI 上下文。同时，提供结构化的思考工具，强制模型将推理与信息来源绑定，形成可追溯的搜索链条。整个模块的经济性与高效性，建立在嵌入模型等计算任务完全本地运行、边际成本趋近于零的基础上，从而实现了通用大模型与精准、可控信息获取能力的融合。

Fork 自 [ihor-sokoliuk/mcp-searxng](https://github.com/ihor-sokoliuk/mcp-searxng)。

[English Documentation](./README.md) | [详细配置](./CONFIGURATION.md)

## 快速开始

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

## 核心功能

### 混合检索
- **BM25 + 语义嵌入**：结合稀疏（关键词）和密集（语义）检索
- **智能排序**：30% BM25 + 70% 语义相似度
- **Top-K 控制**：仅返回最相关结果，节省 tokens

### 语义缓存
- **相似度阈值**：0.95 智能缓存命中
- **多级缓存**：URL、搜索结果、嵌入向量
- **会话隔离**：每个对话独立历史
- **自动清理**：基于 TTL 的过期机制

### 内容读取
- **自动降级**：Fetch → Puppeteer 处理 JavaScript 渲染
- **内容提取**：Mozilla Readability 去除噪声
- **HTML 转 Markdown**：自动转换
- **分块读取**：拆分大文档

### 结构化思考
- **逐步引导**：结构化研究过程
- **证据追踪**：将结论与信息来源关联
- **灵活工作流**：支持修订和分支

## 工具

### `search`

使用 SearXNG 搜索

**参数：**
- `query`（字符串，必填）：搜索查询
- `pageno`（数字，可选）：页码（默认：1）
- `time_range`（字符串，可选）："day"、"month" 或 "year"
- `language`（字符串，可选）：语言代码（如 "en"、"zh"）
- `safesearch`（数字，可选）：0（无）、1（中等）、2（严格）

**示例：**
```json
{
  "query": "机器学习教程",
  "language": "zh",
  "time_range": "month"
}
```

### `read`

读取 URL 的内容

**参数：**
- `url`（字符串，必填）：要读取的 URL
- `maxLength`（数字，可选）：最多返回字符数（默认：3000）
- `section`（字符串，可选）：提取特定标题下的内容
- `readHeadings`（布尔值，可选）：仅返回标题列表
- `timeoutMs`（数字，可选）：请求超时时间（毫秒，默认：30000）

**功能：**
- 自动 Puppeteer（可选）降级渲染 JavaScript
- 内容提取去除导航和广告
- robots.txt 合规（可选）

**示例：**
```json
{
  "url": "https://example.com/article",
  "maxLength": 2000,
  "section": "简介"
}
```

### `research`

结构化思考框架，用于研究规划

**参数：**
- `thought`（字符串，必填）：当前思考步骤
- `nextThoughtNeeded`（布尔值，必填）：是否需要继续思考
- `thoughtNumber`（数字，必填）：当前思考步骤编号（如 1, 2, 3）
- `totalThoughts`（数字，必填）：估算的总思考步骤数（如 5, 10）
- `isRevision`（布尔值，可选）：是否修正之前的思考
- `revisesThought`（数字，可选）：修正哪个思考步骤
- `branchFromThought`（数字，可选）：分支起点思考步骤编号
- `branchId`（字符串，可选）：分支标识符
- `needsMoreThoughts`（布尔值，可选）：是否需要更多思考
- `informationSummary`（字符串，可选）：支撑当前结论的证据
- `searchedKeywords`（数组，可选）：已搜索的关键词列表

**功能：**
- **逐步引导**：结构化研究过程
- **证据追踪**：将结论与信息来源关联
- **灵活工作流**：支持修订和分支

**示例：**
```json
{
  "thought": "研究量子计算与人工智能的结合",
  "nextThoughtNeeded": true,
  "thoughtNumber": 1,
  "totalThoughts": 5
}
```

## 安装

### NPX（推荐）

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

**不安装 Puppeteer（推荐，镜像更小）：**
```bash
docker build -t mcp-searxng:latest .
```

**安装 Puppeteer（用于 JavaScript 渲染）：**
```bash
docker build --build-arg ENABLE_PUPPETEER=true -t mcp-searxng:latest-puppeteer .
```

**使用预构建镜像：**
```bash
docker pull ghcr.io/sebrinass/mcp-searxng:latest
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "ghcr.io/sebrinass/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

## 配置

**必填：**
- `SEARXNG_URL`：你的 SearXNG 实例 URL

**可选：**
- `ENABLE_EMBEDDING`：启用混合检索（默认：`false`）
- `ENABLE_CACHE`：启用缓存（默认：`false`）
- `OLLAMA_HOST`：Ollama 服务器 URL（默认：`http://localhost:11434`）
- `EMBEDDING_MODEL`：嵌入模型（默认：`nomic-embed-text`）

**完整配置：** [CONFIGURATION.md](./CONFIGURATION.md)

## 开发

```bash
npm install
npm run watch    # 监听模式
npm run build    # 构建
npm test        # 测试
```

## 许可证

MIT 许可证 - 详情请查看 [LICENSE](./LICENSE) 文件。

## 链接

- [上游仓库](https://github.com/ihor-sokoliuk/mcp-searxng)
- [MCP Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
- [Jina AI Reader](https://github.com/jina-ai/reader)
- [MCP Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [SearXNG 文档](https://docs.searxng.org)
- [MCP 协议](https://modelcontextprotocol.io/introduction)
- [Ollama 文档](https://ollama.com)
- [详细配置](./CONFIGURATION.md)

