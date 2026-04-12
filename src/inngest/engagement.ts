import { inngest } from "./client";
import { createAdminClient } from '@/utils/supabase/admin';
import { analyzeSentiment } from "@/utils/ai/engine";

export const processEngagementFeedback = inngest.createFunction(
  {
    id: 'xentara-feedback-analyst',
    triggers: [{ event: 'xentara/engagement.received' }],
    concurrency: { limit: 10 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { publicationId, hubId, type, content } = event.data;

    if (type !== 'comment' || !content) {
      return { status: 'skipped', reason: 'not a comment' };
    }

    // Step 1: Analyze sentiment
    const sentimentScore = await step.run('analyze-comment-sentiment', async () => {
      return await analyzeSentiment(content);
    });

    // Step 2: Write score back
    await step.run('update-engagement-record', async () => {
      const supabase = createAdminClient();
      await supabase
        .from('publication_engagement')
        .update({ sentiment_score: sentimentScore })
        .eq('publication_id', publicationId)
        .eq('type', 'comment')
        .eq('value', content)
        .is('sentiment_score', null); // Only update if not already scored
    });

    return { status: 'analyzed', score: sentimentScore };
  }
);
