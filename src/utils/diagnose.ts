
import { createClient } from './supabase/server';
import { createServiceClient } from './supabase/service';

async function diagnose() {
  console.log('--- XENTARA SYSTEM DIAGNOSTICS ---');

  // 1. Supabase Check
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('hubs').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase Client: Connected');
  } catch (e: any) {
    console.error('❌ Supabase Client: FAILED', e.message);
  }

  try {
    const supabaseService = createServiceClient();
    const { data: sData, error: sError } = await supabaseService.from('publications').select('id').limit(1);
    if (sError) throw sError;
    console.log('✅ Supabase Service Role: Connected');
  } catch (e: any) {
    console.error('❌ Supabase Service: FAILED', e.message);
  }

  // 2. Inngest Bridge Check
  try {
    const response = await fetch('http://localhost:3000/api/inngest', { method: 'GET' });
    if (response.ok) {
        console.log('✅ Inngest Bridge (Next.js): Reachable');
    } else {
        console.log(`⚠️ Inngest Bridge (Next.js): Returned ${response.status} - Check if npm run dev is active.`);
    }
  } catch (e: any) {
    console.error('❌ Inngest Bridge (Next.js): UNREACHABLE', e.message);
  }

  // 3. Inngest Runner Check
  try {
    const response = await fetch('http://localhost:8288', { method: 'GET' });
    if (response.ok) {
        console.log('✅ Inngest Dev Server Runner: Active');
    } else {
        console.log(`⚠️ Inngest Dev Server Runner: Returned ${response.status}`);
    }
  } catch (e: any) {
    console.error('❌ Inngest Dev Server Runner: UNREACHABLE - Ensure npm run inngest is active.');
  }

  // 4. AI Provider Check
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://api.inceptionlabs.ai/v1/chat/completions', {
        method: 'OPTIONS',
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log(`✅ Inception Labs API: Reachable (${response.status})`);
  } catch (e: any) {
    console.error('❌ Inception Labs API: UNREACHABLE or Timed Out (5s)', e.message);
  }

  console.log('--- DIAGNOSTICS COMPLETE ---');
}

diagnose();
