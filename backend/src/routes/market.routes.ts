import { Router, Response } from 'express';
import { getFishPricesInAP, getWeatherAP, getFilters } from '../services/market.service';

const router = Router();

// Get fish/shrimp market prices for Andhra Pradesh
router.get('/prices', async (req, res: Response) => {
  try {
    const prices = await getFishPricesInAP();
    res.json({
      success: true,
      data: prices,
      count: prices.length,
      source: prices.length > 0 ? 'agmarknet-scrape' : 'unavailable',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch market prices' },
    });
  }
});

// Get weather for Andhra Pradesh
router.get('/weather', async (req, res: Response) => {
  try {
    const weather = await getWeatherAP();
    if (!weather) {
      res.json({ success: false, error: { message: 'Weather data unavailable' } });
      return;
    }
    res.json({ success: true, data: weather });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch weather' },
    });
  }
});

// Get filters (stub)
router.get('/filters', async (req, res: Response) => {
  try {
    const filters = await getFilters();
    res.json({ success: true, data: filters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
