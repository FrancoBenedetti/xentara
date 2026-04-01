import Parser from 'rss-parser';

const parser = new Parser();

export async function fetchLatestArticlesFromFeed(url: string) {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(item => ({
            id: item.guid || item.link,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
    } catch (error) {
        console.error("RSS Discovery Error:", error);
        return [];
    }
}

export async function fetchRSSMetadata(url: string) {
  try {
    const feed = await parser.parseURL(url);
    const latestItem = feed.items[0]; // For initial scan, get the latest article

    if (!latestItem) {
        throw new Error("No items found in feed");
    }

    return {
      title: latestItem.title || feed.title || "Untitled Article",
      content: latestItem.content || latestItem.contentSnippet || "No content found",
      metadata: {
        link: latestItem.link,
        pubDate: latestItem.pubDate,
        author: latestItem.creator || latestItem.author || feed.title,
        categories: latestItem.categories || []
      }
    };
  } catch (error) {
    console.error("RSS Ingestion Error:", error);
    throw error;
  }
}
