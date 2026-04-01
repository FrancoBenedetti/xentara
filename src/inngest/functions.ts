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
    // 1. Handle manual dashboard invocations (no event.data)
    if (!event?.data?.sourceId) {
        return { status: "skipped", message: "No sourceId provided in event data." };
    }
    const { sourceId, url, type } = event.data;
    return await runDiscovery(sourceId, url, type, step);
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
    const { data: sources } = await supabase.from('monitored_sources').select('*').eq('is_active', true);

    if (!sources) return { count: 0 };

    for (const source of (sources as any[])) {
        await inngest.send({
          name: "xentara/source.added",
          data: { sourceId: source.id, url: source.url, type: source.type }
        });
    }

    return { count: sources.length };
  }
);

/**
 * Helper: Perform discovery and detect new publications
 */
async function runDiscovery(sourceId: string, url: string, type: string, step: any) {
    return await step.run("discover-and-track", async () => {
        const supabase = createServiceClient();
        const { data: source } = await supabase.from('monitored_sources').select('*').eq('id', sourceId).single();
        
        if (!source) throw new Error("Source not found");

        return await discoverRecentItems(source);
    });
}



/**
 * 3. INTELLIGENCE PIPELINE (The 7 Agents)
 */
export const processIntelligencePipeline = (inngest as any).createFunction(
  { id: "xentara-intelligence-pipeline", triggers: [{ event: "xentara/publication.detected" }] },
  async ({ event, step }: any) => {
    const { publicationId, sourceUrl, type } = event.data;

    try {
        const rawData = await step.run("fetch-raw-content", async () => {
            return await ingestContent(sourceUrl, type || 'youtube');
        });

        const isTextSource = rawData.metadata?.sourceType === 'rss';
        const hasTranscript = rawData.metadata?.has_transcript || isTextSource;

        const transcript = await step.run("identify-content-layer", async () => {
            return rawData.content || "No content found.";
        });

        if (hasTranscript) {
            // 4. CREATIVE AGENT: SUMMARIZATION
            const summary = await step.run("summarize-content", async () => {
                return await summarizeWithAI(transcript, rawData.title, rawData.metadata);
            });

            // 5. TASTE PREDICTOR AGENT: PRE-SCORING & BYLINE
            const analysis = await step.run("predict-taste-and-taxonomy", async () => {
                return await predictTaste(summary, rawData.title);
            });

            await step.run("finalize-publication", async () => {
                const supabase = createServiceClient();
                await supabase
                    .from('publications')
                    .update({
                        title: rawData.title,
                        raw_content: transcript,
                        summary: summary,
                        byline: analysis.byline,
                        sentiment_score: analysis.sentiment,
                        tags: analysis.tags,
                        intelligence_metadata: {
                            ...rawData.metadata,
                            taste_calculated_at: new Date().toISOString()
                        },
                        status: 'ready'
                    } as any)
                    .eq('id', publicationId);
            });

            return { status: "fully_processed", type: "intelligence_complete" };
        } else {
            // NO TRANSCRIPT: Stop here (waiting for Whisper agent later)
            await step.run("record-partial-data", async () => {
                const supabase = createServiceClient();
                await supabase
                    .from('publications')
                    .update({
                        title: rawData.title,
                        raw_content: transcript, 
                        intelligence_metadata: rawData.metadata || {},
                        status: 'awaiting_transcript'
                    } as any)
                    .eq('id', publicationId);
            });

            return { status: "partially_processed", type: "metadata_only", message: "No transcript found, skipping summarization." };
        }
    } catch (error: any) {
        console.error("Pipeline failure for PUB " + publicationId, error);
        
        const supabase = createServiceClient();
        await supabase.from('publications').update({ status: 'failed' } as any).eq('id', publicationId);
        
        return { status: "failed", error: error.message };
    }
  }
);
