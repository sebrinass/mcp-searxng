---
name: "web-research-expert"
description: "专业的网络搜索和内容分析技能，能够使用增强搜索和深度阅读工具完成复杂的研究任务"
version: "1.0.0"
author: "mcp-searxng"
tags: ["research", "search", "web", "content-analysis"]
---

# Web Research Expert Skill

## 技能概述

本技能教导 AI 如何使用 MCP SearXNG 服务器提供的 `search` 和 `read` 工具，高效完成网络研究和内容分析任务。

## 可用工具

### 1. search 工具

**用途**：增强搜索工具，支持结构化思考和并发搜索

**核心参数**：
- `thought`（必填）：描述当前思考步骤
- `searchedKeywords`（必填）：要搜索的关键词数组（最多5个）
- `thoughtNumber`（必填）：当前步骤编号（1, 2, 3...）
- `totalThoughts`（必填）：预计总步骤数
- `nextThoughtNeeded`（必填）：是否需要继续搜索
- `site`（可选）：限制搜索到指定网站

**返回内容**：
- `thoughtStatus`：思考状态（步骤编号、是否继续等）
- `searchResults`：搜索结果列表（每个关键词的结果，包含 URL）

**重要特性**：
- 支持并发搜索多个关键词（最多5个）
- 自动缓存搜索结果
- 搜索结果按相关性排序
- 每个关键词应该是独立的实体

### 2. read 工具

**用途**：深度阅读网页完整内容

**核心参数**：
- `url`（必填）：要读取的网页地址
- `maxLength`（可选）：最大返回字符数（默认3000）
- `section`（可选）：只读取特定标题下的内容
- `readHeadings`（可选）：只返回标题列表

**重要特性**：
- 自动处理 JavaScript 网站
- 提取主要内容
- HTML 转 Markdown
- 支持批量读取多个 URL

## 工作流程

### 阶段 1：规划搜索策略

1. **理解用户需求**
   - 明确研究目标
   - 识别关键信息点
   - 确定搜索范围

2. **制定搜索计划**
   - 预估需要几轮搜索（设置 totalThoughts）
   - 规划每轮搜索的关键词
   - 考虑是否需要限定特定网站

### 阶段 2：执行搜索

1. **第一轮搜索（广泛探索）**
   - 使用 3-5 个核心关键词
   - 设置 `thoughtNumber = 1`
   - 设置 `nextThoughtNeeded = true`
   - 在 `thought` 中描述搜索目的

2. **分析搜索结果**
   - 查看每个关键词的搜索结果
   - 识别高相关性的 URL
   - 判断是否需要进一步搜索

3. **后续搜索（深入挖掘）**
   - 根据第一轮结果调整关键词
   - 如发现权威网站，使用 `site` 参数限定搜索
   - 递增 `thoughtNumber`
   - 根据需要更新 `totalThoughts`

### 阶段 3：深度阅读

1. **选择关键 URL**
   - 优先选择相关性高的结果
   - 关注权威来源
   - 避免重复内容

2. **使用 read 工具**
   - 先用 `readHeadings: true` 查看网页结构
   - 根据需要使用 `section` 参数读取特定章节
   - 调整 `maxLength` 控制内容长度

3. **批量读取**
   - 对于多个相关 URL，使用 `urls` 数组批量读取
   - 提高效率

### 阶段 4：综合分析

1. **整合信息**
   - 汇总搜索和阅读结果
   - 识别关键发现
   - 去除冗余信息

2. **形成结论**
   - 基于证据得出结论
   - 标注信息来源
   - 指出信息局限

## 最佳实践

### 搜索策略

✅ **推荐做法**：
- 每个关键词应该是独立的实体（如："量子计算"、"quantum computing"）
- 使用中英文混合搜索提高覆盖率
- 第一轮搜索使用广泛关键词，后续使用具体关键词
- 发现权威网站后使用 `site` 参数深度挖掘

❌ **避免做法**：
- 不要在单个关键词中组合多个概念
- 不要一次性搜索过多关键词（限制在5个以内）
- 不要忽略搜索结果的相关性评分

### 关键词选择

**第一轮搜索示例**：
```json
{
  "thought": "了解量子计算的基本概念和应用领域",
  "searchedKeywords": ["量子计算", "quantum computing", "量子比特", "quantum applications"],
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}
```

**第二轮搜索示例**（发现权威网站后）：
```json
{
  "thought": "深入了解量子计算在密码学中的应用",
  "searchedKeywords": ["quantum cryptography", "post-quantum", "量子密码"],
  "thoughtNumber": 2,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "site": "https://arxiv.org"
}
```

