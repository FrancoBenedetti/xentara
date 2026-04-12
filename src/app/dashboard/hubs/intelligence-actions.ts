'use server'

import { createClient } from '@/utils/supabase/server'

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
    return []
  }

  // Aggregate by publication_id
  const pubMap = new Map<string, any>()

  for (const e of (data || [])) {
    const pubId = e.publication_id;
    if (!pubMap.has(pubId)) {
      pubMap.set(pubId, {
        id: pubId,
        title: (e.publication as any)?.title || 'Unknown',
        insight: 0,
        helpful: 0,
        irrelevant: 0,
        comments: 0
      })
    }

    const stats = pubMap.get(pubId)
    if (e.type === 'reaction') {
      if (e.value === 'insight') stats.insight++;
      if (e.value === 'helpful') stats.helpful++;
      if (e.value === 'irrelevant') stats.irrelevant++;
    } else if (e.type === 'comment') {
      stats.comments++;
    }
  }

  return Array.from(pubMap.values()).sort((a, b) => (b.insight + b.helpful + b.comments) - (a.insight + a.helpful + a.comments))
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
