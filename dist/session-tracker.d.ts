interface SessionContext {
    searchRound: number;
    urlReadRound: number;
    totalSearches: number;
    totalUrlsRead: number;
    searchedQueries: string[];
    readUrls: string[];
    sessionStartTime: number;
}
declare class SessionTracker {
    private sessions;
    private globalCache;
    private readonly maxTrackedQueries;
    private readonly maxTrackedUrls;
    private readonly maxResultsCacheSize;
    private readonly maxContentCacheSize;
    private readonly sessionCleanupIntervalMs;
    private readonly maxSessionAgeMs;
    constructor();
    private getOrCreateSession;
    private cleanupOldSessions;
    incrementSearchRound(sessionId: string): void;
    incrementUrlReadRound(sessionId: string): void;
    recordSearch(sessionId: string, query: string): void;
    recordUrlRead(sessionId: string, url: string): void;
    cacheSearchResults(query: string, results: string): void;
    cacheUrlContent(url: string, content: string): void;
    getContext(sessionId: string): SessionContext;
    getSearchContext(sessionId: string): string;
    getUrlReadContext(sessionId: string): string;
    getDetailedCacheHint(sessionId: string, query: string): string;
    private calculateStringSimilarity;
    getCacheHint(sessionId: string, query: string): string;
    getCombinedContext(sessionId: string): string;
    getSearchCacheStatus(): {
        size: number;
        maxSize: number;
    };
    getUrlCacheStatus(): {
        size: number;
        maxSize: number;
    };
    resetSession(sessionId: string): void;
    getStats(sessionId: string): {
        searches: number;
        urls: number;
        round: number;
        uptime: number;
        searchCacheSize: number;
        urlCacheSize: number;
    };
    getSessionCount(): number;
}
export declare const sessionTracker: SessionTracker;
export declare function getSearchContext(sessionId: string): string;
export declare function getUrlReadContext(sessionId: string): string;
export declare function getCacheHint(sessionId: string, query: string): string;
export declare function getDetailedCacheHint(sessionId: string, query: string): string;
export declare function getCombinedContext(sessionId: string): string;
export declare function incrementSearchRound(sessionId: string): void;
export declare function incrementUrlReadRound(sessionId: string): void;
export declare function recordSearch(sessionId: string, query: string): void;
export declare function recordUrlRead(sessionId: string, url: string): void;
export declare function cacheSearchResults(query: string, results: string): void;
export declare function cacheUrlContent(url: string, content: string): void;
export declare function resetSession(sessionId: string): void;
export declare function getSessionStats(sessionId: string): ReturnType<typeof sessionTracker.getStats>;
export declare function getSearchCacheStatus(): {
    size: number;
    maxSize: number;
};
export declare function getUrlCacheStatus(): {
    size: number;
    maxSize: number;
};
export declare function getSessionCount(): number;
export {};
