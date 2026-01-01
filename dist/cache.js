import { loadConfig } from './config.js';
import { getEmbedding, cosineSimilarity, calculateBM25 } from './embedding.js';
class SessionDeduplication {
    recentSearches = new Map();
    maxRecentSearches = 100;
    dedupWindowMs = 5 * 60 * 1000;
    getCacheKey(text) {
        return text.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
    }
    isDuplicate(query) {
        const key = this.getCacheKey(query);
        const entry = this.recentSearches.get(key);
        if (!entry) {
            return false;
        }
        const isWithinWindow = Date.now() - entry.timestamp < this.dedupWindowMs;
        if (isWithinWindow) {
            return true;
        }
        else {
            this.recentSearches.delete(key);
            return false;
        }
    }
    getDuplicateResult(query) {
        const key = this.getCacheKey(query);
        const entry = this.recentSearches.get(key);
        if (!entry) {
            return null;
        }
        const isWithinWindow = Date.now() - entry.timestamp < this.dedupWindowMs;
        if (isWithinWindow && entry.results) {
            return entry.results;
        }
        if (!isWithinWindow) {
            this.recentSearches.delete(key);
        }
        return null;
    }
    markSearched(query, results) {
        const key = this.getCacheKey(query);
        this.recentSearches.set(key, {
            timestamp: Date.now(),
            results
        });
        while (this.recentSearches.size > this.maxRecentSearches) {
            const oldestKey = this.findOldestKey();
            if (oldestKey) {
                this.recentSearches.delete(oldestKey);
            }
        }
    }
    findOldestKey() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.recentSearches) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    clear() {
        this.recentSearches.clear();
    }
    getStats() {
        return {
            size: this.recentSearches.size,
            maxSize: this.maxRecentSearches
        };
    }
}
class SemanticSearchCache {
    semanticCache = new Map();
    maxEntries = 50;
    similarityThreshold = 0.95;
    ttlMs = 30 * 60 * 1000;
    getCacheKey(text) {
        return text.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
    }
    isExpired(timestamp) {
        return Date.now() - timestamp > this.ttlMs;
    }
    async findSimilar(query) {
        const config = loadConfig();
        if (!config.embedding.enabled) {
            return null;
        }
        const queryEmbedding = await getEmbedding(query);
        if (queryEmbedding.length === 0) {
            return null;
        }
        const cachedDocuments = Array.from(this.semanticCache.entries())
            .filter(([key, entry]) => !this.isExpired(entry.timestamp))
            .map(([key, entry]) => entry.query);
        let bestMatch = null;
        let bestSimilarity = this.similarityThreshold;
        for (const [key, entry] of this.semanticCache) {
            if (this.isExpired(entry.timestamp)) {
                this.semanticCache.delete(key);
                continue;
            }
            if (!entry.embedding || entry.embedding.length !== queryEmbedding.length) {
                continue;
            }
            const bm25Score = calculateBM25(query, entry.query, cachedDocuments);
            const embeddingScore = cosineSimilarity(queryEmbedding, entry.embedding);
            const hybridScore = 0.7 * bm25Score + 0.3 * embeddingScore;
            if (hybridScore > bestSimilarity) {
                bestSimilarity = hybridScore;
                bestMatch = { key, similarity: hybridScore, entry };
            }
        }
        if (bestMatch) {
            bestMatch.entry.timestamp = Date.now();
            return bestMatch.entry.results;
        }
        return null;
    }
    async set(query, results) {
        const config = loadConfig();
        if (!config.embedding.enabled) {
            return;
        }
        const queryEmbedding = await getEmbedding(query);
        if (queryEmbedding.length === 0) {
            return;
        }
        const cacheKey = this.getCacheKey(query);
        if (this.semanticCache.has(cacheKey)) {
            const entry = this.semanticCache.get(cacheKey);
            entry.query = query;
            entry.embedding = queryEmbedding;
            entry.results = results;
            entry.timestamp = Date.now();
            return;
        }
        while (this.semanticCache.size >= this.maxEntries) {
            let oldestKey = null;
            let oldestTime = Infinity;
            for (const [key, entry] of this.semanticCache) {
                if (entry.timestamp < oldestTime) {
                    oldestTime = entry.timestamp;
                    oldestKey = key;
                }
            }
            if (oldestKey) {
                this.semanticCache.delete(oldestKey);
            }
            else {
                break;
            }
        }
        if (this.semanticCache.size < this.maxEntries) {
            this.semanticCache.set(cacheKey, {
                query,
                embedding: queryEmbedding,
                results,
                timestamp: Date.now()
            });
        }
    }
    clear() {
        this.semanticCache.clear();
    }
    getStats() {
        return {
            size: this.semanticCache.size,
            maxSize: this.maxEntries
        };
    }
}
class UrlMemoryCache {
    urlCache = new Map();
    config = loadConfig().cache;
    totalSize = 0;
    shouldEvict() {
        return this.totalSize > this.config.maxSize;
    }
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.urlCache) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.urlCache.delete(oldestKey);
            this.totalSize -= 1;
        }
    }
    isExpired(timestamp) {
        return Date.now() - timestamp > this.config.ttl * 1000;
    }
    get(url) {
        if (!this.config.enabled) {
            return null;
        }
        const entry = this.urlCache.get(url);
        if (!entry) {
            return null;
        }
        if (this.isExpired(entry.timestamp)) {
            this.urlCache.delete(url);
            this.totalSize -= 1;
            return null;
        }
        return {
            htmlContent: entry.htmlContent,
            markdownContent: entry.markdownContent
        };
    }
    set(url, htmlContent, markdownContent) {
        if (!this.config.enabled) {
            return;
        }
        if (this.urlCache.has(url)) {
            const entry = this.urlCache.get(url);
            entry.htmlContent = htmlContent;
            entry.markdownContent = markdownContent;
            entry.timestamp = Date.now();
            return;
        }
        while (this.shouldEvict() && this.totalSize > 0) {
            this.evictOldest();
        }
        if (this.totalSize < this.config.maxSize) {
            this.urlCache.set(url, {
                htmlContent,
                markdownContent,
                timestamp: Date.now()
            });
            this.totalSize += 1;
        }
    }
    clear() {
        this.urlCache.clear();
        this.totalSize = 0;
    }
}
class MemoryCache {
    searchCache = new Map();
    embeddingCache = new Map();
    config = loadConfig().cache;
    totalSize = 0;
    getCacheKey(text) {
        return text.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
    }
    shouldEvict() {
        return this.totalSize > this.config.maxSize;
    }
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        let minHits = Infinity;
        let evictKey = null;
        for (const [key, entry] of this.searchCache) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
            if (entry.hits < minHits) {
                minHits = entry.hits;
                evictKey = key;
            }
        }
        for (const [key, entry] of this.embeddingCache) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
            if (entry.hits < minHits) {
                minHits = entry.hits;
                evictKey = key;
            }
        }
        if (evictKey) {
            if (this.searchCache.has(evictKey)) {
                this.searchCache.delete(evictKey);
                this.totalSize -= 1;
            }
            else if (this.embeddingCache.has(evictKey)) {
                this.embeddingCache.delete(evictKey);
                this.totalSize -= 1;
            }
        }
    }
    isExpired(timestamp) {
        return Date.now() - timestamp > this.config.ttl * 1000;
    }
    getSearch(query) {
        if (!this.config.enabled || !this.config.searchEnabled) {
            return null;
        }
        const key = this.getCacheKey(query);
        const entry = this.searchCache.get(key);
        if (!entry) {
            return null;
        }
        if (this.isExpired(entry.timestamp)) {
            this.searchCache.delete(key);
            this.totalSize -= 1;
            return null;
        }
        entry.hits += 1;
        return entry;
    }
    setSearch(query, results) {
        if (!this.config.enabled || !this.config.searchEnabled) {
            return;
        }
        const key = this.getCacheKey(query);
        if (this.searchCache.has(key)) {
            const entry = this.searchCache.get(key);
            entry.results = results;
            entry.timestamp = Date.now();
            entry.hits += 1;
            return;
        }
        while (this.shouldEvict() && this.totalSize > 0) {
            this.evictOldest();
        }
        if (this.totalSize < this.config.maxSize) {
            this.searchCache.set(key, {
                results,
                timestamp: Date.now(),
                hits: 1,
            });
            this.totalSize += 1;
        }
    }
    getEmbedding(text) {
        if (!this.config.enabled || !this.config.embeddingEnabled) {
            return null;
        }
        const key = this.getCacheKey(text);
        const entry = this.embeddingCache.get(key);
        if (!entry) {
            return null;
        }
        if (this.isExpired(entry.timestamp)) {
            this.embeddingCache.delete(key);
            this.totalSize -= 1;
            return null;
        }
        entry.hits += 1;
        return entry.data;
    }
    setEmbedding(text, embedding) {
        if (!this.config.enabled || !this.config.embeddingEnabled) {
            return;
        }
        const key = this.getCacheKey(text);
        if (this.embeddingCache.has(key)) {
            const entry = this.embeddingCache.get(key);
            entry.data = embedding;
            entry.timestamp = Date.now();
            entry.hits += 1;
            return;
        }
        while (this.shouldEvict() && this.totalSize > 0) {
            this.evictOldest();
        }
        if (this.totalSize < this.config.maxSize) {
            this.embeddingCache.set(key, {
                data: embedding,
                timestamp: Date.now(),
                hits: 1,
            });
            this.totalSize += 1;
        }
    }
    clear() {
        this.searchCache.clear();
        this.embeddingCache.clear();
        this.totalSize = 0;
    }
    getStats() {
        let totalHits = 0;
        for (const entry of this.searchCache.values()) {
            totalHits += entry.hits;
        }
        for (const entry of this.embeddingCache.values()) {
            totalHits += entry.hits;
        }
        return {
            searchSize: this.searchCache.size,
            embeddingSize: this.embeddingCache.size,
            totalSize: this.totalSize,
            hits: totalHits,
        };
    }
}
export const urlCache = new UrlMemoryCache();
export const cache = new MemoryCache();
export const sessionDedup = new SessionDeduplication();
export function getCachedEmbedding(text) {
    return cache.getEmbedding(text);
}
export function setCachedEmbedding(text, embedding) {
    cache.setEmbedding(text, embedding);
}
export function getCachedSearch(query) {
    return cache.getSearch(query);
}
export function setCachedSearch(query, results) {
    cache.setSearch(query, results);
}
export function isSearchDuplicate(query) {
    return sessionDedup.isDuplicate(query);
}
export function getDuplicateSearchResult(query) {
    return sessionDedup.getDuplicateResult(query);
}
export function markSearchPerformed(query, results) {
    sessionDedup.markSearched(query, results);
}
export function clearSessionDedup() {
    sessionDedup.clear();
}
export function getSessionDedupStats() {
    return sessionDedup.getStats();
}
export function clearCache() {
    cache.clear();
}
export function getCacheStats() {
    return cache.getStats();
}
export const semanticCache = new SemanticSearchCache();
export async function findSimilarSearch(query) {
    return semanticCache.findSimilar(query);
}
export async function setSimilarSearch(query, results) {
    return semanticCache.set(query, results);
}
export function clearSemanticCache() {
    semanticCache.clear();
}
export function getSemanticCacheStats() {
    return semanticCache.getStats();
}
