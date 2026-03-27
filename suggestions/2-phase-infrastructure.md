To implement the **Agentic Pipeline (Phase 2)**, we need to transition from a "Static Web App" to an "Event-Driven Processing System."

While your current Supabase and Vercel setup is a great start, the **7-Agent Pipeline** introduces high-compute and asynchronous requirements that standard web servers aren't designed to handle.

Here is the infrastructure breakdown for what you need to set up next:

### 1. AI Intelligence Core (API Keys)

The agents need "brains." In a production SaaS, you'll want to diversify your models to balance cost and performance:

* **Gemini 1.5 Flash (Google)**: Highly recommended for the **Creative** and **Translator** agents. It is extremely fast and cost-effective for long transcripts.
* **OpenAI Whisper (via API)**: The gold standard for the **Transcriber Agent**. You can use the hosted OpenAI API or a specialized provider like **Deepgram** for real-time speed.
* **GPT-4o / Claude 3.5 Sonnet**: Used sparingly for the **Taste Predictor** and **Rating Profiler** agents where high reasoning (sentiment/logic) is required.

### 2. The "Hand-off" Engine (Workflow Orchestration)

The most critical infrastructure piece for this phase is an **Asynchronous Task Queue**. Because one agent must wait for the previous one (e.g., *Translate* waits for *Transcribe*), you cannot run this in a standard HTTP request.

* **Recommended: [Inngest](https://www.inngest.com/)**
  * **Why**: It is "Serverless-native" and works perfectly with Vercel. It allows us to define "Agentic Workflows" where if one step fails, it can automatically retry without failing the entire ingestion.
  * **Setup**: You'll need to create a free Inngest account and link it via a `INNGEST_EVENT_KEY`.

### 3. The "Taste" Memory (Vector Database)

The **Taste Predictor Agent** creates "embeddings" (mathematical representations of meaning). You need a way to store and query these to find content that matches a user's taste.

* **Solution: Supabase Vector (`pgvector`)**
  * **Why**: You already have Supabase! We just need to enable the `vector` extension. This allows us to keep your community data and their "intelligence vectors" in the same place, secured by the same RLS policies we built.
  * **Setup**: Run `CREATE EXTENSION IF NOT EXISTS vector;` in your Supabase SQL editor.

### 4. Content Storage (Media Processing)

Before a video is transcribed, it needs to be temporarily "held" while Whisper processes it.

* **Solution: Supabase Storage**
  * **Setup**: We need to create a `raw_media` bucket in your Supabase dashboard with a lifecycle policy to auto-delete files after 24 hours (to save costs).

---

### **Phase 2 Infrastructure Checklist**

| Component | Provider | Action Required |
| :--- | :--- | :--- |
| **Logic Queue** | **Inngest** | [Register for an account](https://www.inngest.com/) & get an API Key. |
| **Vector Index** | **Supabase** | Enable the `vector` extension in the SQL Editor. |
| **Media Storage** | **Supabase** | Create a `processing_temp` bucket in Storage. |
| **Model API** | **Google AI** | Provide a `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini). |
| **Model API** | **OpenAI** | Provide an `OPENAI_API_KEY` (Whisper). |

**Would you like me to start by creating the "Source Ingestion" database tables so we can begin linking these services?**
