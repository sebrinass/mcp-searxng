interface SearchCacheEntry {
    results: Array<{
        title: string;
        content: string;
        url: string;
        score: number;
    }>;
    timestamp: number;
    hits: number;
}
declare class LinkDeduplication {
    private seenUrls;
    private readonly maxUrls;
    isDuplicate(url: string): boolean;
    addUrls(urls: string[]): void;
    clear(): void;
    getStats(): {
        size: number;
        maxSize: number;
    };
}
declare class SessionDeduplication {
    private recentSearches;
    private readonly maxRecentSearches;
    private readonly dedupWindowMs;
    private getCacheKey;
    isDuplicate(query: string): boolean;
    getDuplicateResult(query: string): SearchCacheEntry['results'] | null;
    markSearched(query: string, results: SearchCacheEntry['results'] | null): void;
    private findOldestKey;
    clear(): void;
    getStats(): {
        size: number;
        maxSize: number;
    };
}
declare class SemanticSearchCache {
    private semanticCache;
    private readonly maxEntries;
    private readonly similarityThreshold;
    private readonly ttlMs;
    private getCacheKey;
    private isExpired;
    findSimilar(query: string): Promise<SearchCacheEntry['results'] | null>;
    set(query: string, results: SearchCacheEntry['results']): Promise<void>;
    clear(): void;
    getStats(): {
        size: number;
        maxSize: number;
    };
}
declare class UrlMemoryCache {
    private urlCache;
    private config;
    private totalSize;
    private shouldEvict;
    private evictOldest;
    private isExpired;
    get(url: string): {
        htmlContent: string;
        markdownContent: string;
    } | null;
    set(url: string, htmlContent: string, markdownContent: string): void;
    clear(): void;
}
declare class MemoryCache {
    private searchCache;
    private embeddingCache;
    private config;
    private totalSize;
    private getCacheKey;
    private shouldEvict;
    private evictOldest;
    private isExpired;
    getSearch(query: string): SearchCacheEntry | null;
    setSearch(query: string, results: SearchCacheEntry['results']): void;
    getEmbedding(text: string): number[] | null;
    setEmbedding(text: string, embedding: number[]): void;
    clear(): void;
    getStats(): {
        searchSize: number;
        embeddingSize: number;
        totalSize: number;
        hits: number;
    };
}
export declare const urlCache: UrlMemoryCache;
export declare const cache: MemoryCache;
export declare const sessionDedup: SessionDeduplication;
export declare const linkDedup: LinkDeduplication;
export declare function getCachedEmbedding(text: string): number[] | null;
export declare function setCachedEmbedding(text: string, embedding: number[]): void;
export declare function getCachedSearch(query: string): SearchCacheEntry | null;
export declare function setCachedSearch(query: string, results: SearchCacheEntry['results']): void;
export declare function isSearchDuplicate(query: string): boolean;
export declare function getDuplicateSearchResult(query: string): SearchCacheEntry['results'] | null;
export declare function markSearchPerformed(query: string, results: SearchCacheEntry['results'] | null): void;
export declare function clearSessionDedup(): void;
export declare function getSessionDedupStats(): ReturnType<typeof sessionDedup.getStats>;
export declare function clearCache(): void;
export declare function getCacheStats(): ReturnType<typeof cache.getStats>;
export declare const semanticCache: SemanticSearchCache;
export declare function findSimilarSearch(query: string): Promise<SearchCacheEntry['results'] | null>;
export declare function setSimilarSearch(query: string, results: SearchCacheEntry['results']): Promise<void>;
export declare function clearSemanticCache(): void;
export declare function getSemanticCacheStats(): ReturnType<typeof semanticCache.getStats>;
export declare function isLinkDuplicate(url: string): boolean;
export declare function addLinksToDedup(urls: string[]): void;
export declare function clearLinkDedup(): void;
export declare function getLinkDedupStats(): ReturnType<typeof linkDedup.getStats>;
export {};
