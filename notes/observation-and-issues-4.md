# User Observations, issues and new features required

1. On the vercel deployment of xentara, the published items added to a telegram distibution channel do not correctly register and record the user reaction button clicks. This was working before. Possibly the webhook might be misconfigured since a new telegram bot was created an linked.
2. The comments or replies submitted in the telegram channel are not been reflected in the 'Intelligence' view of the hub. This was working before. This is likely also due to the webhook not being configured correctly.
3. The http://localhost:3000/dashboard/hubs/[slug] page source card panel can become very long causing the user to scroll down thereby losing visiblity of the other articles div which is vertically scrollable on its own. Make the sources div also scrollable with the same vertical positioning as the articles div.
4. The flavour buttons in the telegram feed '# tags' do not seem to do anything useful. They now appear to be searching  for tags across the whole telegram network instead of filtering for the articles within the same channel.
5. The 'Curator's Take' is the label applied to the comment/opinion panel of the curator for a published item. This should be editable by the curator as a setting for the hub along with branding, etc. The default label is 'Curator\'s Take' which can be changed by the Curator to anything else, e.g. 'My views on this', or something in another language 'Wat dink ek?' etc.
6. The UI error message:
    <error>
    ## Error Type
    Recoverable Error

    ## Error Message
    Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

    - A server/client branch `if (typeof window !== 'undefined')`.
    - Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
    - Date formatting in a user's locale which doesn't match the server.
    - External changing data without sending a snapshot of it along with the HTML.
    - Invalid HTML tag nesting.

    It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

    https://react.dev/link/hydration-mismatch

    ...
        <InnerLayoutRouter url="/dashboard..." tree={[...]} params={{slug:"ai-o..."}} cacheNode={{rsc:{...}, ...}} ...>
        <SegmentViewNode type="page" pagePath="dashboard/...">
            <SegmentTrieNode>
            <HubDetailPage>
            <div className="dashboard-...">
                <header>
                <div className="dashboard-...">
                <div className="dashboard-...">
                    <div>
                    <SourceFilter>
                    <IntelligenceFeed>
                        <IntelligenceFeedClient initialPublications={[...]} hubId="eb57172d-e..." hubRole="owner" ...>
                        <div className="dashboard-...">
                            <div>
                            <div className="dashboard-...">
                            <div ref={null}>
                                <PublicationCard pub={{id:"0ae207...", ...}} selectable={true} isSelected={false} ...>
                                <div className={"dashboar..."}>
    -                               <div className="dashboard-module__XABe8G__pubCardLinks">
                            ...
                    ...
        ...



        at div (<anonymous>:null:null)
        at PublicationCard (src/components/dashboard/PublicationCard.tsx:57:5)
        at <unknown> (src/components/dashboard/IntelligenceFeedClient.tsx:114:11)
        at Array.forEach (<anonymous>:null:null)
        at renderFeedItems (src/components/dashboard/IntelligenceFeedClient.tsx:110:18)
        at IntelligenceFeedClient (src/components/dashboard/IntelligenceFeedClient.tsx:202:12)
        at IntelligenceFeed (src/components/dashboard/IntelligenceFeed.tsx:26:5)
        at HubDetailPage (src/app/dashboard/hubs/[slug]/page.tsx:61:13)

    ## Code Frame
    55 |
    56 |   return (
    > 57 |     <div key={pub.id} className={`${styles.pubCard} ${isProcessing ? styles.pubCardProcessing : ''}`}>
        |     ^
    58 |       
    59 |       <div className={styles.pubCardHeader}>
    60 |          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

    Next.js version: 16.2.1 (Turbopack)
    </error>
