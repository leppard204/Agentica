// server.ts
import express from 'express';
import feedbackRouter from './routes/feedbackRouter.js';
import chatbotRouter from './routes/chatbotRouter.js';
import { analyzePromptAI } from './analyzePromptAI.js';
import { chatbotHandler } from './chatbotHandler.js'; 

const app = express();
const PORT = 3000;

app.use(express.json());

// 라우터 등록
app.use('/feedback', feedbackRouter);
app.use('/chatbot', chatbotRouter);

// Spring이 호출하는 엔드포인트
app.post('/agent/handle', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    // ✅ chatbotHandler에서 intent 포함한 결과 받음
    const result = await chatbotHandler(prompt);
    
    const resp: any = {
      intent: result.intent, // ✅ fallback에서 분류한 intent도 포함됨!
      text: result?.message ?? result?.text ?? (result.intent === 'unknown' ? '인텐트 불명' : `${result.intent} 완료`),
    };

    // ✅ 특정 intent별 추가 데이터 첨부
    if (result.intent === 'initial_email' && Array.isArray(result?.data)) {
      resp.drafts = result.data;
    }
    if (result.intent === 'register_project' && result?.project) {
      resp.project = result.project;
    }

    return res.json(resp);
  } catch (e: any) {
    console.error('[agent/handle] error:', e?.response?.data ?? e);
    return res.status(500).json({
      intent: 'unknown',
      text: e?.message || String(e),
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Express 서버 실행 중: http://localhost:${PORT}`);
});
