import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function determineTagDetails(name: string, description: string, hubLanguage: string) {
  const prompt = `
    Analyze the following taxonomy tag:
    Name: "${name}"
    Description: "${description}"

    The Hub's default language is: ${hubLanguage}.

    Instructions:
    1. Detect the actual language of the provided Name and Description. Return the ISO 639-1 code (e.g., 'en', 'af', 'nl', 'fr').
    2. Provide a translation of the Name and Description into the Hub's default language (${hubLanguage}). If the text is ALREADY in the default language, the translation should be identical to the original.
    
    Return ONLY a JSON object:
    {
      "detected_language": "string",
      "translated_name": "string",
      "translated_description": "string"
    }
  `;

  const response = await fetch("https://api.inceptionlabs.ai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${process.env.INCEPTION_API_KEY}`,
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "mercury-2"
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Inception API Error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

async function main() {
  console.log("Fetching hubs...");
  const { data: hubs, error: hubsError } = await supabase.from('hubs').select('id, content_language');
  if (hubsError) throw hubsError;
  
  const hubLangMap = new Map(hubs.map((h: any) => [h.id, h.content_language || 'en']));

  console.log("Fetching tags...");
  let allTags = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: tags, error } = await supabase
      .from('hub_tags')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) throw error;
    if (!tags || tags.length === 0) break;
    
    allTags.push(...tags);
    page++;
  }

  console.log(`Found ${allTags.length} tags to process.`);

  let updatedCount = 0;

  for (let i = 0; i < allTags.length; i++) {
    const tag = allTags[i];
    let hubLang = hubLangMap.get(tag.hub_id)?.split('-')[0] || 'en';
    
    console.log(`Processing tag ${i + 1}/${allTags.length}: "${tag.name}" (Current lang: ${tag.language})`);
    
    try {
      const result = await determineTagDetails(tag.name, tag.description, hubLang);
      
      const isCorrectlyAligned = result.detected_language === tag.language;
      const isAlreadyInDefaultLang = result.detected_language === hubLang;
      
      if (!isCorrectlyAligned || !isAlreadyInDefaultLang) {
         // Update original tag to be in the Hub's default language
         await supabase.from('hub_tags').update({
           name: result.translated_name,
           description: result.translated_description,
           language: hubLang
         }).eq('id', tag.id);
         
         // Insert translation for the originally detected language
         if (result.detected_language !== hubLang) {
           await supabase.from('hub_tag_translations').upsert({
             tag_id: tag.id,
             language: result.detected_language,
             name: tag.name,
             description: tag.description
           }, { onConflict: 'tag_id,language' });
         }
         
         console.log(`✅ Updated. Detected Lang: ${result.detected_language}. New primary is ${hubLang}.`);
         updatedCount++;
      } else {
         console.log(`☑️ Tag is already correctly aligned and in default language (${hubLang}).`);
      }
      
    } catch (err: any) {
      console.error(`❌ Error processing tag ${tag.id}: ${err.message}`);
    }
    
    // Slight delay to prevent rate limits
    await new Promise(res => setTimeout(res, 300));
  }
  
  console.log(`Finished processing all tags! Updated ${updatedCount} tags.`);
}

main().catch(console.error);
