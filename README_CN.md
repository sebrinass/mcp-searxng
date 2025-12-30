# MCP-SearXNG 服务器

基于 [ihor-sokoliuk/mcp-searxng](https://github.com/ihor-sokoliuk/mcp-searxng) 的 Fork 版本，集成了 [SearXNG](https://docs.searxng.org) 并提供混合检索、智能缓存和自动 JavaScript 渲染等高级功能。

感谢原作者 [ihor-sokoliuk](https://github.com/ihor-sokoliuk) 的优秀工作。

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

### 🔍 智能搜索
- **混合检索**：结合 BM25（稀疏）和语义（密集）检索，提升结果质量
- **语义缓存**：0.95 相似度阈值的智能缓存，减少重复查询
- **时间筛选**：按天、月、年筛选结果
- **语言选择**：获取指定语言的结果
- **安全搜索**：控制内容过滤级别

### 📄 高级内容读取
- **自动降级**：fetch 失败时自动使用 Puppeteer 渲染 JavaScript
- **内容提取**：Mozilla Readability 提取正文，去除噪声
- **分块读取**：分部分读取大文档，节省 token
- **HTML 转 Markdown**：自动转换，提升可读性
- **章节过滤**：提取特定标题下的内容

### 🧠 智能缓存
- **多级缓存**：URL、搜索结果、嵌入向量分别缓存
- **会话隔离**：每个对话独立的历史记录
- **全局共享**：跨对话共享缓存，提高效率
- **自动清理**：超过 1 小时的会话自动清理

### 🛡️ robots.txt 合规
- 可选的 robots.txt 检查
- 按域名缓存（24h TTL）
- 错误时优雅降级

## 工具

### `search`（原名 `searxng_web_search`）

执行网络搜索，支持智能缓存和语义重排序。

**参数：**
- `query`（字符串，必填）：搜索查询
- `pageno`（数字，可选）：页码（默认：1）
- `time_range`（字符串，可选）："day"、"month" 或 "year"
- `language`（字符串，可选）：语言代码（如 "en"、"zh"）
- `safesearch`（数字，可选）：0（无）、1（中等）、2（严格）
- `sessionId`（字符串，可选）：会话标识符

**返回：**
- 最多 5 个搜索结果，包含：
  - URL、标题、摘要
  - 缓存命中信息
  - 语义相似度分数

**示例：**
```json
{
  "query": "机器学习教程",
  "language": "zh",
  "time_range": "month"
}
```

### `read`（原名 `web_url_read`）

读取 URL 内容并转换为 Markdown，支持高级提取。

**参数：**
- `url`（字符串，必填）：要读取的 URL
- `startChar`（数字，可选）：起始位置（默认：0）
- `maxLength`（数字，可选）：最多返回的字符数
- `section`（字符串，可选）：提取特定标题下的内容
- `paragraphRange`（字符串，可选）：段落范围（如 "1-5"、"3"）
- `readHeadings`（布尔值，可选）：仅返回标题列表
- `timeoutMs`（数字，可选）：请求超时时间（毫秒，默认：30000）
- `sessionId`（字符串，可选）：会话标识符

**功能：**
- **自动 Puppeteer 降级**：fetch 失败时渲染 JavaScript
- **内容提取**：去除导航、广告和噪声
- **分块读取**：分部分读取大文档
- **章节过滤**：获取特定标题下的内容
- **robots.txt 检查**：遵守网站规则（可选）

**示例：**
```json
{
  "url": "https://example.com/article",
  "maxLength": 2000,
  "section": "简介"
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

## 配置

详细配置选项请查看 [CONFIGURATION.md](./CONFIGURATION.md)。

### 快速配置

**必填：**
- `SEARXNG_URL`：你的 SearXNG 实例 URL

**可选（推荐）：**
- `ENABLE_EMBEDDING`：启用混合检索（默认：`true`）
- `OLLAMA_HOST`：Ollama 服务器 URL（默认：`http://localhost:11434`）
- `EMBEDDING_MODEL`：嵌入模型（默认：`nomic-embed-text`）

**完整配置：** [CONFIGURATION.md](./CONFIGURATION.md)

## 架构

### 混合检索系统

```
查询
  ├─→ BM25（稀疏）───→ 关键词匹配
  └─→ 嵌入（密集）───→ 语义匹配
           ↓
      合并（30%:70%）
           ↓
      排序结果
```

### 内容读取流程

```
URL 请求
    ↓
尝试 Fetch API
    ↓
成功？ ──否──→ Puppeteer 渲染
    ↓ 是              ↓
提取内容    等待 JS
    ↓                  ↓
Readability  最终 HTML
    ↓                  ↓
Markdown ←───────────┘
```

### 缓存策略

```
请求
    ↓
检查缓存（语义 + TTL）
    ↓
命中？ ──是──→ 返回缓存
    ↓ 否
获取/处理
    ↓
存入缓存
    ↓
返回结果
```

## 开发

### 设置

```bash
git clone https://github.com/YOUR_USERNAME/mcp-searxng.git
cd mcp-searxng
npm install
```

### 开发模式

```bash
npm run watch    # 监听模式，自动重建
npm run build    # 构建一次
npm test        # 运行测试
```

### 测试

```bash
npm test                    # 运行所有测试
npm run test:coverage      # 生成覆盖率报告
npm run inspector          # 使用 MCP inspector 测试
```

## 版本历史

- **v0.8.0+7**（2025-12-30）：混合检索、Puppeteer 自动降级、简化工具名称
- **v0.8.0+6**（2025-12-29）：会话隔离、全局缓存
- **v0.8.0+5**（2025-12-29）：robots.txt 检查
- **v0.8.0+4**（2025-12-29）：Fetch 功能（超时、User-Agent、内容提取）
- **v0.8.0+1**（2025-12-29）：初始 Fork，添加语义嵌入

详细版本历史请查看 [HANDOVER.md](./HANDOVER.md)。

## 许可证

MIT 许可证 - 详情请查看 [LICENSE](./LICENSE) 文件。

## 链接

- [SearXNG 文档](https://docs.searxng.org)
- [MCP 协议](https://modelcontextprotocol.io/introduction)
- [Ollama 文档](https://ollama.com)
- [详细配置](./CONFIGURATION.md)
- [项目交接文档](./HANDOVER.md)
