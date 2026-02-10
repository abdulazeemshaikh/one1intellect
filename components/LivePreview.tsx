import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

const PREVIEWS = [
  { id: 104, title: "Consciousness", summary: "Emergent property vs. fundamental state.", confidence: "High" },
  { id: 27, title: "Time", summary: "Thermodynamic arrow and relative perception.", confidence: "Medium" },
  { id: 1, title: "Existence", summary: "Ontological frameworks in modern physics.", confidence: "High" },
  { id: 89, title: "Quantum Entanglement", summary: "Non-local interaction verified.", confidence: "High" }
];

const LivePreview: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PREVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = PREVIEWS[index];

  return (
    <div className="w-full mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 p-1">
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm">
          <Activity className="w-3 h-3 text-ink" />
          <h3 className="text-[9px] font-bold text-ink uppercase tracking-widest">Live</h3>
        </div>

        <div className="flex-1 w-full relative h-10 overflow-hidden rounded-xl border border-border bg-white/40 dark:bg-white/5 backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-[10px] text-subtle/40 font-mono tracking-tighter">#{current.id}</span>
                <span className="text-xs font-medium text-ink whitespace-nowrap">{current.title}</span>
                <span className="hidden md:inline text-subtle/20 text-[10px]">|</span>
                <span className="hidden md:inline text-[10px] text-subtle truncate font-light">{current.summary}</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 opacity-80">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>{current.confidence}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default LivePreview;