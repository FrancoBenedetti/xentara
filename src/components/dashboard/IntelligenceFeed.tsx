import { getRecentPublications } from '@/app/dashboard/actions'
import IntelligenceFeedClient from './IntelligenceFeedClient'

interface IntelligenceFeedProps {
  hubId: string
  sourceId?: string
}

export default async function IntelligenceFeed({ hubId, sourceId }: IntelligenceFeedProps) {
  const publications = await getRecentPublications(hubId, sourceId) 

  return (
    <IntelligenceFeedClient 
      initialPublications={publications}
      hubId={hubId}
      sourceId={sourceId}
    />
  )
}
