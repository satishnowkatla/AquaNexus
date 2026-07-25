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
  data_source: string;
  unit: string;
}

let cache: { data: MarketPrice[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

const AP_FISH_COMMODITIES = [
  { slug: 'fish', name: 'Fish' },
  { slug: 'shrimp', name: 'Shrimp' },
  { slug: 'prawn', name: 'Prawn' },
  { slug: 'dry-fish', name: 'Dry Fish' },
];

async function scrapeNapanta(commoditySlug: string): Promise<MarketPrice[]> {
  try {
    const url = `https://www.napanta.com/agri-commodity-prices/andhra-pradesh/${commoditySlug}/`;
    const res = await fetch(url, { headers: SCRAPE_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const html = await res.text();

    const prices: MarketPrice[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const row = match[1];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      }
      // Napanta table: District | Market | Commodity | Variety | Max | Avg | Min | Date | ...
      if (cells.length >= 7) {
        const district = cells[0];
        const market = cells[1];
        const species = cells[2];
        const variety = cells[3];
        const maxPrice = parseFloat(cells[4].replace(/[₹,\s]/g, '')) || 0;
        const avgPrice = parseFloat(cells[5].replace(/[₹,\s]/g, '')) || 0;
        const minPrice = parseFloat(cells[6].replace(/[₹,\s]/g, '')) || 0;

        if (district && market && minPrice > 0) {
          prices.push({
            species: species || commoditySlug,
            variety: variety || 'General',
            price_per_kg: avgPrice / 100,
            min_price: minPrice / 100,
            max_price: maxPrice / 100,
            market_name: market,
            district,
            price_date: cells.length > 7 ? cells[7] : new Date().toISOString().split('T')[0],
            trend: maxPrice > minPrice * 1.05 ? 'up' : maxPrice < minPrice * 1.02 ? 'down' : 'stable',
            data_source: 'agmarknet',
            unit: 'per_kg',
          });
        }
      }
    }
    return prices;
  } catch (err) {
    console.warn(`Napanta scrape failed for ${commoditySlug}:`, err);
    return [];
  }
}

export async function getFishPricesInAP(): Promise<MarketPrice[]> {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }

  const results = await Promise.all(
    AP_FISH_COMMODITIES.map(c => scrapeNapanta(c.slug))
  );
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
  return {
    commodities: AP_FISH_COMMODITIES.map(c => ({ slug: c.slug, name: c.name })),
    districts: ['Krishna', 'Guntur', 'East Godavari', 'West Godavari', 'Nellore', 'Prakasam'],
  };
}
