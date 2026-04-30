import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('publications')
        .select('id, title, source_url, raw_content, error_message, status')
        .ilike('title', '%Wie volg John Steenhuisen op%');
        
    console.log(JSON.stringify(data, null, 2));
}

run();
