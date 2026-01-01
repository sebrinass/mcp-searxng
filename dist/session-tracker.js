class SessionTracker {
    sessions = new Map();
    globalCache;
    maxTrackedQueries = 20;
    maxTrackedUrls = 50;
    maxResultsCacheSize = 100;
    maxContentCacheSize = 200;
    sessionCleanupIntervalMs = 30 * 60 * 1000;
    maxSessionAgeMs = 60 * 60 * 1000;
    constructor() {
        this.globalCache = {
            searchResultsCache: new Map(),
            urlContentCache: new Map(),
        };
        setInterval(() => this.cleanupOldSessions(), this.sessionCleanupIntervalMs);
    }
    getOrCreateSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                searchRound: 0,
                urlReadRound: 0,
                totalSearches: 0,
                totalUrlsRead: 0,
                searchedQueries: [],
                readUrls: [],
                sessionStartTime: Date.now(),
            });
        }
        return this.sessions.get(sessionId);
    }
    cleanupOldSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.sessionStartTime > this.maxSessionAgeMs) {
                this.sessions.delete(sessionId);
            }
        }
    }
    incrementSearchRound(sessionId) {
        const session = this.getOrCreateSession(sessionId);
        session.searchRound += 1;
    }
    incrementUrlReadRound(sessionId) {
        const session = this.getOrCreateSession(sessionId);
        session.urlReadRound += 1;
    }
    recordSearch(sessionId, query) {
        const session = this.getOrCreateSession(sessionId);
        session.totalSearches += 1;
        const normalizedQuery = query.toLowerCase().trim().slice(0, 100);
        if (!session.searchedQueries.includes(normalizedQuery)) {
            session.searchedQueries.unshift(normalizedQuery);
            while (session.searchedQueries.length > this.maxTrackedQueries) {
                session.searchedQueries.pop();
            }
        }
    }
    recordUrlRead(sessionId, url) {
        const session = this.getOrCreateSession(sessionId);
        session.totalUrlsRead += 1;
        if (!session.readUrls.includes(url)) {
            session.readUrls.unshift(url);
            while (session.readUrls.length > this.maxTrackedUrls) {
                session.readUrls.pop();
            }
        }
    }
    cacheSearchResults(query, results) {
        const key = query.toLowerCase().trim().slice(0, 100);
        while (this.globalCache.searchResultsCache.size >= this.maxResultsCacheSize) {
            const iteratorResult = this.globalCache.searchResultsCache.keys().next();
            if (iteratorResult.done)
                break;
            const firstKey = iteratorResult.value;
            this.globalCache.searchResultsCache.delete(firstKey);
        }
        this.globalCache.searchResultsCache.set(key, results);
    }
    cacheUrlContent(url, content) {
        while (this.globalCache.urlContentCache.size >= this.maxContentCacheSize) {
            const iteratorResult = this.globalCache.urlContentCache.keys().next();
            if (iteratorResult.done)
                break;
            const firstKey = iteratorResult.value;
            this.globalCache.urlContentCache.delete(firstKey);
        }
        this.globalCache.urlContentCache.set(url, content);
    }
    getContext(sessionId) {
        return { ...this.getOrCreateSession(sessionId) };
    }
    getSearchContext(sessionId) {
        const session = this.getOrCreateSession(sessionId);
        const { searchRound, totalSearches, searchedQueries } = session;
        let contextText = `【搜索进度】第 ${searchRound} 轮搜索，已完成 ${totalSearches} 次搜索\n`;
        if (searchedQueries.length > 0) {
            contextText += `【已搜索】${searchedQueries.slice(0, 5).join('、')}`;
            if (searchedQueries.length > 5) {
                contextText += ` 等${searchedQueries.length}个`;
            }
        }
        return contextText;
    }
    getUrlReadContext(sessionId) {
        const session = this.getOrCreateSession(sessionId);
        const { urlReadRound, totalUrlsRead, readUrls } = session;
        let contextText = `【阅读进度】第 ${urlReadRound} 轮阅读，已读取 ${totalUrlsRead} 个页面\n`;
        if (readUrls.length > 0) {
            contextText += `【已阅读】${readUrls.slice(0, 3).join('、')}`;
            if (readUrls.length > 3) {
                contextText += ` 等${readUrls.length}个`;
            }
        }
        return contextText;
    }
    getDetailedCacheHint(sessionId, query) {
        const session = this.getOrCreateSession(sessionId);
        const { searchedQueries, readUrls } = session;
        const normalizedQuery = query.toLowerCase().trim();
        let hints = [];
        let foundSearch = false;
        let foundUrl = false;
        for (const searched of searchedQueries) {
            if (!foundSearch && (searched.includes(normalizedQuery) || normalizedQuery.includes(searched))) {
                hints.push(`📋 已缓存搜索结果: "${searched}"`);
                foundSearch = true;
                if (this.globalCache.searchResultsCache.has(searched)) {
                    const results = this.globalCache.searchResultsCache.get(searched);
                    const lineCount = (results?.split('\n\n') || []).length;
                    hints.push(`   → 包含 ${lineCount} 条结果，共 ${results?.length || 0} 字符`);
                }
            }
        }
        for (const url of readUrls) {
            if (!foundUrl && (url.includes(normalizedQuery) || normalizedQuery.includes(url))) {
                hints.push(`📄 已缓存页面内容`);
                foundUrl = true;
                if (this.globalCache.urlContentCache.has(url)) {
                    const content = this.globalCache.urlContentCache.get(url);
                    hints.push(`   → ${content?.length || 0} 字符`);
                }
                break;
            }
        }
        if (!foundSearch && !foundUrl) {
            for (const searched of searchedQueries.slice(0, 3)) {
                const similarity = this.calculateStringSimilarity(normalizedQuery, searched);
                if (similarity > 0.6) {
                    hints.push(`💡 相关搜索历史: "${searched}" (相似度: ${(similarity * 100).toFixed(0)}%)`);
                    break;
                }
            }
        }
        return hints.length > 0 ? hints.join('\n') : '';
    }
    calculateStringSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        if (s1 === s2)
            return 1.0;
        if (s1.length === 0 || s2.length === 0)
            return 0.0;
        const words1 = new Set(s1.split(/\s+/));
        const words2 = new Set(s2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        if (union.size === 0)
            return 0.0;
        return intersection.size / union.size;
    }
    getCacheHint(sessionId, query) {
        const session = this.getOrCreateSession(sessionId);
        const { searchedQueries, readUrls } = session;
        const normalizedQuery = query.toLowerCase().trim();
        let hints = [];
        for (const searched of searchedQueries) {
            if (searched.includes(normalizedQuery) || normalizedQuery.includes(searched)) {
                hints.push(`之前搜索过类似问题: "${searched}"`);
                break;
            }
        }
        for (const url of readUrls) {
            if (url.includes(normalizedQuery) || normalizedQuery.includes(url)) {
                hints.push(`之前阅读过相关页面`);
                break;
            }
        }
        return hints.length > 0 ? hints.join('\n') : '';
    }
    getCombinedContext(sessionId) {
        const searchCtx = this.getSearchContext(sessionId);
        const urlCtx = this.getUrlReadContext(sessionId);
        const cacheHint = this.getCacheHint(sessionId, '');
        return [searchCtx, urlCtx, cacheHint].filter(Boolean).join('\n\n');
    }
    getSearchCacheStatus() {
        return {
            size: this.globalCache.searchResultsCache.size,
            maxSize: this.maxResultsCacheSize,
        };
    }
    getUrlCacheStatus() {
        return {
            size: this.globalCache.urlContentCache.size,
            maxSize: this.maxContentCacheSize,
        };
    }
    resetSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    getStats(sessionId) {
        const session = this.getOrCreateSession(sessionId);
        return {
            searches: session.totalSearches,
            urls: session.totalUrlsRead,
            round: session.searchRound,
            uptime: Date.now() - session.sessionStartTime,
            searchCacheSize: this.globalCache.searchResultsCache.size,
            urlCacheSize: this.globalCache.urlContentCache.size,
        };
    }
    getSessionCount() {
        return this.sessions.size;
    }
}
export const sessionTracker = new SessionTracker();
export function getSearchContext(sessionId) {
    return sessionTracker.getSearchContext(sessionId);
}
export function getUrlReadContext(sessionId) {
    return sessionTracker.getUrlReadContext(sessionId);
}
export function getCacheHint(sessionId, query) {
    return sessionTracker.getCacheHint(sessionId, query);
}
export function getDetailedCacheHint(sessionId, query) {
    return sessionTracker.getDetailedCacheHint(sessionId, query);
}
export function getCombinedContext(sessionId) {
    return sessionTracker.getCombinedContext(sessionId);
}
export function incrementSearchRound(sessionId) {
    sessionTracker.incrementSearchRound(sessionId);
}
export function incrementUrlReadRound(sessionId) {
    sessionTracker.incrementUrlReadRound(sessionId);
}
export function recordSearch(sessionId, query) {
    sessionTracker.recordSearch(sessionId, query);
}
export function recordUrlRead(sessionId, url) {
    sessionTracker.recordUrlRead(sessionId, url);
}
export function cacheSearchResults(query, results) {
    sessionTracker.cacheSearchResults(query, results);
}
export function cacheUrlContent(url, content) {
    sessionTracker.cacheUrlContent(url, content);
}
export function resetSession(sessionId) {
    sessionTracker.resetSession(sessionId);
}
export function getSessionStats(sessionId) {
    return sessionTracker.getStats(sessionId);
}
export function getSearchCacheStatus() {
    return sessionTracker.getSearchCacheStatus();
}
export function getUrlCacheStatus() {
    return sessionTracker.getUrlCacheStatus();
}
export function getSessionCount() {
    return sessionTracker.getSessionCount();
}
