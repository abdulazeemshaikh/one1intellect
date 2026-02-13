import React from 'react';
import { SearchResultItem } from '../types';
import { motion } from 'framer-motion';
import { Calendar, Network, Type, Lightbulb, Footprints, BookOpen, FlaskConical, Tag } from 'lucide-react';

// Map category names to their corresponding icons
const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('knowledge') || categoryLower.includes('pedia') || categoryLower.includes('encyclopedia')) {
        return Network;
    }
    if (categoryLower.includes('language') || categoryLower.includes('dictionary') || categoryLower.includes('meaning')) {
        return Type;
    }
    if (categoryLower.includes('insight') || categoryLower.includes('thinking') || categoryLower.includes('idea')) {
        return Lightbulb;
    }
    if (categoryLower.includes('guide') || categoryLower.includes('how') || categoryLower.includes('practical')) {
        return Footprints;
    }
    if (categoryLower.includes('religious') || categoryLower.includes('spiritual') || categoryLower.includes('sacred')) {
        return BookOpen;
    }
    if (categoryLower.includes('research') || categoryLower.includes('paper') || categoryLower.includes('study') || categoryLower.includes('science')) {
        return FlaskConical;
    }
    
    return Tag; // Default fallback
};

interface ResultViewProps {
    results: SearchResultItem[];
    onClear: () => void;
    onSelectArticle: (article: SearchResultItem) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ results, onClear, onSelectArticle }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 pb-12 xs:pb-16 sm:pb-20">
            <div className="grid grid-cols-1 gap-2 xs:gap-3">
                {results.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-white/50 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/30 dark:border-white/[0.06] rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 hover:bg-white/70 dark:hover:bg-white/[0.05] hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 cursor-pointer active:scale-[0.99]"
                        onClick={() => onSelectArticle(item)}
                    >
                        <div className="mb-1.5 xs:mb-2">
                            <h3 className="font-sans font-semibold text-base xs:text-lg text-ink transition-colors line-clamp-2">
                                {item.title}
                            </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[9px] xs:text-[10px] text-subtle/60 mb-1.5 xs:mb-2 uppercase tracking-wide font-medium">
                            {(() => {
                                const CategoryIcon = getCategoryIcon(item.category);
                                return (
                                    <span className="flex items-center gap-1">
                                        <CategoryIcon className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                                        {item.category}
                                    </span>
                                );
                            })()}
                            {item.createdDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                                    {new Date(item.createdDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <p className="text-xs xs:text-sm text-subtle/70 line-clamp-2 leading-relaxed font-sans">
                            {item.summary}
                        </p>
                    </motion.div>
                ))}
            </div>

            {results.length === 0 && (
                <div className="text-center py-12 xs:py-16 sm:py-20 text-subtle">
                    <p className="text-sm xs:text-base">No matching articles found in the knowledge base.</p>
                </div>
            )}
        </div>
    );
};

export default ResultView;
