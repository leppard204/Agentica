export declare function submitFeedback({ userPrompt }: {
    userPrompt: string;
}): Promise<any>;
export declare function summarizeFeedback({ leadName, projectName, subject, body }: {
    leadName: string;
    projectName: string;
    subject: string;
    body: string;
}): Promise<{
    status: string;
    error: string;
    raw: any;
    summary?: undefined;
    responseType?: undefined;
} | {
    status: string;
    summary: any;
    responseType: any;
    error?: undefined;
    raw?: undefined;
}>;
export declare function handleFeedbackSummary({ leadName, projectName, subject, body }: {
    leadName: string;
    projectName: string;
    subject: string;
    body: string;
}): Promise<{
    status: string;
    error: string;
    raw: any;
    summary?: undefined;
    responseType?: undefined;
} | {
    status: string;
    summary: any;
    responseType: any;
    error?: undefined;
    raw?: undefined;
}>;
