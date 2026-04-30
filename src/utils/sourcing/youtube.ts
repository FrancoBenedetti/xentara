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
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/'
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
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    if (!videoId) {
        return {
            title: "Youtube Entry (" + url + ")",
            content: "",
            metadata: { has_transcript: false, original_url: url, sourceType: 'youtube', status: 'limited' }
        };
    }

    // --- Attempt 1: Full metadata via ytdl (may be blocked by YouTube bot detection) ---
    let videoDetails: any = null;
    try {
        const info = await ytdl.getBasicInfo(url, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.youtube.com/'
                }
            }
        });
        videoDetails = info.videoDetails;

        // Filter: Duration-based (Shorts are < 60s)
        const duration = parseInt(videoDetails.lengthSeconds || "0");
        if (duration > 0 && duration < 60) {
            throw new Error("REJECTED: Video identified as Short-form media (< 60s).");
        }
    } catch (ytdlError: any) {
        // Re-throw explicit rejections (Shorts) so the pipeline can auto-purge them
        if (ytdlError.message?.startsWith("REJECTED:")) throw ytdlError;
        // Otherwise ytdl is just blocked — log and continue to transcript attempt
        console.warn(`ytdl.getBasicInfo blocked for ${videoId}: ${ytdlError.message}`);
    }

    // --- Attempt 2: Transcript via YoutubeTranscript (tries InnerTube then web scrape) ---
    let transcript = "";
    let hasTranscript = false;
    try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = transcriptData.map(item => item.text).join(" ");
        hasTranscript = transcript.length > 50;
    } catch (transcriptError: any) {
        console.warn(`YoutubeTranscript library threw for ${videoId}: ${transcriptError.message}`);
    }

    // If the library returned empty (either threw or returned []), try InnerTube directly
    if (!hasTranscript) {
        console.warn(`YoutubeTranscript returned no content for ${videoId}. Trying InnerTube fallback...`);
        try {
            const innerTubeRes = await fetch(
                'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)',
                    },
                    body: JSON.stringify({
                        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
                        videoId,
                    }),
                }
            );

            if (innerTubeRes.ok) {
                const playerData = await innerTubeRes.json();
                const captionTracks: any[] =
                    playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

                if (captionTracks.length > 0) {
                    // Prefer English track, fall back to first available
                    const track =
                        captionTracks.find((t: any) => t.languageCode === 'en') ??
                        captionTracks[0];

                    if (track?.baseUrl) {
                        const ttRes = await fetch(track.baseUrl, {
                            headers: {
                                'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)',
                            },
                        });

                        if (ttRes.ok) {
                            const xml = await ttRes.text();
                            // Parse both <p><s> (XML3) and legacy <text> formats
                            const psSegments = [...xml.matchAll(/<p\s+t="\d+"\s+d="\d+"[^>]*>([\s\S]*?)<\/p>/g)];
                            if (psSegments.length > 0) {
                                transcript = psSegments.map(m => {
                                    const inner = m[1];
                                    const sMatches = [...inner.matchAll(/<s[^>]*>([^<]*)<\/s>/g)];
                                    return sMatches.length > 0
                                        ? sMatches.map(s => s[1]).join('')
                                        : inner.replace(/<[^>]+>/g, '');
                                }).join(' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
                            } else {
                                // Legacy <text> format
                                const textMatches = [...xml.matchAll(/<text start="[^"]*" dur="[^"]*">([^<]+)<\/text>/g)];
                                transcript = textMatches.map(m => m[1]
                                    .replace(/&amp;/g, '&')
                                    .replace(/&#39;/g, "'")
                                    .replace(/&quot;/g, '"')
                                ).join(' ').trim();
                            }
                            hasTranscript = transcript.length > 50;
                            if (hasTranscript) {
                                console.info(`InnerTube fallback succeeded for ${videoId}: ${transcript.length} chars`);
                            } else {
                                console.warn(`InnerTube fallback: captionTrack baseUrl returned empty content for ${videoId}`);
                            }
                        }
                    }
                } else {
                    console.warn(`InnerTube: no captionTracks in player response for ${videoId}`);
                }
            } else {
                console.warn(`InnerTube player API returned ${innerTubeRes.status} for ${videoId}`);
            }
        } catch (innerTubeError: any) {
            console.warn(`InnerTube fallback failed for ${videoId}: ${innerTubeError.message}`);
        }

        // Fallback: use video description from ytdl if we have it
        let description = videoDetails?.description || "";

        if (!description || description.length <= 10) {
            const ytKey = process.env.YOUTUBE_KEY;
            if (ytKey) {
                try {
                    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${ytKey}`);
                    if (ytRes.ok) {
                        const ytData = await ytRes.json();
                        if (ytData?.items?.[0]?.snippet?.description) {
                            description = ytData.items[0].snippet.description;
                            console.info(`Fetched description from YouTube Data API for ${videoId}`);
                        }
                    } else {
                        console.warn(`YouTube Data API returned ${ytRes.status} for ${videoId}`);
                    }
                } catch (e: any) {
                    console.warn(`YouTube Data API fallback failed: ${e.message}`);
                }
            }
        }

        if (description.length > 10) {
            transcript = description;
            hasTranscript = true;
        }
    }

    // If we got at least a transcript (even without ytdl metadata), return what we have
    if (hasTranscript) {
        return {
            title: videoDetails?.title || `YouTube Video (${videoId})`,
            content: transcript,
            metadata: {
                has_transcript: true,
                thumbnail: videoDetails?.thumbnails?.[0]?.url,
                description: videoDetails?.description,
                publishDate: videoDetails?.publishDate,
                author: videoDetails?.author?.name,
                sourceType: 'youtube'
            }
        };
    }

    // Both ytdl and transcript failed — return degraded fallback
    console.error(`YouTube Ingestion: No usable content for ${videoId} (ytdl blocked + no transcript)`);
    return {
        title: videoDetails?.title || `YouTube Video (${videoId})`,
        content: "",
        metadata: { has_transcript: false, original_url: url, sourceType: 'youtube', status: 'limited' }
    };
}
