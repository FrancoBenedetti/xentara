import { createServiceClient } from '@/utils/supabase/service'

/**
 * Token usage reported by the Gemini API (usageMetadata field).
 */
export interface UsageMetrics {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model: string;
}

/**
 * Structured return type for summarization calls.
 */
export interface SummarizeResult {
  summary: string;
  usage: UsageMetrics | null;
}

/**
 * Structured return type for taste prediction calls.
 */
export interface TasteResult {
  analysis: TasteAnalysis;
  usage: UsageMetrics | null;
}

/**
 * Structured return type for the Single-Pass Intelligence pipeline.
 */
export interface SinglePassIntelligenceResult {
  summary: string;
  analysis: TasteAnalysis;
  usage: UsageMetrics | null;
}

/**
 * Helper to manage Gemini API keys with cyclical rotation and rate limit backoff.
 */
let currentGeminiKeyIndex = 0;
const keyCooldowns = new Map<string, number>();

function hasGeminiKeys(): boolean {
  return [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10
  ].some(Boolean);
}

async function fetchWithGeminiKey(urlSuffix: string, options: RequestInit): Promise<Response> {
  const keys = [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10
  ].filter(Boolean) as string[];

  if (keys.length === 0) throw new Error("No Gemini keys configured.");

  const now = Date.now();
  const availableKeys = keys.filter(k => !keyCooldowns.has(k) || now > keyCooldowns.get(k)!);

  if (availableKeys.length === 0) {
    throw new Error("Gemini API Error [429]: All configured keys are currently on cooldown.");
  }

  // Try each available key in rotation
  for (let attempt = 0; attempt < availableKeys.length; attempt++) {
    const key = availableKeys[(currentGeminiKeyIndex + attempt) % availableKeys.length];

    console.log(`[AI Engine] Attempt ${attempt + 1}: Using Gemini Key starting with: ${key.substring(0, 10)}...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:${urlSuffix}?key=${key}`;
    const response = await fetch(url, options);

    if (response.status === 429) {
      let retryAfterSeconds = 60; // Default wait time
      const retryAfterHeader = response.headers.get('retry-after');
      if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed)) retryAfterSeconds = parsed;
        else {
          const date = new Date(retryAfterHeader).getTime();
          if (!isNaN(date)) retryAfterSeconds = Math.max(1, Math.floor((date - now) / 1000));
        }
      }
      
      // Safety factor: add 10 seconds
      retryAfterSeconds += 10;
      
      console.warn(`[AI Engine] Key ${key.substring(0, 10)}... hit 429. Cooldown for ${retryAfterSeconds}s.`);
      keyCooldowns.set(key, Date.now() + retryAfterSeconds * 1000);
      continue;
    }

    // Success - update the global index to the key AFTER this one for the next request
    currentGeminiKeyIndex = (currentGeminiKeyIndex + attempt + 1) % availableKeys.length;
    return response;
  }

  throw new Error("Gemini API Error [429]: Max retries exhausted, all attempted keys rate-limited.");
}

/**
 * Distinguishes a transient per-minute rate limit (retry-able) from a daily
 * quota exhaustion (billing limit hit — won't recover until midnight Pacific).
 * Daily exhaustion: no retry-after header, message includes "billing" or "plan".
 */
function isQuotaExhausted(e: Error): boolean {
  const msg = e.message?.toLowerCase() ?? '';
  return msg.includes('billing') || msg.includes('check your plan') || msg.includes('quota');
}

/**
 * AI Engine to summarize transcripts with various providers.
 */
export async function summarizeWithAI(transcript: string, title: string, metadata: any, contentLanguage?: string): Promise<SummarizeResult> {
  let lastError: Error | null = null;

  if (hasGeminiKeys()) {
    try {
      return await summarizeGemini(transcript, title, contentLanguage);
    } catch (e: any) {
      if (e.message?.includes('[429]')) {
        if (!isQuotaExhausted(e)) {
          // Per-minute rate limit — let Inngest retry with backoff
          console.warn('[AI Engine] Gemini per-minute rate limit hit. Rethrowing for Inngest retry.');
          throw e;
        }
        // Daily quota exhausted — fall through to Inception immediately
        console.warn('[AI Engine] Gemini daily quota exhausted. Falling back to Inception.');
      } else {
        console.warn('[AI Engine] Gemini summarization failed, falling back to Inception.', e.message);
      }
      lastError = e;
    }
  }

  if (process.env.INCEPTION_API_KEY) {
    try {
      return await summarizeInception(transcript, title, contentLanguage);
    } catch (e: any) {
      console.warn("Inception Labs failed, falling back...", e.message);
      lastError = e;
    }
  }

  if (lastError && (hasGeminiKeys() || process.env.INCEPTION_API_KEY)) {
      throw new Error(`AI Summarization Failed: ${lastError.message}`);
  }

  // Fallback: Return truncated original if no API keys are set
  console.info("Using local fallback summarization strategy (truncation).");
  const baseContent = transcript || "No usable text was found in the source.";
  return {
    summary: baseContent.substring(0, 1000) + "... [Note: AI Neural Link was unconfigured, showing raw excerpt]",
    usage: null
  };
}

