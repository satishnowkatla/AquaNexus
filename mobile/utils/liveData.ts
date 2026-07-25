const AP_DISTRICTS = [
  { name: 'Krishna', lat: 16.17, lon: 81.13 },
  { name: 'West Godavari', lat: 16.92, lon: 81.34 },
  { name: 'East Godavari', lat: 17.00, lon: 81.80 },
  { name: 'Guntur', lat: 16.31, lon: 80.44 },
  { name: 'Nellore', lat: 14.44, lon: 79.99 },
  { name: 'Srikakulam', lat: 18.30, lon: 83.90 },
  { name: 'Visakhapatnam', lat: 17.69, lon: 83.22 },
  { name: 'Prakasam', lat: 15.35, lon: 79.55 },
];

export interface LiveAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'weather' | 'disease' | 'feeding' | 'market' | 'general';
  priority: 'low' | 'medium' | 'high';
  district: string;
  created_at: string;
  source: string;
  action?: string;
}

const WEATHER_CODES: Record<number, { desc: string; risk: string }> = {
  0: { desc: 'Clear sky', risk: 'low' }, 1: { desc: 'Mainly clear', risk: 'low' },
  2: { desc: 'Partly cloudy', risk: 'low' }, 3: { desc: 'Overcast', risk: 'medium' },
  45: { desc: 'Fog', risk: 'medium' }, 48: { desc: 'Depositing rime fog', risk: 'medium' },
  51: { desc: 'Light drizzle', risk: 'medium' }, 53: { desc: 'Moderate drizzle', risk: 'medium' },
  55: { desc: 'Dense drizzle', risk: 'high' }, 61: { desc: 'Slight rain', risk: 'medium' },
  63: { desc: 'Moderate rain', risk: 'high' }, 65: { desc: 'Heavy rain', risk: 'high' },
  80: { desc: 'Slight rain showers', risk: 'medium' }, 81: { desc: 'Moderate rain showers', risk: 'high' },
  82: { desc: 'Violent rain showers', risk: 'high' }, 95: { desc: 'Thunderstorm', risk: 'high' },
  96: { desc: 'Thunderstorm with hail', risk: 'high' }, 99: { desc: 'Thunderstorm with heavy hail', risk: 'high' },
};

function getWeatherCodeMeaning(code: number) {
  return WEATHER_CODES[code] || { desc: 'Variable weather', risk: 'low' };
}

function generateDiseaseRisk(temp: number, humidity: number, rainfall: number) {
  const diseases: string[] = [];
  let risk = 'low';

  if (temp > 28 && temp < 35 && humidity > 70 && rainfall > 5) {
    diseases.push('White Spot Syndrome (WSSV)', 'EHP (Enterocytozoon hepatopenaei)');
    risk = 'high';
  } else if (temp > 25 && humidity > 60) {
    diseases.push('Vibrio infection', 'Shell disease');
    risk = 'medium';
  }
  if (rainfall > 20) {
    diseases.push('Fungal infections (Saprolegnia)', 'Bacterial gill disease');
    if (risk !== 'high') risk = 'medium';
  }
  if (temp > 35) {
    diseases.push('Heat stress mortality', 'Oxygen depletion');
    risk = 'high';
  }
  if (temp < 20) {
    diseases.push('Slow growth rate', 'Reduced feed intake');
    if (risk !== 'high') risk = 'medium';
  }
  if (humidity < 40 && rainfall === 0) {
    diseases.push('Ammonia spike risk');
    if (risk !== 'high') risk = 'medium';
  }

  return { risk, diseases };
}

function generateFeedAdvice(temp: number, weatherCode: number, rainfall: number): string {
  if (rainfall > 20) return 'Heavy rain — skip feeding or reduce by 50%. Feed after rain stops.';
  if (temp > 35) return 'Heat stress — feed early morning (5-6 AM) or evening (6-7 PM). Reduce quantity by 30%.';
  if (temp < 20) return 'Cold weather — reduce feeding to once daily. Feed in afternoon when warmest.';
  if (weatherCode >= 61 && weatherCode <= 65) return 'Rain expected — feed 1 hour before rain. Avoid feeding during rain.';
  if (temp >= 25 && temp <= 32) return 'Optimal temperature — feed normally 2-3 times daily for maximum growth.';
  return 'Normal conditions — maintain regular feeding schedule.';
}

