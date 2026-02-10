import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryKnowledgeBase } from '../services/geminiService';
import { SearchResultItem } from '../types';

interface HeroSearchProps {
    onSearchStart: () => void;
    onSearchComplete: (result: SearchResultItem[]) => void;
    isSearching: boolean;
    compact?: boolean;
}

const PLACEHOLDERS = [
    "Albert Einstein",
    "AIR",
    "Braneworld",
    "Plasma-filled cosmos",
    "The holographic universe",
    "The Big Splat",
    "Black hole",
    "NASA",
    "GOOGLE"
];

const SUGGESTIONS_POOL = [
    "Albert Einstein", "AIR", "Braneworld", "Plasma-filled cosmos",
    "The holographic universe", "The Big Splat", "Black hole", "NASA", "GOOGLE",
    "Artificial Intelligence", "Quantum Physics", "String Theory"
];

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearchStart, onSearchComplete, isSearching, compact = false }) => {
    const [query, setQuery] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (val.trim().length > 1) {
            const filtered = SUGGESTIONS_POOL.filter(item =>
                item.toLowerCase().includes(val.toLowerCase()) &&
                item.toLowerCase() !== val.toLowerCase()
            ).slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const performSearch = async (term: string) => {
        if (!term.trim() || isSearching) return;

        setQuery(term);
        setIsFocused(false);
        setSuggestions([]);

        onSearchStart();
        const result = await queryKnowledgeBase(term);
        onSearchComplete(result);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    return (
        <div className={`w-full flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${compact ? 'py-4 min-h-[auto]' : 'py-8 md:py-12'}`}>

            {/* Central Branding - Moves to Top Left when compact */}
            <div
                className={`fixed z-[100] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center
        ${compact
                        ? 'top-6 left-6 md:left-12 opacity-100 scale-75 origin-top-left flex-row'
                        : 'relative top-0 left-0 max-h-32 opacity-100 mb-4 scale-100 flex-col justify-center'
                    }`}
            >
                <h1 className="font-sans font-semibold text-3xl md:text-4xl tracking-tight text-ink text-center select-none py-2 px-4 cursor-pointer" onClick={() => window.location.reload()}>
                    ONE1<span className="italic relative inline-block" style={{ fontFamily: '"Times New Roman", Times, serif', paddingRight: '12px', marginRight: '-8px' }}>intellect</span>
                </h1>
            </div>

            <div className={`w-full max-w-2xl relative z-20 transition-all duration-500`}>
                <form onSubmit={handleSubmit} className="relative group">

                    <div className={`
            relative flex items-center w-full h-14
            bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl
            border border-black/[0.06] dark:border-white/[0.08]
            rounded-[2rem] shadow-sm
            transition-all duration-300 ease-out
            ${isFocused ? 'bg-white/95 dark:bg-black/40 border-black/[0.15] dark:border-white/[0.2]' : ''}
          `}>

                        <div className={`pl-5 pr-4 transition-colors duration-300 ${isFocused || query ? 'text-ink' : 'text-subtle/40'}`}>
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 stroke-[2]" />}
                        </div>

                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setTimeout(() => setIsFocused(false), 200);
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-base text-ink placeholder-transparent font-light tracking-wide h-full w-full z-10"
                            disabled={isSearching}
                            autoComplete="off"
                        />

                        {!query && (
                            <div className="absolute left-[3.5rem] top-0 h-full flex items-center pointer-events-none overflow-hidden select-none">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={placeholderIndex}
                                        initial={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                                        animate={{ y: 0, opacity: 0.35, filter: 'blur(0px)' }}
                                        exit={{ y: -8, opacity: 0, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="text-base text-ink font-light tracking-wide whitespace-nowrap"
                                    >
                                        {PLACEHOLDERS[placeholderIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="pr-2 pl-1">
                            <button
                                type="submit"
                                className={`
                  flex items-center justify-center p-2 rounded-full transition-all duration-500 ease-out
                  ${query.trim() && !isSearching
                                        ? 'bg-ink text-paper opacity-100 translate-x-0 rotate-0 scale-100'
                                        : 'bg-transparent text-subtle/0 opacity-0 translate-x-4 -rotate-45 scale-75 pointer-events-none'
                                    }
                `}
                                disabled={!query.trim() || isSearching}
                            >
                                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </form>

                <AnimatePresence>
                    {isFocused && suggestions.length > 0 && !isSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-glass overflow-hidden z-50"
                        >
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        performSearch(item);
                                    }}
                                    className="w-full text-left px-6 py-3.5 text-sm text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors flex items-center gap-3 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-subtle/40" />
                                    <span className="font-light">{item}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`mt-3 text-center transition-all duration-700 delay-100 ${compact ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100'}`}>
                <p className="text-sm md:text-base font-medium text-subtle/60 tracking-wider">
                    The front door to all the <span className="italic font-serif">right</span> knowledge of our Infinite Universe
                </p>
            </div>
        </div>
    );
};

export default HeroSearch;
