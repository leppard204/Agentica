import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const springService = {
  async createProject({ name, description, industry }: { name: string; description: string; industry: string }) {
    const res = await axios.post(`${BASE_URL}/projects`, { name, description, industry });
    return res.data;
  },
  async listProjects() {
    const res = await axios.get(`${BASE_URL}/projects`);
    return res.data;
  },
  async createLead({
    companyName,
    industry,
    contactEmail,
    contactName
  }: { companyName: string; industry: string; contactEmail: string; contactName?: string }) {
    const res = await axios.post(`${BASE_URL}/leads`, { companyName, industry, contactEmail, contactName });
    return res.data;
  },
  async listLeads() {
    const res = await axios.get(`${BASE_URL}/leads`);
    return res.data;
  },
  async autoConnectLeads(projectId: number) {
    const res = await axios.post(`${BASE_URL}/projects/${projectId}/auto-connect`);
    return res.data;
  },
  async getProjectById(projectId: number) {
    const res = await axios.get(`${BASE_URL}/projects/${projectId}`);
    return res.data;
  },
  async getLeadById(leadId: number) {
    const res = await axios.get(`${BASE_URL}/leads/${leadId}`);
    return res.data;
  },
  async saveEmail(projectId: number, leadId: number, subject: string, body: string) {
    const res = await axios.post(`${BASE_URL}/emails`, { projectId, leadId, subject, body });
    return res.data;
  },
  async submitFeedback({ emailId, feedbackText }: { emailId: number; feedbackText: string }) {
    const res = await axios.post(`${BASE_URL}/feedbacks`, { emailId, feedbackText });
    return res.data;
  }
  // 필요시 추가 엔드포인트 여기에 계속 확장
};
