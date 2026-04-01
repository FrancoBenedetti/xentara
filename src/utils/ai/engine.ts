/**
 * AI Engine to summarize transcripts with various providers.
 */
export async function summarizeWithAI(transcript: string, title: string, metadata: any) {
  // Try Inception Labs first (User-provided new one)
  if (process.env.INCEPTION_API_KEY) {
    try {
      return await summarizeInception(transcript, title);
    } catch (e) {
      console.warn("Inception Labs failed, falling back...", e);
    }
  }

  // Fallback to Google Gemini
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      return await summarizeGemini(transcript, title);
    } catch (e) {
      console.warn("Gemini failed, falling back...", e);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      return await summarizeOpenAI(transcript, title);
    } catch (e) {
      console.warn("OpenAI failed...", e);
    }
  }

  return "# AISUMMARY: " + title + "\n\n(Auto-summarization failed - using fallback preview)\n\n" + (transcript.length > 500 ? transcript.substring(0, 500) : transcript) + "...";
}

async function summarizeInception(transcript: string, title: string) {
  const prompt = `Summarize this video transcript titled "${title}". Focus on key analytical facts, community-relevant points, and concise insights. Format as Markdown with clear sections.\n\nTranscript:\n${transcript.substring(0, 15000)}`;

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

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary returned from Inception.";
}

async function summarizeGemini(transcript: string, title: string) {
  const prompt = `Provide a professional, analytical summary of the following video transcript for the Xentara community hub. Title: "${title}"\n\n${transcript.substring(0, 20000)}`;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned from Gemini.";
}

async function summarizeOpenAI(transcript: string, title: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: `Summarize "${title}":\n\n${transcript.substring(0, 10000)}` }],
      model: "gpt-4o-mini"
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary returned from OpenAI.";
}

export interface TasteAnalysis {
  byline: string;
  sentiment: number;
  tags: string[];
}

/**
 * Predicts the "Taste" of a publication (Sentiment, Tags, Byline).
 */
export async function predictTaste(summary: string, title: string): Promise<TasteAnalysis> {
  const prompt = `
    Analyze this content titled "${title}" and provide:
    1. A short, compelling 150-character byline.
    2. A sentiment score between -1.0 (negative) and 1.0 (positive).
    3. Exactly 5 topical tags that best represent the content.
    
    Return ONLY a JSON object with this structure:
    {
      "byline": "string",
      "sentiment": number,
      "tags": ["string", "string", ...]
    }

    Summary: ${summary.substring(0, 5000)}
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonStr = content.includes("{") ? content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1) : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Taste Prediction Failed:", error);
    return {
      byline: title.substring(0, 147) + "...",
      sentiment: 0,
      tags: ["general"]
    };
  }
}
