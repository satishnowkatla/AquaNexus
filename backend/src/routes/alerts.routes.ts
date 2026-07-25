import { Router, Response } from 'express';
import { generateDailyAlerts } from '../services/alerts.service';
import { getFeedPrices, getFeedCostEstimate } from '../services/feed.service';

const router = Router();

// GET /api/alerts/daily — real-time weather + disease + feeding alerts
router.get('/daily', async (_req, res: Response) => {
  try {
    const alerts = await generateDailyAlerts();
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to generate alerts' },
    });
  }
});

// GET /api/alerts/feed-prices — feed ingredient prices
router.get('/feed-prices', async (_req, res: Response) => {
  try {
    const prices = await getFeedPrices();
    res.json({
      success: true,
      data: prices,
      count: prices.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch feed prices' },
    });
  }
});

// POST /api/alerts/feed-cost — calculate feed cost estimate
router.post('/feed-cost', async (req, res: Response) => {
  try {
    const { species, biomass_kg, fcr } = req.body;
    const estimate = await getFeedCostEstimate(species || 'shrimp', biomass_kg || 5000, fcr || 1.5);
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to calculate feed cost' },
    });
  }
});

export default router;
