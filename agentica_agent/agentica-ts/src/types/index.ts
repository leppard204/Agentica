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
  companyName: string;
  industry: string;
  contactEmail: string;
  contactName?: string;
  createdAt: string;
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
