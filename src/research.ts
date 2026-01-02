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
        description: "【必填 - 本步证据快照】仅记录刚刚执行的搜索/阅读步骤中直接获取的具体事实或数据。格式强制为：'关键发现：[引用本轮获取的原文/数据/结论]。' ❌ 严禁复述之前步骤已记录的信息，❌ 严禁依靠模型内部知识编造未搜索到的内容。"
      },
      searchedKeywords: {
        type: "array",
        items: {
          type: "string"
        },
        description: "【单点降维规划】仅规划当前优先级最高的1个独立基础实体。❌ 绝对禁止包含关系/对比/组合型词条（如'A与B的区别'、'A+B组合'）。✅ 必须拆解为原子概念（若需分析A和B的关系，本次仅填'A'，下一轮再填'B'）。原则：一次只锚定一个核心名词。"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts", "informationSummary", "searchedKeywords"]
  }
};
