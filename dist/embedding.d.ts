export interface SearchResult {
    id: string;
    title: string;
    content: string;
    url: string;
    score: number;
}
export interface ScoredResult extends SearchResult {
    embeddingScore: number;
}
export interface SparseResult extends SearchResult {
    sparseScore: number;
}
export interface HybridResult extends SearchResult {
    sparseScore: number;
    denseScore: number;
    hybridScore: number;
}
export declare function calculateBM25(query: string, document: string, documents: string[]): number;
export declare function sparseRetrieve(query: string, documents: {
    id: string;
    content: string;
}[], topK: number): SparseResult[];
export declare function getEmbedding(text: string): Promise<number[]>;
export declare function cosineSimilarity(a: number[], b: number[]): number;
export declare function hybridRetrieve(query: string, documents: {
    id: string;
    title: string;
    content: string;
    url: string;
    score: number;
}[], topK: number, sparseWeight?: number, denseWeight?: number): Promise<HybridResult[]>;
export declare function rerankResults(query: string, results: SearchResult[], useHybrid?: boolean, sparseWeight?: number, denseWeight?: number): Promise<HybridResult[]>;
