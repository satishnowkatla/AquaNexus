import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get dashboard
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get cooperative member is part of
    const { data: membership } = await supabase
      .from('cooperative_members')
      .select('cooperative_id')
      .eq('user_id', req.userId)
      .single();

    if (!membership) {
      res.json({ success: true, data: { isMember: false } });
      return;
    }

    // Get all members in cooperative
    const { data: members } = await supabase
      .from('cooperative_members')
      .select('user_id, users(full_name, phone)')
      .eq('cooperative_id', membership.cooperative_id);

    // Get cooperative info
    const { data: cooperative } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('id', membership.cooperative_id)
      .single();

    res.json({
      success: true,
      data: {
        isMember: true,
        cooperative,
        memberCount: members?.length || 0,
        members,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get alerts
router.get('/alerts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: membership } = await supabase
      .from('cooperative_members')
      .select('cooperative_id')
      .eq('user_id', req.userId)
      .single();

    if (!membership) {
      res.json({ success: true, data: [] });
      return;
    }

    const { data, error } = await supabase
      .from('cooperative_alerts')
      .select('*')
      .eq('cooperative_id', membership.cooperative_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get members
router.get('/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: membership } = await supabase
      .from('cooperative_members')
      .select('cooperative_id')
      .eq('user_id', req.userId)
      .single();

    if (!membership) {
      res.json({ success: true, data: [] });
      return;
    }

    const { data, error } = await supabase
      .from('cooperative_members')
      .select('user_id, users(full_name, phone), joined_at')
      .eq('cooperative_id', membership.cooperative_id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get map data
router.get('/map', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get all ponds in the area
    const { data, error } = await supabase
      .from('ponds')
      .select('id, name, latitude, longitude, species, status')
      .not('latitude', 'is', null);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
