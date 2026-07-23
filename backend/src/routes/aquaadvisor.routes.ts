import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini';

const router = Router();

// Chat with AI
router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, language } = req.body;

    const aiMessage = await geminiService.chat(message, language || 'en');

    // Save to database
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: req.userId,
        module: 'advisor',
        message,
        response: aiMessage.response,
        language: language || 'te',
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        id: data.id,
        message,
        response: aiMessage.response,
        suggestions: aiMessage.suggestions || [],
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get chat history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', req.userId)
      .eq('module', 'advisor')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
