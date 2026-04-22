import { getRecentPublications, getHubPromotions } from '@/app/dashboard/actions'
import IntelligenceFeedClient from './IntelligenceFeedClient'

interface IntelligenceFeedProps {
  hubId: string
  sourceId?: string
  hubRole?: string
}

export default async function IntelligenceFeed({ hubId, sourceId, hubRole }: IntelligenceFeedProps) {
  const [publications, allPromotions] = await Promise.all([
    getRecentPublications(hubId, sourceId),
    getHubPromotions(hubId),
  ])

  // Only pass active, in-window promotions to the client
  const now = new Date()
  const activePromotions = allPromotions.filter(p => {
    if (!p.is_active) return false
    if (p.start_date && new Date(p.start_date) > now) return false
    if (p.end_date && new Date(p.end_date) < now) return false
    return true
  })

  return (
    <IntelligenceFeedClient 
      key={sourceId || 'unified'}
      initialPublications={publications}
      hubId={hubId}
      sourceId={sourceId}
      hubRole={hubRole}
      promotions={activePromotions}
    />
  )
}
