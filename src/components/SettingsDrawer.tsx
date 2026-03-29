import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Moon, Sun, Info, Mail, LogIn, UserPlus, ChevronRight } from 'lucide-react';
import { t } from '../translations';
import ActionModal, { ModalType } from './ActionModal';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

export default function SettingsDrawer({ isOpen, onClose, lang, setLang }: SettingsDrawerProps) {
  const [isDark, setIsDark] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const dict = t[lang];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/30 backdrop-blur-sm z-[10000]"
          />
          <motion.div
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} bottom-0 w-full max-w-[340px] bg-[#F8F9FA] dark:bg-zinc-950 shadow-2xl z-[10001] flex flex-col transition-colors duration-300`}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="px-6 py-5 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{dict.menu}</h2>
              <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Account Section */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2">{dict.account}</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm transition-colors duration-300">
                  <button onClick={() => setModalType('login')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <LogIn className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.login}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setModalType('signup')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.signup}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2">{dict.preferences}</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm transition-colors duration-300">
                  <button onClick={toggleLang} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.language}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{lang.toUpperCase()}</span>
                      <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2.5} />
                    </div>
                  </button>
                  <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        {isDark ? <Moon className="w-5 h-5" strokeWidth={2.5} /> : <Sun className="w-5 h-5" strokeWidth={2.5} />}
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.darkMode}</span>
                    </div>
                    <div className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors ${isDark ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                      <motion.div 
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ x: isDark ? (lang === 'ar' ? -20 : 20) : 0 }}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2">{dict.about}</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm transition-colors duration-300">
                  <button onClick={() => setModalType('about')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Info className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.aboutUs}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setModalType('contact')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <Mail className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dict.contactTeam}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <ActionModal 
            type={modalType} 
            onClose={() => setModalType(null)} 
            lang={lang} 
          />
        </>
      )}
    </AnimatePresence>
  );
}
