import { fetchLatestVideosFromChannel } from './sourcing/youtube';

async function test(url: string) {
    console.log("-----------------------------------------");
    console.log("TESTING URL:", url);
    const results = await fetchLatestVideosFromChannel(url);
    console.log("Results found:", results.length);
    results.slice(0, 2).forEach(r => console.log(` - [${r.id}] ${r.title}`));
}

async function run() {
    // 1. Channel ID (Should work)
    await test('https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw'); // PewDiePie
    
    // 2. Handle (Usually fails with RSS if not resolved first)
    await test('https://www.youtube.com/@mkbhd');
    
    // 3. User Path (Legacy)
    await test('https://www.youtube.com/user/pewdiepie');
}

run();
