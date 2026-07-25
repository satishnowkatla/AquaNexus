import { Router, Response } from 'express';
import { getFishPricesInAP, getFilters } from '../services/market.service';

const router = Router();

// Get fish/shrimp market prices for Andhra Pradesh
router.get('/prices', async (req, res: Response) => {
  try {
    const prices = await getFishPricesInAP();
    res.json({
      success: true,
      data: prices,
      count: prices.length,
      source: prices.length > 0 ? 'agmarknet' : 'unavailable',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch market prices' },
    });
  }
});

// Get available filters (commodities, states, etc.)
router.get('/filters', async (req, res: Response) => {
  try {
    const filters = await getFilters();
    res.json({ success: true, data: filters });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch filters' },
    });
  }
});

export default router;
