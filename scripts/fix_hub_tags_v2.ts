import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function determineTagDetails(name: string, description: string, hubLanguage: string) {
  const prompt = `
    Analyze the following taxonomy tag:
    Name: "${name}"
    Description: "${description}"

    The target Hub's default language is: ${hubLanguage}.
    
    IMPORTANT: You must accurately detect if the text is English ('en') or Afrikaans ('af'). 
    If the name is "African Political Shocks", it is English ('en'). If the name is "Actor Career", it is English ('en').
    
    Instructions:
    1. Detect the actual language of the provided Name and Description. Return the ISO 639-1 code (e.g., 'en', 'af', 'nl', 'fr').
    2. Provide a translation of the Name and Description into the Hub's default language (${hubLanguage}). If the text is ALREADY in the default language, the translation should be identical to the original. Do NOT return the English version if the Hub language is 'af'.
    
    Return ONLY a JSON object:
    {
      "detected_language": "string",
      "translated_name": "string",
      "translated_description": "string"
    }
  `;

  for (let attempt = 1; attempt <= 3; attempt++) {
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
      if (response.status === 429) {
        console.warn(`Rate limited. Retrying in 5 seconds... (Attempt ${attempt}/3)`);
        await new Promise(res => setTimeout(res, 5000));
        continue;
      }
      const err = await response.text();
      throw new Error(`Inception API Error: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  }
  throw new Error("Failed after 3 retries due to rate limits.");
}

async function main() {
  const { data: hubs, error: hubsError } = await supabase.from('hubs').select('id, content_language');
  if (hubsError) throw hubsError;
  const hubLangMap = new Map(hubs.map((h: any) => [h.id, h.content_language || 'en']));

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

  console.log(`Found ${allTags.length} tags. Re-verifying...`);

  for (let i = 0; i < allTags.length; i++) {
    const tag = allTags[i];
    let hubLang = hubLangMap.get(tag.hub_id)?.split('-')[0] || 'en';
    
    // Quick heuristic: If it belongs to an Afrikaans hub but has English words like "African", "Insight", "Shocks", "Career", "Football"
    // we want to force re-evaluation. Also re-evaluate anything that has language 'en' but belongs to 'af' hub.
    const isSuspicious = tag.language !== hubLang || 
                         (hubLang === 'af' && tag.name.match(/(African|Insight|Shocks|Career|Football|Geopolitics|Tensions|Movements|Heritage|Policy|Outlook)/i));
                         
    if (!isSuspicious) continue;
    
    console.log(`Re-processing suspicious tag: "${tag.name}" (DB lang: ${tag.language}, Hub lang: ${hubLang})`);
    
    try {
      const result = await determineTagDetails(tag.name, tag.description, hubLang);
      
      const isCorrectlyAligned = result.detected_language === tag.language;
      const isAlreadyInDefaultLang = result.detected_language === hubLang;
      
      // If the currently saved text is exactly the translated text, it's already correct.
      if (tag.name === result.translated_name && tag.language === hubLang) {
          continue;
      }
      
      await supabase.from('hub_tags').update({
        name: result.translated_name,
        description: result.translated_description,
        language: hubLang
      }).eq('id', tag.id);
      
      if (result.detected_language !== hubLang) {
        await supabase.from('hub_tag_translations').upsert({
          tag_id: tag.id,
          language: result.detected_language,
          name: tag.name,
          description: tag.description
        }, { onConflict: 'tag_id,language' });
      }
      
      console.log(`✅ Fixed -> [${hubLang}] ${result.translated_name}`);
      
    } catch (err: any) {
      console.error(`❌ Error on tag ${tag.id}: ${err.message}`);
    }
    
    await new Promise(res => setTimeout(res, 800)); // Safer rate limit
  }
  
  console.log("Finished sweep.");
}

main().catch(console.error);
