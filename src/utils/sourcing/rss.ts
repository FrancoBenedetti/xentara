import Parser from 'rss-parser';

// Status codes that are transient and worth retrying (not permanent failures like 403/404)
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2000;

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
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                }
            });

            if (!response.ok) {
                if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
                    const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
                    console.warn(
                        `[RSS] Attempt ${attempt}/${MAX_RETRIES} — status ${response.status} for ${url}. ` +
                        `Retrying in ${delay}ms...`
                    );
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
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
                    content: item['content:encoded'] || (item as any).content || (item as any).description || item.contentSnippet || null,
                }))
            };
        } catch (error: any) {
            lastError = error;
            if (attempt < MAX_RETRIES) {
                const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
                console.warn(
                    `[RSS] Attempt ${attempt}/${MAX_RETRIES} — network error for ${url}: ` +
                    `${error.message}. Retrying in ${delay}ms...`
                );
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    console.error("RSS Discovery Error (all retries exhausted):", lastError?.message);
    throw lastError;
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
