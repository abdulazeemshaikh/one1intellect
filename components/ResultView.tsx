import React from 'react';
import { SearchResultItem } from '../types';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Tag } from 'lucide-react';

interface ResultViewProps {
    results: SearchResultItem[];
    onClear: () => void;
    onSelectArticle: (article: SearchResultItem) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ results, onClear, onSelectArticle }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-20">

            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-subtle font-medium">Found {results.length} verified articles</p>
                <button
                    onClick={onClear}
                    className="text-[10px] font-bold text-subtle hover:text-ink uppercase tracking-widest transition-colors"
                >
                    Clear Search
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {results.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-6 hover:shadow-lg hover:border-ink/20 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
                        onClick={() => onSelectArticle(item)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-sans font-semibold text-xl text-ink group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h3>
                                <ArrowUpRight className="w-5 h-5 text-subtle opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>

                            <div className="flex items-center gap-4 text-xs text-subtle mb-3 uppercase tracking-wide font-medium">
                                <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                                    <Tag className="w-3 h-3" />
                                    {item.category}
                                </span>
                                {item.createdDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.createdDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <p className="text-base text-subtle/80 line-clamp-2 leading-relaxed font-serif">
                                {item.summary}
                            </p>

                            <div className="mt-4 pt-3 border-t border-dashed border-black/5 dark:border-white/5 flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest text-subtle/60 font-semibold">Verified Entry</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {results.length === 0 && (
                <div className="text-center py-20 text-subtle">
                    <p>No matching articles found in the knowledge base.</p>
                </div>
            )}
        </div>
    );
};

export default ResultView;
