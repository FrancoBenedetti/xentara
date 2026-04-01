import { createServiceClient } from './utils/supabase/service';

async function check() {
    const supabase = createServiceClient();
    const { data: sources, error } = await supabase.from('monitored_sources').select('*');
    if (error) {
        console.error("DB Error:", error.message);
        return;
    }
    console.log(`Found ${sources?.length} sources:`);
    sources?.forEach(s => console.log(` - [${s.id}] ${s.name} (${s.url})`));
}

check();
