async function test() {
    const videoId = 'QFTwUvE-lO0';
    console.log('Testing transcript for videoId:', videoId);
    try {
        const mod = await import('youtube-transcript');
        console.log('Available keys in imported module:', Object.keys(mod));
        
        // Based on the code seen in the error message earlier
        const fetchFn = mod.fetchTranscript || (mod.default && mod.default.fetchTranscript);
        
        if (!fetchFn) {
            console.error('Could not find fetchTranscript function in module');
            return;
        }

        const transcriptData = await fetchFn(videoId);
        console.log('SUCCESS: Transcript fetched. Length:', transcriptData.map((i: any) => i.text).join(' ').length);
    } catch (e: any) {
        console.error('FAILURE: Transcript error:', e.message);
    }
}

test();
