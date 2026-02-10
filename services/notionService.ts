
export interface NotionPage {
    id: string;
    url: string;
    properties: Record<string, any>;
    content?: string; // Content can be fetched later or eagerly
}

export const searchNotionDatabase = async (query: string): Promise<NotionPage[]> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    const dbId = import.meta.env.VITE_NOTION_DB_ID;

    if (!apiKey || apiKey.includes('PLACEHOLDER')) {
        console.warn('Notion API Key is missing');
        return [];
    }

    try {
        const response = await fetch(`/api/notion/databases/${dbId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    or: [
                        {
                            property: "Name",
                            title: {
                                contains: query
                            }
                        }
                    ]
                },
                page_size: 50
            })
        });

        if (!response.ok) {
            console.error("Notion Search Error", await response.text());
            return [];
        }

        const data = await response.json();
        return data.results as NotionPage[];

    } catch (error) {
        console.error("Notion Fetch Error:", error);
        return [];
    }
};

export const getDatabaseStats = async (): Promise<{ count: number }> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    const dbId = import.meta.env.VITE_NOTION_DB_ID;

    if (!apiKey || apiKey.includes('PLACEHOLDER')) return { count: 0 };

    try {
        // Query with minimal page_size just to get structure, but wait.. Notion API doesn't give total count easily.
        // We have to iterate or make an empty query.
        // For efficiency in this prototype, let's fetch with a reasonable limit.
        const response = await fetch(`/api/notion/databases/${dbId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page_size: 100 // Limit for now to get a "count".
            })
        });

        if (!response.ok) return { count: 0 };
        const data = await response.json();
        // data.results.length is the count of this page.
        // Ideally we check has_more to see if there are more.
        // For prototype, returning results.length is acceptable if DB is small.
        // Better: We can rely on a dedicated "stats" property if we had one, but we don't.
        return { count: data.results.length };

    } catch (e) {
        console.warn("Failed to get DB stats", e);
        return { count: 0 };
    }
};

export const getPageContent = async (pageId: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    if (!apiKey || apiKey.includes('PLACEHOLDER')) return "";

    try {
        const response = await fetch(`/api/notion/blocks/${pageId}/children?page_size=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            }
        });

        if (!response.ok) return "";

        const data = await response.json();
        return data.results.map((block: any) => {
            const type = block.type;
            if (block[type] && block[type].rich_text) {
                return block[type].rich_text.map((t: any) => t.plain_text).join('');
            }
            return "";
        }).join('\n\n'); // Double newline for paragraphs

    } catch (e) {
        console.error("Error fetching page content", e);
        return "";
    }
}
