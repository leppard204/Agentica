// chatbotHandler.ts
import { analyzePromptAI } from './analyzePromptAI.js';
import * as projectFuncs from './functions/projectFunctions.js';
import * as leadFuncs from './functions/leadFunctions.js';
import * as emailFuncs from './functions/emailFunctions.js';
import * as feedbackFuncs from './functions/feedbackFunctions.js';

export async function chatbotHandler(input: string) {
  const { intent, extracted_params } = await analyzePromptAI(input);
  console.log('analyzePromptAI 결과:', intent, extracted_params);
  
  // ✅ 모든 응답에 intent 정보를 포함시켜서 반환
  let functionResult;
  
  switch (intent) {
    case 'register_project':
      functionResult = await projectFuncs.createProject(extracted_params);
      break;
    case 'register_lead':
      functionResult = await leadFuncs.createLead(extracted_params);
      break;
    case 'connect_leads':
      functionResult = await leadFuncs.autoConnectLeads(extracted_params);
      break;
    case 'initial_email': {
      const { userPrompt } = extracted_params;
      const result = await emailFuncs.generateInitialEmail({ userPrompt });
      functionResult = {
        status: 'success',
        message: `초안 생성 완료: ${result.length}건`,
        data: result
      };
      break;
    }
    case 'followup_email':
      functionResult = await emailFuncs.generateFollowupEmail(extracted_params);
      break;
    case 'email_rewrite_request':
      functionResult = await emailFuncs.regenerateEmailWithFeedback(extracted_params);
      break;
    case 'analyze_email':
      functionResult = await emailFuncs.analyzeEmailIssues(extracted_params);
      break;
    case 'handle_email_rejection':
      functionResult = await emailFuncs.handleEmailRejection(extracted_params);
      break;
    case 'list_projects':
      functionResult = await projectFuncs.listProjects();
      break;
    case 'list_leads':
      functionResult = await leadFuncs.listLeads();
      break;
    case 'unknown':
    default:
      functionResult = { 
        message: '의도를 이해하지 못했습니다. 다시 입력해 주세요.' 
      };
      break;
  }

  // ✅ intent 정보를 항상 포함해서 반환
  return {
    intent, // 여기가 핵심! fallback에서 분류한 intent도 포함됨
    ...functionResult
  };
}