### 阅读策略

**快速浏览**：
```json
{
  "url": "https://example.com/article",
  "readHeadings": true
}
```

**读取特定章节**：
```json
{
  "url": "https://example.com/article",
  "section": "技术原理",
  "maxLength": 5000
}
```

**批量读取**：
```json
{
  "urls": [
    "https://example.com/article1",
    "https://example.com/article2",
    "https://example.com/article3"
  ],
  "maxLength": 2000
}
```

## 常见任务模式

### 模式 1：技术调研

1. **第一轮**：搜索技术概述和基本概念
2. **第二轮**：搜索具体实现和案例
3. **第三轮**：搜索最佳实践和常见问题
4. **深度阅读**：选择 3-5 个高质量文档详细阅读

### 模式 2：新闻追踪

1. **第一轮**：搜索最新新闻和动态
2. **第二轮**：使用 `site` 参数搜索权威媒体
3. **深度阅读**：快速浏览多个来源，交叉验证信息

### 模式 3：学术研究

1. **第一轮**：搜索学术论文和研究报告
2. **第二轮**：限定在学术网站搜索（如 arxiv.org, scholar.google.com）
3. **深度阅读**：仔细阅读摘要、方法和结论部分

### 模式 4：产品比较

1. **第一轮**：搜索产品名称和对比
2. **第二轮**：搜索评测和用户反馈
3. **第三轮**：搜索官方文档和技术规格
4. **深度阅读**：重点阅读评测和对比文章

## 性能优化

### 搜索效率

- 合理设置 `totalThoughts`，避免过度搜索
- 利用缓存机制，相同关键词会自动命中缓存
- 优先使用相关性高的搜索结果

### 阅读效率

- 先用 `readHeadings` 了解结构，再决定是否深入阅读
- 合理设置 `maxLength`，避免读取过多无关内容
- 批量读取相关 URL 提高效率

## 错误处理

### 搜索失败

如果搜索返回错误：
1. 检查关键词是否合理
2. 尝试简化关键词
3. 减少关键词数量
4. 检查网络连接

### 阅读失败

如果读取 URL 失败：
1. 尝试读取其他 URL
2. 检查 URL 是否可访问
3. 考虑使用 `maxLength` 限制读取长度

## 信息质量评估

在综合分析时，评估信息质量：

**高可靠性来源**：
- 官方文档和网站
- 学术论文和研究报告
- 知名媒体和专业期刊
- GitHub 仓库和开源项目

**需要验证的来源**：
- 个人博客和论坛
- 社交媒体内容
- 匿名发布的文章

**评估标准**：
- 来源的权威性
- 信息的时效性
- 内容的完整性
- 是否有交叉验证

## 示例对话

**用户**：帮我研究一下 Rust 编程语言的并发模型

**AI（使用本技能）**：

1. **第一轮搜索**：
```
thought: "了解 Rust 并发模型的基本概念"
searchedKeywords: ["Rust concurrency", "Rust 并发", "Rust async", "Rust threads"]
thoughtNumber: 1
totalThoughts: 3
nextThoughtNeeded: true
```

2. **分析结果**：发现官方文档和权威教程

3. **第二轮搜索**：
```
thought: "深入研究 Rust 的所有权和借用规则"
searchedKeywords: ["Rust ownership", "Rust borrowing", "Rust lifetime"]
thoughtNumber: 2
totalThoughts: 3
nextThoughtNeeded: true
site: "https://doc.rust-lang.org"
```

4. **深度阅读**：选择 3-4 个高质量文档详细阅读

5. **第三轮搜索**（如需要）：
```
thought: "查找 Rust 并发的最佳实践和常见陷阱"
searchedKeywords: ["Rust async best practices", "Rust concurrency patterns"]
thoughtNumber: 3
totalThoughts: 3
nextThoughtNeeded: false
```

6. **综合分析**：整理信息，形成完整的回答

## 总结

本技能的核心在于：

1. **结构化思考**：使用 `thoughtNumber` 和 `totalThoughts` 规划搜索过程
2. **并发搜索**：利用 `searchedKeywords` 一次性搜索多个关键词
3. **智能阅读**：根据搜索结果选择性地深度阅读关键内容
4. **持续迭代**：根据每轮搜索结果调整后续策略
5. **质量评估**：评估信息来源的可靠性

通过合理使用 `search` 和 `read` 工具，可以高效完成各种网络研究和内容分析任务。
