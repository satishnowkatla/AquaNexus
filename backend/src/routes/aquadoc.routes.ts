import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();

// Diagnose disease
router.post('/diagnose', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pondId, imageBase64, voiceDescription } = req.body;

    // Call AI service
    const aiResponse = await axios.post(`${env.AI_SERVICE_URL}/ai/disease/diagnose`, {
      image_base64: imageBase64,
      voice_description: voiceDescription,
      pond_id: pondId,
    });

    const diagnosis = aiResponse.data;

    // Save to database
    const { data, error } = await supabase
      .from('disease_reports')
      .insert({
        farmer_id: req.userId,
        pond_id: pondId,
        image_url: imageBase64,
        voice_description: voiceDescription,
        diagnosis: diagnosis.diagnosis,
        severity: diagnosis.severity,
        treatment: diagnosis.treatment,
        medicine_name: diagnosis.medicine_name,
        medicine_dosage: diagnosis.medicine_dosage,
        follow_up_date: diagnosis.follow_up_date,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('disease_reports')
      .select('*')
      .eq('farmer_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get specific diagnosis
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('disease_reports')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
