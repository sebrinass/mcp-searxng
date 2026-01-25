import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface SearXNGWeb {
  results: Array<{
    title: string;
    content: string;
    url: string;
    score: number;
  }>;
}


export const READ_URL_TOOL: Tool = {
  name: "read",
  description: "读取网页内容并转换为 Markdown 格式",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "单个网页 URL",
      },
      urls: {
        type: "array",
        items: { type: "string" },
        description: "批量网页 URL 列表（与 url 参数二选一）",
      },
      startChar: {
        type: "number",
        description: "内容提取的起始字符位置（默认：0）",
        minimum: 0,
      },
      maxLength: {
        type: "number",
        description: "每个 URL 返回的最大字符数",
        minimum: 1,
      },
      section: {
        type: "string",
        description: "提取特定标题下的内容（搜索标题文本）",
      },
      paragraphRange: {
        type: "string",
        description: "返回特定段落范围（如 '1-5', '3', '10-'）",
      },
      readHeadings: {
        type: "boolean",
        description: "仅返回标题列表而非完整内容",
      },
      timeoutMs: {
        type: "number",
        description: "请求超时时间（毫秒，默认：30000）",
        minimum: 1000,
      },
    },
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


