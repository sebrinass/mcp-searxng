---
name: web-research-expert
description: Efficiently complete web research and content analysis tasks using search and read tools. Use when the user needs to research topics, find latest information, compare products, or extract content from web pages.
allowed-tools: Bash(mcp-searxng:*)
---

# Web Research Expert Skill

## Quick start

Use `search` and `read` tools together to complete research tasks:

1. Search first: find relevant URLs
2. Read selected URLs: extract detailed content
3. Analyze and summarize

## Search tool

**Purpose**: Find relevant web pages

**Usage**:
```json
{
  "thought": "Describe your research goal",
  "searchedKeywords": ["keyword1", "keyword2", "keyword3"],
  "site": "" // optional, e.g., "https://arxiv.org"
}
```

**Returns**: Search results with URLs and relevance scores

**Tips**:
- Use 3-5 keywords per search
- Mix Chinese and English keywords
- Use `site` parameter to limit to specific website

**Example**:
```json
{
  "thought": "了解量子计算的基本概念",
  "searchedKeywords": ["量子计算", "quantum computing", "quantum applications"]
}
```

## Read tool

**Purpose**: Extract content from web pages

**Usage**:
```json
{
  "url": "https://example.com/article",
  "maxLength": 3000,
  "readHeadings": false,
  "section": "" // optional, e.g., "技术原理"
}
```

**Returns**: Main content extracted from the page

**Tips**:
- Use `readHeadings: true` to see page structure first
- Set `maxLength` lower for faster responses
- Use `section` to read specific chapters

**Example**:
```json
{
  "url": "https://arxiv.org/abs/2301.00001",
  "readHeadings": true
}
```

## Research workflow

### Simple question
1. Search with core keywords
2. Read 1-2 high-relevance URLs
3. Answer based on verified information

### Complex question
1. First round: broad search with 3-5 keywords
2. Analyze results: identify high-relevance URLs
3. Second round: targeted search if needed
4. Read selected URLs in detail
5. Summarize and cite sources

## Common patterns

### Pattern 1: Technical research
1. Search overview
2. Search implementation details
3. Search best practices
4. Read 3-5 high-quality docs

### Pattern 2: News tracking
1. Search latest news
2. Search authoritative sources
3. Cross-verify multiple sources

### Pattern 3: Academic research
1. Search papers and reports
2. Limit to academic sites (site:arxiv.org, site:scholar.google.com)
3. Read abstracts and conclusions

### Pattern 4: Product comparison
1. Search product names and comparisons
2. Search reviews and feedback
3. Search official documentation
4. Read comparison articles

## Keyword strategy

**Good examples**:
- `["量子计算", "quantum computing"]`
- `["GPT-4", "ChatGPT", "large language model"]`
- `["人工智能", "AI", "machine learning"]`

**Avoid**:
- Combining multiple concepts in one keyword
- Too many keywords (max 5)
- Overly broad terms

## URL selection

**Prioritize**:
- High relevance scores (≥0.75)
- Authoritative sources (official docs, academic papers)
- Recent publications for news

**Skip**:
- Low relevance (<0.75)
- Duplicate content
- Suspicious sources

## Information quality

**High reliability**:
- Official documentation
- Academic papers
- Known media outlets
- GitHub repositories

**Verify**:
- Personal blogs
- Social media
- Anonymous posts

## Output format

Always cite sources with links:
```
Answer based on verified information [1][2].

[1] https://example.com/article1
[2] https://example.com/article2
```

## Error handling

**Search fails**:
- Try simpler keywords
- Reduce number of keywords
- Check network connection

**Read fails**:
- Try another URL
- Check if URL is accessible
- Use shorter `maxLength`
