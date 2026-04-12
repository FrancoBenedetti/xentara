import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
});
/**
 * Basic discovery of latest items in a feed
 */
export async function fetchLatestArticlesFromFeed(url: string) {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(item => ({
            id: item.guid || item.link,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
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
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "RSS Article";

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
        title: "RSS Feed Entry",
        content: "Draft content: Automated ingestion failed to scrape full body.",
        metadata: { source_url: url, status: "failed", error: error.message }
    };
  }
}
