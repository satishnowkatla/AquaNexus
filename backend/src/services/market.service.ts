import * as cheerio from 'cheerio';

const KISAN_FISH_URL = 'https://www.kisandeals.com/mandiprices/FISH/Andhra-Pradesh/ALL';
const KISAN_PRAWN_URL = 'https://www.kisandeals.com/mandiprices/SHRIMP/Andhra-Pradesh/ALL';
const KISAN_SHRIMP_URL = 'https://www.kisandeals.com/mandiprices/SHRIMP/Andhra-Pradesh/ALL';

const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
  'Accept-Language': 'en-US,en;q=0.9',
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

function parsePrice(text: string): number {
  const cleaned = text.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

function inferTrend(min: number, max: number): string {
  if (max <= 0 || min <= 0) return 'stable';
  const spread = (max - min) / min;
  if (spread > 0.05) return 'up';
  if (spread < 0.01) return 'stable';
  return 'down';
}

async function scrapeKisanDeals(url: string): Promise<MarketPrice[]> {
  try {
    const res = await fetch(url, { headers: SCRAPE_HEADERS });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const prices: MarketPrice[] = [];

    // KisanDeals uses a structured table format
    $('table tbody tr, .price-card, [class*="mandi-row"]').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 7) {
        const commodity = $(tds[0]).text().trim();
        const variety = $(tds[1]).text().trim();
        const market = $(tds[2]).text().trim();
        const district = $(tds[3]).text().trim();
        const minP = parsePrice($(tds[4]).text());
        const modalP = parsePrice($(tds[5]).text());
        const maxP = parsePrice($(tds[6]).text());
        const date = tds.length > 7 ? $(tds[7]).text().trim() : new Date().toISOString().split('T')[0];

        if (commodity && modalP > 0) {
          prices.push({
            species: commodity,
            variety: variety || 'General',
            price_per_kg: modalP / 100,
            min_price: minP / 100,
            max_price: maxP / 100,
            market_name: market,
            district: district || 'Andhra Pradesh',
            price_date: date,
            trend: inferTrend(minP, maxP),
          });
        }
      }
    });

    return prices;
  } catch (err) {
    console.warn(`Scrape ${url} failed:`, err);
    return [];
  }
}

export async function getFishPricesInAP(): Promise<MarketPrice[]> {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }

  const [fish, prawn] = await Promise.all([
    scrapeKisanDeals(KISAN_FISH_URL),
    scrapeKisanDeals(KISAN_PRAWN_URL),
  ]);

  const all = [...fish, ...prawn];

  if (all.length > 0) {
    cache = { data: all, fetchedAt: Date.now() };
    return all;
  }

  if (cache?.data) return cache.data;
  return [];
}

export async function getWeatherAP(): Promise<any> {
  try {
    // Vijayawada, AP coordinates
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
  return { message: 'Market prices scraped from open-source AGMARKNET data' };
}
