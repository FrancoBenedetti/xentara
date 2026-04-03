import { createClient } from '@/utils/supabase/server'

/**
 * AI Engine to summarize transcripts with various providers.
 */
export async function summarizeWithAI(transcript: string, title: string, metadata: any) {
  if (process.env.INCEPTION_API_KEY) {
    try {
      return await summarizeInception(transcript, title);
    } catch (e: any) {
      console.warn("Inception Labs failed, falling back...", e.message);
    }
  }

  // Fallback: Return truncated original if AI is unavailable or fails
  console.info("Using local fallback summarization strategy (truncation).");
  const baseContent = transcript || "No usable text was found in the source.";
  return baseContent.substring(0, 1000) + "... [Note: AI Neural Link was unavailable, showing raw excerpt]";
}

async function summarizeInception(transcript: string, title: string) {
  const prompt = `Summarize this content titled "${title}". Focus on key analytical facts and concise insights. Format as Markdown.\n\nContent:\n${transcript.substring(0, 15000)}`;
  const response = await fetch("https://api.inceptionlabs.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.INCEPTION_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: "mercury-2" })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || response.statusText;
    
    if (response.status === 401) throw new Error("Inception API: Unauthorized. Check API key.");
    if (response.status === 429) throw new Error("Inception API: Rate Limit Exceeded.");
    if (response.status === 402) throw new Error("Inception API: Payment Required (Balance/Credits exhausted).");
    if (response.status >= 500) throw new Error(`Inception API: Server error (${response.status})`);
    
    throw new Error(`Inception API Error [${response.status}]: ${message}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary returned.";
}

export interface TasteAnalysis {
  byline: string;
  sentiment: number;
  tags: string[];
  new_suggestions?: { name: string, description: string }[];
}

/**
 * Predicts the "Taste" of a publication (Sentiment, Tags, Byline).
 * Scoped to the specific Hub's taxonomy and strictness rules.
 */
export async function predictTaste(summary: string | null | undefined, title: string, hubId: string): Promise<TasteAnalysis> {
  if (!summary || summary.trim().length === 0) {
    return { byline: "No content to analyze.", sentiment: 0, tags: [] };
  }

  const supabase = await createClient()
  
  // 1. Fetch Hub Taxonomy & Strictness
  const { data: hub } = await supabase.from('hubs').select('strictness').eq('id', hubId).single();
  const { data: tags } = await supabase.from('hub_tags').select('name, description').eq('hub_id', hubId).eq('is_confirmed', true);
  
  const taxonomyDesc = tags?.map(t => `- ${t.name}: ${t.description}`).join('\n') || "No flavors defined yet.";
  const isStrict = hub?.strictness === 'strict';

  const prompt = `
    Analyze this content titled "${title}" for the Xentara Collective.
    
    Current Hub Flavors (Lenses):
    ${taxonomyDesc}

    Instructions:
    1. ${isStrict ? "STRICT MODE: Match the content ONLY to the existing flavors above. Force a match if possible." : "EXPLORATORY MODE: Match to existing flavors first. If none represent the content accurately, CREATE up to 2 new high-precision flavors."}
    2. Provide a short, compelling 150-character byline.
    3. Sentiment score -1.0 to 1.0.
    4. Limit result to 5 total tags.

    Return ONLY a JSON object:
    {
      "byline": "string",
      "sentiment": number,
      "tags": ["string", ...],
      "new_suggestions": [{"name": "string", "description": "string"}] 
    }

    Content Summary: ${summary.substring(0, 4000)}
  `;

  try {
    const response = await fetch("https://api.inceptionlabs.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.INCEPTION_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "mercury-2"
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || response.statusText;
        throw new Error(`Inception API Taste Error [${response.status}]: ${message}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonStr = content.includes("{") ? content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1) : "{}";
    
    try {
        const result = JSON.parse(jsonStr);
        
        // Auto-seed suggestions to DB if in exploratory mode
        if (!isStrict && result.new_suggestions?.length > 0) {
            // This logic will be handled by the pipeline worker to avoid blocking the sync
            console.log("AI Suggesting new flavors:", result.new_suggestions);
        }

        return result;
    } catch (e) {
        return { byline: "Intelligence processed.", sentiment: 0.5, tags: ["active"] };
    }
  } catch (error) {
    return { byline: "Sync complete.", sentiment: 0.5, tags: ["ready"] };
  }
}
