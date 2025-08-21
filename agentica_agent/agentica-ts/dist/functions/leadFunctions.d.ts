import { Lead } from '../types/index.js';
export declare function createLead({ userPrompt }: {
    userPrompt: string;
}): Promise<{
    status: string;
    error: string;
    lead?: undefined;
} | {
    lead: Lead;
    status?: undefined;
    error?: undefined;
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
