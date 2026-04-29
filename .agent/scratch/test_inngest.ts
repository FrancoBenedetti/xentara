import { inngest } from './src/inngest/client';

async function test() {
    console.log('Sending reprocess event for QFTwUvE-lO0...');
    try {
        await inngest.send({
            name: "xentara/publication.detected",
            data: {
                publicationId: "6472f883-85f0-45c1-9231-72921008061e", // Assuming this from typical uuid patterns if I had it, but let's just test sending.
                sourceUrl: "https://www.youtube.com/watch?v=QFTwUvE-lO0",
                type: "youtube",
                hasContent: false
            }
        });
        console.log('SUCCESS: Event sent');
    } catch (e: any) {
        console.error('FAILURE:', e.message);
    }
}

test();
