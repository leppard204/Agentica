import type { Lead } from '../types/index.js';
export declare function extractLeadsInfo(this: any, params: {
    prompt: string;
}): Promise<Lead[]>;
export declare function createMultipleLeads(this: any, params: {
    leads: Partial<Lead>[];
}): Promise<Lead[]>;
export declare function listLeads(): Promise<Lead[]>;
export declare function autoConnectLeads(this: any, params: {
    projectId: number;
}): Promise<Lead[]>;
