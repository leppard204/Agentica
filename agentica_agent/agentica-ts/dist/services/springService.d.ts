import type { Project, Lead, Email, Feedback } from '../types/index.js';
export declare class SpringService {
    createProject(project: Partial<Project>): Promise<Project>;
    getAllProjects(): Promise<Project[]>;
    getProjectById(id: number): Promise<Project>;
    createLead(lead: Partial<Lead>): Promise<Lead>;
    getAllLeads(): Promise<Lead[]>;
    getLeadById(id: number): Promise<Lead>;
    autoConnectLeads(projectId: number): Promise<Lead[]>;
    saveEmail(projectId: number, leadId: number, subject: string, body: string): Promise<Email>;
    getLatestEmail(projectId: number, leadId: number): Promise<Email | null>;
    saveFeedback(projectId: number, leadId: number, emailId: number, summary: string, responseType: string): Promise<Feedback>;
    getLatestFeedback(emailId: number): Promise<Feedback | null>;
    sendEmail(emailId: number): Promise<string>;
}
export declare const springService: SpringService;
