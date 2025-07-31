export declare function createLead({ userPrompt }: {
    userPrompt: string;
}): Promise<{
    status: string;
    data: any;
} | {
    status: string;
    error: string;
}>;
export declare function autoConnectLeads({ userPrompt }: {
    userPrompt: string;
}): Promise<{
    status: string;
    data: any;
} | {
    status: string;
    error: string;
}>;
export declare function listLeads(): Promise<any>;
