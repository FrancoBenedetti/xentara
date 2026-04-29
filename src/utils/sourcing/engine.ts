import { fetchLatestVideosFromChannel, fetchYoutubeMetadata } from './youtube';
import { fetchLatestArticlesFromFeed, fetchRSSMetadata } from './rss';
import { resolveRSSHubFeedUrl } from './rsshub';
import { inngest } from '@/inngest/client';
import { createServiceClient } from '@/utils/supabase/service';

/**
 * URL Type Detection
 */
export function detectUrlType(url: string): 'youtube' | 'web' {
    try {
        const parsed = new URL(url);
        const ytHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];
        if (ytHosts.includes(parsed.hostname)) return 'youtube';
    } catch {}
    return 'web';
}

/**
 * DISCOVERY AGENT (#1): Scans sources for new content
 * Now processes up to 10 new items per run.
 */
export async function discoverRecentItems(source: any) {
    let items: any[] = [];
    
    try {
        if (source.type === 'youtube') {
            items = await fetchLatestVideosFromChannel(source.url);
        } else if (source.type === 'rss') {
            const res = await fetchLatestArticlesFromFeed(source.url);
            items = res.items;
        } else if (source.type === 'rsshub') {
            const res = await fetchLatestArticlesFromFeed(resolveRSSHubFeedUrl(source.url));
            items = res.items;
        }
        
        if (items.length === 0) {
            console.warn(`No items found for source: ${source.url}`);
        }
    } catch (discoveryError: any) {
        console.error(`[DISCOVERY] CRITICAL FAILURE for ${source.url}:`, discoveryError.message);
        
        // Resolve the feed URL for logging purposes.
        // NOTE: source_url on publications semantically represents the *article* link.
        // A feed-level failure has no article, so source_url must be null.
        // We keep the resolved feed URL in the error_message for diagnostics.
        const resolvedFeedUrl = source.type === 'rsshub'
            ? resolveRSSHubFeedUrl(source.url)
            : source.url;

        const errorDetail = discoveryError.message || "Failed to resolve source or fetch items.";

        // Upsert the failure sentinel: remove any existing one for this source first
        // so the hourly cron never accumulates duplicates. One sentinel per source, always.
        const supabase = createServiceClient();
        await (supabase.from('publications' as any) as any)
            .delete()
            .eq('source_id', source.id)
            .ilike('title', '%NEURAL FAULT%');

        await (supabase.from('publications' as any) as any).insert({
            hub_id: source.hub_id,
            source_id: source.id,
            title: `NEURAL FAULT: Discovery Failed`,
            byline: `Source: ${source.name}`,
            source_url: null,  // No article URL exists for a feed-level failure
            status: 'failed',
            error_message: `${errorDetail} [feed: ${resolvedFeedUrl}]`
        } as any);
        
        return { total_found: 0, tracked: 0, error: discoveryError.message };
    }

    const supabase = createServiceClient();
    
    // Update last_fetched_at immediately to show activity
    await (supabase.from('monitored_sources' as any) as any)
        .update({ last_fetched_at: new Date().toISOString() } as any)
        .eq('id', source.id);

    let newItemsCount = 0;

    // Process up to 10 latest items to populate the board quickly
    const batch = items.slice(0, 10);

    // If we successfully found items, clear any previous "Discovery Failed" sentinels
    // for this source — regardless of what status they may have drifted into (they
    // can escape 'failed' if the curator accidentally triggers Reprocess on them).
    if (items.length > 0) {
        await (supabase.from('publications' as any) as any)
            .delete()
            .eq('source_id', source.id)
            .ilike('title', '%NEURAL FAULT%');
    }

    for (const item of batch) {
        // 1. Check uniqueness
        const { data: existing } = await (supabase
            .from('publications' as any) as any)
            .select('id, source_id, hub_id, status')
            .eq('source_url', item.link)
            .eq('hub_id', source.hub_id)
            .maybeSingle() as { data: { id: string; source_id: string | null; hub_id: string; status: string } | null };

        if (existing) {
            // Re-trigger pipeline if it's stuck in a non-final state
            const isStuck = !['ready', 'published', 'purged'].includes(existing.status);
            
            // Adoption logic: If publication exists in this hub but has no source_id, link it.
            if (!existing.source_id && existing.status !== 'purged') {
                await (supabase
                    .from('publications' as any) as any)
                    .update({ 
                        source_id: source.id,
                        title: item.title 
                    } as any)
                    .eq('id', existing.id);
                
                newItemsCount++;
            }

            if (isStuck || !existing.source_id) {
                // Trigger pipeline to ensure it's fully processed
                await inngest.send({
                    name: "xentara/publication.detected",
                    data: { 
                        publicationId: existing.id, 
                        sourceUrl: item.link, 
                        hubId: source.hub_id,
                        type: source.type,
                        hasContent: !!item.content
                    }
                });
            }
            continue;
        }
        
        // 2. Create entry track
        const { data: pub, error: pubError } = await (supabase
            .from('publications' as any) as any)
            .insert({
                hub_id: source.hub_id,
                source_id: source.id,
                title: item.title,
                source_url: item.link,
                raw_content: item.content || null,
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
        try {
            await inngest.send({
                name: "xentara/publication.detected",
                data: { 
                    publicationId: (pub as any).id, 
                    sourceUrl: item.link, 
                    hubId: source.hub_id,
                    type: source.type,
                    hasContent: !!item.content
                }
            });
        } catch (inngestError) {
            console.warn("Could not trigger intelligence pipeline for item:", item.link, inngestError);
        }
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
    
    if (type === 'rss' || type === 'rsshub' || type === 'web') {
        const feedData = await fetchRSSMetadata(url);
        return {
            title: feedData.title,
            content: feedData.content,
            metadata: {
                ...feedData.metadata,
                sourceType: type,
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
