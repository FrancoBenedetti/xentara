async function test() {
    const videoId = 'QFTwUvE-lO0';
    console.log('Testing transcript for videoId:', videoId);
    
    // Manual implementation of the same logic used by the library
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
    
    try {
        console.log('Step 1: Fetching video page...');
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const html = await response.text();
        
        console.log('Step 2: Searching for caption tracks...');
        const regex = /"playerCaptionsTracklistRenderer":\{"captionTracks":\[(.*?)\]\}/;
        const match = html.match(regex);
        
        if (!match) {
            console.error('FAILURE: No caption tracks found in HTML');
            // Try InnerTube fallback
            console.log('Attempting InnerTube fallback...');
            const innerResponse = await fetch('https://www.youtube.com/youtubei/v1/player', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: { client: { clientName: 'WEB', clientVersion: '2.20240210.01.00' } },
                    videoId: videoId
                })
            });
            const innerJson: any = await innerResponse.json();
            const tracks = innerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (!tracks) {
                console.error('InnerTube also failed');
                return;
            }
            console.log('InnerTube Success! Found tracks:', tracks.length);
            return;
        }
        
        console.log('SUCCESS: Caption tracks found!');
    } catch (e: any) {
        console.error('FAILURE:', e.message);
    }
}

test();
