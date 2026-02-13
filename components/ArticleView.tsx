import React, { useEffect, useState, useRef, useMemo } from 'react';
import { SearchResultItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Network, List, ChevronRight, File, ExternalLink, Image as ImageIcon, CheckSquare } from 'lucide-react';
import { getPageBlocks, getPageDetails, NotionBlock, NotionPage } from '../services/notionService';
import mermaid from 'mermaid';

interface ArticleViewProps {
    article: SearchResultItem;
    onBack: () => void;
}

// Mermaid Component
const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (ref.current) {
                try {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
                        securityLevel: 'loose',
                        fontFamily: 'Inter, sans-serif'
                    });
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    if (ref.current) ref.current.innerHTML = svg;
                    setError(null);
                } catch (err) {
                    setError("Diagram preview unavailable");
                }
            }
        };
        renderChart();
    }, [chart]);

    if (error) return <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-xs font-mono">{error}</div>;
    return <div ref={ref} className="flex justify-center my-6 overflow-x-auto bg-white/50 dark:bg-white/5 rounded-xl p-6 backdrop-blur-md border border-black/5 dark:border-white/5" />;
};

// Rich Text Renderer
const renderRichText = (richText: any[]) => {
    if (!richText) return null;
    return richText.map((text, i) => {
        const { annotations, text: textContent, href } = text;
        const style: React.CSSProperties = {
            fontWeight: annotations.bold ? '700' : 'inherit',
            fontStyle: annotations.italic ? 'italic' : 'inherit',
            textDecoration: annotations.underline ? 'underline' : annotations.strikethrough ? 'line-through' : 'none',
            color: annotations.color !== 'default' ? annotations.color : 'inherit',
        };

        const content = textContent.content;

        let element = <span key={i} style={style}>{content}</span>;

        if (annotations.code) {
            element = <code key={i} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono text-pink-500 dark:text-pink-400">{content}</code>;
        }

        if (href) {
            return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-current/30 hover:decoration-current transition-colors" style={style}>
                    {element}
                </a>
            );
        }
        return element;
    });
};

// Media URL Extractor
const getMediaUrl = (data: any) => {
    if (!data) return "";
    if (data.type === 'external') return data.external.url;
    if (data.type === 'file') return data.file.url;
    return "";
};