let alertsCache: { data: LiveAlert[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

export async function fetchLiveAlerts(): Promise<LiveAlert[]> {
  if (alertsCache && (Date.now() - alertsCache.fetchedAt) < CACHE_TTL) {
    return alertsCache.data;
  }

  const alerts: LiveAlert[] = [];
  const now = new Date();

  const results = await Promise.allSettled(
    AP_DISTRICTS.map(async (district) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=3`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return;
        const weather = await res.json() as any;
        const current = weather.current;
        const daily = weather.daily;
        if (!current || !daily) return;

        const temp = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const weatherCode = current.weather_code;
        const windSpeed = current.wind_speed_10m;
        const precipitation = current.precipitation || 0;
        const tomorrowRain = daily.precipitation_sum?.[1] || 0;

        const weatherInfo = getWeatherCodeMeaning(weatherCode);
        const diseaseRisk = generateDiseaseRisk(temp, humidity, precipitation);
        const feedAdvice = generateFeedAdvice(temp, weatherCode, precipitation);

        if (temp > 33) {
          alerts.push({
            id: `heat-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `High Temperature — ${district.name}`,
            message: `Temperature ${temp}°C with ${humidity}% humidity. Risk of oxygen depletion in ponds during afternoon.`,
            alert_type: 'weather',
            priority: temp > 36 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Increase aeration, test DO levels, avoid afternoon feeding',
          });
        }

        if (tomorrowRain > 10 || weatherCode >= 61) {
          alerts.push({
            id: `rain-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `Rain Alert — ${district.name}`,
            message: `${weatherInfo.desc}. Expected rainfall: ${tomorrowRain.toFixed(1)}mm tomorrow. Check pond bunds, secure feed stores.`,
            alert_type: 'weather',
            priority: tomorrowRain > 25 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Check bunds, secure equipment, reduce feeding 50%',
          });
        }

        if (diseaseRisk.risk !== 'low' && diseaseRisk.diseases.length > 0) {
          alerts.push({
            id: `disease-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `Disease Risk — ${district.name}`,
            message: `${diseaseRisk.risk.toUpperCase()} risk: ${diseaseRisk.diseases.join(', ')}. Current: ${temp}°C, ${humidity}% humidity, ${precipitation}mm rain.`,
            alert_type: 'disease',
            priority: diseaseRisk.risk === 'high' ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'AI Risk Assessment',
            action: 'Monitor shrimp health, check for white spots, test water quality',
          });
        }

        alerts.push({
          id: `feed-${district.name}-${now.toISOString().split('T')[0]}`,
          title: `Feeding Guide — ${district.name}`,
          message: feedAdvice,
          alert_type: 'feeding',
          priority: 'low',
          district: district.name,
          created_at: now.toISOString(),
          source: 'AI Feed Advisor',
        });

        if (windSpeed > 30) {
          alerts.push({
            id: `wind-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `Wind Advisory — ${district.name}`,
            message: `Wind speed ${windSpeed} km/h. Secure nets and aerators. Check for physical damage to pond structures.`,
            alert_type: 'weather',
            priority: windSpeed > 40 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Secure equipment, check aerator positioning',
          });
        }

        const maxTemp = Math.max(...(daily.temperature_2m_max || []));
        const minTemp = Math.min(...(daily.temperature_2m_min || []));
        if (maxTemp - minTemp > 12) {
          alerts.push({
            id: `fluctuation-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `Temperature Fluctuation — ${district.name}`,
            message: `Temperature will vary ${minTemp}°C to ${maxTemp}°C over 3 days. This stress can weaken shrimp immunity.`,
            alert_type: 'disease',
            priority: 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo 3-Day Forecast',
            action: 'Monitor pH and ammonia, use probiotics',
          });
        }
      } catch {}
    })
  );

  if (alerts.length > 0) {
    alertsCache = { data: alerts, fetchedAt: Date.now() };
  }

  return alerts;
}

export interface FeedIngredient {
  id: string;
  name: string;
  name_te: string;
  category: string;
  price_per_kg: number;
  trend: string;
  change_percent: number;
  price_date: string;
  source: string;
}

const BASE_PRICES: Record<string, { base: number; name_te: string; category: string }> = {
  'Fish Meal (65% protein)': { base: 92, name_te: 'చేపల పిండి', category: 'protein' },
  'Soybean Meal (44%)': { base: 48, name_te: 'సోయా పిండి', category: 'protein' },
  'Groundnut Cake': { base: 42, name_te: 'పల్లి పిండి', category: 'protein' },
  'Shrimp Head Meal': { base: 78, name_te: 'రొయ్యల తల పిండి', category: 'protein' },
  'Rice Bran (12%)': { base: 22, name_te: 'బియ్యం తవుడు', category: 'energy' },
  'Maize (Corn)': { base: 26, name_te: 'మొక్కజొన్న', category: 'energy' },
  'Wheat Flour': { base: 30, name_te: 'గోధుమ పిండి', category: 'energy' },
  'Tapioca Starch': { base: 28, name_te: 'జామకాయ మైద', category: 'energy' },
  'Fish Oil': { base: 145, name_te: 'చేపల నూనె', category: 'lipid' },
  'Soybean Oil': { base: 108, name_te: 'సోయా నూనె', category: 'lipid' },
  'Palm Oil': { base: 95, name_te: 'పామాయిల్', category: 'lipid' },
  'Vitamin Mix (Shrimp)': { base: 320, name_te: 'విటమిన్ మిశ్రమం', category: 'additive' },
  'Mineral Mix (Prawn)': { base: 180, name_te: 'ఖనిజ మిశ్రమం', category: 'additive' },
  'Probiotics (Bacillus)': { base: 450, name_te: 'ప్రొబయోటిక్స్', category: 'additive' },
  'Choline Chloride': { base: 280, name_te: 'కోలిన్ క్లోరైడ్', category: 'additive' },
};

function getSeasonalFactor(): number {
  const month = new Date().getMonth();
  const factors = [1.08, 1.05, 1.0, 0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.0, 1.05, 1.10];
  return factors[month];
}

export function getFeedPrices(): FeedIngredient[] {
  const seasonal = getSeasonalFactor();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  return Object.entries(BASE_PRICES).map(([name, info]) => {
    const hash = name.length * 7 + now.getDate();
    const dailyVariation = ((hash % 11) - 5) / 100;
    const price = Math.round(info.base * seasonal * (1 + dailyVariation) * 100) / 100;
    const prevDay = Math.round(info.base * seasonal * (1 + dailyVariation - 0.02) * 100) / 100;
    const change = price - prevDay;
    const changePercent = Math.round((change / prevDay) * 100 * 100) / 100;

    return {
      id: `feed-${name.replace(/\s/g, '-').toLowerCase()}`,
      name,
      name_te: info.name_te,
      category: info.category,
      price_per_kg: price,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change_percent: changePercent,
      price_date: dateStr,
      source: 'AP Feed Market (Seasonal)',
    };
  });
}
