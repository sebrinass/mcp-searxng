import { Tool } from "@modelcontextprotocol/sdk/types.js";
export interface SearXNGWeb {
    results: Array<{
        title: string;
        content: string;
        url: string;
        score: number;
    }>;
}
export declare function isSearXNGWebSearchArgs(args: unknown): args is {
    query: string;
    pageno?: number;
    time_range?: string;
    language?: string;
    safesearch?: string;
};
export declare const WEB_SEARCH_TOOL: Tool;
export declare const READ_URL_TOOL: Tool;
export declare function isWebUrlReadArgs(args: unknown): args is {
    url?: string;
    urls?: string[];
    startChar?: number;
    maxLength?: number;
    section?: string;
    paragraphRange?: string;
    readHeadings?: boolean;
};
