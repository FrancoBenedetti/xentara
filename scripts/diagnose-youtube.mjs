/**
 * Diagnostic: YouTube Ingestion + Gemini Key Health
 * Run: node scripts/diagnose-youtube.mjs
 */
import { readFileSync } from 'fs';

// ── Load .env.local manually since dotenv/config only reads .env ─────────────
try {
  const envLocal = readFileSync('.env.local', 'utf8');
  for (const line of envLocal.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    // Strip inline comment FIRST, then strip surrounding quotes
    const raw = trimmed.slice(eqIdx + 1).trim();
    const uncommented = raw.replace(/\s+#.*$/, ''); // remove trailing # comment
    const val = uncommented.replace(/^["']|["']$/g, '').trim(); // strip quotes
    process.env[key] = val;
  }
} catch { /* ignore */ }

// ── Config ────────────────────────────────────────────────────────────────────
const CHANNEL_URL   = 'https://www.youtube.com/@wesroth';
const VIDEO_URL     = 'https://www.youtube.com/watch?v=Mz7W0qNlmOw';
const VIDEO_ID      = 'Mz7W0qNlmOw';

const GEMINI_KEYS = [
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
].filter(Boolean);

const YT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.youtube.com/',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

const ok   = (s) => `\x1b[32m✔ ${s}\x1b[0m`;
const fail = (s) => `\x1b[31m✘ ${s}\x1b[0m`;
const warn = (s) => `\x1b[33m⚠ ${s}\x1b[0m`;
const info = (s) => `\x1b[36mℹ ${s}\x1b[0m`;
const head = (s) => `\n\x1b[1m\x1b[35m══ ${s} ══\x1b[0m`;

// ── 1. Channel page scrape ────────────────────────────────────────────────────
async function testChannelScrape() {
  console.log(head('TEST 1: YouTube Channel Page Scrape'));
  console.log(info(`Target: ${CHANNEL_URL}`));
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(CHANNEL_URL, { headers: YT_HEADERS, signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(t);
    console.log(info(`HTTP Status: ${res.status} ${res.statusText}`));
    if (!res.ok) {
      console.log(fail(`Channel page returned ${res.status} — likely blocked by Google`));
      return null;
    }
    const html = await res.text();
    console.log(info(`Response size: ${(html.length / 1024).toFixed(1)} KB`));

    const metaMatch   = html.match(/<meta itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})"/);
    const jsonMatch   = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    const canonMatch  = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/);
    const extMatch    = html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/);

    const channelId = metaMatch?.[1] || jsonMatch?.[1] || canonMatch?.[1] || extMatch?.[1] || null;

    if (channelId) {
      console.log(ok(`Channel ID resolved: ${channelId}`));
    } else {
      console.log(fail(`Could not extract channel ID from HTML`));
      // Check if it looks like a bot-detection page
      if (html.includes('consent.youtube.com') || html.includes('accounts.google.com')) {
        console.log(warn('Redirected to consent/login — IP is likely flagged by Google'));
      } else if (html.length < 5000) {
        console.log(warn('Response is suspiciously small — may be a bot-rejection page'));
        console.log(warn(`First 500 chars:\n${html.substring(0, 500)}`));
      } else {
        console.log(info(`HTML present but no UC ID found — scraper pattern may be stale`));
      }
    }
    return channelId;
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log(fail('Channel scrape TIMED OUT after 15s — network or bot block'));
    } else {
      console.log(fail(`Channel scrape threw: ${e.message}`));
    }
    return null;
  }
}

// ── 2. YouTube RSS Feed ───────────────────────────────────────────────────────
async function testYouTubeRSS(channelId) {
  console.log(head('TEST 2: YouTube RSS Feed'));
  const feedUrl = channelId
    ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    : `https://www.youtube.com/feeds/videos.xml?channel_id=UNKNOWN`;
  console.log(info(`Feed URL: ${feedUrl}`));
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(feedUrl, { signal: ctrl.signal });
    clearTimeout(t);
    console.log(info(`HTTP Status: ${res.status} ${res.statusText}`));
    if (!res.ok) {
      console.log(fail(`RSS feed returned ${res.status}`));
      return;
    }
    const xml = await res.text();
    const entryCount = (xml.match(/<entry>/g) || []).length;
    console.log(ok(`RSS feed returned ${entryCount} entries`));
    // Extract first video ID
    const firstId = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (firstId) console.log(info(`Latest video ID in feed: ${firstId}`));
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log(fail('RSS feed TIMED OUT after 15s'));
    } else {
      console.log(fail(`RSS feed threw: ${e.message}`));
    }
  }
}

