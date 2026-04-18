'use server'

import { createClient } from '@/utils/supabase/server'
import { DEFAULT_REACTIONS } from '@/lib/engagement/reactions'

export async function getHubEngagementSummary(hubId: string) {
  const supabase = await createClient()

  // We can use a simple SQL query if we had RPC, but we can also fetch and aggregate.
  // We'll fetch the counts in parallel, grouped by type when possible.

  const { data: engagements, error } = await supabase
    .from('publication_engagement')
    .select('type, value, sentiment_score')
    .eq('hub_id', hubId)

  if (error) {
    console.error("Failed to fetch engagements:", error.message)
    return { reactions: 0, comments: 0, avgSentiment: 0 }
  }

  let reactions = 0;
  let comments = 0;
  let totalSentiment = 0;
  let scoredComments = 0;

  for (const e of (engagements || [])) {
    if (e.type === 'reaction') {
      reactions++;
    } else if (e.type === 'comment') {
      comments++;
      if (e.sentiment_score !== null) {
        totalSentiment += e.sentiment_score;
        scoredComments++;
      }
    }
  }

  const avgSentiment = scoredComments > 0 ? (totalSentiment / scoredComments) : 0;

  return { reactions, comments, avgSentiment }
}

export async function getPublicationEngagement(hubId: string) {
  const supabase = await createClient()

  // Fetch the hub's enabled reactions
  const { data: config } = await supabase
    .from('hub_engagement_config')
    .select('reactions_enabled')
    .eq('hub_id', hubId)
    .maybeSingle()

  const enabledReactions: string[] = config?.reactions_enabled ?? DEFAULT_REACTIONS

  const { data, error } = await supabase
    .from('publication_engagement')
    .select(`
      publication_id,
      type,
      value,
      publication:publications(title)
    `)
    .eq('hub_id', hubId)

  if (error) {
    console.error("Failed to fetch publication engagement:", error.message)
    return { rows: [], enabledReactions }
  }

  // Aggregate by publication_id
  const pubMap = new Map<string, any>()

  for (const e of (data || [])) {
    const pubId = e.publication_id;
    if (!pubMap.has(pubId)) {
      const reactionCounts = Object.fromEntries(enabledReactions.map(r => [r, 0]));
      pubMap.set(pubId, {
        id: pubId,
        title: (e.publication as any)?.title || 'Unknown',
        ...reactionCounts,
        comments: 0,
        totalReactions: 0
      })
    }

    const stats = pubMap.get(pubId)
    if (e.type === 'reaction' && stats[e.value] !== undefined) {
      stats[e.value]++;
      stats.totalReactions++;
    } else if (e.type === 'comment') {
      stats.comments++;
    }
  }

  return {
    rows: Array.from(pubMap.values()).sort((a, b) => (b.totalReactions + b.comments) - (a.totalReactions + a.comments)),
    enabledReactions
  }
}

export async function getRecentComments(hubId: string, limit = 20) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publication_engagement')
    .select(`
      *,
      publication:publications(title)
    `)
    .eq('hub_id', hubId)
    .eq('type', 'comment')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Failed to fetch recent comments:", error.message)
    return []
  }

  return data || []
}
