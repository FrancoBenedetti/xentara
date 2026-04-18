import { createClient } from '@/utils/supabase/server'

/**
 * AI Engine to summarize transcripts with various providers.
 */
export async function summarizeWithAI(transcript: string, title: string, metadata: any) {
  let lastError: Error | null = null;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      return await summarizeGemini(transcript, title);
    } catch (e: any) {
      console.warn("Gemini AI failed, falling back to Inception/Local...", e.message);
      lastError = e;
    }
  }

  if (process.env.INCEPTION_API_KEY) {
    try {
      return await summarizeInception(transcript, title);
    } catch (e: any) {
      console.warn("Inception Labs failed, falling back...", e.message);
      lastError = e;
    }
  }

  if (lastError && (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.INCEPTION_API_KEY)) {
      throw new Error(`AI Summarization Failed: ${lastError.message}`);
  }

  // Fallback: Return truncated original if no API keys are set
  console.info("Using local fallback summarization strategy (truncation).");
  const baseContent = transcript || "No usable text was found in the source.";
  return baseContent.substring(0, 1000) + "... [Note: AI Neural Link was unconfigured, showing raw excerpt]";
}

async function summarizeGemini(transcript: string, title: string) {
  const prompt = `Summarize this content titled "${title}". Focus on key analytical facts and concise insights. Format as Markdown.\n\nContent:\n${transcript.substring(0, 30000)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Gemini can take longer for large contexts

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error [${response.status}]: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned by Gemini.";
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function summarizeInception(transcript: string, title: string) {
  const prompt = `Summarize this content titled "${title}". Focus on key analytical facts and concise insights. Format as Markdown.\n\nContent:\n${transcript.substring(0, 15000)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.inceptionlabs.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.INCEPTION_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: "mercury-2" }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Inception API: Request timed out (30s).");
    throw error;
  }
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

  let lastError: Error | null = null;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
        return await predictTasteGemini(summary, title, hubId);
    } catch (e: any) {
        console.warn("Gemini Taste Prediction failed, falling back to Inception...", e.message);
        lastError = e;
    }
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
        if (!isStrict && result.new_suggestions?.length > 0) {
            console.log("AI Suggesting new flavors:", result.new_suggestions);
        }
        return result;
    } catch (e) {
        return { byline: "Intelligence processed.", sentiment: 0.5, tags: ["active"] };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Inception API Taste: Request timed out (30s).");
    throw error;
  }
}
async function predictTasteGemini(summary: string, title: string, hubId: string): Promise<TasteAnalysis> {
    const supabase = await createClient()
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

      Content Summary: ${summary.substring(0, 10000)}
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Gemini Taste API Error [${response.status}]: ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return JSON.parse(content);
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
}

/**
 * Analyzes the sentiment of a user comment.
 * Returns a score between -1.0 and 1.0.
 */
export async function analyzeSentiment(comment: string): Promise<number> {
  if (!comment || comment.trim().length === 0) return 0;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const prompt = `Analyze the sentiment of this user comment regarding an article. 
      Return ONLY a float between -1.0 (very negative) and 1.0 (very positive). 
      Comment: "${comment.substring(0, 2000)}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const score = parseFloat(content);
        if (!isNaN(score)) return Math.max(-1.0, Math.min(1.0, score));
      }
    } catch (e) {
      console.warn("Gemini sentiment failed:", e);
    }
  }

  // Fallback to Inception or default
  return 0;
}