// ── 3. Transcript API ─────────────────────────────────────────────────────────
async function testTranscript() {
  console.log(head('TEST 3: YouTube Transcript API'));
  console.log(info(`Video URL: ${VIDEO_URL}`));
  console.log(info(`Video ID:  ${VIDEO_ID}`));

  // The transcript library hits: https://www.youtube.com/watch?v=<id>
  // then follows up with the timedtext API. We can test the primary page first.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(`https://www.youtube.com/watch?v=${VIDEO_ID}`, {
      headers: YT_HEADERS,
      signal: ctrl.signal,
      redirect: 'follow'
    });
    clearTimeout(t);
    console.log(info(`Watch page status: ${res.status} ${res.statusText}`));
    if (!res.ok) {
      console.log(fail(`Watch page returned ${res.status} — blocked`));
      return;
    }
    const html = await res.text();
    console.log(info(`Watch page size: ${(html.length / 1024).toFixed(1)} KB`));

    // Check for captionTracks in ytInitialPlayerResponse
    if (html.includes('"captionTracks"')) {
      const captionMatch = html.match(/"captionTracks":\[(.*?)\]/s);
      const count = (captionMatch?.[1]?.match(/"baseUrl"/g) || []).length;
      console.log(ok(`Found ${count} caption track(s) in ytInitialPlayerResponse`));
    } else {
      console.log(warn('No captionTracks found in page — video may have no captions, or page is a bot response'));
      if (html.includes('consent.youtube.com') || html.includes('accounts.google.com')) {
        console.log(fail('BLOCKED: Redirected to consent/login page — IP flagged by Google'));
      } else if (html.length < 10000) {
        console.log(fail('Response suspiciously small — likely a bot-detection or error page'));
      }
    }

    // Extract full captionTracks from ytInitialPlayerResponse JSON
    const captionTracksMatch = html.match(/"captionTracks":(\[.*?\])/s);
    if (captionTracksMatch) {
      try {
        // The JSON may contain unicode escapes like \u0026 — decode them
        const cleanedJson = captionTracksMatch[1].replace(/\\u0026/g, '&').replace(/\\u003d/g, '=');
        const tracks = JSON.parse(cleanedJson);
        console.log(info(`Found ${tracks.length} caption track(s):`));
        for (const track of tracks.slice(0, 3)) {
          console.log(info(`  - lang=${track.languageCode} kind=${track.kind || 'standard'} name="${track.name?.simpleText || ''}"`));
        }

        // Try fetching first available track
        const firstTrack = tracks[0];
        if (firstTrack?.baseUrl) {
          const trackUrl = firstTrack.baseUrl;
          console.log(info(`First track baseUrl (first 150): ${trackUrl.substring(0, 150)}...`));
          const isAsr = firstTrack.kind === 'asr';

          // For ASR (auto-generated) tracks, try appending tlang=en
          const urlsToTry = [
            { label: 'raw baseUrl', url: trackUrl },
            ...(isAsr ? [{ label: 'baseUrl + &tlang=en', url: trackUrl + '&tlang=en' }] : []),
          ];

          for (const { label, url } of urlsToTry) {
            console.log(info(`Testing ${label}...`));
            try {
              const ttCtrl = new AbortController();
              const ttT = setTimeout(() => ttCtrl.abort(), 10000);
              const ttRes = await fetch(url, { headers: YT_HEADERS, signal: ttCtrl.signal });
              clearTimeout(ttT);
              if (ttRes.ok) {
                const body = await ttRes.text();
                const textCount = (body.match(/<text /g) || []).length;
                const sCount = (body.match(/<s /g) || []).length;
                const total = textCount + sCount;
                if (total > 0) {
                  console.log(ok(`[${label}] Timedtext returned ${total} segments — TRANSCRIPT AVAILABLE`));
                  break;
                } else if (body.length > 0) {
                  try {
                    const json = JSON.parse(body);
                    const evCount = json.events?.filter(e => e.segs)?.length || 0;
                    if (evCount > 0) {
                      console.log(ok(`[${label}] Timedtext JSON3 returned ${evCount} events — TRANSCRIPT AVAILABLE`));
                      break;
                    } else {
                      console.log(warn(`[${label}] JSON3 with 0 usable events`));
                    }
                  } catch {
                    console.log(warn(`[${label}] Non-empty non-JSON body (${body.length} bytes): ${body.substring(0, 100)}`));
                  }
                } else {
                  console.log(fail(`[${label}] Empty body (200 OK)`));
                }
              } else {
                console.log(fail(`[${label}] HTTP ${ttRes.status}`));
              }
            } catch (e) {
              console.log(fail(`[${label}] threw: ${e.message}`));
            }
          }
        }
      } catch (e) {
        console.log(warn(`Failed to parse captionTracks JSON: ${e.message}`));
        console.log(warn(`Raw: ${captionTracksMatch[1].substring(0, 200)}`));
      }
    } else {
      console.log(warn('Could not locate captionTracks in page HTML'));
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log(fail('Watch page TIMED OUT after 15s'));
    } else {
      console.log(fail(`Watch page fetch threw: ${e.message}`));
    }
  }
}

