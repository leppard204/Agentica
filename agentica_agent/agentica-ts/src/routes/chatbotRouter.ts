import express from 'express';
import { chatbotHandler } from '../chatbotHandler.js';

const router = express.Router();

// POST /chatbot - 챗봇 메시지 처리
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }

    console.log('🤖 챗봇 요청 받음:', message);
    
    const result = await chatbotHandler(message);
    
    console.log('🤖 챗봇 응답:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ 챗봇 처리 오류:', error);
    res.status(500).json({ error: '챗봇 처리 중 오류가 발생했습니다.' });
  }
});

export default router;