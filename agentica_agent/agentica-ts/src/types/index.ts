// types/index.ts
export interface Project {
  id: number;
  name: string;
  description: string;
  industry: string;
  createdAt: string;
  isActive?: boolean;
}

export interface Lead {
  id: number;
  name: string;
  industry: string;
  size?: string;
  language?: 'KO' | 'EN' | 'JP';
  contactName?: string;
  contactEmail: string;
  createdAt: string;
  isActive?: boolean;
}

export interface Email {
  id: number;
  project: Project;
  lead: Lead;
  subject: string;
  body: string;
  createdAt: string;
  status?: 'DRAFT' | 'SENT' | 'REPLIED' | 'BOUNCED' | 'READ' | 'FAILED';
}

export interface Feedback {
  id: number;
  project: Project;
  lead: Lead;
  email: Email;
  responseSummary: string;
  responseType: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface EmailResult {
  subject: string;
  body: string;
  lead?: Lead;
  status: 'success' | 'error';
  error?: string;
}