// Recursive Block Renderer
const NotionBlockRenderer: React.FC<{ block: NotionBlock }> = ({ block }) => {
    const type = block.type;
    const data = block[type];
    if (!data) return null;

    const renderChildren = () => {
        if (!block.children || block.children.length === 0) return null;
        return (
            <div className="nested-blocks space-y-2 mt-4">
                {block.children.map(child => <NotionBlockRenderer key={child.id} block={child} />)}
            </div>
        );
    };

    switch (type) {
        case 'paragraph':
            return (
                <div className="mb-4">
                    <p className="text-lg leading-relaxed text-ink/85">{renderRichText(data.rich_text)}</p>
                    {renderChildren()}
                </div>
            );
        case 'heading_1':
            return <h1 id={block.id} className="text-3xl font-bold mt-12 mb-6 text-ink border-b border-black/10 dark:border-white/10 pb-3 tracking-tight scroll-mt-28">{renderRichText(data.rich_text)}</h1>;
        case 'heading_2':
            return <h2 id={block.id} className="text-2xl font-bold mt-10 mb-4 text-ink tracking-tight scroll-mt-28">{renderRichText(data.rich_text)}</h2>;
        case 'heading_3':
            return <h3 id={block.id} className="text-xl font-bold mt-8 mb-3 text-ink tracking-tight scroll-mt-28">{renderRichText(data.rich_text)}</h3>;
        case 'bulleted_list_item':
            return (
                <div className="mb-2">
                    <li className="ml-6 text-lg text-ink/85 list-disc marker:text-subtle/50">
                        {renderRichText(data.rich_text)}
                    </li>
                    <div className="ml-6">{renderChildren()}</div>
                </div>
            );
        case 'numbered_list_item':
            return (
                <div className="mb-2">
                    <li className="ml-6 text-lg text-ink/85 list-decimal marker:text-subtle/50 font-medium">
                        {renderRichText(data.rich_text)}
                    </li>
                    <div className="ml-6">{renderChildren()}</div>
                </div>
            );
        case 'to_do':
            return (
                <div className="flex items-start gap-3 mb-2">
                    <div className={`mt-1.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${data.checked ? 'bg-blue-500 border-blue-500' : 'border-subtle/30'}`}>
                        {data.checked && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`text-lg transition-opacity ${data.checked ? 'opacity-50 line-through' : 'opacity-100'}`}>
                        {renderRichText(data.rich_text)}
                    </div>
                </div>
            );
        case 'toggle':
            return (
                <details className="group mb-5 bg-black/[0.01] dark:bg-white/[0.01] rounded-xl p-4 border border-black/5 dark:border-white/5 overflow-hidden">
                    <summary className="text-base font-bold cursor-pointer list-none flex items-center gap-2 select-none">
                        <ChevronRight className="w-4 h-4 text-subtle/50 group-open:rotate-90 transition-transform" />
                        {renderRichText(data.rich_text)}
                    </summary>
                    <div className="mt-4 ml-6 border-l border-black/5 dark:border-white/5 pl-5">
                        {renderChildren()}
                    </div>
                </details>
            );
        case 'column_list':
            return (
                <div className="flex flex-col md:flex-row gap-8 my-10 items-stretch">
                    {block.children?.map(col => (
                        <div key={col.id} className="flex-1 min-w-0">
                            <NotionBlockRenderer block={col} />
                        </div>
                    ))}
                </div>
            );
        case 'column':
            return <div className="space-y-4">{block.children?.map(child => <NotionBlockRenderer key={child.id} block={child} />)}</div>;
        case 'code':
            if (data.language === 'mermaid') {
                const code = data.rich_text.map((t: any) => t.plain_text).join('');
                return <Mermaid chart={code} />;
            }
            return (
                <div className="relative group my-8">
                    <div className="absolute top-0 right-0 px-4 py-1.5 text-[10px] font-bold font-mono text-subtle/60 uppercase tracking-widest bg-black/5 dark:bg-white/5 rounded-bl-xl border-l border-b border-black/5 dark:border-white/5">
                        {data.language}
                    </div>
                    <pre className="bg-black/[0.03] dark:bg-white/[0.03] p-8 rounded-3xl overflow-x-auto text-[0.9em] font-mono border border-black/5 dark:border-white/5 shadow-inner leading-relaxed">
                        <code>{data.rich_text.map((t: any) => t.plain_text).join('')}</code>
                    </pre>
                </div>
            );
        case 'image':
            const imageUrl = getMediaUrl(data);
            if (!imageUrl) return null;
            return (
                <figure className="my-10">
                    <div className="relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                        <img
                            src={imageUrl}
                            alt="Notion Visual Content"
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onLoad={(e) => (e.currentTarget.parentElement?.classList.remove('bg-black/5', 'animate-pulse'))}
                            onError={(e) => {
                                console.warn("Failed to load image:", imageUrl);
                                e.currentTarget.parentElement?.classList.add('hidden');
                            }}
                        />
                    </div>
                    {data.caption && data.caption.length > 0 && (
                        <figcaption className="text-center text-xs text-subtle mt-4 font-medium italic px-6 opacity-60">
                            {renderRichText(data.caption)}
                        </figcaption>
                    )}
                </figure>
            );
        case 'file':
        case 'video':
        case 'pdf':
            const mediaUrl = getMediaUrl(data);
            if (!mediaUrl) return null;
            return (
                <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl my-4 border border-black/5 dark:border-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-paper dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10">
                        <File className="w-4 h-4 text-ink/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-ink truncate uppercase tracking-wider">{data.caption?.[0]?.plain_text || "Document"}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-subtle/30" />
                </a>
            );
        case 'quote':
            return (
                <div className="my-10 relative pl-8 border-l-4 border-ink/10">
                    <blockquote className="text-2xl font-sans italic text-ink/70 leading-relaxed">
                        {renderRichText(data.rich_text)}
                    </blockquote>
                    <div className="mt-4">{renderChildren()}</div>
                </div>
            );
        case 'divider':
            return <hr className="my-16 border-t-2 border-black/[0.03] dark:border-white/[0.03]" />;
        case 'callout':
            const bgColor = data.color?.split('_')[0] || 'blue';
            return (
                <div className={`flex flex-col gap-6 p-8 rounded-3xl my-10 border transition-all hover:shadow-lg ${bgColor === 'blue' ? 'bg-blue-500/[0.03] border-blue-500/10' :
                    bgColor === 'red' ? 'bg-red-500/[0.03] border-red-500/10' :
                        'bg-ink/[0.03] border-ink/10'
                    }`}>
                    <div className="flex items-start gap-5">
                        <div className="text-3xl pt-1 shrink-0">{data.icon?.emoji || '💡'}</div>
                        <div className="text-xl leading-relaxed text-ink/80 flex-1">{renderRichText(data.rich_text)}</div>
                    </div>
                    <div className="pl-14">{renderChildren()}</div>
                </div>
            );
        case 'synced_block':
            return <div className="synced-content my-4">{renderChildren()}</div>;
        default:
            return null;
    }
};

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
    const [blocks, setBlocks] = useState<NotionBlock[]>([]);
    const [pageDetails, setPageDetails] = useState<NotionPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>("");

    // Recursive heading extractor for TOC
    const headings = useMemo(() => {
        const extracted: { id: string, text: string, level: number }[] = [];
        const scan = (items: NotionBlock[]) => {
            items.forEach(item => {
                if (item.type.startsWith('heading_')) {
                    const text = item[item.type].rich_text.map((t: any) => t.plain_text).join('');
                    if (text) {
                        extracted.push({
                            id: item.id,
                            text,
                            level: parseInt(item.type.split('_')[1])
                        });
                    }
                }
                if (item.children) scan(item.children);
            });
        };
        scan(blocks);
        return extracted;
    }, [blocks]);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                const [blocksData, detailsData] = await Promise.all([
                    getPageBlocks(article.id),
                    getPageDetails(article.id)
                ]);
                setBlocks(blocksData);
                setPageDetails(detailsData);
            } catch (e) {
                console.error("Failed to load page data", e);
            }
            setLoading(false);
        };
        loadPageData();
    }, [article.id]);

    // Scroll Spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -40% 0px', threshold: 0 }
        );

        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings, loading]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const coverImageUrl = pageDetails?.cover ? getMediaUrl(pageDetails.cover) : "";

    return (
        <div className="w-full max-w-5xl mx-auto px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8 relative">

            {/* Floating TOC - Fixed on left edge - Hidden on smaller screens */}
            <aside className="hidden 2xl:block fixed left-4 top-1/2 -translate-y-1/2 w-56 z-40">
                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-xl border border-white/20 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                        <List className="w-3 h-3 text-ink/40" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/40">Navigation</span>
                    </div>
                    <nav className="space-y-0.5 py-2 px-2 max-h-[60vh] overflow-y-auto">
                    {headings.length > 0 ? (
                        headings.map((heading) => (
                            <button
                                key={heading.id}
                                onClick={() => scrollToHeading(heading.id)}
                                className={`
                                    w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-200 min-h-0
                                    ${activeSection === heading.id
                                        ? 'bg-ink text-paper'
                                        : 'text-subtle/60 hover:text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                                    }
                                `}
                                style={{ paddingLeft: `${(heading.level - 1) * 8 + 10}px` }}
                            >
                                <span className="text-[11px] font-medium leading-tight line-clamp-2">{heading.text}</span>
                            </button>
                        ))
                    ) : null}
                    
                    <div className="pt-2 mt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                        <button
                            onClick={onBack}
                            className="w-full flex items-center gap-2 text-subtle/50 hover:text-ink transition-colors px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] min-h-0"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span className="text-[11px] font-medium">Back</span>
                        </button>
                    </div>
                    </nav>
                </div>
            </aside>

            {/* Content Body */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* Mobile Top Controls */}
                <div className="xl:hidden flex justify-between items-center mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-subtle font-medium text-xs bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1.5 rounded-full">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                </div>

                {/* Header */}
                <header className="mb-10">
                    {coverImageUrl && (
                        <div className="w-full h-[20vh] md:h-[25vh] rounded-2xl overflow-hidden mb-8 border border-black/[0.04] dark:border-white/[0.08]">
                            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-subtle/50 mb-4">
                        <span className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
                            <Network className="w-2.5 h-2.5" />
                            {article.category}
                        </span>
                    </div>

                    <div className="flex items-start gap-3 mb-6">
                        {pageDetails?.icon?.emoji && <span className="text-3xl md:text-4xl shrink-0">{pageDetails.icon.emoji}</span>}
                        {pageDetails?.icon?.type !== 'emoji' && pageDetails?.icon && (
                            <img src={getMediaUrl(pageDetails.icon)} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="icon" />
                        )}
                        <h1 className="text-2xl md:text-3xl font-sans font-bold text-ink leading-[1.15] tracking-tight">
                            {article.title}
                        </h1>
                    </div>

                    <AnimatePresence>
                        {article.summary && article.summary !== "No summary available." && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-l-2 border-ink/10 rounded-r-xl text-ink/60 text-sm font-sans leading-relaxed"
                            >
                                {article.summary}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Content */}
                <div className="prose prose-base prose-neutral dark:prose-invert max-w-none font-sans selection:bg-blue-500/20 prose-headings:tracking-tight prose-p:text-ink/80 prose-p:leading-relaxed">
                    {loading ? (
                        <div className="space-y-6 py-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className={`h-5 bg-black/[0.04] dark:bg-white/[0.04] rounded-lg animate-pulse`} style={{ width: `${Math.random() * 30 + 40}%` }}></div>
                                    <div className="h-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-full animate-pulse w-full"></div>
                                    <div className="h-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-full animate-pulse w-[85%]"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="content-root">
                            {blocks.length > 0 ? (
                                blocks.map(block => <NotionBlockRenderer key={block.id} block={block} />)
                            ) : (
                                <div className="py-16 text-center border border-dashed border-black/[0.06] rounded-2xl opacity-50">
                                    <File className="w-10 h-10 mx-auto mb-4 text-subtle/20" />
                                    <p className="font-sans font-semibold text-[10px] uppercase tracking-widest">Entry Data Unavailable</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Attached Properties Section */}
                {!loading && pageDetails?.properties && (
                    <div className="mt-12 pt-8 border-t border-black/[0.04] dark:border-white/[0.04]">
                        <div className="text-[9px] font-semibold uppercase tracking-widest text-subtle/40 mb-4">Linked Assets</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(pageDetails.properties).map(([key, prop]: any) => {
                                if (prop.type === 'files' && prop.files.length > 0) {
                                    return prop.files.map((file: any, idx: number) => (
                                        <a
                                            key={`${key}-${idx}`}
                                            href={getMediaUrl(file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative overflow-hidden rounded-lg border border-black/[0.04] dark:border-white/[0.06] aspect-video bg-black/[0.02] flex items-center justify-center"
                                        >
                                            <img src={getMediaUrl(file)} alt="" className="w-full h-full object-cover" />
                                        </a>
                                    ));
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                <div className="h-32" />
            </motion.main>

        </div>
    );
};

export default ArticleView;
