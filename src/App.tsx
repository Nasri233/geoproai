import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2, Search, Compass, Sparkles, Navigation, Share2, Check, Mail, Menu, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Map from './components/Map';
import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import WeatherWidget from './components/WeatherWidget';
import SettingsDrawer from './components/SettingsDrawer';
import { Location } from './types';
import { t } from './translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'image' | 'chat'>('map');
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const dict = t[lang];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationError(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        setLocationError(`Location set to: ${data[0].display_name}`);
      } else {
        setLocationError("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setLocationError("Failed to search for location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = async () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const shareData = {
      title: 'My Location - GeoPro',
      text: 'Check out my current location on the map!',
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.toLowerCase().includes('cancel')) {
        // User simply canceled the share dialog, no action needed
        console.log('Share canceled by user');
      } else {
        console.error('Error sharing:', err);
        // Fallback to clipboard if native share fails for other reasons
        try {
          await navigator.clipboard.writeText(url);
          setIsShared(true);
          setTimeout(() => setIsShared(false), 2000);
        } catch (clipboardErr) {
          console.error('Clipboard fallback failed:', clipboardErr);
        }
      }
    }
  };

  const handleEmailShare = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const subject = encodeURIComponent('My Location - GeoPro');
    const body = encodeURIComponent(`Check out my current location on the map!\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleLocateMe = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(dict.locatingSignal || "Could not get precise location. Please ensure GPS is enabled.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setLocation({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
          setLocationError(`Using IP-based location (${data.city || 'Unknown City'}, ${data.country || 'Unknown Country'}) because precise geolocation was denied.`);
        } else {
          throw new Error("Invalid IP location data");
        }
      } catch (err) {
        setLocation({ lat: 37.7749, lng: -122.4194 });
        setLocationError("Using default location (San Francisco) because all location methods failed.");
      }
    };

    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationError(null);
          },
          (error) => {
            console.error("Geolocation error:", error);
            fetchIpLocation();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } catch (err) {
        console.error("Geolocation sync error:", err);
        fetchIpLocation();
      }
    } else {
      fetchIpLocation();
    }
  }, []);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-screen w-full bg-[#F8F9FA] dark:bg-zinc-950 flex overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-e border-zinc-200/50 dark:border-zinc-800/50 z-50 shadow-[8px_0_30px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <div className="p-8 flex flex-col h-full">
          <div>
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-bold text-2xl tracking-tight mb-12 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Navigation className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              {dict.appTitle}
            </div>
            
            <nav className="space-y-3">
              <DesktopNavButton 
                active={activeTab === 'map'} 
                onClick={() => setActiveTab('map')} 
                icon={<Compass className="w-5 h-5" strokeWidth={2.5} />} 
                label={dict.exploreMap} 
              />
              <DesktopNavButton 
                active={activeTab === 'image'} 
                onClick={() => setActiveTab('image')} 
                icon={<Sparkles className="w-5 h-5" strokeWidth={2.5} />} 
                label={dict.aiStudio} 
              />
              <DesktopNavButton 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')} 
                icon={<MessageSquare className="w-5 h-5" strokeWidth={2.5} />} 
                label={dict.aiGuide} 
              />
            </nav>
          </div>

          <div className="mt-auto pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300">
            <DesktopNavButton 
              active={isSettingsOpen} 
              onClick={() => setIsSettingsOpen(true)} 
              icon={<Menu className="w-5 h-5" strokeWidth={2.5} />} 
              label={dict.menu} 
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        {activeTab === 'map' && (
          <div className="absolute inset-0 z-0">
            {location ? (
              <Map location={location} onLocationSelect={setLocation} dict={dict} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
                <div className="relative flex flex-col items-center">
                  <div className="w-32 h-32 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full flex items-center justify-center relative transition-colors duration-300">
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                    <Navigation className="w-8 h-8 text-indigo-500 animate-pulse" strokeWidth={2.5} />
                  </div>
                  <p className="mt-8 font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase text-sm transition-colors duration-300">{dict.locatingSignal}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating UI Elements for Map */}
        <AnimatePresence>
          {activeTab === 'map' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 md:top-8 start-4 end-4 md:start-8 md:end-8 z-[1000] flex flex-col gap-4 pointer-events-none"
            >
              {/* Top Row: Search Bar and Share Button */}
              <div className="flex items-start gap-4 w-full">
                {/* Search Bar */}
                <div className="flex-1 max-w-md pointer-events-auto">
                  <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <input
                      type="text"
                      placeholder={dict.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="relative w-full ps-12 pe-4 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none font-medium text-[15px]"
                    />
                    <div className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} /> : <Search className="w-5 h-5" strokeWidth={2.5} />}
                    </div>
                  </form>
                  
                  <AnimatePresence>
                    {locationError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/80 dark:border-zinc-800/80 rounded-xl p-3 shadow-lg overflow-hidden transition-colors duration-300"
                      >
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed flex items-start gap-2">
                          <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                          {locationError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Share Buttons (Desktop & Mobile) */}
                {location && (
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLocateMe}
                      className="pointer-events-auto bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white h-[52px] w-[52px] md:w-auto md:px-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      title={dict.locateMe}
                    >
                      <LocateFixed className="w-5 h-5" strokeWidth={2.5} />
                      <span className="hidden md:inline">{dict.locateMe}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEmailShare}
                      className="pointer-events-auto bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white h-[52px] px-4 md:px-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <Mail className="w-5 h-5" strokeWidth={2.5} />
                      <span className="hidden md:inline">{dict.email}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="pointer-events-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-[52px] px-4 md:px-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100"
                    >
                      {isShared ? (
                        <>
                          <Check className="w-5 h-5 text-green-400 dark:text-green-500" strokeWidth={2.5} />
                          <span className="hidden md:inline text-green-400 dark:text-green-500">{dict.copied}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5" strokeWidth={2.5} />
                          <span className="hidden md:inline">{dict.share}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Weather Widget (Positioned below search/share on mobile, right-aligned on desktop) */}
              {location && (
                <div className="pointer-events-auto self-end md:self-end mt-2">
                  <WeatherWidget location={location} lang={lang} />
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'image' && <ImageGenerator location={location} />}
        {activeTab === 'chat' && <Chatbot location={location} />}
      </main>

      {/* Mobile Bottom Nav - Floating Pill */}
      <nav className="md:hidden fixed bottom-6 start-4 end-4 z-[9999] pointer-events-none">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-2 flex justify-around items-center pointer-events-auto transition-colors duration-300">
          <MobileNavButton 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            icon={<Compass className="w-6 h-6" strokeWidth={2.5} />} 
            label={dict.explore} 
          />
          <MobileNavButton 
            active={activeTab === 'image'} 
            onClick={() => setActiveTab('image')} 
            icon={<Sparkles className="w-6 h-6" strokeWidth={2.5} />} 
            label={dict.create} 
          />
          <MobileNavButton 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            icon={<MessageSquare className="w-6 h-6" strokeWidth={2.5} />} 
            label={dict.aiGuide} 
          />
          <MobileNavButton 
            active={isSettingsOpen} 
            onClick={() => setIsSettingsOpen(true)} 
            icon={<Menu className="w-6 h-6" strokeWidth={2.5} />} 
            label={dict.menu} 
          />
        </div>
      </nav>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} lang={lang} setLang={setLang} />
    </div>
  );
}

function DesktopNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 ${
        active 
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/20 dark:shadow-white/10' 
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
    >
      <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 ${active ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}>{label}</span>
    </button>
  );
}
