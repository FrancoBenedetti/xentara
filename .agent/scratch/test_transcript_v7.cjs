const YT = require('youtube-transcript');

async function test() {
    const videoId = 'QFTwUvE-lO0';
    console.log('Testing transcript for videoId:', videoId);
    try {
        console.log('Keys:', Object.keys(YT));
        const transcriptData = await YT.YoutubeTranscript.fetchTranscript(videoId);
        console.log('SUCCESS: Transcript fetched. Length:', transcriptData.map(i => i.text).join(' ').length);
    } catch (e) {
        console.error('FAILURE: Transcript error:', e.message);
    }
}

test();
