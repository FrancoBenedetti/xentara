import { fetchLatestVideosFromChannel, fetchYoutubeMetadata } from './youtube';
import { fetchLatestArticlesFromFeed, fetchRSSMetadata } from './rss';
import { inngest } from '@/inngest/client';
import { createServiceClient } from '@/utils/supabase/service';

export async function discoverRecentItems(source: any) {
    let items = [];
    
    if (source.type === 'youtube') {
        items = await fetchLatestVideosFromChannel(source.url);
    } else if (source.type === 'rss') {
        items = await fetchLatestArticlesFromFeed(source.url);
    }

    const supabase = createServiceClient();

    for (const item of items) {
        // 1. Check if already exists in publications
        const { data: existing } = await supabase
            .from('publications')
            .select('id')
            .eq('source_url', item.link)
            .single();

        if (existing) continue;

        // 2. Create raw entry
        const { data: pub, error: pubError } = await supabase
            .from('publications')
            .insert({
                hub_id: source.hub_id,
                source_id: source.id,
                title: item.title,
                source_url: item.link,
                status: 'raw'
            })
            .select()
            .single();

        if (pubError) {
            console.error("Error creating publication track:", pubError);
            continue;
        }

        // 3. Trigger Intelligence Pipeline
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

    return items.length;
}

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
                has_transcript: true // RSS content is natively text-ready
            }
        };
    }

    return {
        title: "Unknown Content",
        content: "Source type not supported for ingestion.",
        metadata: { sourceType: 'unknown' }
    };
}
