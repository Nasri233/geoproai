import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Loader2, Bot, User, Key, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export default function Chatbot({ location }: { location: Location | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Hello! I am your AI assistant. How can I help you explore your current location or answer any other questions?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<any>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      aiRef.current = ai;
      
      let systemInstruction = "You are a helpful AI assistant for a geolocation app.";
      if (location) {
        systemInstruction += ` The user is currently at latitude ${location.lat.toFixed(4)} and longitude ${location.lng.toFixed(4)}. Use this context if relevant to their questions.`;
      }

      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
        },
      });
    } catch (err) {
      console.error("Failed to initialize AI Chat:", err);
    }
  }, [location]);

  const sendMessage = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMessage });
      setMessages((prev) => [...prev, { role: 'model', text: response.text }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMessage = `Sorry, I encountered an error: ${error.message}`;
      const errStr = error.message || "";
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently receiving too many requests. Please wait a moment and try again.";
      }
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: errorMessage, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-zinc-950 pb-24 md:pb-0 relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.01] z-0 pointer-events-none"></div>
      
      <div className="p-6 md:p-8 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-10 flex flex-col justify-center transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors duration-300">
              Local AI Guide
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5 transition-colors duration-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" strokeWidth={2.5} />
              Ask me anything about your surroundings
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 z-10 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex gap-4 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300 ${
                msg.role === 'user' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-5 h-5" strokeWidth={2.5} /> : <Bot className="w-5 h-5" strokeWidth={2.5} />}
            </div>
            <div
              className={`px-6 py-4 rounded-3xl text-[15px] transition-colors duration-300 ${
                msg.role === 'user'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-sm shadow-lg shadow-zinc-900/10 dark:shadow-white/5'
                  : msg.isError 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 text-orange-800 dark:text-orange-300 rounded-tl-sm shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 rounded-tl-sm shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
              {msg.isError && msg.text.includes('too many requests') && window.aistudio && (
                <button 
                  onClick={() => window.aistudio?.openSelectKey()}
                  className="mt-4 flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-xl hover:bg-orange-700 transition-colors text-sm font-bold shadow-sm"
                >
                  <Key className="w-4 h-4" strokeWidth={2.5} />
                  Use Personal API Key
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex gap-4 max-w-3xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300">
              <Bot className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="px-6 py-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-tl-sm shadow-sm flex items-center gap-3 transition-colors duration-300">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500 dark:text-indigo-400" strokeWidth={2.5} />
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-8 bg-gradient-to-t from-[#F8F9FA] dark:from-zinc-950 via-[#F8F9FA] dark:via-zinc-950 to-transparent sticky bottom-0 z-10 transition-colors duration-300">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-3xl blur-xl group-focus-within:bg-indigo-500/20 dark:group-focus-within:bg-indigo-500/10 transition-colors duration-500"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything about this location..."
            className="relative w-full pl-6 pr-16 py-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all outline-none font-medium text-[15px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
