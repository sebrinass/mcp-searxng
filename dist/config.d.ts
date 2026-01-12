export interface EmbeddingConfig {
    enabled: boolean;
    provider: string;
    host: string;
    apiKey?: string;
    apiEndpoint?: string;
    model: string;
    topK: number;
    chunkSize: number;
    chunkOverlap: number;
}
export interface CacheConfig {
    ttl: number;
    maxSize: number;
    embeddingEnabled: boolean;
    urlEnabled: boolean;
}
export interface FetchConfig {
    timeoutMs: number;
    enableRobotsTxt: boolean;
    blockVideoSites: boolean;
    videoBlocklist: string[];
}
export interface ResearchConfig {
    maxKeywords: number;
    maxDescriptionLength: number;
    searchTimeoutMs: number;
}
export interface Config {
    searxngUrl: string;
    authUsername?: string;
    authPassword?: string;
    userAgent?: string;
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
    embedding: EmbeddingConfig;
    cache: CacheConfig;
    fetch: FetchConfig;
    research: ResearchConfig;
}
export declare function loadConfig(): Config;
export declare function validateConfig(config: Config): string | null;
