export interface ThoughtData {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    isRevision?: boolean;
    revisesThought?: number;
    branchFromThought?: number;
    branchId?: string;
    needsMoreThoughts?: boolean;
    nextThoughtNeeded: boolean;
}
export declare class ResearchServer {
    private thoughtHistory;
    private branches;
    private disableThoughtLogging;
    constructor();
    private formatThought;
    processThought(input: ThoughtData): {
        content: Array<{
            type: "text";
            text: string;
        }>;
        isError?: boolean;
    };
}
