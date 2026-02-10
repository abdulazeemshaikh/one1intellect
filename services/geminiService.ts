import { SearchResultItem } from "../types";
import { searchNotionDatabase, getPageContent } from "./notionService";

export const queryKnowledgeBase = async (query: string): Promise<SearchResultItem[]> => {
  try {
    const notionResults = await searchNotionDatabase(query);

    if (notionResults.length === 0) {
      return [];
    }

    // Map results to items
    const items: SearchResultItem[] = await Promise.all(notionResults.map(async page => {
      const props = page.properties;

      // 1. Name
      let title = "Untitled";
      try {
        const nameProp = props["Name"] || props["title"];
        if (nameProp?.title?.[0]?.plain_text) {
          title = nameProp.title[0].plain_text;
        }
      } catch (e) { }

      // 2. Knowledge categories
      let category = "Uncategorized";
      try {
        const catProp = props["Knowledge categories"];
        if (catProp?.select?.name) {
          category = catProp.select.name;
        } else if (catProp?.multi_select?.length > 0) {
          category = catProp.multi_select.map((s: any) => s.name).join(", ");
        }
      } catch (e) { }

      // 3. Created Date
      let createdDate = "";
      try {
        const dateProp = props["Created Date"] || props["Date"];
        // If it's a date property
        if (dateProp?.date?.start) {
          createdDate = dateProp.date.start;
        } else if (dateProp?.created_time) {
          createdDate = new Date(dateProp.created_time).toLocaleDateString();
        } else {
          // specific "Created time" property type
          const createdTimeProp = props["Created time"];
          if (createdTimeProp?.created_time) {
            createdDate = new Date(createdTimeProp.created_time).toLocaleDateString();
          }
        }
      } catch (e) { }

      // 4. Summary
      let summary = "";
      try {
        // Check if there is a 'Summary' text property
        const summaryProp = props["Summary"];
        if (summaryProp?.rich_text?.[0]?.plain_text) {
          summary = summaryProp.rich_text.map((t: any) => t.plain_text).join("");
        }
      } catch (e) { }

      // 5. Full Content (Lazy load optimized: We fetch it here for the 'click' requirement 'exactly show whatever there is')
      // Ideally we fetch it only on click, but since the user wants it ready, let's just keep it empty here 
      // and fetch in the ArticleView component to keep search fast.

      return {
        id: page.id,
        title,
        category,
        createdDate,
        summary: summary || "No summary available.",
        fullContent: "" // Will fetch on demand
      };
    }));

    return items;

  } catch (error) {
    console.error("Knowledge Query Error:", error);
    return [];
  }
};