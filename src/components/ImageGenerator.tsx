import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2, Download, Sparkles, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';

export default function ImageGenerator({ location }: { location: Location | null }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt) return;
    
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      
      const contextPrompt = location 
        ? `Generate an image based on this prompt: "${prompt}". The setting should be inspired by the geographical location at latitude ${location.lat.toFixed(4)} and longitude ${location.lng.toFixed(4)}.`
        : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: contextPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const url = `data:image/png;base64,${base64EncodeString}`;
          setImageUrl(url);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("No image was generated. Please try a different prompt.");
      }

    } catch (err: any) {
      console.error("Image generation error:", err);
      const errorMessage = err.message || "";
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setError("Image generation servers are currently at capacity. Please try again later.");
      } else {
        setError(errorMessage || "Failed to generate image.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 pb-28 md:pb-0 relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-white dark:border-zinc-800/50 overflow-hidden transition-colors duration-300"
        >
          <div className="p-8 md:p-12 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 mb-6">
              <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors duration-300">
              Location-Inspired Art
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed transition-colors duration-300">
              Describe an image you want to create. We'll use your current coordinates to magically influence the lighting, geography, and atmosphere.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-8 bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors duration-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[2rem] blur opacity-20 dark:opacity-10 group-focus-within:opacity-40 dark:group-focus-within:opacity-20 transition duration-500"></div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city skyline at sunset..."
                className="relative w-full h-40 p-6 rounded-[1.5rem] bg-white dark:bg-zinc-900 border-0 shadow-sm focus:ring-0 resize-none text-lg font-medium placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-white outline-none transition-colors duration-300"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={generateImage}
                disabled={!prompt || loading}
                className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6" strokeWidth={2.5} />
                    Generate Image
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-6 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded-2xl text-sm font-medium border border-orange-100 dark:border-orange-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
                <p className="leading-relaxed">{error}</p>
                {error.includes('capacity') && window.aistudio && (
                  <button 
                    onClick={() => window.aistudio?.openSelectKey()}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white py-2.5 px-5 rounded-xl hover:bg-orange-700 transition-colors shrink-0 shadow-sm"
                  >
                    <Key className="w-4 h-4" strokeWidth={2.5} />
                    Use Personal Key
                  </button>
                )}
              </div>
            )}

            {imageUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12"
              >
                <div className="relative rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-square shadow-2xl border-4 border-white dark:border-zinc-800 transition-colors duration-300">
                  <img 
                    src={imageUrl} 
                    alt={prompt} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <a
                    href={imageUrl}
                    download="geopro-generated-image.png"
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-bold shadow-sm border border-zinc-200 dark:border-zinc-800"
                  >
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                    Download High-Res
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
