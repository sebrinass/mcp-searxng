export function isSearXNGWebSearchArgs(args) {
    return (typeof args === "object" &&
        args !== null &&
        "query" in args &&
        typeof args.query === "string");
}
export const WEB_SEARCH_TOOL = {
    name: "search",
    description: "Web search using SearXNG API with intelligent caching and semantic reranking.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The search query. This is the main input for the web search",
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
                description: "Language code for search results (e.g., 'en', 'fr', 'de'). Default is instance-dependent.",
                default: "all",
            },
            safesearch: {
                type: "string",
                description: "Safe search filter level (0: None, 1: Moderate, 2: Strict)",
                enum: ["0", "1", "2"],
                default: "0",
            },
        },
        required: ["query"],
    },
};
export const READ_URL_TOOL = {
    name: "read",
    description: "Read URL content and convert to Markdown with content extraction.",
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
export function isWebUrlReadArgs(args) {
    return (typeof args === "object" &&
        args !== null &&
        (("url" in args && typeof args.url === "string") ||
            ("urls" in args && Array.isArray(args.urls))));
}
