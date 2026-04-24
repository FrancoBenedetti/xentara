import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: tags } = await supabase.from('hub_tags').select('*').limit(5);
  console.log("HUB TAGS:");
  console.log(JSON.stringify(tags, null, 2));

  const { data: trans } = await supabase.from('hub_tag_translations').select('*').limit(5);
  console.log("\nHUB TAG TRANSLATIONS:");
  console.log(JSON.stringify(trans, null, 2));
}

main().catch(console.error);
