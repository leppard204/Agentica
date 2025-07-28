import type { Project } from '../types/index.js';
export declare function extractProjectInfo(this: any, params: {
    prompt: string;
}): Promise<Partial<Project>>;
export declare function listProjects(): Promise<Project[]>;
export declare function createProject(this: any, params: {
    name: string;
    description: string;
    industry: string;
}): Promise<Project>;
