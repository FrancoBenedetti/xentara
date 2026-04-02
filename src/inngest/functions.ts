import { inngest } from "./client";
import { createServiceClient } from "@/utils/supabase/service";
import { ingestContent, discoverRecentItems } from "@/utils/sourcing/engine";
import { summarizeWithAI, predictTaste } from "@/utils/ai/engine";

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
        const supabase = createServiceClient();
        const { data: pub } = await (supabase.from('publications') as any).select('hub_id').eq('id', publicationId).single();
        if (!pub) throw new Error("Publication Context Lost");

        const rawData = await step.run("fetch-raw-content", async () => {
            return await ingestContent(sourceUrl, type || 'youtube');
        });

        const transcript = rawData.content || "No content found.";
        const hasTranscript = rawData.metadata?.has_transcript || rawData.metadata?.sourceType === 'rss';

        if (hasTranscript) {
            // 4. CREATIVE AGENT: SUMMARIZATION
            const summary = await step.run("summarize-content", async () => {
                return await summarizeWithAI(transcript, rawData.title, rawData.metadata);
            });

            // 5. TASTE PREDICTOR AGENT: taxonomy-aware analysis
            const analysis = await step.run("predict-taste-and-taxonomy", async () => {
                return await predictTaste(summary, rawData.title, pub.hub_id);
            });

            // 6. TAXONOMY AGENT: Save Suggestions & Link Tags
            await step.run("save-taxonomy-discoveries", async () => {
                const supabase = createServiceClient();
                if (analysis.new_suggestions && analysis.new_suggestions.length > 0) {
                   for (const suggestion of analysis.new_suggestions) {
                      await (supabase.from('hub_tags') as any).upsert({
                         hub_id: pub.hub_id,
                         name: suggestion.name,
                         description: suggestion.description,
                         is_confirmed: false
                      }, { onConflict: 'hub_id, name' });
                   }
                }
            });

            await step.run("finalize-publication", async () => {
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
                        status: 'ready'
                    })
                    .eq('id', publicationId);
            });

            return { status: "processed" };
        }
        return { status: "pending_transcript" };
    } catch (error: any) {
        const supabase = createServiceClient();
        await (supabase.from('publications') as any).update({ status: 'failed' }).eq('id', publicationId);
        throw error;
    }
  }
);
