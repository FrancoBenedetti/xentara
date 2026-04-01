import { createClient } from '../src/utils/supabase/server'

async function checkSchema() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hubs')
    .select('id, name, brand_color, logo_url')
    .limit(1)

  if (error) {
    console.error("Column check failed:", error.message)
    console.log("SUGGESTION: Add 'brand_color' (text, default: '#6366f1') and 'logo_url' (text) to your 'hubs' table.")
  } else {
    console.log("Schema is READY for branding engine:", data)
  }
}

checkSchema()
