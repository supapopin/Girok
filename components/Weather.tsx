
import React, { useState, useEffect } from 'react';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; code: number; city: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch weather from Open-Meteo (Free, no API key)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        // Fetch city name from Nominatim (OpenStreetMap)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`, {
          headers: {
            'User-Agent': 'GirokJournalApp/1.0'
          }
        });
        const geoData = await geoRes.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.suburb || geoData.address.county || "Unknown";

        setWeather({
          temp: Math.round(weatherData.current_weather.temperature),
          code: weatherData.current_weather.weathercode,
          city: city
        });
      } catch (err) {
        console.error("Weather fetch error", err);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Geolocation error", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4 pl-4 border-l border-slate-100">Loading Weather...</div>;
  if (!weather) return null;

  // Simple weather icon mapping based on WMO codes
  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️"; // Clear
    if (code >= 1 && code <= 3) return "⛅"; // Partly cloudy
    if (code >= 45 && code <= 48) return "🌫️"; // Fog
    if (code >= 51 && code <= 67) return "🌧️"; // Rain
    if (code >= 71 && code <= 77) return "❄️"; // Snow
    if (code >= 80 && code <= 82) return "🌦️"; // Showers
    if (code >= 95) return "⛈️"; // Thunderstorm
    return "🌡️";
  };

  return (
    <div className="flex items-center gap-3 ml-6 pl-6 border-l border-slate-100">
      <span className="text-2xl filter drop-shadow-sm">{getWeatherIcon(weather.code)}</span>
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm font-black text-slate-800 mb-0.5">{weather.temp}°C</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{weather.city}</span>
      </div>
    </div>
  );
};

export default Weather;
