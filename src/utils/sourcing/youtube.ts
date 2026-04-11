import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
        ['media:group', 'mediaGroup'],
        ['media:content', 'mediaContent']
    ]
  }
});

/**
 * Resolves a handle (@name) or legacy user to a permanent Channel ID (UC...)
 * YouTube's RSS feeds now strictly require the UC... ID for handles.
 */
async function resolveChannelId(url: string): Promise<string | null> {
  const lastPart = url.split('/').pop() || '';
  if (lastPart.startsWith('UC')) return lastPart; // Already an ID

  const isHandle = url.includes('/@') || lastPart.startsWith('@');

  try {
    const targetUrl = url.startsWith('http') ? url : `https://www.youtube.com/${url.startsWith('@') ? '' : '@'}${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`YouTube returned status ${response.status}`);
    
    const html = await response.text();
    
    // 1. Try modern meta tag extraction (Most reliable)
    const metaMatch = html.match(/<meta itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})"/);
    if (metaMatch) return metaMatch[1];
    
    // 2. Try JSON configuration search (ytInitialData)
    const jsonMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (jsonMatch) return jsonMatch[1];

    // 3. Try alternative canonical URL pattern
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/);
    if (canonicalMatch) return canonicalMatch[1];

    // 4. Try externalId in scripts
    const externalMatch = html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (externalMatch) return externalMatch[1];

    console.warn(`Could not find UCID in HTML for ${url}. Fallback required.`);
  } catch (e: any) {
    console.error(`YouTube ID Resolution Failed for ${url}: ${e.message}`);
  }
  
  // Only fallback to legacy user param if NOT a modern handle
  if (isHandle) return null;
  
  return lastPart.replace('@', '');
}

export async function fetchLatestVideosFromChannel(channelUrl: string) {
  try {
    const resolvedId = await resolveChannelId(channelUrl);
    
    if (!resolvedId) {
        throw new Error(`Could not resolve YouTube Channel ID for modern handle (${channelUrl}). Scraper was likely blocked or the identifier is missing.`);
    }

    const param = resolvedId.startsWith('UC') ? 'channel_id' : 'user';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?${param}=${resolvedId}`;
    
    console.info(`Syncing YouTube via RSS: ${feedUrl}`);
    
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items
        .filter(item => !item.title?.toLowerCase().includes('#shorts')) // Filter 1: Title-based
        .map(item => ({
            id: (item as any).id?.split(':').pop() || item.link?.split('v=').pop(),
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
  } catch (error: any) {
    console.error("YouTube Discovery Error [" + channelUrl + "]:", error.message);
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        }
    });
    
    // Filter 2: Duration-based (Shorts are < 60s)
    const duration = parseInt(info.videoDetails.lengthSeconds || "0");
    if (duration > 0 && duration < 60) {
        throw new Error("REJECTED: Video identified as Short-form media (< 60s).");
    }

    let transcript = "";
    let hasTranscript = false;
    try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = transcriptData.map(item => item.text).join(" ");
        hasTranscript = transcript.length > 50; 
    } catch (e: any) {
        console.warn(`Transcript extraction failed for ${videoId}: ${e.message}`);
        
        // Fallback to description, but only if it's substantial
        const description = info.videoDetails.description || "";
        if (description.length > 200) {
            transcript = description;
            hasTranscript = true;
        } else {
            throw new Error(`TRANSCRIPT FAILURE: No usable captions found and description too short for analysis.`);
        }
    }

    return {
      title: info.videoDetails.title,
      content: transcript,
      metadata: {
        has_transcript: hasTranscript,
        thumbnail: info.videoDetails.thumbnails[0]?.url,
        description: info.videoDetails.description,
        publishDate: info.videoDetails.publishDate,
        author: info.videoDetails.author?.name,
        sourceType: 'youtube'
      }
    };
  } catch (error: any) {
    console.error("YouTube Ingestion Blocked:", error.message);
    return {
        title: "Youtube Entry (" + url + ")",
        content: "Draft content: High volume processing may have temporarily limited ingestion data.",
        metadata: { has_transcript: false, original_url: url, sourceType: 'youtube', status: 'limited' }
    };
  }
}
