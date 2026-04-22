import { getRecentPublications } from '@/app/dashboard/actions'
import IntelligenceFeedClient from './IntelligenceFeedClient'

interface IntelligenceFeedProps {
  hubId: string
  sourceId?: string
  hubRole?: string
}

export default async function IntelligenceFeed({ hubId, sourceId, hubRole }: IntelligenceFeedProps) {
  const publications = await getRecentPublications(hubId, sourceId) 

  return (
    <IntelligenceFeedClient 
      key={sourceId || 'unified'}
      initialPublications={publications}
      hubId={hubId}
      sourceId={sourceId}
      hubRole={hubRole}
    />
  )
}
