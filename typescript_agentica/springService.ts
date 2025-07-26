import axios from 'axios';
import type { Project, Lead, Email, Feedback } from '../types/index.js';

const SPRING_BASE_URL = 'http://localhost:8080';
const springClient = axios.create({
  baseURL: SPRING_BASE_URL,
  timeout: 5000
});

export class SpringService {
  async createProject(project: Partial<Project>): Promise<Project> {
    const res = await springClient.post('/projects', project);
    return res.data;
  }

  async getAllProjects(): Promise<Project[]> {
    const res = await springClient.get('/projects');
    return res.data;
  }

  async getProjectById(id: number): Promise<Project> {
    const res = await springClient.get(`/projects/${id}`);
    return res.data;
  }

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    const res = await springClient.post('/leads', lead);
    return res.data;
  }

  async getAllLeads(): Promise<Lead[]> {
    const res = await springClient.get('/leads');
    return res.data;
  }

  async getLeadById(id: number): Promise<Lead> {
    const res = await springClient.get(`/leads/${id}`);
    return res.data;
  }

  async autoConnectLeads(projectId: number): Promise<Lead[]> {
    const res = await springClient.post(`/projects/${projectId}/auto-connect`);
    return res.data;
  }

  async saveEmail(projectId: number, leadId: number, subject: string, body: string): Promise<Email> {
    const res = await springClient.post('/emails', {
      projectId,
      leadId,
      subject,
      body
    });
    return res.data;
  }

  async getLatestEmail(projectId: number, leadId: number): Promise<Email | null> {
    try {
      const res = await springClient.get(`/emails?projectId=${projectId}&leadId=${leadId}`);
      const emails: Email[] = res.data;
      if (emails.length > 0) {
        return emails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  async saveFeedback(projectId: number, leadId: number, emailId: number, summary: string, responseType: string): Promise<Feedback> {
    const res = await springClient.post('/feedback/', {
      projectId,
      leadId,
      emailId,
      responseSummary: summary,
      responseType
    });
    return res.data;
  }

  async getLatestFeedback(emailId: number): Promise<Feedback | null> {
    try {
      const res = await springClient.get(`/feedback/latest/${emailId}`);
      return res.data;
    } catch {
      return null;
    }
  }
}
