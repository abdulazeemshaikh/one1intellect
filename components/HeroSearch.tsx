import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryKnowledgeBase } from '../services/geminiService';
import { SearchResultItem } from '../types';

interface HeroSearchProps {
    onSearchStart: () => void;
    onSearchComplete: (result: SearchResultItem[], query: string) => void;
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

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearchStart, onSearchComplete, isSearching, compact = false }) => {
    const [query, setQuery] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const performSearch = async (term: string) => {
        if (!term.trim() || isSearching) return;

        setQuery(term);
        setIsFocused(false);

        onSearchStart();
        const result = await queryKnowledgeBase(term);
        onSearchComplete(result, term.trim());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    // Compact mode - just the search bar for navbar
    if (compact) {
        return (
            <div className="w-full">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className={`
                        relative flex items-center w-full h-9 xs:h-10
                        bg-ink/[0.04] dark:bg-white/[0.06]
                        border border-black/[0.04] dark:border-white/[0.06]
                        rounded-full
                        transition-all duration-300 ease-out
                        ${isFocused ? 'bg-ink/[0.06] dark:bg-white/[0.1] border-black/[0.1] dark:border-white/[0.15]' : ''}
                    `}>
                        <div className={`pl-3 xs:pl-4 pr-2 xs:pr-3 transition-colors duration-300 ${isFocused || query ? 'text-ink' : 'text-subtle/40'}`}>
                            {isSearching ? <Loader2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 animate-spin" /> : <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2]" />}
                        </div>

                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="Search..."
                            className="flex-1 bg-transparent border-none outline-none text-xs xs:text-sm text-ink placeholder-subtle/40 font-light tracking-wide h-full w-full min-h-0"
                            disabled={isSearching}
                            autoComplete="off"
                        />

                        <div className="pr-1 xs:pr-1.5">
                            <button
                                type="submit"
                                className={`
                                    flex items-center justify-center p-1 xs:p-1.5 rounded-full transition-all duration-300 ease-out min-h-0 min-w-0
                                    ${query.trim() && !isSearching
                                        ? 'bg-ink text-paper opacity-100 scale-100'
                                        : 'opacity-0 scale-75 pointer-events-none'
                                    }
                                `}
                                disabled={!query.trim() || isSearching}
                            >
                                <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // Full hero mode
    return (
        <div className="w-full flex flex-col items-center justify-center py-4 xs:py-6 sm:py-8 md:py-12">

            {/* Central Branding */}
            <div className="relative mb-3 xs:mb-4 flex flex-col items-center justify-center cursor-pointer" onClick={() => window.location.reload()}>
                <img 
                    src="/logo.png" 
                    alt="one1intellect" 
                    className="h-5 xs:h-6 md:h-8 w-auto dark:invert"
                />
            </div>

            <div className="w-full max-w-[280px] xs:max-w-[360px] sm:max-w-[500px] md:max-w-[625px] relative z-20 px-2 xs:px-0 sm:ml-6">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className={`
                        relative flex items-center w-full h-10 xs:h-11 sm:h-12
                        bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl
                        border border-black/[0.06] dark:border-white/[0.08]
                        rounded-full sm:rounded-[2rem] shadow-sm
                        transition-all duration-300 ease-out
                        ${isFocused ? 'bg-white/95 dark:bg-black/40 border-black/[0.15] dark:border-white/[0.2]' : ''}
                    `}>
                        <div className={`pl-3 xs:pl-4 sm:pl-5 pr-2 xs:pr-3 sm:pr-4 transition-colors duration-300 ${isFocused || query ? 'text-ink' : 'text-subtle/40'}`}>
                            {isSearching ? <Loader2 className="w-4 h-4 xs:w-5 xs:h-5 animate-spin" /> : <Search className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2]" />}
                        </div>

                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            className="flex-1 bg-transparent border-none outline-none text-sm xs:text-base text-ink placeholder-transparent font-light tracking-wide h-full w-full z-10 min-h-0"
                            disabled={isSearching}
                            autoComplete="off"
                        />

                        {!query && (
                            <div className="absolute left-10 xs:left-12 sm:left-[3.5rem] top-0 h-full flex items-center pointer-events-none overflow-hidden select-none">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={placeholderIndex}
                                        initial={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                                        animate={{ y: 0, opacity: 0.35, filter: 'blur(0px)' }}
                                        exit={{ y: -8, opacity: 0, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="text-sm xs:text-base text-ink font-light tracking-wide whitespace-nowrap"
                                    >
                                        {PLACEHOLDERS[placeholderIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="pr-1.5 xs:pr-2 pl-1">
                            <button
                                type="submit"
                                className={`
                                    flex items-center justify-center p-1.5 xs:p-2 rounded-full transition-all duration-500 ease-out min-h-0 min-w-0
                                    ${query.trim() && !isSearching
                                        ? 'bg-ink text-paper opacity-100 translate-x-0 rotate-0 scale-100'
                                        : 'bg-transparent text-subtle/0 opacity-0 translate-x-4 -rotate-45 scale-75 pointer-events-none'
                                    }
                                `}
                                disabled={!query.trim() || isSearching}
                            >
                                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </form>

            </div>

            <div className="mt-2 xs:mt-3 text-center px-4">
                <p className="text-xs xs:text-sm md:text-base font-medium text-subtle/60 tracking-wide xs:tracking-wider leading-relaxed">
                    The front door to all the <span className="italic" style={{ fontFamily: '"Times New Roman", Times, serif' }}>right</span> knowledge
                </p>
            </div>
        </div>
    );
};

export default HeroSearch;
