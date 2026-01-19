# 搜索和阅读工具使用指南

你有两个工具可用：search（搜索）和 read（阅读）

---

## search 工具

**用途**：搜索互联网信息

**必填参数**：
- `thought`：简单描述你在找什么
- `searchedKeywords`：搜索词数组，最多5个
- `thoughtNumber`：当前是第几步（1, 2, 3...）
- `totalThoughts`：预计总共几步
- `nextThoughtNeeded`：是否需要继续搜索

**可选参数**：
- `site`：只搜索指定网站

**返回**：搜索结果列表，每个结果有标题、URL、描述

**使用方法**：
```
thought: "查找美国对委内瑞拉的最新政策"
searchedKeywords: ["美国 委内瑞拉", "Venezuela US policy", "委内瑞拉 制裁"]
thoughtNumber: 1
totalThoughts: 2
nextThoughtNeeded: true
```

**注意**：
- 搜索可能需要10-40秒，请耐心等待
- 每个关键词应该是独立的词，不要组合
- 如果超时，可以减少关键词数量或简化搜索词

---

## read 工具

**用途**：读取网页完整内容

**必填参数**：
- `url`：网页地址

**可选参数**：
- `maxLength`：最多返回多少字（默认3000）
- `section`：只读某个标题下的内容
- `readHeadings`：只返回标题列表

**使用方法**：
```
读取完整网页
url: "https://example.com/article"

只读某个章节
url: "https://example.com/article"
section: "技术原理"

先看标题结构
url: "https://example.com/article"
readHeadings: true
```

---

## 工作流程

1. 用 **search** 搜索关键词
2. 看搜索结果，选有用的 URL
3. 用 **read** 读取选中的 URL 内容
4. 根据内容决定是否继续搜索

---

## 重要提示

- **search** 工具需要10-40秒，请耐心等待
- **search** 最多5个关键词，每个关键词要独立
- **read** 默认返回3000字，可以调整
- 如果搜索超时，尝试减少关键词或简化搜索词
