export interface QueryAnalysis {
    original: string;
    transformed: string[];
    type: 'single' | 'comparative' | 'relational';
    needsSplit: boolean;
    reason: string;
}
export declare function analyzeQuery(query: string): QueryAnalysis;
export declare function splitComparativeQuery(query: string): string[];
export declare function shouldSplitQuery(query: string): boolean;
export declare function getQueryType(query: string): 'single' | 'comparative' | 'relational';
