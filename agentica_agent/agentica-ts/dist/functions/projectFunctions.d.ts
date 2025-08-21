import { Project } from '../types/index.js';
export declare function createProject({ userPrompt }: {
    userPrompt: string;
}): Promise<{
    status: string;
    error: string;
    project?: undefined;
} | {
    project: Project;
    status?: undefined;
    error?: undefined;
}>;
export declare function listProjects(): Promise<any>;