async function summarizeGemini(transcript: string, title: string, contentLanguage?: string): Promise<SummarizeResult> {
  const languageInstruction = contentLanguage && contentLanguage !== 'original' ? `The output summary MUST be written in ${contentLanguage}. ` : '';
  const prompt = `Summarize this content titled "${title}". Focus on key analytical facts and concise insights. Format as Markdown. ${languageInstruction}\n\nContent:\n${transcript.substring(0, 30000)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Gemini can take longer for large contexts

  try {
    const response = await fetchWithGeminiKey('generateContent', {
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned by Gemini.";
    const raw = data.usageMetadata;
    const usage: UsageMetrics | null = raw ? {
      input_tokens: raw.promptTokenCount ?? 0,
      output_tokens: raw.candidatesTokenCount ?? 0,
      total_tokens: raw.totalTokenCount ?? 0,
      model: 'gemini-3-flash-preview'
    } : null;
    return { summary: text, usage };
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function summarizeInception(transcript: string, title: string, contentLanguage?: string): Promise<SummarizeResult> {
  const languageInstruction = contentLanguage && contentLanguage !== 'original' ? `The output summary MUST be written in ${contentLanguage}. ` : '';
  const prompt = `Summarize this content titled "${title}". Focus on key analytical facts and concise insights. Format as Markdown. ${languageInstruction}\n\nContent:\n${transcript.substring(0, 15000)}`;
  
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
    // Inception Labs does not expose standard token counts; usage is null
    return { summary: data.choices?.[0]?.message?.content || "No summary returned.", usage: null };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Inception API: Request timed out (30s).");
    throw error;
  }
}

export interface TasteAnalysis {
  byline: string;
  synopsis: string;
  sentiment: number;
  tags: string[];
  new_suggestions?: { name: string, description: string }[];
  refined_title?: string;
}

/**
 * Predicts the "Taste" of a publication (Sentiment, Tags, Byline).
 * Scoped to the specific Hub's taxonomy and strictness rules.
 */
export async function predictTaste(summary: string | null | undefined, title: string, hubId: string, contentLanguage?: string): Promise<TasteResult> {
  if (!summary || summary.trim().length === 0) {
    return { analysis: { byline: "No content to analyze.", synopsis: "", sentiment: 0, tags: [] }, usage: null };
  }

  let lastError: Error | null = null;

  if (hasGeminiKeys()) {
    try {
        return await predictTasteGemini(summary, title, hubId, contentLanguage);
    } catch (e: any) {
        if (e.message?.includes('[429]')) {
          if (!isQuotaExhausted(e)) {
            // Per-minute rate limit — let Inngest retry with backoff
            console.warn('[AI Engine] Gemini per-minute rate limit hit (taste). Rethrowing for Inngest retry.');
            throw e;
          }
          // Daily quota exhausted — fall through to Inception immediately
          console.warn('[AI Engine] Gemini daily quota exhausted (taste). Falling back to Inception.');
        } else {
          console.warn('[AI Engine] Gemini taste prediction failed, falling back to Inception.', e.message);
        }
        lastError = e;
    }
  }

  const supabase = createServiceClient()
  
  // 1. Fetch Hub Taxonomy & Strictness
  const { data: hub } = await supabase.from('hubs').select('strictness').eq('id', hubId).single();
  const { data: tags } = await supabase.from('hub_tags').select('name, description').eq('hub_id', hubId).eq('is_confirmed', true).limit(60);
  
  // For large taxonomies send only names (saves ~25x tokens); for small ones include descriptions for precision
  const tagList = (tags as any[]) ?? [];
  const taxonomyDesc = tagList.length === 0
    ? "No flavors defined yet."
    : tagList.length > 30
      ? tagList.map(t => `- ${t.name}`).join('\n')  // names only — large taxonomy
      : tagList.map(t => `- ${t.name}: ${t.description}`).join('\n'); // full detail — small taxonomy
  const isStrict = (hub as any)?.strictness === 'strict';

  const languageInstruction = contentLanguage && contentLanguage !== 'original' ? `The refined_title, byline and synopsis MUST be written in ${contentLanguage}.` : '';

  const prompt = `
    Analyze this content titled "${title}" for the Xentara Collective.
    
    Current Hub Flavors (Lenses):
    ${taxonomyDesc}

    Instructions:
    1. ${isStrict ? "STRICT MODE: Match the content ONLY to the existing flavors above. Force a match if possible." : "EXPLORATORY MODE: Match to existing flavors first. If none represent the content accurately, CREATE up to 2 new high-precision flavors."}
    2. Provide a short, compelling 150-character byline.
    3. Sentiment score -1.0 to 1.0.
    4. Limit result to 5 total tags.
    5. Provide a 2-3 sentence 'synopsis' of the article.
    6. Provide a 'refined_title' that is a clean, compelling version of the original title, translated to the target language if required.
    ${languageInstruction}

    Return ONLY a JSON object:
    {
      "byline": "string",
      "synopsis": "string",
      "sentiment": number,
      "tags": ["string", ...],
      "new_suggestions": [{"name": "string", "description": "string"}],
      "refined_title": "string"
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
        return { analysis: result, usage: null };
    } catch (e) {
        return { analysis: { byline: "Intelligence processed.", synopsis: "Analysis complete.", sentiment: 0.5, tags: ["active"] }, usage: null };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Inception API Taste: Request timed out (30s).");
    throw error;
  }
}
async function predictTasteGemini(summary: string, title: string, hubId: string, contentLanguage?: string): Promise<TasteResult> {
    const supabase = createServiceClient()
    const { data: hub } = await supabase.from('hubs').select('strictness').eq('id', hubId).single();
    const { data: tags } = await supabase.from('hub_tags').select('name, description').eq('hub_id', hubId).eq('is_confirmed', true).limit(60);
    
    // For large taxonomies send only names (saves ~25x tokens); for small ones include descriptions for precision
    const tagList = (tags as any[]) ?? [];
    const taxonomyDesc = tagList.length === 0
      ? "No flavors defined yet."
      : tagList.length > 30
        ? tagList.map(t => `- ${t.name}`).join('\n')  // names only — large taxonomy
        : tagList.map(t => `- ${t.name}: ${t.description}`).join('\n'); // full detail — small taxonomy
    const isStrict = (hub as any)?.strictness === 'strict';
    const languageInstruction = contentLanguage && contentLanguage !== 'original' ? `The refined_title, byline and synopsis MUST be written in ${contentLanguage}.` : '';

    const prompt = `
      Analyze this content titled "${title}" for the Xentara Collective.
      
      Current Hub Flavors (Lenses):
      ${taxonomyDesc}

      Instructions:
      1. ${isStrict ? "STRICT MODE: Match the content ONLY to the existing flavors above. Force a match if possible." : "EXPLORATORY MODE: Match to existing flavors first. If none represent the content accurately, CREATE up to 2 new high-precision flavors."}
      2. Provide a short, compelling 150-character byline.
      3. Sentiment score -1.0 to 1.0. 
      4. Limit result to 5 total tags.
      5. Provide a 2-3 sentence 'synopsis' of the article.
      6. Provide a 'refined_title' that is a clean, compelling version of the original title, translated to the target language if required.
      ${languageInstruction}

      Return ONLY a JSON object:
      {
        "byline": "string",
        "synopsis": "string",
        "sentiment": number,
        "tags": ["string", ...],
        "new_suggestions": [{"name": "string", "description": "string"}],
        "refined_title": "string"
      }

      Content Summary: ${summary.substring(0, 10000)}
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetchWithGeminiKey('generateContent', {
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
      const analysis: TasteAnalysis = JSON.parse(content);
      const raw = data.usageMetadata;
      const usage: UsageMetrics | null = raw ? {
        input_tokens: raw.promptTokenCount ?? 0,
        output_tokens: raw.candidatesTokenCount ?? 0,
        total_tokens: raw.totalTokenCount ?? 0,
        model: 'gemini-3-flash-preview'
      } : null;
      if (!analysis.new_suggestions) analysis.new_suggestions = [];
      return { analysis, usage };
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
}

/**
 * SINGLE-PASS INTELLIGENCE
 * Combines summarization, translation, and taxonomy prediction into a single API call.
 * This halves the number of requests per article and vastly reduces token usage.
 */
export async function processSinglePassIntelligence(transcript: string, title: string, hubId: string, contentLanguage?: string): Promise<SinglePassIntelligenceResult> {
  if (!transcript || transcript.trim().length === 0) {
    return {
      summary: "No content to analyze.",
      analysis: { byline: "No content.", synopsis: "", sentiment: 0, tags: [] },
      usage: null
    };
  }

  let lastError: Error | null = null;

  if (hasGeminiKeys()) {
    try {
        return await processSinglePassGemini(transcript, title, hubId, contentLanguage);
    } catch (e: any) {
        if (e.message?.includes('[429]')) {
          if (!isQuotaExhausted(e)) {
            console.warn('[AI Engine] Gemini per-minute rate limit hit (single-pass). Rethrowing for Inngest retry.');
            throw e;
          }
          console.warn('[AI Engine] Gemini daily quota exhausted (single-pass). Falling back to Inception.');
        } else {
          console.warn('[AI Engine] Gemini single-pass failed, falling back to Inception.', e.message);
        }
        lastError = e;
    }
  }

  // Fallback to Inception
  if (process.env.INCEPTION_API_KEY) {
    try {
      return await processSinglePassInception(transcript, title, hubId, contentLanguage);
    } catch (e: any) {
      console.warn("Inception Labs single-pass failed, falling back...", e.message);
      lastError = e;
    }
  }

  if (lastError && (hasGeminiKeys() || process.env.INCEPTION_API_KEY)) {
      throw new Error(`AI Single-Pass Failed: ${lastError.message}`);
  }

  const baseContent = transcript || "No usable text was found in the source.";
  return {
    summary: baseContent.substring(0, 1000) + "... [Note: AI Neural Link was unconfigured, showing raw excerpt]",
    analysis: { byline: "Intelligence processed.", synopsis: "Analysis complete.", sentiment: 0.5, tags: ["active"] },
    usage: null
  };
}

async function getHubTaxonomyPrompt(hubId: string, isStrict: boolean): Promise<string> {
  const supabase = createServiceClient();
  const { data: tags } = await supabase.from('hub_tags').select('name, description').eq('hub_id', hubId).eq('is_confirmed', true).limit(60);
  const tagList = (tags as any[]) ?? [];
  const taxonomyDesc = tagList.length === 0
    ? "No flavors defined yet."
    : tagList.length > 30
      ? tagList.map(t => `- ${t.name}`).join('\n')
      : tagList.map(t => `- ${t.name}: ${t.description}`).join('\n');

  return `
    Current Hub Flavors (Lenses):
    ${taxonomyDesc}

    Taxonomy Rules:
    ${isStrict ? "STRICT MODE: Match the content ONLY to the existing flavors above. Force a match if possible." : "EXPLORATORY MODE: Match to existing flavors first. If none represent the content accurately, CREATE up to 2 new high-precision flavors."}
  `;
}

async function processSinglePassGemini(transcript: string, title: string, hubId: string, contentLanguage?: string): Promise<SinglePassIntelligenceResult> {
    const supabase = createServiceClient();
    const { data: hub } = await supabase.from('hubs').select('strictness').eq('id', hubId).single();
    const isStrict = (hub as any)?.strictness === 'strict';
    const taxonomyContext = await getHubTaxonomyPrompt(hubId, isStrict);

    const languageInstruction = contentLanguage && contentLanguage !== 'original' 
      ? `The output 'summary', 'refined_title', 'byline', and 'synopsis' MUST be written in ${contentLanguage}.` 
      : '';

    const prompt = `
      Analyze this content titled "${title}" for the Xentara Collective.
      
      ${taxonomyContext}

      Instructions:
      1. Provide a 'summary' of the content focusing on key analytical facts and concise insights. Format as Markdown.
      2. Provide a 'refined_title' that is a clean, compelling version of the original title.
      3. Provide a short, compelling 150-character 'byline'.
      4. Provide a 2-3 sentence 'synopsis' of the article.
      5. Sentiment score -1.0 to 1.0. 
      6. Limit result to 5 total 'tags' based on the Taxonomy Rules.
      ${languageInstruction}

      Return ONLY a JSON object:
      {
        "summary": "string",
        "refined_title": "string",
        "byline": "string",
        "synopsis": "string",
        "sentiment": number,
        "tags": ["string", ...],
        "new_suggestions": [{"name": "string", "description": "string"}]
      }

      Content Transcript: ${transcript.substring(0, 30000)}
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetchWithGeminiKey('generateContent', {
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
          throw new Error(`Gemini Single-Pass API Error [${response.status}]: ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const result = JSON.parse(content);
      
      const raw = data.usageMetadata;
      const usage: UsageMetrics | null = raw ? {
        input_tokens: raw.promptTokenCount ?? 0,
        output_tokens: raw.candidatesTokenCount ?? 0,
        total_tokens: raw.totalTokenCount ?? 0,
        model: 'gemini-3-flash-preview'
      } : null;

      const analysis: TasteAnalysis = {
        byline: result.byline || "Intelligence processed.",
        synopsis: result.synopsis || "",
        sentiment: result.sentiment || 0.5,
        tags: result.tags || ["active"],
        new_suggestions: result.new_suggestions || [],
        refined_title: result.refined_title
      };

      return { summary: result.summary || "No summary provided.", analysis, usage };
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
}

async function processSinglePassInception(transcript: string, title: string, hubId: string, contentLanguage?: string): Promise<SinglePassIntelligenceResult> {
    const supabase = createServiceClient();
    const { data: hub } = await supabase.from('hubs').select('strictness').eq('id', hubId).single();
    const isStrict = (hub as any)?.strictness === 'strict';
    const taxonomyContext = await getHubTaxonomyPrompt(hubId, isStrict);

    const languageInstruction = contentLanguage && contentLanguage !== 'original' 
      ? `The output 'summary', 'refined_title', 'byline', and 'synopsis' MUST be written in ${contentLanguage}.` 
      : '';

    const prompt = `
      Analyze this content titled "${title}" for the Xentara Collective.
      
      ${taxonomyContext}

      Instructions:
      1. Provide a 'summary' of the content focusing on key analytical facts and concise insights. Format as Markdown.
      2. Provide a 'refined_title' that is a clean, compelling version of the original title.
      3. Provide a short, compelling 150-character 'byline'.
      4. Provide a 2-3 sentence 'synopsis' of the article.
      5. Sentiment score -1.0 to 1.0. 
      6. Limit result to 5 total 'tags' based on the Taxonomy Rules.
      ${languageInstruction}

      Return ONLY a JSON object:
      {
        "summary": "string",
        "refined_title": "string",
        "byline": "string",
        "synopsis": "string",
        "sentiment": number,
        "tags": ["string", ...],
        "new_suggestions": [{"name": "string", "description": "string"}]
      }

      Content Transcript: ${transcript.substring(0, 15000)}
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

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
          throw new Error(`Inception API Single-Pass Error [${response.status}]: ${message}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const jsonStr = content.includes("{") ? content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1) : "{}";
      
      try {
          const result = JSON.parse(jsonStr);
          const analysis: TasteAnalysis = {
            byline: result.byline || "Intelligence processed.",
            synopsis: result.synopsis || "",
            sentiment: result.sentiment || 0.5,
            tags: result.tags || ["active"],
            new_suggestions: result.new_suggestions || [],
            refined_title: result.refined_title
          };
          return { summary: result.summary || "No summary provided.", analysis, usage: null };
      } catch (e) {
          return {
             summary: "Failed to parse intelligence payload.",
             analysis: { byline: "Intelligence processed.", synopsis: "Analysis complete.", sentiment: 0.5, tags: ["active"] },
             usage: null
          };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error("Inception API Single-Pass: Request timed out.");
      throw error;
    }
}

/**
 * Analyzes the sentiment of a user comment.
 * Returns a score between -1.0 and 1.0.
 */
export async function analyzeSentiment(comment: string): Promise<number> {
  if (!comment || comment.trim().length === 0) return 0;

  if (hasGeminiKeys()) {
    try {
      const prompt = `Analyze the sentiment of this user comment regarding an article. 
      Return ONLY a float between -1.0 (very negative) and 1.0 (very positive). 
      Comment: "${comment.substring(0, 2000)}"`;

        const response = await fetchWithGeminiKey('generateContent', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const score = parseFloat(content);
        if (!isNaN(score)) return Math.max(-1.0, Math.min(1.0, score));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini Sentiment API Error [${response.status}]: ${errorData?.error?.message || response.statusText}`);
      }
    } catch (e: any) {
      if (e.message?.includes('[429]')) throw e;
      console.warn("Gemini sentiment failed:", e.message);
    }
  }

  // Fallback to Inception or default
  return 0;
}
