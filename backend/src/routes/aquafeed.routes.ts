import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini';

const router = Router();

// Calculate feed schedule
router.post('/calculate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId, species, area_acres, stocking_density, stocking_days } = req.body;

    const schedule = await geminiService.calculateFeed(
      species || 'shrimp',
      area_acres || 1,
      stocking_density || 50000,
      stocking_days || 30
    );

    // Save to database
    const { data, error } = await supabase
      .from('feed_schedules')
      .insert({
        pond_id: pondId,
        feed_type: schedule.feed_type,
        morning_kg: schedule.morning_kg,
        evening_kg: schedule.evening_kg,
        total_daily_kg: schedule.total_daily_kg,
        feed_grade: schedule.feed_grade,
        cumulative_cost: schedule.daily_cost,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get current schedule
router.get('/schedule', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId } = req.query;

    const { data, error } = await supabase
      .from('feed_schedules')
      .select('*')
      .eq('pond_id', pondId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get cost tracker
router.get('/cost', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId } = req.query;

    const { data, error } = await supabase
      .from('feed_logs')
      .select('*')
      .eq('schedule_id', pondId)
      .order('feed_date', { ascending: false });

    if (error) throw error;

    const totalCost = data?.reduce((sum, log) => sum + Number(log.cost), 0) || 0;

    res.json({ success: true, data: { logs: data, totalCost } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
