import type { Lead, EmailResult } from '../types/index.js';
import type { Email } from '../types/index.js';
export declare function analyzeEmailIssues(this: any, params: {
    emailContent: {
        subject: string;
        body: string;
    };
    userFeedback: string;
}): Promise<{
    issues: string[];
    suggestions: string[];
    priority: 'high' | 'medium' | 'low';
}>;
export declare function regenerateEmailWithFeedback(this: any, params: {
    projectId: number;
    leadInfo: Lead;
    originalEmail: {
        subject: string;
        body: string;
    };
    userFeedback: string;
    emailType?: 'initial' | 'followup';
}): Promise<EmailResult>;
export declare function handleEmailRejection(this: any, params: {
    projectId: number;
    leadInfo: Lead;
    originalEmail: {
        subject: string;
        body: string;
    };
    userFeedback: string;
    emailType?: 'initial' | 'followup';
}): Promise<{
    action: 'regenerate' | 'improve';
    newEmail: EmailResult;
    analysis: {
        issues: string[];
        suggestions: string[];
        priority: string;
    };
    improvements: string[];
    message: string;
}>;
export declare function generateEmailsForMultipleLeads(this: any, params: {
    projectId: number;
    leadInfoList: Lead[];
}): Promise<{
    type: string;
    projectId: number;
    totalLeads: number;
    successCount: number;
    errorCount: number;
    emails: Array<{
        lead: Lead;
        email: EmailResult;
        status: string;
        leadIndex: number;
        error?: string;
    }>;
}>;
export declare function generateInitialEmail(this: any, params: {
    projectId: number;
    leadInfo: Lead;
}): Promise<EmailResult>;
export declare function generateMultipleEmails(this: any, params: {
    projectId: number;
    leads: Lead[];
}): Promise<EmailResult[]>;
export declare function generateFollowupEmail(this: any, params: {
    projectId: number;
    leadId: number;
    feedbackSummary: string;
}): Promise<EmailResult>;
export declare function rewriteEmail(this: any, params: {
    originalSubject: string;
    originalBody: string;
    userFeedback: string;
    projectId: number;
    leadId: number;
}): Promise<EmailResult>;
export declare function getLatestEmailForRewrite(this: any, params: {
    projectId?: number;
    leadId?: number;
}): Promise<Email | null>;
export declare function sendEmail(this: any, params: {
    emailId: number;
}): Promise<{
    status: string;
    message: string;
}>;
export declare function completeEmailWorkflow(this: any, params: {
    projectId: number;
    leadIds: number[];
    autoSend?: boolean;
}): Promise<{
    emailResults: EmailResult[];
    sentEmails: number[];
    errors: string[];
}>;
