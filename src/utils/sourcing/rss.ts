import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    },
    customFields: {
        item: [
            ['content:encoded', 'content:encoded'],
            ['description', 'description'],
        ]
    }
});
/**
 * Basic discovery of latest items in a feed
 */
export async function fetchLatestArticlesFromFeed(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Status code ${response.status}: Failed to fetch feed`);
        }
        
        const xml = await response.text();
        const feed = await parser.parseString(xml);
        
        return {
            metadata: {
                title: feed.title,
                description: feed.description,
                link: feed.link,
            },
            items: feed.items.map(item => ({
                id: item.guid || item.link,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item['content:encoded'] || (item as any).content || item.contentSnippet || null,
            }))
        };
    } catch (error: any) {
        console.error("RSS Discovery Error:", error.message);
        throw error;
    }
}

/**
 * Deep Ingestion: Follows the RSS link and extracts the actual article content
 */
export async function fetchRSSMetadata(url: string) {
  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Article";

    const cleanContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') 
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')         
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '') 
      .replace(/<[^>]+>/g, ' ')                                          
      .replace(/\s+/g, ' ')                                              
      .trim();

    return {
      title,
      content: cleanContent.slice(0, 18000), 
      metadata: {
        source_url: url,
        ingested_at: new Date().toISOString(),
        content_length: cleanContent.length,
        method: "deep_ingestion_v1"
      }
    };
  } catch (error: any) {
    console.error("Deep RSS Ingestion Failed for " + url, error.message);
    return {
        title: "Content Unavailable",
        content: "Draft content: Automated ingestion failed to scrape full body.",
        metadata: { source_url: url, status: "failed", error: error.message }
    };
  }
}
