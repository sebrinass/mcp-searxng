import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
  informationSummary?: string;
  searchedKeywords?: string[];
}

export class ResearchServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};

  public processThought(input: ThoughtData): { content: Array<{ type: "text"; text: string }>; isError?: boolean } {
    try {
      if (input.thoughtNumber > input.totalThoughts) {
        input.totalThoughts = input.thoughtNumber;
      }

      this.thoughtHistory.push(input);

      if (input.branchFromThought && input.branchId) {
        if (!this.branches[input.branchId]) {
          this.branches[input.branchId] = [];
        }
        this.branches[input.branchId].push(input);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            thoughtNumber: input.thoughtNumber,
            totalThoughts: input.totalThoughts,
            nextThoughtNeeded: input.nextThoughtNeeded,
            branches: Object.keys(this.branches),
            thoughtHistoryLength: this.thoughtHistory.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

export const RESEARCH_TOOL: Tool = {
  name: "research",
  description: `通过结构化的思考步骤，引导使用 search 和 read 工具
核心原则：1. 知识可能过时2. 结构化思考3. 信息足够时停止4. 不编造信息5. 工具单次调用
迭代策略：1.宽泛搜索，获取概览2.根据结果，缩小范围3.深入细节，补充信息4. 信息不足就继续搜索`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "number",
        description: "Current thought number (numeric value, e.g., 1, 2, 3)"
      },
      totalThoughts: {
        type: "number",
        description: "Estimated total thoughts needed (numeric value, e.g., 5, 10)"
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "number",
        description: "Which thought is being reconsidered"
      },
      branchFromThought: {
        type: "number",
        description: "Branching point thought number"
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      },
      informationSummary: {
        type: "string",
        description: "【必填 - 本步骤的唯一证据栏】仅填写直接支撑上述结论的最新、最具体信息。必须源自本步骤前刚执行的行动（如 `read` 或 `search`）。格式应为：'关键发现：[具体事实、数据或原文引用]。' 严禁复述之前步骤已提交的信息。"
      },
      searchedKeywords: {
        type: "array",
        items: {
          type: "string"
        },
        description: "【必填】本次调用前已经搜索过的关键词列表。用于避免重复搜索相同或相似的内容。每次调用search工具后，应在下一次调用时将新的搜索词添加到此列表中。AI通过对话历史自动维护完整的搜索词列表。如果是第一次调用且尚未搜索，填写['无']。"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts", "informationSummary", "searchedKeywords"]
  }
};
