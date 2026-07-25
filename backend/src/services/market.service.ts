// Market price service using NFDB FMPIS (Government of India)
// https://fmpisnfdb.in - National Fisheries Development Board

const NFDB_BASE = 'https://fmpisnfdb.in';
const NFDB_HEADERS = {
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

const SPECIES_TYPE_MAP: Record<string, string> = {
  'Whiteleg Shrimp': 'shrimp',
  'Indian nylon shrimp': 'shrimp',
  'Kiddi shrimp': 'shrimp',
  'Giant tiger prawn': 'prawn',
  'Indian white prawn': 'prawn',
  'Flower tail prawn': 'prawn',
  'Jinga prawn': 'prawn',
  'Blue Swimming Crab': 'crab',
  'Flowercrab': 'crab',
  'Green mud crab': 'crab',
  'Spotted crab': 'crab',
};

const FRESHWATER_FISH = new Set([
  'Rohu', 'Catla', 'Mrigal', 'Tilapia', 'Roopchand', 'Grass carp',
  'Common carp', 'Silver carp', 'Carnatic carp', 'Reba Carp', 'Pool Barb',
  'Murrel', 'Magur', 'Singhi', 'Pangas catfish', 'Giant catfish',
  'Pabo Catfish', 'Indian featherback or Chital', 'Bronze Featherback',
  'Climbing Perch', 'Giant Snakehead', 'Green Snake head', 'Assamese snake head',
  'Indian Glassy Fish', 'Stripped Gourami', 'Tiger loach', 'Zebra Danio',
  'Zig zag eel', 'Short fin eel', 'Rainbow Trout', 'Chocolate Mahseer',
  'Golden Mahseer', 'Indian trout',
]);

const MARINE_FISH = new Set([
  'Hilsa shad', 'Indian mackerel', 'Oil sardine', 'White sardine',
  'Rainbow sardine', 'Indian anchovy', 'Malabar anchovy', 'Mustached anchovy',
  'Pomfret', 'Silver pomfret', 'Black pomfret', 'Indian scad',
  'Indian river shad', 'Indo-pacific seer fish', 'Narrow-barred spanish mackerel',
  'Indo-pacific sail fish', 'Big eye thresher', 'Big eye trevally',
  'Big eye tuna', 'Frigate tuna', 'Little tuna', 'Long tail tuna',
  'Skipjack tuna', 'Yellowfin tuna', 'Pelagic thresher',
  'Asian Seabass', 'Burmese King Fish', 'Indian thread fin',
  'Four finger thread fin', 'Talang queen fish', 'Striped bonito',
  'Torpedo scad', 'Horse Mackerel', 'Great barracuda',
  'Pickhandle barracuda', 'Sword fish', 'Milk fish', 'Milk shark',
  'Bearded croaker', 'Lesser tigertooth croaker', 'Spotted croaker',
  'John\'s snapper', 'Mangrove snapper', 'Malabar grouper', 'Malabar blood snapper',
  'Spotted croaker', 'Granulated guitar fish', 'Giant guitar fish',
  'Spade nose shark', 'Big-eyes', 'Japanese threadfin bream',
  'Splendid pony fish', 'Silver Belly', 'Silver sillago',
  'Black barred half beak', 'Needle cuttle fish', 'Pharaoh cuttle fish',
  'Spineless cuttle fish', 'Indian squid', 'Rock lobster',
  'Flat head lobster', 'Brown mussel', 'Green mussel', 'Oyster',
  'Spotted eagle ray', 'Smooth brass snake head',
]);

function getSpeciesType(name: string): string {
  if (SPECIES_TYPE_MAP[name]) return SPECIES_TYPE_MAP[name];
  if (FRESHWATER_FISH.has(name)) return 'freshwater_fish';
  if (MARINE_FISH.has(name)) return 'marine_fish';
  return 'other';
}

let cache: { data: MarketPrice[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

async function fetchNfdbPrices(stateId: number = 1): Promise<MarketPrice[]> {
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

  const body = `draw=1&start=0&length=500&sid=${stateId}&market=&species=&size=&date=${dateStr}`;
  const res = await fetch(`${NFDB_BASE}/prices/filters`, {
    method: 'POST',
    headers: NFDB_HEADERS as any,
    body,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`NFDB returned ${res.status}`);
  const json = await res.json() as any;

  if (!json.data || !Array.isArray(json.data)) return [];

  // Aggregate by species: show min/max/avg across all markets
  const speciesMap = new Map<string, {
    prices: number[];
    markets: Set<string>;
    date: string;
    variety: string;
  }>();

  for (const row of json.data) {
    const [_, species, size, priceStr, date] = row;
    const price = parseFloat(priceStr);
    if (!species || isNaN(price) || price <= 0) continue;

    const key = `${species}|${size}`;
    const existing = speciesMap.get(key);
    if (existing) {
      existing.prices.push(price);
      existing.date = date;
    } else {
      speciesMap.set(key, {
        prices: [price],
        markets: new Set(),
        date,
        variety: size,
      });
    }
  }

  const result: MarketPrice[] = [];
  let idx = 0;

  for (const [key, agg] of speciesMap) {
    const [species, size] = key.split('|');
    const prices = agg.prices;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const speciesType = getSpeciesType(species);

    result.push({
      id: `nfdb-${idx++}`,
      species,
      variety: size.charAt(0).toUpperCase() + size.slice(1),
      price_per_kg: avg,
      min_price: min,
      max_price: max,
      market_name: `AP Fish Markets (${prices.length} sources)`,
      district: 'Andhra Pradesh',
      price_date: agg.date || dateStr.split('-').reverse().join('-'),
      trend: max > min * 1.1 ? 'up' : max < min * 0.95 ? 'down' : 'stable',
      data_source: 'nfdb_govt',
      unit: 'per_kg',
      species_type: speciesType,
    });
  }

  // Sort: shrimp/prawn first, then freshwater, then marine
  const typeOrder: Record<string, number> = { shrimp: 0, prawn: 1, freshwater_fish: 2, crab: 3, marine_fish: 4, other: 5 };
  result.sort((a, b) => (typeOrder[a.species_type] ?? 5) - (typeOrder[b.species_type] ?? 5) || a.species.localeCompare(b.species));

  return result;
}

export async function getFishPricesInAP(): Promise<MarketPrice[]> {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
    return cache.data;
  }

  try {
    const prices = await fetchNfdbPrices(1);
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
    species_types: ['All', 'Shrimp', 'Prawn', 'Freshwater Fish', 'Marine Fish', 'Crab'],
    state: 'Andhra Pradesh',
  };
}
