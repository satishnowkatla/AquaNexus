import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', req.userId)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { district, village, total_pond_area, primary_species, years_experience } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ district, village, total_pond_area, primary_species, years_experience })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Switch language
router.put('/language', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { language } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ language })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
