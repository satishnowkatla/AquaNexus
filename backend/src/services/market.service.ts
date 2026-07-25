const AGMARKNET_BASE = 'https://api.agmarknet.gov.in/v1';

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://agmarknet.gov.in',
  'Referer': 'https://agmarknet.gov.in/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
};

// AP state_id in AGMARKNET
const AP_STATE_ID = '28';

// Known fish/shrimp commodity IDs in AGMARKNET
const FISH_COMMODITY_IDS = [
  '9',    // Fish
  '496',  // Fish Dry
  '630',  // Prawns
  '631',  // Shrimp
  '714',  // Fish Wet
];

interface CachedData {
  data: any[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function agmarknetFetch(path: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(`${AGMARKNET_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (!res.ok) {
    throw new Error(`AGMARKNET ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function getFilters(): Promise<any> {
  return agmarknetFetch('/daily-price-arrival/filters');
}

export async function getFishPricesInAP(): Promise<any[]> {
  // Check cache
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

  try {
    // Try fetching daily prices for AP state
    const result = await agmarknetFetch(
      '/prices-and-arrivals/commodity-wise/daily-report-state',
      { date: dateStr, state_ids: AP_STATE_ID }
    );

    if (result?.success === false || !result?.data) {
      // Fallback: try yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;

      const result2 = await agmarknetFetch(
        '/prices-and-arrivals/commodity-wise/daily-report-state',
        { date: yesterdayStr, state_ids: AP_STATE_ID }
      );

      if (result2?.data) {
        const fishData = filterFishData(result2.data, yesterdayStr);
        cache = { data: fishData, fetchedAt: Date.now() };
        return fishData;
      }
    }

    if (result?.data) {
      const fishData = filterFishData(result.data, dateStr);
      cache = { data: fishData, fetchedAt: Date.now() };
      return fishData;
    }
  } catch (err) {
    console.warn('AGMARKNET fetch failed, using fallback:', err);
  }

  // Return cached data if available, even if expired
  if (cache?.data) {
    return cache.data;
  }

  // Final fallback: return empty (Supabase seed data will show)
  return [];
}

function filterFishData(data: any[], dateStr: string): any[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item: any) => {
      const name = (item.commodity_name || item.Commodity || item.commodity || '').toLowerCase();
      return name.includes('fish') ||
        name.includes('prawn') ||
        name.includes('shrimp') ||
        name.includes('rohu') ||
        name.includes('catla') ||
        name.includes('murrel') ||
        name.includes('pangasius') ||
        name.includes('tilapia') ||
        name.includes('carp');
    })
    .map((item: any) => ({
      species: item.commodity_name || item.Commodity || item.commodity || 'Unknown',
      variety: item.variety || item.Variety || 'General',
      min_price: Number(item.min_price || item['Min Price'] || 0),
      max_price: Number(item.max_price || item['Max Price'] || 0),
      modal_price: Number(item.modal_price || item['Modal Price'] || 0),
      market_name: item.market_name || item.Market || item.market || 'Unknown',
      district: item.district || item.District || 'Unknown',
      date: dateStr,
    }));
}
