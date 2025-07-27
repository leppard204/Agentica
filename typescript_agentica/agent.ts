import { Agent, Controller } from 'agentica';
import * as project from './functions/projectFunctions.js';
import * as lead from './functions/leadFunctions.js';
import * as email from './functions/emailFunctions.js';
import * as feedback from './functions/feedbackFunctions.js';

@Controller('autosales')
export class AutoSalesAgent extends Agent {
  constructor() {
    super({
      name: 'AutoSales AI Agent',
      description: 'B2B 세일즈 자동화를 위한 Agentica 기반 AI',
      functions: [
        // Project
        project.extractProjectInfo,
        project.listProjects,
        // Lead
        lead.extractLeadsInfo,
        lead.createMultipleLeads,
        lead.listLeads,
        lead.autoConnectLeads,
        // Email
        email.generateInitialEmail,
        email.generateMultipleEmails,
        email.generateFollowupEmail,
        // Feedback
        feedback.summarizeFeedback
      ]
    });
  }

  async handleNaturalLanguage(prompt: string): Promise<any> {
    const intent = await this.analyzeIntent(prompt);

    switch (intent.type) {
      case 'register_project': {
        const info = await project.extractProjectInfo.call(this, prompt);
        return await this.springService.createProject(info);
      }
      case 'register_leads': {
        const leads = await lead.extractLeadsInfo.call(this, prompt);
        return await lead.createMultipleLeads.call(this, leads);
      }
      case 'generate_emails': {
        const { projectId, leadIds } = intent.params;
        const leads = await Promise.all(leadIds.map((id: number) =>
          this.springService.getLeadById(id)
        ));
        return await email.generateMultipleEmails.call(this, projectId, leads);
      }
      case 'list_projects':
        return await project.listProjects.call(this);
      case 'list_leads':
        return await lead.listLeads.call(this);
      case 'connect_leads':
        return await lead.autoConnectLeads.call(this, intent.params.projectId);
      default:
        return { error: '지원하지 않는 명령입니다.' };
    }
  }

  private async analyzeIntent(prompt: string): Promise<any> {
    const system = `
프롬프트를 분석해서 다음 형식으로 반환해줘:
{
  "type": "register_project|register_leads|generate_emails|list_projects|list_leads|connect_leads|unknown",
  "params": {},
  "confidence": 0.0
}
    `.trim();

    const response = await this.llm.complete({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    });

    try {
      const match = response.match(/\{.*\}/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.error('인텐트 분석 실패:', e);
    }

    return { type: 'unknown', params: {}, confidence: 0 };
  }
}
