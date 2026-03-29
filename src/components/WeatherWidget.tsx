import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Loader2, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';
import { t } from '../translations';

export default function WeatherWidget({ location, lang = 'en' }: { location: Location | null, lang?: 'en' | 'ar' }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const dict = t[lang];

  useEffect(() => {
    if (!location) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true`);
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (!location) return null;

  const getWeatherDetails = (code: number) => {
    if (code === 0) return { icon: <Sun className="w-7 h-7 text-amber-500" strokeWidth={2.5} />, text: dict.clearSky };
    if (code === 1 || code === 2 || code === 3) return { icon: <Cloud className="w-7 h-7 text-sky-400" strokeWidth={2.5} />, text: dict.partlyCloudy };
    if (code >= 45 && code <= 48) return { icon: <Wind className="w-7 h-7 text-zinc-400" strokeWidth={2.5} />, text: dict.foggy };
    if (code >= 51 && code <= 67) return { icon: <CloudRain className="w-7 h-7 text-blue-500" strokeWidth={2.5} />, text: dict.rainy };
    if (code >= 71 && code <= 77) return { icon: <Snowflake className="w-7 h-7 text-sky-200" strokeWidth={2.5} />, text: dict.snow };
    if (code >= 95) return { icon: <CloudLightning className="w-7 h-7 text-purple-500" strokeWidth={2.5} />, text: dict.storm };
    return { icon: <Cloud className="w-7 h-7 text-zinc-400" strokeWidth={2.5} />, text: dict.unknown };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center gap-4 min-w-[160px] transition-colors duration-300"
    >
      {loading ? (
        <div className="flex items-center justify-center w-full py-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" strokeWidth={2.5} />
        </div>
      ) : weather ? (
        <>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-50 dark:from-zinc-800 to-zinc-100 dark:to-zinc-900 flex items-center justify-center shadow-inner border border-zinc-200/50 dark:border-zinc-700/50 transition-colors duration-300">
            {getWeatherDetails(weather.weathercode).icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none mb-1 transition-colors duration-300">
              {Math.round(weather.temperature)}°<span className="text-lg text-zinc-400 dark:text-zinc-500">C</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider transition-colors duration-300">
              {getWeatherDetails(weather.weathercode).text}
            </div>
          </div>
        </>
      ) : (
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 w-full text-center transition-colors duration-300">Weather unavailable</div>
      )}
    </motion.div>
  );
}
