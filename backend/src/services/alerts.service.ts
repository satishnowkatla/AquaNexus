export interface DailyAlert {
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

let alertsCache: { data: DailyAlert[]; fetchedAt: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

function getWeatherCodeMeaning(code: number): { desc: string; risk: string } {
  const map: Record<number, { desc: string; risk: string }> = {
    0: { desc: 'Clear sky', risk: 'low' },
    1: { desc: 'Mainly clear', risk: 'low' },
    2: { desc: 'Partly cloudy', risk: 'low' },
    3: { desc: 'Overcast', risk: 'medium' },
    45: { desc: 'Fog', risk: 'medium' },
    48: { desc: 'Depositing rime fog', risk: 'medium' },
    51: { desc: 'Light drizzle', risk: 'medium' },
    53: { desc: 'Moderate drizzle', risk: 'medium' },
    55: { desc: 'Dense drizzle', risk: 'high' },
    61: { desc: 'Slight rain', risk: 'medium' },
    63: { desc: 'Moderate rain', risk: 'high' },
    65: { desc: 'Heavy rain', risk: 'high' },
    80: { desc: 'Slight rain showers', risk: 'medium' },
    81: { desc: 'Moderate rain showers', risk: 'high' },
    82: { desc: 'Violent rain showers', risk: 'high' },
    95: { desc: 'Thunderstorm', risk: 'high' },
    96: { desc: 'Thunderstorm with hail', risk: 'high' },
    99: { desc: 'Thunderstorm with heavy hail', risk: 'high' },
  };
  return map[code] || { desc: 'Variable weather', risk: 'low' };
}

function generateDiseaseRisk(temp: number, humidity: number, rainfall: number): { risk: string; diseases: string[] } {
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
    risk = risk === 'high' ? 'high' : 'medium';
  }

  if (temp > 35) {
    diseases.push('Heat stress mortality', 'Oxygen depletion');
    risk = 'high';
  }

  if (temp < 20) {
    diseases.push('Slow growth rate', 'Reduced feed intake');
    risk = 'medium';
  }

  if (humidity < 40 && rainfall === 0) {
    diseases.push('Ammonia spike risk');
    risk = risk === 'high' ? 'high' : 'medium';
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

export async function generateDailyAlerts(): Promise<DailyAlert[]> {
  if (alertsCache && (Date.now() - alertsCache.fetchedAt) < CACHE_TTL) {
    return alertsCache.data;
  }

  const alerts: DailyAlert[] = [];
  const now = new Date();

  const districts = [
    { name: 'Krishna', lat: 16.17, lon: 81.13 },
    { name: 'West Godavari', lat: 16.92, lon: 81.34 },
    { name: 'East Godavari', lat: 17.00, lon: 81.80 },
    { name: 'Guntur', lat: 16.31, lon: 80.44 },
    { name: 'Nellore', lat: 14.44, lon: 79.99 },
    { name: 'Srikakulam', lat: 18.30, lon: 83.90 },
    { name: 'Visakhapatnam', lat: 17.69, lon: 83.22 },
    { name: 'Prakasam', lat: 15.35, lon: 79.55 },
  ];

  try {
    for (const district of districts) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=3`,
          { signal: AbortSignal.timeout(5000) },
        );
        if (!res.ok) continue;
        const weather = await res.json() as any;
        const current = weather.current;
        const daily = weather.daily;
        if (!current || !daily) continue;

        const temp = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const weatherCode = current.weather_code;
        const windSpeed = current.wind_speed_10m;
        const precipitation = current.precipitation || 0;
        const tomorrowRain = daily.precipitation_sum?.[1] || 0;
        const tomorrowCode = daily.weather_code?.[1] || 0;

        const weatherInfo = getWeatherCodeMeaning(weatherCode);
        const diseaseRisk = generateDiseaseRisk(temp, humidity, precipitation);
        const feedAdvice = generateFeedAdvice(temp, weatherCode, precipitation);

        // High temperature alert
        if (temp > 33) {
          alerts.push({
            id: `heat-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `🌡 High Temperature Alert — ${district.name}`,
            message: `Temperature is ${temp}°C with ${humidity}% humidity. Risk of oxygen depletion in ponds during afternoon. Increase aeration and monitor DO levels.`,
            alert_type: 'weather',
            priority: temp > 36 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Increase aeration, test DO levels, avoid afternoon feeding',
          });
        }

        // Rain / storm alert
        if (tomorrowRain > 10 || weatherCode >= 61) {
          alerts.push({
            id: `rain-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `🌧 Rain Alert — ${district.name}`,
            message: `${weatherInfo.desc}. Expected rainfall: ${tomorrowRain.toFixed(1)}mm tomorrow. Check pond bunds, secure feed stores, reduce feeding.`,
            alert_type: 'weather',
            priority: tomorrowRain > 25 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Check bunds, secure equipment, reduce feeding 50%',
          });
        }

        // Disease risk alert
        if (diseaseRisk.risk !== 'low' && diseaseRisk.diseases.length > 0) {
          alerts.push({
            id: `disease-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `⚠ Disease Risk — ${district.name}`,
            message: `${diseaseRisk.risk.toUpperCase()} risk: ${diseaseRisk.diseases.join(', ')}. Current conditions: ${temp}°C, ${humidity}% humidity, ${precipitation}mm rain.`,
            alert_type: 'disease',
            priority: diseaseRisk.risk === 'high' ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'AI Risk Assessment',
            action: 'Monitor shrimp health, check for white spots, test water quality',
          });
        }

        // Feeding advice
        alerts.push({
          id: `feed-${district.name}-${now.toISOString().split('T')[0]}`,
          title: `📊 Today's Feeding Guide — ${district.name}`,
          message: feedAdvice,
          alert_type: 'feeding',
          priority: 'low',
          district: district.name,
          created_at: now.toISOString(),
          source: 'AI Feed Advisor',
        });

        // Wind alert for aeration
        if (windSpeed > 30) {
          alerts.push({
            id: `wind-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `💨 Wind Advisory — ${district.name}`,
            message: `Wind speed ${windSpeed} km/h. Secure nets and aerators. Check for physical damage to pond structures.`,
            alert_type: 'weather',
            priority: windSpeed > 40 ? 'high' : 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo Live',
            action: 'Secure equipment, check aerator positioning',
          });
        }

        // Temperature range alert for next 3 days
        const maxTemp = Math.max(...(daily.temperature_2m_max || []));
        const minTemp = Math.min(...(daily.temperature_2m_min || []));
        if (maxTemp - minTemp > 12) {
          alerts.push({
            id: `fluctuation-${district.name}-${now.toISOString().split('T')[0]}`,
            title: `📉 Temperature Fluctuation — ${district.name}`,
            message: `Temperature will vary from ${minTemp}°C to ${maxTemp}°C over 3 days. This stress can weaken shrimp immunity. Maintain stable water quality.`,
            alert_type: 'disease',
            priority: 'medium',
            district: district.name,
            created_at: now.toISOString(),
            source: 'Open-Meteo 3-Day Forecast',
            action: 'Monitor pH and ammonia, use probiotics',
          });
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.warn('Alert generation failed:', err);
  }

  if (alerts.length > 0) {
    alertsCache = { data: alerts, fetchedAt: Date.now() };
  }

  return alerts;
}
