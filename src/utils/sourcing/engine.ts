import { fetchLatestVideosFromChannel, fetchYoutubeMetadata } from './youtube';
import { fetchLatestArticlesFromFeed, fetchRSSMetadata } from './rss';
import { inngest } from '@/inngest/client';
import { createServiceClient } from '@/utils/supabase/service';

/**
 * DISCOVERY AGENT (#1): Scans sources for new content
 * Now processes up to 10 new items per run.
 */
export async function discoverRecentItems(source: any) {
    let items = [];
    
    if (source.type === 'youtube') {
        items = await fetchLatestVideosFromChannel(source.url);
    } else if (source.type === 'rss') {
        items = await fetchLatestArticlesFromFeed(source.url);
    }

    const supabase = createServiceClient();
    let newItemsCount = 0;

    // Process up to 10 latest items to populate the board quickly
    const batch = items.slice(0, 10);

    for (const item of batch) {
        // 1. Check uniqueness
        const { data: existing } = await supabase
            .from('publications')
            .select('id')
            .eq('source_url', item.link)
            .single();

        if (existing) continue;

        // 2. Create entry track
        const { data: pub, error: pubError } = await supabase
            .from('publications')
            .insert({
                hub_id: source.hub_id,
                source_id: source.id,
                title: item.title,
                source_url: item.link,
                status: 'raw'
            } as any)
            .select()
            .single();

        if (pubError) {
            console.error("Discovery Save Error:", pubError.message);
            continue;
        }

        newItemsCount++;

        // 3. Trigger Intelligence Pipeline (#2-5)
        await inngest.send({
            name: "xentara/publication.detected",
            data: { 
                publicationId: pub.id, 
                sourceUrl: item.link, 
                hubId: source.hub_id,
                type: source.type 
            }
        });
    }

    return { total_found: items.length, tracked: newItemsCount };
}

/**
 * INGESTION ENGINE: Prepares content for AI analaysis
 * Distinguishes between Media and Deep Text Ingestion.
 */
export async function ingestContent(url: string, type: string) {
    if (type === 'youtube') {
        const data = await fetchYoutubeMetadata(url);
        return {
            ...data,
            metadata: { ...data.metadata, sourceType: 'youtube' }
        };
    }
    
    if (type === 'rss') {
        const feedData = await fetchRSSMetadata(url);
        return {
            title: feedData.title,
            content: feedData.content,
            metadata: {
                ...feedData.metadata,
                sourceType: 'rss',
                has_transcript: true // Text is natively analysis-ready
            }
        };
    }

    return {
        title: "Unknown Content",
        content: "Source type not supported.",
        metadata: { sourceType: 'unknown' }
    };
}
