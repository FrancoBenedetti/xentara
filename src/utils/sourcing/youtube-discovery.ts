import Parser from 'rss-parser';

const parser = new Parser();

export async function getLatestVideosFromChannel(channelId: string) {
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map(item => ({
        id: item.id.replace('yt:video:', ''),
        title: item.title,
        url: item.link,
        publishedAt: item.pubDate
    }));
  } catch (error) {
    console.error("YouTube Channel Discovery Error:", error);
    return [];
  }
}

/**
 * Robust YouTube URL to Channel ID resolver
 */
export async function resolveChannelId(url: string) {
    // Simple regex for common channel ID patterns
    const match = url.match(/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (match) return match[1];

    // For @handles, we'd normally need the YouTube Data API or scraping.
    // As a fallback for this phase, we assume the user provides a channel ID or a standard URL.
    return null; 
}
