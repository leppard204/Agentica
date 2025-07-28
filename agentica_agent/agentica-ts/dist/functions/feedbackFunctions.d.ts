export declare function summarizeFeedback(this: any, params: {
    feedbackText: string;
    projectId: number;
    leadId: number;
    emailId: number;
}): Promise<{
    summary: string;
    responseType: string;
    status: string;
}>;
