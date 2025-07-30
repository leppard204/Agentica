export declare const springService: {
    createProject({ name, description, industry }: {
        name: string;
        description: string;
        industry: string;
    }): Promise<any>;
    listProjects(): Promise<any>;
    createLead({ companyName, industry, contactEmail, contactName }: {
        companyName: string;
        industry: string;
        contactEmail: string;
        contactName?: string;
    }): Promise<any>;
    listLeads(): Promise<any>;
    autoConnectLeads(projectId: number): Promise<any>;
    getProjectById(projectId: number): Promise<any>;
    getLeadById(leadId: number): Promise<any>;
    saveEmail(projectId: number, leadId: number, subject: string, body: string): Promise<any>;
    submitFeedback({ emailId, feedbackText }: {
        emailId: number;
        feedbackText: string;
    }): Promise<any>;
};
