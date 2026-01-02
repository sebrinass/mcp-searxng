import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface SearXNGWeb {
  results: Array<{
    title: string;
    content: string;
    url: string;
    score: number;
  }>;
}

export function isSearXNGWebSearchArgs(args: unknown): args is {
  query: string;
  pageno?: number;
  time_range?: string;
  language?: string;
  safesearch?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

export const WEB_SEARCH_TOOL: Tool = {
  name: "search",
  description: "使用 SearXNG 搜索",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "【单实体聚焦搜索】仅针对唯一的核心主体发起查询（支持'是什么'/'定义'/'特征'）。❌ 严禁在单次查询中包含两个及以上不同主体（如禁止搜'A和B的对比'、'A对B的影响'）。✅ 正确抽象示例：'主体A 定义'、'主体B 机制'。⚠️ 必须拆分为单主体关键词，否则搜索结果将为空。"
      },
      pageno: {
        type: "number",
        description: "Search page number (starts at 1)",
        default: 1,
      },
      time_range: {
        type: "string",
        description: "Time range of search (day, month, year)",
        enum: ["day", "month", "year"],
      },
      language: {
        type: "string",
        description:
          "Language code for search results (e.g., 'en', 'fr', 'de'). Default is instance-dependent.",
        default: "all",
      },
      safesearch: {
        type: "string",
        description:
          "Safe search filter level (0: None, 1: Moderate, 2: Strict)",
        enum: ["0", "1", "2"],
        default: "0",
      },
    },
    required: ["query"],
  },
};

export const READ_URL_TOOL: Tool = {
  name: "read",
  description: "读取 URL 的内容",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL to read",
      },
      urls: {
        type: "array",
        items: { type: "string" },
        description: "Array of URLs to read in batch (alternative to single url parameter)",
      },
      startChar: {
        type: "number",
        description: "Starting character position for content extraction (default: 0)",
        minimum: 0,
      },
      maxLength: {
        type: "number",
        description: "Maximum number of characters to return per URL",
        minimum: 1,
      },
      section: {
        type: "string",
        description: "Extract content under a specific heading (searches for heading text)",
      },
      paragraphRange: {
        type: "string",
        description: "Return specific paragraph ranges (e.g., '1-5', '3', '10-')",
      },
      readHeadings: {
        type: "boolean",
        description: "Return only a list of headings instead of full content",
      },
      timeoutMs: {
        type: "number",
        description: "Request timeout in milliseconds (default: 30000, from FETCH_TIMEOUT_MS env var)",
        minimum: 1000,
      },
    },
    required: ["url"],
  },
};

export function isWebUrlReadArgs(args: unknown): args is {
  url?: string;
  urls?: string[];
  startChar?: number;
  maxLength?: number;
  section?: string;
  paragraphRange?: string;
  readHeadings?: boolean;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    (("url" in args && typeof (args as { url?: string }).url === "string") ||
     ("urls" in args && Array.isArray((args as { urls?: string[] }).urls)))
  );
}


