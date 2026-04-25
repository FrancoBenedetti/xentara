import { fetchYoutubeMetadata } from './src/utils/sourcing/youtube.ts';

async function test() {
  const data = await fetchYoutubeMetadata('https://www.youtube.com/watch?v=Hkqek71Vemw');
  console.log(data);
}

test();
