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
    return <div ref={ref} className="flex justify-center my-8 overflow-x-auto bg-white/50 dark:bg-white/5 rounded-2xl p-8 backdrop-blur-md shadow-inner border border-black/5 dark:border-white/5" />;
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
            return <h1 id={block.id} className="text-4xl font-bold mt-16 mb-8 text-ink border-b border-black/10 dark:border-white/10 pb-4 tracking-tight scroll-mt-32">{renderRichText(data.rich_text)}</h1>;
        case 'heading_2':
            return <h2 id={block.id} className="text-3xl font-bold mt-12 mb-6 text-ink tracking-tight scroll-mt-32">{renderRichText(data.rich_text)}</h2>;
        case 'heading_3':
            return <h3 id={block.id} className="text-2xl font-bold mt-10 mb-4 text-ink tracking-tight scroll-mt-32">{renderRichText(data.rich_text)}</h3>;
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
                <details className="group mb-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 border border-black/5 dark:border-white/5 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                    <summary className="text-lg font-bold cursor-pointer list-none flex items-center gap-3 select-none">
                        <ChevronRight className="w-5 h-5 text-subtle group-open:rotate-90 transition-transform" />
                        {renderRichText(data.rich_text)}
                    </summary>
                    <div className="mt-6 ml-8 border-l-2 border-black/5 dark:border-white/5 pl-6">
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
                <figure className="my-12 group">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 aspect-auto min-h-[100px]">
                        <img
                            src={imageUrl}
                            alt="Notion Visual Content"
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                            loading="lazy"
                            onLoad={(e) => (e.currentTarget.parentElement?.classList.remove('bg-black/5', 'animate-pulse'))}
                            onError={(e) => {
                                console.warn("Failed to load image:", imageUrl);
                                e.currentTarget.parentElement?.classList.add('hidden');
                            }}
                        />
                    </div>
                    {data.caption && data.caption.length > 0 && (
                        <figcaption className="text-center text-sm text-subtle mt-6 font-medium italic px-10 leading-relaxed opacity-70">
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
                <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl my-6 border border-black/5 dark:border-white/10 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                        <File className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-ink truncate">{data.caption?.[0]?.plain_text || "Attached Document"}</div>
                        <div className="text-[10px] uppercase tracking-widest text-subtle/50 mt-0.5">{type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-subtle/30 group-hover:text-ink transition-colors" />
                </a>
            );
        case 'quote':
            return (
                <div className="my-10 relative pl-8 border-l-4 border-ink/10">
                    <blockquote className="text-2xl font-serif italic text-ink/70 leading-relaxed">
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
            const offset = 120;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const coverImageUrl = pageDetails?.cover ? getMediaUrl(pageDetails.cover) : "";

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16 relative">

            {/* TOC Sidebar */}
            <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-32">
                    <div className="flex items-center gap-3 mb-8 text-ink/30 uppercase tracking-[0.25em] text-[11px] font-black">
                        <List className="w-3.5 h-3.5" />
                        Navigation
                    </div>
                    <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {headings.length > 0 ? (
                            headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={`
                                        group w-full text-left flex items-start gap-3 py-2.5 px-4 rounded-xl transition-all duration-300
                                        ${activeSection === heading.id
                                            ? 'bg-ink text-paper shadow-lg shadow-ink/10 -translate-y-0.5'
                                            : 'text-subtle/70 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5'
                                        }
                                    `}
                                    style={{ marginLeft: `${(heading.level - 1) * 1.25}rem` }}
                                >
                                    <ChevronRight className={`w-3.5 h-3.5 mt-1 shrink-0 transition-all ${activeSection === heading.id ? 'opacity-100 rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    <span className="text-sm font-bold leading-tight">{heading.text}</span>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center">
                                <p className="text-[10px] text-subtle/50 uppercase font-black italic">Outline Unavailable</p>
                            </div>
                        )}
                    </nav>

                    <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-3 text-subtle hover:text-ink transition-all group px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-widest">Return to Library</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Body */}
            <motion.main
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-w-0"
            >
                {/* Mobile Top Controls */}
                <div className="lg:hidden flex justify-between items-center mb-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-subtle font-bold text-sm bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-widest text-subtle/40">Article View</div>
                </div>

                {/* Header */}
                <header className="mb-20">
                    {coverImageUrl && (
                        <div className="w-full h-[40vh] md:h-[50vh] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl relative group border border-black/5 dark:border-white/10">
                            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-subtle/50 mb-8">
                        <span className="flex items-center gap-2.5 bg-ink/5 px-4 py-2 rounded-full text-ink/80">
                            <Network className="w-4 h-4" />
                            {article.category}
                        </span>
                        {article.createdDate && (
                            <span className="flex items-center gap-2.5 bg-black/[0.02] dark:bg-white/[0.02] px-4 py-2 rounded-full">
                                <Calendar className="w-4 h-4" />
                                {new Date(article.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    <div className="flex items-start gap-6 mb-10">
                        {pageDetails?.icon?.emoji && <span className="text-6xl md:text-7xl drop-shadow-sm shrink-0">{pageDetails.icon.emoji}</span>}
                        {pageDetails?.icon?.type !== 'emoji' && pageDetails?.icon && (
                            <img src={getMediaUrl(pageDetails.icon)} className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0" alt="icon" />
                        )}
                        <h1 className="text-5xl md:text-7xl font-sans font-black text-ink leading-[1] tracking-tighter">
                            {article.title}
                        </h1>
                    </div>

                    <AnimatePresence>
                        {article.summary && article.summary !== "No summary available." && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-10 bg-gradient-to-br from-black/[0.03] to-transparent dark:from-white/[0.03] border-l-[6px] border-ink/20 rounded-r-[2rem] text-ink/80 text-2xl font-serif leading-relaxed italic relative overflow-hidden"
                            >
                                <div className="relative z-10">{article.summary}</div>
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <List className="w-24 h-24" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Content */}
                <div className="prose prose-2xl prose-neutral dark:prose-invert max-w-none font-serif selection:bg-blue-500/20">
                    {loading ? (
                        <div className="space-y-10 py-10">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className={`h-8 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse`} style={{ width: `${Math.random() * 30 + 40}%` }}></div>
                                    <div className="h-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-full animate-pulse w-full"></div>
                                    <div className="h-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-full animate-pulse w-[90%]"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="content-root">
                            {blocks.length > 0 ? (
                                blocks.map(block => <NotionBlockRenderer key={block.id} block={block} />)
                            ) : (
                                <div className="py-32 text-center border-2 border-dashed border-black/5 rounded-[3rem] opacity-40">
                                    <File className="w-16 h-16 mx-auto mb-6 text-subtle/20" />
                                    <p className="font-sans font-black text-xs uppercase tracking-widest">Entry Data Unavailable</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Attached Properties Section */}
                {!loading && pageDetails?.properties && (
                    <div className="mt-32 pt-16 border-t-2 border-black/[0.03] dark:border-white/[0.03]">
                        <div className="flex items-center gap-3 mb-10 text-ink/30 uppercase tracking-[0.25em] text-[11px] font-black">
                            <ImageIcon className="w-4 h-4" />
                            Linked Assets
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(pageDetails.properties).map(([key, prop]: any) => {
                                if (prop.type === 'files' && prop.files.length > 0) {
                                    return prop.files.map((file: any, idx: number) => (
                                        <a
                                            key={`${key}-${idx}`}
                                            href={getMediaUrl(file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/10 aspect-video bg-black/5 flex items-center justify-center"
                                        >
                                            <img src={getMediaUrl(file)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center text-white">
                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                                                    <ExternalLink className="w-5 h-5" />
                                                </div>
                                                <div className="text-xs font-black uppercase tracking-widest">{file.name || key}</div>
                                            </div>
                                        </a>
                                    ));
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                <div className="h-64" />
            </motion.main>

        </div>
    );
};

export default ArticleView;
