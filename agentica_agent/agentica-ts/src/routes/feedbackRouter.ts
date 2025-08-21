import express, { Request, Response } from 'express';
import { handleFeedbackSummary } from '../functions/feedbackFunctions.js';

const router = express.Router();

router.post('/summarize', async (req: Request, res: Response) => {

    console.log('요청 받은 바디:', req.body);
    const { leadName, projectName, subject, body } = req.body;

    if (!leadName || !projectName || !subject || !body) {
    return res.status(400).json({ error: '필수 항목 누락' });
    }

    try {
        const result = await handleFeedbackSummary({
        leadName,
        projectName,
        subject,
        body
        });
        res.json(result);
    } catch (e) {
        console.error('summarize 처리 중 오류:', e);
        res.status(500).json({ error: '서버 오류' });
    }
});

export default router;
