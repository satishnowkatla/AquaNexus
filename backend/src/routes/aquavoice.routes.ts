import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini';

const router = Router();

// Record transaction from voice
router.post('/record', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId, text, language } = req.body;

    const parsed = await geminiService.parseVoice(text, language || 'en');

    // Save to database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        farmer_id: req.userId,
        pond_id: pondId,
        type: parsed.type,
        category: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        voice_text: text,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get ledger
router.get('/ledger', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', req.userId)
      .order('transaction_date', { ascending: false });

    if (pondId) {
      query = query.eq('pond_id', pondId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get summary
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId } = req.query;

    let query = supabase
      .from('transactions')
      .select('type, amount')
      .eq('farmer_id', req.userId);

    if (pondId) {
      query = query.eq('pond_id', pondId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totalIncome = data
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpense = data
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        profit: totalIncome - totalExpense,
        transactionCount: data?.length || 0,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
