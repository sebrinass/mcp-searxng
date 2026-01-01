/**
 * Concise error handling for MCP SearXNG server
 * Provides clear, focused error messages that identify the root cause
 */
export class MCPSearXNGError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MCPSearXNGError';
    }
}
export function createConfigurationError(message) {
    return new MCPSearXNGError(`🔧 Configuration Error: ${message}`);
}
export function createNetworkError(error, context) {
    const target = context.searxngUrl ? 'SearXNG server' : 'website';
    if (error.code === 'ECONNREFUSED') {
        return new MCPSearXNGError(`🌐 Connection Error: ${target} is not responding (${context.url})`);
    }
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_NONAME') {
        const hostname = context.url ? new URL(context.url).hostname : 'unknown';
        return new MCPSearXNGError(`🌐 DNS Error: Cannot resolve hostname "${hostname}"`);
    }
    if (error.code === 'ETIMEDOUT') {
        return new MCPSearXNGError(`🌐 Timeout Error: ${target} is too slow to respond`);
    }
    if (error.message?.includes('certificate')) {
        return new MCPSearXNGError(`🌐 SSL Error: Certificate problem with ${target}`);
    }
    // For generic fetch failures, provide root cause guidance
    const errorMsg = error.message || error.code || 'Connection failed';
    if (errorMsg === 'fetch failed' || errorMsg === 'Connection failed') {
        const guidance = context.searxngUrl
            ? 'Check if the SEARXNG_URL is correct and the SearXNG server is available'
            : 'Check if the website URL is accessible';
        return new MCPSearXNGError(`🌐 Network Error: ${errorMsg}. ${guidance}`);
    }
    return new MCPSearXNGError(`🌐 Network Error: ${errorMsg}`);
}
export function createServerError(status, statusText, responseBody, context) {
    const target = context.searxngUrl ? 'SearXNG server' : 'Website';
    if (status === 403) {
        const reason = context.searxngUrl ? 'Authentication required or IP blocked' : 'Access blocked (bot detection or geo-restriction)';
        return new MCPSearXNGError(`🚫 ${target} Error (${status}): ${reason}`);
    }
    if (status === 404) {
        const reason = context.searxngUrl ? 'Search endpoint not found' : 'Page not found';
        return new MCPSearXNGError(`🚫 ${target} Error (${status}): ${reason}`);
    }
    if (status === 429) {
        return new MCPSearXNGError(`🚫 ${target} Error (${status}): Rate limit exceeded`);
    }
    if (status >= 500) {
        return new MCPSearXNGError(`🚫 ${target} Error (${status}): Internal server error`);
    }
    return new MCPSearXNGError(`🚫 ${target} Error (${status}): ${statusText}`);
}
export function createJSONError(responseText, context) {
    const preview = responseText.substring(0, 100).replace(/\n/g, ' ');
    return new MCPSearXNGError(`🔍 SearXNG Response Error: Invalid JSON format. Response: "${preview}..."`);
}
export function createDataError(data, context) {
    return new MCPSearXNGError(`🔍 SearXNG Data Error: Missing results array in response`);
}
export function createNoResultsMessage(query) {
    return `🔍 No results found for "${query}". Try different search terms or check if SearXNG search engines are working.`;
}
export function createURLFormatError(url) {
    return new MCPSearXNGError(`🔧 URL Format Error: Invalid URL "${url}"`);
}
export function createContentError(message, url) {
    return new MCPSearXNGError(`📄 Content Error: ${message} (${url})`);
}
export function createConversionError(error, url, htmlContent) {
    return new MCPSearXNGError(`🔄 Conversion Error: Cannot convert HTML to Markdown (${url})`);
}
export function createTimeoutError(timeout, url) {
    const hostname = new URL(url).hostname;
    return new MCPSearXNGError(`⏱️ Timeout Error: ${hostname} took longer than ${timeout}ms to respond`);
}
export function createEmptyContentWarning(url, htmlLength, htmlPreview) {
    return `📄 Content Warning: Page fetched but appears empty after conversion (${url}). May contain only media or require JavaScript.`;
}
export function createUnexpectedError(error, context) {
    return new MCPSearXNGError(`❓ Unexpected Error: ${error.message || String(error)}`);
}
export function validateEnvironment() {
    const issues = [];
    const searxngUrl = process.env.SEARXNG_URL;
    if (!searxngUrl) {
        issues.push("SEARXNG_URL not set");
    }
    else {
        try {
            const url = new URL(searxngUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
                issues.push(`SEARXNG_URL invalid protocol: ${url.protocol}`);
            }
        }
        catch (error) {
            issues.push(`SEARXNG_URL invalid format: ${searxngUrl}`);
        }
    }
    const authUsername = process.env.AUTH_USERNAME;
    const authPassword = process.env.AUTH_PASSWORD;
    if (authUsername && !authPassword) {
        issues.push("AUTH_USERNAME set but AUTH_PASSWORD missing");
    }
    else if (!authUsername && authPassword) {
        issues.push("AUTH_PASSWORD set but AUTH_USERNAME missing");
    }
    if (issues.length === 0) {
        return null;
    }
    return `⚠️ Configuration Issues: ${issues.join(', ')}. Set SEARXNG_URL (e.g., http://localhost:8080 or https://search.example.com)`;
}
