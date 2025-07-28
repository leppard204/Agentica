import axios from 'axios';
const SPRING_BASE_URL = 'http://localhost:8080';
const springClient = axios.create({
    baseURL: SPRING_BASE_URL,
    timeout: 5000
});
export class SpringService {
    async createProject(project) {
        const res = await springClient.post('/projects', project);
        return res.data;
    }
    async getAllProjects() {
        const res = await springClient.get('/projects');
        return res.data;
    }
    async getProjectById(id) {
        const res = await springClient.get(`/projects/${id}`);
        return res.data;
    }
    async createLead(lead) {
        const res = await springClient.post('/leads', lead);
        return res.data;
    }
    async getAllLeads() {
        const res = await springClient.get('/leads');
        return res.data;
    }
    async getLeadById(id) {
        const res = await springClient.get(`/leads/${id}`);
        return res.data;
    }
    async autoConnectLeads(projectId) {
        const res = await springClient.post(`/projects/${projectId}/auto-connect`);
        return res.data;
    }
    async saveEmail(projectId, leadId, subject, body) {
        const res = await springClient.post('/emails', {
            projectId,
            leadId,
            subject,
            body
        });
        return res.data;
    }
    async getLatestEmail(projectId, leadId) {
        try {
            const res = await springClient.get(`/emails?projectId=${projectId}&leadId=${leadId}`);
            const emails = res.data;
            if (emails.length > 0) {
                return emails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            }
            return null;
        }
        catch {
            return null;
        }
    }
    async saveFeedback(projectId, leadId, emailId, summary, responseType) {
        const res = await springClient.post('/feedback/', {
            projectId,
            leadId,
            emailId,
            responseSummary: summary,
            responseType
        });
        return res.data;
    }
    async getLatestFeedback(emailId) {
        try {
            const res = await springClient.get(`/feedback/latest/${emailId}`);
            return res.data;
        }
        catch {
            return null;
        }
    }
}
export const springService = new SpringService();
