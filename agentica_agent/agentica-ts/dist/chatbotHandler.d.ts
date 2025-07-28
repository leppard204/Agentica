export declare function analyzePromptAI(prompt: string): Promise<any>;
export declare function chatbotHandler(prompt: string): Promise<import("./types/index.js").Project | import("./types/index.js").EmailResult | import("./types/index.js").Project[] | import("./types/index.js").Lead[] | {
    issues: string[];
    suggestions: string[];
    priority: "high" | "medium" | "low";
} | {
    action: "regenerate" | "improve";
    newEmail: import("./types/index.js").EmailResult;
    analysis: {
        issues: string[];
        suggestions: string[];
        priority: string;
    };
    improvements: string[];
    message: string;
} | {
    type: string;
    projectId: number;
    totalLeads: number;
    successCount: number;
    errorCount: number;
    emails: Array<{
        lead: import("./types/index.js").Lead;
        email: import("./types/index.js").EmailResult;
        status: string;
        leadIndex: number;
        error?: string;
    }>;
}>;
