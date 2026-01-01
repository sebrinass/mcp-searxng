import { ProxyAgent } from "undici";
/**
 * Creates a proxy agent dispatcher for Node.js fetch API.
 *
 * Node.js fetch uses Undici under the hood, which requires a 'dispatcher' option
 * instead of 'agent'. This function creates a ProxyAgent compatible with fetch.
 *
 * Environment variables checked (in order):
 * - HTTP_PROXY / http_proxy: For HTTP requests
 * - HTTPS_PROXY / https_proxy: For HTTPS requests
 * - NO_PROXY / no_proxy: Comma-separated list of hosts to bypass proxy
 *
 * @param targetUrl - Optional target URL to check against NO_PROXY rules
 * @returns ProxyAgent dispatcher for fetch, or undefined if no proxy configured or bypassed
 */
export declare function createProxyAgent(targetUrl?: string): ProxyAgent | undefined;
