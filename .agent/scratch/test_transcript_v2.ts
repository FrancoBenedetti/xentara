import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
    const videoId = 'QFTwUvE-lO0';
    console.log('Testing transcript for videoId:', videoId);
    try {
        // @ts-ignore
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('SUCCESS: Transcript fetched. Length:', transcriptData.map(i => i.text).join(' ').length);
    } catch (e: any) {
        console.error('FAILURE: Transcript error:', e.message);
    }
}

test();
