const NFDB_BASE = 'https://fmpisnfdb.in';
const NFDB_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://fmpisnfdb.in/prices/dashboard',
  'X-Requested-With': 'XMLHttpRequest',
  'Origin': 'https://fmpisnfdb.in',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

export interface MarketPrice {
  id: string;
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
  species_type: string;
}

const MARKET_ID_DISTRICT: Record<number, string> = {
  3: 'West Godavari',
  195: 'Krishna',
  531: 'Visakhapatnam',
  537: 'Dr. B.R. Ambedkar Konaseema',
  730: 'Kurnool',
  539: 'Guntur',
  726: 'Srikakulam',
  742: 'Tirupathi',
};

function getSpeciesType(name: string): string {
  const n = name.toLowerCase();

  if (n.includes('shrimp')) return 'shrimp';
  if (n.includes('prawn')) return 'prawn';
  if (n.includes('crab')) return 'crab';
  if (n.includes('lobster') || n.includes('mussel') || n.includes('oyster') || n.includes('squid') || n.includes('cuttle')) return 'crab';

  const freshwaterKeywords = [
    'rohu', 'catla', 'mrigal', 'tilapia', 'roopchand', 'carp', 'murrel', 'magur',
    'singhi', 'pangas', 'featherback', 'climbing perch', 'snakehead', 'gourami',
    'loach', 'danio', 'eel', 'trout', 'mahseer', 'barb', 'pabda', 'pabo',
    'anabas', 'channa', 'heteropneustes', 'wallago', 'gibel', 'rasbora',
    'koi', 'goldfish', 'betta', 'puntius', 'labeo', 'cirrhinus', 'hypophthalmichthys',
  ];
  if (freshwaterKeywords.some(k => n.includes(k))) return 'freshwater_fish';

  const marineKeywords = [
    'mackerel', 'sardine', 'anchovy', 'pomfret', 'tuna', 'seer', 'king fish',
    'kingfish', 'barracuda', 'shark', 'ray', 'stingray', 'grouper', 'snapper',
    'bream', 'trevally', 'jack', 'bonito', 'sailfish', 'sword', 'marlin',
    'hilsa', 'milkfish', 'milk fish', 'croaker', 'threadfin', 'scad',
    'pony fish', 'sillago', 'half beak', 'seabass', 'sea bass', 'cod',
    'sole', 'flatfish', 'flounder', 'halibut', 'squid', 'octopus',
    'silago', ' emperor', 'spanish', 'whiting',
  ];
  if (marineKeywords.some(k => n.includes(k))) return 'marine_fish';

  if (n.includes('fish') || n.includes('mathi') || n.includes('nethili')) return 'marine_fish';

  return 'other';
}

function getDistrictById(marketId: number): string {
  return MARKET_ID_DISTRICT[marketId] || 'Andhra Pradesh';
}

let cache: { data: MarketPrice[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

async function fetchNfdbForMarket(marketId: number, marketName: string, dateStr: string): Promise<MarketPrice[]> {
  try {
    const body = `draw=1&start=0&length=200&sid=1&market=${marketId}&species=&size=&date=${dateStr}`;
    const res = await fetch(`${NFDB_BASE}/prices/filters`, {
      method: 'POST',
      headers: NFDB_HEADERS,
      body,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const json = await res.json() as any;
    if (!json.data || !Array.isArray(json.data)) return [];

    const district = getDistrictById(marketId);
    return json.data.map((row: any[], idx: number) => {
      const [_, species, size, priceStr, date] = row;
      const price = parseFloat(priceStr);
      if (!species || isNaN(price) || price <= 0) return null;
      return {
        id: `nfdb-${marketId}-${idx}`,
        species,
        variety: String(size).charAt(0).toUpperCase() + String(size).slice(1),
        price_per_kg: price,
        min_price: price,
        max_price: price,
        market_name: marketName,
        district,
        price_date: date || dateStr.split('-').reverse().join('-'),
        trend: 'stable',
        data_source: 'nfdb_govt',
        unit: 'per_kg',
        species_type: getSpeciesType(species),
      };
    }).filter(Boolean) as MarketPrice[];
  } catch {
    return [];
  }
}

const TOP_MARKETS: Array<{ id: number; name: string; district: string }> = [
  { id: 3, name: 'Eluru Wholesale Fish Market', district: 'West Godavari' },
  { id: 195, name: 'Machilipatnam Fish Market', district: 'Krishna' },
  { id: 531, name: 'Visakhapatnam Fish Market', district: 'Visakhapatnam' },
  { id: 537, name: 'Amalapuram Fish Market', district: 'Dr. B.R. Ambedkar Konaseema' },
  { id: 730, name: 'Kurnool Fish Market', district: 'Kurnool' },
  { id: 539, name: 'Jalapushpa Bhavan Fish Market', district: 'Guntur' },
  { id: 726, name: 'Srikakulam Fish Market', district: 'Srikakulam' },
  { id: 742, name: 'Tirupathi Fish Market', district: 'Tirupathi' },
];

async function fetchFromNfdb(): Promise<MarketPrice[]> {
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

  const results = await Promise.all(
    TOP_MARKETS.map(m => fetchNfdbForMarket(m.id, m.name, dateStr))
  );
  const all = results.flat();
  if (all.length === 0) return [];

  const typeOrder: Record<string, number> = { shrimp: 0, prawn: 1, freshwater_fish: 2, crab: 3, marine_fish: 4, other: 5 };
  all.sort((a, b) => (typeOrder[a.species_type] ?? 5) - (typeOrder[b.species_type] ?? 5) || a.species.localeCompare(b.species));
  return all;
}

export async function getFishPricesInAP(): Promise<MarketPrice[]> {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }
  try {
    const prices = await fetchFromNfdb();
    if (prices.length > 0) {
      cache = { data: prices, fetchedAt: Date.now() };
      return prices;
    }
  } catch (err) {
    console.warn('NFDB fetch failed:', err);
  }
  if (cache?.data) return cache.data;
  return [];
}

export async function getMarketsList(): Promise<Array<{ id: number; name: string; district: string }>> {
  return TOP_MARKETS.map(m => ({
    id: m.id,
    name: m.name,
    district: m.district,
  }));
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
    source: 'NFDB FMPIS (Government of India)',
    species_types: ['shrimp', 'prawn', 'freshwater_fish', 'marine_fish', 'crab', 'other'],
    markets: TOP_MARKETS.map(m => ({ id: m.id, name: m.name, district: m.district })),
    state: 'Andhra Pradesh',
  };
}