// ── 4. Gemini Key Health ──────────────────────────────────────────────────────
async function testGeminiKeys() {
  console.log(head('TEST 4: Gemini API Key Health'));
  console.log(info(`Testing ${GEMINI_KEYS.length} configured keys...`));
  const TINY_PROMPT = 'Reply with exactly: OK';

  let okCount = 0;
  let rateLimited = 0;
  let failed = 0;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[i];
    const keyLabel = `Key ${i + 1} (...${key.slice(-6)})`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: TINY_PROMPT }] }] }),
          signal: ctrl.signal
        }
      );
      clearTimeout(t);
      if (res.status === 200) {
        okCount++;
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(no reply)';
        const quota = data.usageMetadata?.totalTokenCount;
        console.log(ok(`${keyLabel}: OK — tokens used: ${quota ?? '?'}, reply: "${reply.substring(0, 30)}"`));
      } else if (res.status === 429) {
        rateLimited++;
        const data = await res.json().catch(() => ({}));
        const retryAfter = res.headers.get('retry-after') || 'unknown';
        console.log(fail(`${keyLabel}: 429 RATE LIMITED — retry-after: ${retryAfter}s — ${data?.error?.message?.substring(0, 80) || ''}`));
      } else {
        failed++;
        const data = await res.json().catch(() => ({}));
        console.log(fail(`${keyLabel}: HTTP ${res.status} — ${data?.error?.message?.substring(0, 80) || res.statusText}`));
      }
    } catch (e) {
      failed++;
      if (e.name === 'AbortError') {
        console.log(fail(`${keyLabel}: TIMED OUT after 15s`));
      } else {
        console.log(fail(`${keyLabel}: threw ${e.message}`));
      }
    }
  }

  console.log('');
  console.log(info(`Summary: ${okCount} OK | ${rateLimited} rate-limited | ${failed} failed`));
  if (okCount === 0) {
    console.log(fail('ALL keys are rate-limited or broken — Gemini is the blocker'));
  } else if (rateLimited > 0) {
    console.log(warn(`${rateLimited} key(s) are on cooldown — rotation will handle this`));
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('\n\x1b[1m\x1b[37m═══════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[37m  Xentara YouTube + Gemini Diagnostic\x1b[0m');
console.log('\x1b[1m\x1b[37m═══════════════════════════════════════════════\x1b[0m');
console.log(info(`Server IP will be visible in errors above`));
console.log(info(`Time: ${new Date().toISOString()}`));

const channelId = await testChannelScrape();
await testYouTubeRSS(channelId);
await testTranscript();
await testGeminiKeys();

console.log('\n\x1b[1m\x1b[37m═══════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[37m  Diagnosis Complete\x1b[0m');
console.log('\x1b[1m\x1b[37m═══════════════════════════════════════════════\x1b[0m\n');
