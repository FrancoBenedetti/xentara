import { fetchYoutubeMetadata } from '../src/utils/sourcing/youtube';

async function run() {
    console.log("Testing ingestion...");
    const res = await fetchYoutubeMetadata('https://www.youtube.com/watch?v=58JrC9iLinI');
    console.log(`Success: ${res.metadata.has_transcript}`);
    console.log(`Content length: ${res.content.length}`);
    console.log(`Title: ${res.title}`);
}
run().catch(console.error);
