/**
 * Concise error handling for MCP SearXNG server
 * Provides clear, focused error messages that identify the root cause
 */
export interface ErrorContext {
    url?: string;
    searxngUrl?: string;
    proxyAgent?: boolean;
    username?: string;
    timeout?: number;
    query?: string;
}
export declare class MCPSearXNGError extends Error {
    constructor(message: string);
}
export declare function createConfigurationError(message: string): MCPSearXNGError;
export declare function createNetworkError(error: any, context: ErrorContext): MCPSearXNGError;
export declare function createServerError(status: number, statusText: string, responseBody: string, context: ErrorContext): MCPSearXNGError;
export declare function createJSONError(responseText: string, context: ErrorContext): MCPSearXNGError;
export declare function createDataError(data: any, context: ErrorContext): MCPSearXNGError;
export declare function createNoResultsMessage(query: string): string;
export declare function createURLFormatError(url: string): MCPSearXNGError;
export declare function createContentError(message: string, url: string): MCPSearXNGError;
export declare function createConversionError(error: any, url: string, htmlContent: string): MCPSearXNGError;
export declare function createTimeoutError(timeout: number, url: string): MCPSearXNGError;
export declare function createEmptyContentWarning(url: string, htmlLength: number, htmlPreview: string): string;
export declare function createUnexpectedError(error: any, context: ErrorContext): MCPSearXNGError;
export declare function validateEnvironment(): string | null;
