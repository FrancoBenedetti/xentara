import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';
import Parser from 'rss-parser';

const parser = new Parser();

/**
 * Resolves a handle (@name) or legacy user to a permanent Channel ID (UC...)
 * YouTube's RSS feeds now strictly require the UC... ID for handles.
 */
async function resolveChannelId(url: string): Promise<string> {
  const lastPart = url.split('/').pop() || '';
  if (lastPart.startsWith('UC')) return lastPart; // Already an ID

  try {
    const targetUrl = url.startsWith('http') ? url : `https://www.youtube.com/${url.startsWith('@') ? '' : '@'}${url}`;
    
    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    
    // 1. Try modern meta tag extraction (Most reliable)
    const metaMatch = html.match(/<meta itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})"/);
    if (metaMatch) return metaMatch[1];
    
    // 2. Try JSON configuration search
    const jsonMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (jsonMatch) return jsonMatch[1];

    // 3. Try browseId (Used in some internal YT JSON)
    const browseMatch = html.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (browseMatch) return browseMatch[1];

  } catch (e: any) {
    console.warn(`Could not resolve Channel ID for ${url}: ${e.message}`);
  }
  
  // Fallback to legacy behavior if all else fails
  return lastPart.replace('@', '');
}

export async function fetchLatestVideosFromChannel(channelUrl: string) {
  try {
    const resolvedId = await resolveChannelId(channelUrl);
    
    if (!resolvedId.startsWith('UC')) {
        console.warn(`Using legacy fallback for ${channelUrl} - this may trigger a 404.`);
    }

    const param = resolvedId.startsWith('UC') ? 'channel_id' : 'user';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?${param}=${resolvedId}`;
    
    console.info(`Syncing YouTube via RSS: ${feedUrl}`);
    
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map(item => ({
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
    
    let transcript = "";
    let hasTranscript = false;
    try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = transcriptData.map(item => item.text).join(" ");
        hasTranscript = transcript.length > 50; 
    } catch (e) {
        console.warn("Transcript extraction failed for " + videoId);
        transcript = info.videoDetails.description || "No full transcript available for this media.";
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
