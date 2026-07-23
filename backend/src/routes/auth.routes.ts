import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();

// Send OTP
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+91') ? phone : `+91${phone}`,
    });

    if (error) throw error;

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith('+91') ? phone : `+91${phone}`,
      token: otp,
      type: 'sms',
    });

    if (error) throw error;

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    const token = jwt.sign({ userId: user?.id || data.user?.id }, env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      success: true,
      data: { token, user, isNewUser: !user },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, full_name, district, village, primary_species } = req.body;

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ phone, full_name })
      .select()
      .single();

    if (userError) throw userError;

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        district,
        village,
        primary_species,
      });

    if (profileError) throw profileError;

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ success: true, data: { token, user } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: { message: 'No token' } });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    const { data: user, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', decoded.userId)
      .single();

    if (error) throw error;

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
