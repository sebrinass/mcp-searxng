# SearXNG MCP 服务器

这是一个集成了 [SearXNG](https://docs.searxng.org) API 的 [MCP 服务器](https://modelcontextprotocol.io/introduction) 实现，提供网络搜索功能。

[![https://nodei.co/npm/mcp-searxng.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/mcp-searxng.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mcp-searxng)

[![https://badgen.net/docker/pulls/isokoliuk/mcp-searxng](https://badgen.net/docker/pulls/isokoliuk/mcp-searxng)](https://hub.docker.com/r/isokoliuk/mcp-searxng)

<a href="https://glama.ai/mcp/servers/0j7jjyt7m9"><img width="380" height="200" src="https://glama.ai/mcp/servers/0j7jjyt7m9/badge" alt="SearXNG Server MCP server" /></a>

## 功能特性

- **网络搜索**：支持常规查询、新闻、文章搜索，支持分页
- **URL 内容读取**：高级内容提取，支持分页、章节筛选和标题提取
- **智能缓存**：URL 内容使用 TTL（生存时间）缓存，提高性能并减少冗余请求
- **语义嵌入**：使用 Ollama 生成向量嵌入，实现语义相似度评分
- **相似度排名**：结合传统关键词匹配和语义相似度，优化搜索结果
- **分页支持**：控制获取结果的页码
- **时间筛选**：按时间范围（天、月、年）筛选结果
- **语言选择**：按首选语言筛选结果
- **安全搜索**：控制搜索结果的内容过滤级别

## 分支修改

本分支为原始 mcp-searxng 项目添加了以下增强功能：

### 语义嵌入集成
- **Ollama 集成**：添加了使用 Ollama 生成语义嵌入的支持
- **余弦相似度评分**：实现余弦相似度算法以评分和排名搜索结果
- **文本分块**：智能文本分块，可配置分块大小和重叠，以获得更好的嵌入质量
- **Top-K 结果**：基于语义相似度返回最相似的 Top-K 结果

### 增强缓存系统
- **多级缓存**：为 URL 内容、搜索结果和嵌入分别设置独立缓存
- **LRU 淘汰策略**：当达到最大大小时使用最近最少使用策略淘汰缓存
- **TTL 支持**：所有缓存项目支持基于时间的过期
- **内存高效**：内存缓存，可配置最大大小限制

### HTTP 传输改进
- **会话管理**：增强的 HTTP 服务器，具有适当的会话处理
- **CORS 支持**：添加 CORS 标头以支持 Web 客户端兼容性
- **健康端点**：添加 `/health` 端点用于监控

## 工具说明

### searxng_web_search
- **功能**：执行带分页的网络搜索
- **输入参数**：
  - `query` (字符串)：搜索查询词，传递给外部搜索服务
  - `pageno` (数字，可选)：搜索页码，从 1 开始（默认 1）
  - `time_range` (字符串，可选)：按时间范围筛选结果 - 可选值："day"、"month"、"year"（默认：无）
  - `language` (字符串，可选)：结果语言代码（如："en"、"zh"、"ja"）或 "all"（默认："all"）
  - `safesearch` (数字，可选)：安全搜索过滤级别（0: 无、1: 适中、2: 严格）（默认：实例设置）

### web_url_read
- **功能**：获取 URL 内容并转换为 Markdown，支持高级内容提取选项
- **输入参数**：
  - `url` (字符串)：要获取和处理的 URL
  - `startChar` (数字，可选)：内容提取的起始字符位置（默认：0）
  - `maxLength` (数字，可选)：返回的最大字符数
  - `section` (字符串，可选)：提取特定标题下的内容（搜索标题文本）
  - `paragraphRange` (字符串，可选)：返回特定的段落范围（如：'1-5'、'3'、'10-'）
  - `readHeadings` (布尔值，可选)：仅返回标题列表而非完整内容

## 配置说明

### 环境变量

#### 必需
- **`SEARXNG_URL`**：SearXNG 实例 URL（默认：`http://localhost:8080`）
  - 格式：`<protocol>://<hostname>[:<port>]`
  - 示例：`https://search.example.com`

#### 可选
- **`AUTH_USERNAME`** / **`AUTH_PASSWORD`**：HTTP 基本认证凭据，用于受密码保护的实例
- **`USER_AGENT`**：自定义 User-Agent 标头（如：`MyBot/1.0`）
- **`HTTP_PROXY`** / **`HTTPS_PROXY`**：代理 URL，用于路由流量
  - 格式：`http://[username:password@]proxy.host:port`
- **`NO_PROXY`**：逗号分隔的 bypass 列表（如：`localhost,.internal,example.com`）

#### 嵌入配置 (Ollama 集成)
- **`ENABLE_EMBEDDING`**：启用语义嵌入功能（默认：`true`）
- **`OLLAMA_HOST`**：Ollama 服务器 URL（默认：`http://localhost:11434`）
- **`EMBEDDING_MODEL`**：嵌入模型名称（默认：`nomic-embed-text`）
- **`TOP_K`**：基于嵌入相似度返回的最相似结果数量（默认：`3`）
- **`CHUNK_SIZE`**：用于生成嵌入的文本分块大小（默认：`1000`）
- **`CHUNK_OVERLAP`**：文本分块之间的重叠（默认：`100`）

#### 缓存配置
- **`ENABLE_CACHE`**：启用缓存功能（默认：`true`）
- **`CACHE_TTL`**：缓存生存时间，单位秒（默认：`300`）
- **`CACHE_MAX_SIZE`**：缓存的最大项目数（默认：`1000`）
- **`CACHE_SEARCH`**：启用搜索结果缓存（默认：`true`）
- **`CACHE_EMBEDDING`**：启用嵌入缓存（默认：`true`）

## 安装与配置

### [NPX](https://www.npmjs.com/package/mcp-searxng)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

<details>
<summary>完整配置示例（所有选项）</summary>

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "USER_AGENT": "MyBot/1.0",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080",
        "NO_PROXY": "localhost,127.0.0.1,.local,.internal"
      }
    }
  }
}
```

</details>

### [NPM](https://www.npmjs.com/package/mcp-searxng)

```bash
npm install -g mcp-searxng
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

<details>
<summary>完整配置示例（所有选项）</summary>

```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "USER_AGENT": "MyBot/1.0",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080",
        "NO_PROXY": "localhost,127.0.0.1,.local,.internal"
      }
    }
  }
}
```

</details>

### Docker

#### 使用 [Docker Hub 预构建镜像](https://hub.docker.com/r/isokoliuk/mcp-searxng)

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
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

<details>
<summary>完整配置示例（所有选项）</summary>

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "AUTH_USERNAME",
        "-e", "AUTH_PASSWORD",
        "-e", "USER_AGENT",
        "-e", "HTTP_PROXY",
        "-e", "HTTPS_PROXY",
        "-e", "NO_PROXY",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "USER_AGENT": "MyBot/1.0",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080",
        "NO_PROXY": "localhost,127.0.0.1,.local,.internal"
      }
    }
  }
}
```

</details>

**注意**：只添加你需要的 `-e` 标志和环境变量。

#### 本地构建

```bash
docker build -t mcp-searxng:latest -f Dockerfile .
```

使用与上面相同的配置，将 `isokoliuk/mcp-searxng:latest` 替换为 `mcp-searxng:latest`。

#### Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
services:
  mcp-searxng:
    image: isokoliuk/mcp-searxng:latest
    stdin_open: true
    environment:
      - SEARXNG_URL=YOUR_SEARXNG_INSTANCE_URL
      # 根据需要添加可选变量：
      # - AUTH_USERNAME=your_username
      # - AUTH_PASSWORD=your_password
      # - USER_AGENT=MyBot/1.0
      # - HTTP_PROXY=http://proxy.company.com:8080
      # - HTTPS_PROXY=http://proxy.company.com:8080
      # - NO_PROXY=localhost,127.0.0.1,.local,.internal
```

