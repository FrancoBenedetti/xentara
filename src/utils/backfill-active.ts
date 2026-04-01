import { createServiceClient } from './utils/supabase/service';

async function backfill() {
    const supabase = createServiceClient();
    console.log("Activating all existing monitored sources...");
    const { data, error } = await supabase
        .from('monitored_sources')
        .update({ is_active: true } as any)
        .is('is_active', null); // Or just update all
    
    if (error) {
        console.error("Backfill Failed:", error.message);
    } else {
        console.log("Success! All existing sources are now enabled for cron discovery.");
    }
}

backfill();
