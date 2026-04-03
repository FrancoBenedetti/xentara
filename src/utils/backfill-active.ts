import { createServiceClient } from '@/utils/supabase/service';

async function backfill() {
    const supabase = createServiceClient();
    console.log("Activating all existing monitored sources...");
    const { data, error } = await (supabase
        .from('monitored_sources') as any)
        .update({ is_active: true })
        .is('is_active', null);
    
    if (error) {
        console.error("Backfill Failed:", error.message);
    } else {
        console.log("Success! All existing sources are now enabled for cron discovery.");
    }
}

backfill();
