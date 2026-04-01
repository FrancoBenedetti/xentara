import Parser from 'rss-parser';

const parser = new Parser();

async function testHandle(handle: string) {
    console.log(`Testing Handle: ${handle}`);
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle.replace('@', '')}`;
    try {
        const feed = await parser.parseURL(feedUrl);
        console.log(`Items found: ${feed.items?.length || 0}`);
    } catch (e: any) {
        console.error(`RSS Feed Failed: ${e.message}`);
    }
}

testHandle('@mkbhd');
testHandle('@PewDiePie');
