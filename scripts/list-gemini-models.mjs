import { readFileSync } from 'fs';

try {
  const envLocal = readFileSync('.env.local', 'utf8');
  for (const line of envLocal.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    const uncommented = raw.replace(/\s+#.*$/, '');
    const val = uncommented.replace(/^["']|["']$/g, '').trim();
    process.env[key] = val;
  }
} catch { /* ignore */ }

const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name).filter(name => name.includes('flash') || name.includes('gemini-3')));
}

run();
