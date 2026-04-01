import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';
import Parser from 'rss-parser';

const parser = new Parser();

/**
 * Resolves a handle (@name) or legacy user to a permanent Channel ID (UC...)
 */
async function resolveChannelId(url: string): Promise<string> {
  const lastPart = url.split('/').pop() || '';
  if (lastPart.startsWith('UC')) return lastPart; // Already an ID

  try {
    const targetUrl = url.startsWith('http') ? url : `https://www.youtube.com/${url.startsWith('@') ? '' : '@'}${url}`;
    const response = await fetch(targetUrl);
    const html = await response.text();
    const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (match) return match[1];
  } catch (e) {
    console.warn("Could not resolve Channel ID via scraping", e);
  }
  return lastPart.replace('@', ''); // Fallback to raw handle
}

export async function fetchLatestVideosFromChannel(channelUrl: string) {
  try {
    const channelId = await resolveChannelId(channelUrl);
    
    // Strategy: always prefer channel_id if resolved, otherwise fallback to user
    const param = channelId.startsWith('UC') ? 'channel_id' : 'user';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?${param}=${channelId}`;
    
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map(item => ({
        id: (item as any).id?.split(':').pop() || item.link?.split('v=').pop(),
        title: item.title,
        link: item.link,
        pubDate: item.pubDate
    }));
  } catch (error) {
    console.error("YouTube Discovery Error:", error);
    return [];
  }
}

export async function fetchYoutubeMetadata(url: string) {
  try {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    if (!videoId) throw new Error("ID extraction failed");

    const info = await ytdl.getBasicInfo(url, {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }
    });
    
    let transcript = "";
    let hasTranscript = false;
    try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = transcriptData.map(item => item.text).join(" ");
        hasTranscript = transcript.length > 50; 
    } catch (e) {
        console.warn("Transcript failed:", e);
        transcript = info.videoDetails.description || "No content found.";
    }

    return {
      title: info.videoDetails.title,
      content: transcript,
      metadata: {
        has_transcript: hasTranscript,
        thumbnail: info.videoDetails.thumbnails[0]?.url,
        description: info.videoDetails.description,
        publishDate: info.videoDetails.publishDate,
        author: info.videoDetails.author?.name
      }
    };
  } catch (error: any) {
    console.error("YouTube Ingestion Blocked:", error.message);
    return {
        title: "Youtube Entry (" + url + ")",
        content: "Draft content: Automated ingestion partially failed due to rate limits.",
        metadata: { has_transcript: false, original_url: url }
    };
  }
}



