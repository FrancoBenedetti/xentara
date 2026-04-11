import { inngest } from "./client";
import { createServiceClient } from "@/utils/supabase/service";
import { ingestContent, discoverRecentItems } from "@/utils/sourcing/engine";
import { summarizeWithAI, predictTaste } from "@/utils/ai/engine";
export { distributePublication } from "./distribution";

/**
 * 1. DISCOVERY AGENT (Instant)
 * Triggered when a new source (channel/feed) is added.
 */
export const discoverNewContentOnce = (inngest as any).createFunction(
  { id: "xentara-discovery-instant", triggers: [{ event: "xentara/source.added" }] },
  async ({ event, step }: any) => {
    if (!event?.data?.sourceId) return { status: "skipped" };
    const { sourceId, url, type } = event.data;
    return await step.run("discover-and-track", async () => {
        const supabase = createServiceClient();
        const { data: source } = await (supabase.from('monitored_sources') as any).select('*').eq('id', sourceId).single();
        if (!source) throw new Error("Source not found");
        return await discoverRecentItems(source);
    });
  }
);

/**
 * 2. DISCOVERY AGENT (Recurring)
 * Periodic scan of all whitelisted sources.
 */
export const discoverNewContentRecurring = (inngest as any).createFunction(
  { id: "xentara-discovery-cron", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }: any) => {
    const supabase = createServiceClient();
    const { data: sources } = await (supabase.from('monitored_sources') as any).select('*').eq('is_active', true);

    if (!sources) return { count: 0 };

    for (const source of (sources as any[])) {
        try {
            await inngest.send({
              name: "xentara/source.added",
              data: { sourceId: source.id, url: source.url, type: source.type }
            });
        } catch (inngestError) {
            console.warn(`Failed to dispatch event for source ${source.id}:`, inngestError);
        }
    }

    return { count: sources.length };
  }
);

/**
 * 3. INTELLIGENCE PIPELINE (The 7 Agents)
 */
export const processIntelligencePipeline = (inngest as any).createFunction(
  { id: "xentara-intelligence-pipeline", triggers: [{ event: "xentara/publication.detected" }] },
  async ({ event, step }: any) => {
    const { publicationId, sourceUrl, type } = event.data;

    try {
        console.log(`[PIPELINE START] Processing Publication ID: ${publicationId} (URL: ${sourceUrl})`);
        
        const supabase = createServiceClient();
        const { data: pub } = await (supabase.from('publications') as any).select('hub_id').eq('id', publicationId).single();
        if (!pub) throw new Error("Publication Context Lost");

        // 1. CONTENT INGESTION
        console.log(`[PIPELINE] Fetching raw content for: ${sourceUrl}`);
        const rawData = await step.run("fetch-raw-content", async () => {
            const supabase = createServiceClient();
            await (supabase.from('publications') as any).update({ status: 'transcribing' }).eq('id', publicationId).throwOnError();
            return await ingestContent(sourceUrl, type || 'youtube');
        });

        const transcript = rawData.content || "No content found.";
        const hasTranscript = rawData.metadata?.has_transcript || rawData.metadata?.sourceType === 'rss';

        if (hasTranscript) {
            console.log(`[PIPELINE] Content FOUND. Starting Creative Agent (Summarization).`);
            // 2. CREATIVE AGENT: SUMMARIZATION
            const summary = await step.run("summarize-content", async () => {
                const supabase = createServiceClient();
                await (supabase.from('publications') as any).update({ status: 'summarizing' }).eq('id', publicationId).throwOnError();
                return await summarizeWithAI(transcript, rawData.title, rawData.metadata);
            });

            console.log(`[PIPELINE] Summary RECEIVED. Starting Taste Predictor.`);
            // 3. TASTE PREDICTOR AGENT: taxonomy-aware analysis
            const analysis = await step.run("predict-taste-and-taxonomy", async () => {
                return await predictTaste(summary, rawData.title, pub.hub_id);
            });

            console.log(`[PIPELINE] Taste ANALYSIS complete. Saving taxonomy discoveries.`);
            // 4. TAXONOMY AGENT: Save Suggestions & Link Tags
            await step.run("save-taxonomy-discoveries", async () => {
                const supabase = createServiceClient();
                const tagNames = [...(analysis.tags || [])];
                
                // 1. Handle new suggestions
                if (analysis.new_suggestions && analysis.new_suggestions.length > 0) {
                   for (const suggestion of analysis.new_suggestions) {
                      await (supabase.from('hub_tags') as any).upsert({
                         hub_id: pub.hub_id,
                         name: suggestion.name,
                         description: suggestion.description,
                         is_confirmed: false
                      }, { onConflict: 'hub_id, name' });
                      
                      if (!tagNames.includes(suggestion.name)) {
                          tagNames.push(suggestion.name);
                      }
                   }
                }

                // 2. Fetch IDs for all tags associated with this hub/publication
                const { data: hubTags } = await (supabase
                    .from('hub_tags') as any)
                    .select('id, name')
                    .eq('hub_id', pub.hub_id)
                    .in('name', tagNames);

                if (hubTags && hubTags.length > 0) {
                    const links = hubTags.map((tag: any) => ({
                        publication_id: publicationId,
                        tag_id: tag.id
                    }));

                    await (supabase
                        .from('publication_hub_tags') as any)
                        .upsert(links, { onConflict: 'publication_id, tag_id' });
                }
            });

            await step.run("finalize-publication", async () => {
                console.log(`[PIPELINE] FINALIZING publication: ${publicationId}`);
                const supabase = createServiceClient();
                await (supabase
                    .from('publications') as any)
                    .update({
                        title: rawData.title,
                        raw_content: transcript,
                        summary: summary,
                        byline: analysis.byline,
                        sentiment_score: analysis.sentiment,
                        tags: analysis.tags,
                        error_message: null,
                        status: 'ready'
                    })
                    .eq('id', publicationId)
                    .throwOnError();
            });

            return { status: "processed" };
        }
        
        await (supabase.from('publications') as any).update({ 
            status: 'failed', 
            error_message: "Media ingestion returned no usable transcript or text."
        }).eq('id', publicationId).throwOnError();

        return { status: "no_transcript" };
    } catch (error: any) {
        console.error("CRITICAL: Intelligence Pipeline Fault:", error);
        
        try {
            const supabase = createServiceClient();

            // AUTO-PURGE: If the video was explicitly rejected (e.g. identified as a Short)
            // we delete it from the board immediately to avoid clutter.
            if (error.message?.includes("REJECTED:")) {
                console.log(`[PIPELINE] Purging rejected content: ${publicationId}`);
                await (supabase.from('publications') as any).delete().eq('id', publicationId);
                return { status: "purged", reason: error.message };
            }

            const { error: updateError } = await (supabase.from('publications') as any).update({ 
                status: 'failed',
                error_message: error.message || "An unexpected neural processing error occurred."
            }).eq('id', publicationId);
            
            if (updateError) {
                console.error("Secondary Fault: Could not update publication status to FAILED:", updateError.message);
            }
        } catch (secondaryError) {
            console.error("Tertiary Fault: Crash during error reporting:", secondaryError);
        }
        
        throw error;
    }
  }
);