然后配置你的 MCP 客户端：

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

### HTTP 传输（可选）

服务器支持 STDIO（默认）和 HTTP 两种传输方式。设置 `MCP_HTTP_PORT` 以启用 HTTP 模式。

```json
{
  "mcpServers": {
    "searxng-http": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "MCP_HTTP_PORT": "3000"
      }
    }
  }
}
```

**HTTP 端点**：
- **MCP 协议**：`POST/GET/DELETE /mcp`
- **健康检查**：`GET /health`

**测试方法**：
```bash
MCP_HTTP_PORT=3000 SEARXNG_URL=http://localhost:8080 mcp-searxng
curl http://localhost:3000/health
```

## 运行评估

```bash
SEARXNG_URL=YOUR_URL OPENAI_API_KEY=your-key npx mcp-eval evals.ts src/index.ts
```

## 开发者指南

### 贡献指南

欢迎贡献！请遵循以下指南：

**编码规范**：
- 使用 TypeScript 并保持严格类型安全
- 遵循现有的错误处理模式
- 编写简洁、信息丰富的错误消息
- 为新功能编写单元测试
- 保持 90%+ 的测试覆盖率
- 提交前使用 MCP inspector 测试
- 运行评估以验证功能

**工作流程**：

1. **Fork 并克隆**：
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-searxng.git
   cd mcp-searxng
   git remote add upstream https://github.com/ihor-sokoliuk/mcp-searxng.git
   ```

2. **设置**：
   ```bash
   npm install
   npm run watch  # 开发模式，带文件监控
   ```

3. **开发**：
   ```bash
   git checkout -b feature/your-feature-name
   # 在 src/ 中进行修改
   npm run build
   npm test
   npm run test:coverage
   npm run inspector
   ```

4. **提交**：
   ```bash
   git commit -m "feat: description"
   git push origin feature/your-feature-name
   # 在 GitHub 上创建 PR
   ```

### 测试

```bash
npm test                    # 运行所有测试
npm run test:coverage       # 生成覆盖率报告
npm run test:watch          # 监控模式
```

**覆盖率**：100% 成功率，包含全面的单元测试，覆盖错误处理、类型、代理配置、资源和日志。

## 许可证

本 MCP 服务器根据 MIT 许可证授权。这意味着你可以自由使用、修改和分发本软件，但须遵守 MIT 许可证的条款和条件。如需更多详情，请参阅项目仓库中的 LICENSE 文件。
