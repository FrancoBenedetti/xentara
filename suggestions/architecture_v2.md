# Xentara Architecture V2: Hub-Centric Intelligence

This document revises the original architecture (V1) based on implementation findings and the emergence of the "Hub Flavors" (Lenses) model and the "Strictness" pipeline logic.

## 1. The Core Evolution: From Aggregator to "Hub Collective"
The original concept of a "SaaS Aggregator" has evolved into a "Hub-Centric Intelligence Framework." In V2, the **Hub** is not just a container for sources; it is an **Intelligence Persona** defined by its **Taxonomy (Flavors)** and **Operational Strictness**.

| Feature | Architecture V1 | Architecture V2 (Current) |
| :--- | :--- | :--- |
| **Primary Focal Point** | Content Streams | Hub Lenses (Flavors) |
| **Taxonomy Model** | Global/Static Tags | Hub-Specific, Self-Evolving Taxonomy |
| **AI Role** | Pure Automation | Hybrid (AI Suggests -> Human Confirms) |
| **Logic Mode** | Generic Processing | Strict vs. Exploratory Pipelines |
| **Backend Orchestration** | Queue-based (Redis/BullMQ) | Event-Driven (Inngest) |

---

## 2. The Refined 7-Agent Intelligence Pipeline
The pipeline is now implemented using an event-driven model on **Inngest**, allowing for modular agents that execute in sequence or parallel depending on content types.

1.  **Discovery Agent**: Monitors whitelisted Youtube/RSS URLs (Recurring & Instant).
2.  **Ingestion Agent**: Pulls raw metadata and deep content (transcripts/full text).
3.  **Creative Agent (Summarization)**: Distills raw text using **Inception Labs (Mercury-2)** into analytical insights.
4.  **Taste Predictor (Lenses)**: Analyzes content against the **Hub's specific "Flavors"** (confirmed tags) to find alignment.
5.  **Taxonomy Seeding Agent**: In **Exploratory Mode**, identifies new emerging themes and proposes them as "unconfirmed" tags.
6.  **Normalization Agent**: Finalizes the `publication` record with bylines, sentiment scores, and weighted tags.
7.  **Distribution Agent** (*Planned*): Dispatches intelligence to Tier 2 (Telegram Mini App) and triggers "MainButton" events.

---

## 3. The "Strictness" Engine (The Lensing Logic)
V2 introduces a core architectural toggle per Hub:

### **A. Exploratory Mode (Open Loop)**
- **Behavior**: AI actively looks for novelty outside the current confirmed taxonomy.
- **Outcome**: The `hub_tags` table grows dynamically. The custodian reviews and "confirms" new flavors to refine the Hub's focus.
- **Ideal for**: Trend analysis, discovery-focused communities.

### **B. Strict Mode (Closed Loop)**
- **Behavior**: AI forces every piece of content to be viewed through the lens of *already confirmed* flavors.
- **Outcome**: High precision, zero noise. Content that doesn't align is deprioritized or labeled as "Out of Focus."
- **Ideal for**: Expert systems, corporate intelligence, niche professional collectives.

---

## 4. Technical Stack Updates
- **Orchestrator**: **Inngest** (Transitioned from proposal of Redis/BullMQ to leverage serverless reliability).
- **Primary AI Model**: **Inception Labs (Mercury-2)** (Optimized for long-context summarization and analytical reasoning).
- **Taxonomy Engine**: **PostgreSQL Supabase (RLS Enabled)**. The "Taste Graph" is currently structured as a relational adjacency between Hubs, Tags, and Publications.
- **Frontend Architecture**: **Next.js 15+ (App Router)** with a custom CSS Design System focused on "Rich Aesthetics" and dark-mode by default.

---

## 5. Next Steps & Implications
1.  **Implication: Taxonomy Management UI**: We need a first-class "Taxonomy Studio" in the dashboard where custodians can confirm, merge, or delete AI-suggested flavors.
2.  **Implication: Multi-Model Fallbacks**: As we scale, the pipeline should support fallback models (Gemini Flash / GPT-4o) if Inception Labs reaches rate limits.
3.  **Implication: Vector Memory**: While currently relational, the "Taste Graph" will eventually require a Vector sidecar (pgvector) to handle semantic similarity between suggested and confirmed tags.

## 6. Revised Roadmap
- [x] Phase 1: Core Hub & Source Management
- [x] Phase 2: Agentic Pipeline (Discovery -> Summary -> Taste)
- [ ] Phase 3: Taxonomy Confirmation Workflow (Human-in-the-Loop)
- [ ] Phase 4: Tier 2 (Telegram Mini App) Initial Prototype
- [ ] Phase 5: White-label Domain Routing (Vercel Edge)
