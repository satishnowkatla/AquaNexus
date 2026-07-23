import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// List ponds
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ponds')
      .select('*')
      .eq('farmer_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Create pond
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, area_acres, species, stocking_density, stocking_date, expected_harvest_date } = req.body;

    const { data, error } = await supabase
      .from('ponds')
      .insert({
        farmer_id: req.userId,
        name,
        area_acres,
        species,
        stocking_density,
        stocking_date,
        expected_harvest_date,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get pond
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ponds')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Update pond
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ponds')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Delete pond
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('ponds')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId);

    if (error) throw error;

    res.json({ success: true, message: 'Pond deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
