import { Router, Response } from 'express';
import { getFishPricesInAP, getWeatherAP, getFilters, getMarketsList } from '../services/market.service';

const router = Router();

// Get fish/shrimp market prices for Andhra Pradesh
// Query params: ?market_id=<number> to filter by specific market
//               ?fresh=1 to bypass the cache and fetch live from NFDB
router.get('/prices', async (req, res: Response) => {
  try {
    const fresh = req.query.fresh === '1';
    const prices = await getFishPricesInAP(fresh);
    const marketId = req.query.market_id ? Number(req.query.market_id) : null;
    let filtered = prices;
    if (marketId) {
      filtered = prices.filter(p => {
        const match = p.market_name.toLowerCase();
        return p.id.includes(`-${marketId}-`);
      });
    }
    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      source: filtered.length > 0 ? 'nfdb_fmpis' : 'unavailable',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch market prices' },
    });
  }
});

// Get list of markets in Andhra Pradesh
router.get('/markets', async (_req, res: Response) => {
  try {
    const markets = await getMarketsList();
    res.json({ success: true, data: markets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get weather for Andhra Pradesh
router.get('/weather', async (_req, res: Response) => {
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

// Get filters
router.get('/filters', async (_req, res: Response) => {
  try {
    const filters = await getFilters();
    res.json({ success: true, data: filters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
