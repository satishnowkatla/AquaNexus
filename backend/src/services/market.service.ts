const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
};

export interface MarketPrice {
  species: string;
  variety: string;
  price_per_kg: number;
  min_price: number;
  max_price: number;
  market_name: string;
  district: string;
  price_date: string;
  trend: string;
}

let cache: { data: MarketPrice[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

function extractTableRow(html: string): MarketPrice[] {
  const prices: MarketPrice[] = [];
  // Match table rows with price data
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(row)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length >= 6) {
      const species = cells[0];
      const variety = cells[1] || 'General';
      const market = cells[2] || '';
      const district = cells[3] || 'Andhra Pradesh';
      const minP = parseFloat(cells[4].replace(/[₹,\s]/g, '')) || 0;
      const maxP = parseFloat(cells[5].replace(/[₹,\s]/g, '')) || 0;
      const date = cells.length > 6 ? cells[6] : new Date().toISOString().split('T')[0];

      if (species && !species.includes('Commodity') && minP > 0) {
        prices.push({
          species,
          variety,
          price_per_kg: Math.round((minP + maxP) / 200),
          min_price: minP / 100,
          max_price: maxP / 100,
          market_name: market,
          district,
          price_date: date,
          trend: maxP > minP * 1.05 ? 'up' : maxP < minP * 1.02 ? 'down' : 'stable',
        });
      }
    }
  }
  return prices;
}

async function scrapeUrl(url: string): Promise<MarketPrice[]> {
  try {
    const res = await fetch(url, { headers: SCRAPE_HEADERS });
    if (!res.ok) return [];
    const html = await res.text();
    return extractTableRow(html);
  } catch (err) {
    console.warn(`Scrape failed for ${url}:`, err);
    return [];
  }
}

export async function getFishPricesInAP(): Promise<MarketPrice[]> {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }

  const urls = [
    'https://www.kisandeals.com/mandiprices/FISH/Andhra-Pradesh/ALL',
    'https://www.kisandeals.com/mandiprices/SHRIMP/Andhra-Pradesh/ALL',
    'https://www.commoditymarketlive.com/mandi-price-state/andhra-pradesh/fish',
  ];

  const results = await Promise.all(urls.map(u => scrapeUrl(u)));
  const all = results.flat();

  if (all.length > 0) {
    cache = { data: all, fetchedAt: Date.now() };
    return all;
  }

  if (cache?.data) return cache.data;
  return [];
}

export async function getWeatherAP(): Promise<any> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=16.5062&longitude=80.6480&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FKolkata&forecast_days=7',
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return null;
  }
}

export async function getFilters(): Promise<any> {
  return { message: 'Market prices from open-source data' };
}
