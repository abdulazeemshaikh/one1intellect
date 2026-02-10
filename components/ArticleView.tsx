import React, { useEffect, useState } from 'react';
import { SearchResultItem } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Network } from 'lucide-react';
import { getPageContent } from '../services/notionService';

interface ArticleViewProps {
    article: SearchResultItem;
    onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            const data = await getPageContent(article.id);
            setContent(data);
            setLoading(false);
        };
        loadContent();
    }, [article.id]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-3xl mx-auto px-6 py-8"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-subtle hover:text-ink transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Results
            </button>

            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-subtle mb-4">
                    <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
                        <Network className="w-3 h-3" />
                        {article.category}
                    </span>
                    {article.createdDate && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.createdDate).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl md:text-5xl font-sans font-bold text-ink leading-tight mb-6">
                    {article.title}
                </h1>

                {article.summary && article.summary !== "No summary available." && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-2 border-amber-500 text-ink/80 text-lg italic leading-relaxed mb-8">
                        {article.summary}
                    </div>
                )}
            </div>

            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-5/6"></div>
                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-full"></div>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap font-serif leading-8 text-ink/90">
                        {content || "No content found for this page."}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ArticleView;
