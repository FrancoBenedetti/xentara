import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript('Hkqek71Vemw');
    console.log("Success:", transcriptData.slice(0, 2));
  } catch (e: any) {
    console.error("Failed:", e.message);
  }
}
test();
