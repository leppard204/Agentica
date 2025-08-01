// types/index.ts

export interface Project {
  id: number;
  name: string;
  description: string;
  industry: string;
  createdAt: string;
}

export interface Lead {
  id: number;
  name: string;
  industry: string;
  contactEmail: string;
  contactName?: string;
  createdAt: string;
  size?: string;
  language?: string;
}

export interface Email {
  id: number;
  project: Project;
  lead: Lead;
  subject: string;
  body: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  email: Email;
  feedbackText: string;
  createdAt: string;
}

export type EmailResult = {
  companyName: string;
  subject?: string;
  body?: string;
  status?: 'error';
  error?: string;
};