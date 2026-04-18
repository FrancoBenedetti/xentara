# Xentara Architecture V2: The Intelligence & Publication Platform

This document revises and expands the architecture to clarify the operational roles of curators and the delivery mechanisms for consumers.

## 1. The Core Evolution: From Aggregator to "Hub Collective"
The original concept of a "SaaS Aggregator" has evolved into a "Hub-Centric Intelligence Framework." In V2, the **Hub** is not just a container for sources; it is an **Intelligence Persona** defined by its **Taxonomy (Flavors)** and **Operational Strictness**.

| Feature | Architecture V1 | Architecture V2 (Current) |
| :--- | :--- | :--- |
| **Primary Focal Point** | Content Streams | Hub Lenses (Flavors) |
| **Taxonomy Model** | Global/Static Tags | Hub-Specific, Self-Evolving Taxonomy |
| **AI Role** | Pure Automation | Hybrid (AI Suggests -> Human Confirms) |
| **Logic Mode** | Generic Processing | Strict vs. Exploratory Pipelines |
| Backend Orchestration | Queue-based (Redis/BullMQ) | Event-Driven (Inngest) |
| **Feeding Model** | Static Feed | Polymorphic "Rhythm" Feeds (e.g., 2 Detailed / 8 Visual) |
| **Identity & RBAC** | Single Owner | Multi-Role Teams & Unified Consumer IDs (PWA <-> Messengers) |

---

## 2. The Refined 7-Agent Intelligence Pipeline
The pipeline is now implemented using an event-driven model on **Inngest**, allowing for modular agents that execute in sequence or parallel depending on content types.

1. Discovery Agent: Monitors whitelisted Youtube/RSS URLs (Recurring & Instant).
2. Ingestion Agent: Pulls raw metadata and deep content (transcripts/full text).
3. Creative Agent (Summarization): Distills raw text using **Inception Labs (Mercury-2)** into analytical insights.
4. Taste Predictor (Lenses): Analyzes content against the **Hub's specific "Flavors"** (confirmed tags) to find alignment.
5. Taxonomy Seeding Agent: In **Exploratory Mode**, identifies new emerging themes and proposes them as "unconfirmed" tags.
6. Normalization Agent: Finalizes the `publication` record with bylines, sentiment scores, and weighted tags.
7. Distribution & Notification Agent: Manages the selective push of publications to Telegram/WhatsApp and updates the Consumer PWA state.
8. Engagement & Feedback Agent: Listens for reactions and responses from messengers to build an "Intelligence Feedback Loop" for curators. Available reaction signals and whether qualitative responses (comments) are captured are **configurable per Hub** by the hub owner/curator from a platform-defined base set.
9. Format Orchestrator (Polymorphic Agent): AI-assisted assistant that reformats publication cards based on medium constraints (e.g., plain-text for messengers, image-grids for visual discovery walls).

---

## 3. High-Level Logic Layers: From Curation to Consumption

### **A. Curation Layer (Xentara Admin Dashboard)**
- Functions: Role-Based Access Control (RBAC) for Hub Teams (Owner, Editor, Viewer).
- Source & Taxonomy Configuration: Management of Youtube/RSS and confirmed "Flavor" Lenses.
- Publication History: Persistent log of all published items with cross-medium timestamps. 
- Republication Engine: Curators can manually re-publish any item with fresh commentary and added context.
- Intelligence Feedback: Real-time analytics on consumer reactions (stats) and responses (anonymous or identified) to refine Hub strategy. Curators configure which reaction signals are active for their Hub (selected from a platform base set) and whether qualitative comment capture is enabled — giving each Hub a tailored feedback vocabulary.

### **B. Service Layer (The Headless Xentara API)**
- Identity: Federated Auth (Supabase) and **API Key Management** for external integrations.
- API Strategy: **Discoverable REST API** allowing third-party web applications to consume Hub publications, taxonomy, and engagement stats.
- Mapping: Unified Identity Engine linking messenger handles (Telegram/WhatsApp) to PWA/Third-party Consumer Accounts.
- Storage: **Xentara Article Reader Service** for saving and managing "Read Later" content across all Hubs.
- Engine: Orchestrator and intelligence engine (Inngest + AI Models + Supabase).
- Function: Acts as the primary headless bridge for all downstream delivery endpoints.

### **C. Consumption Layer (Differentiated Delivery)**
1.  **Mode A: The Intelligence Stream (Telegram/WhatsApp)**: High-signal push to shared channels for instant, low-friction consumption. Supported by **AI-Assisted Plain Text Formatting**.
2.  **Mode B: The Comprehensive Experience (Xentara PWA Client)**: The full-featured, developer-customizable frontend for personalized reading, saving, and taste profiling. Supports **Feed Rhythms** (e.g., 2 Detailed / 8 Visual grid).
3.  **Mode C: The Custom Integration (Third-party REST)**: Developers use the Xentara API to build bespoke integrations in their own existing web ecosystems.
4.  **Mode D: The Xentara Reader (Standalone/Integrated)**: An installable reader application or widget that allows consumers to save and consume long-form articles in a distraction-free environment.
5.  **Mode E: The Global Subscription Client (Meta-Hub)**: A future-state central aggregation point where consumers can discover, subscribe to, and manage multiple Xentara Hubs from a single interface.

---

## 4. The "Strictness" Engine (The Lensing Logic)
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

## 5. Technical Stack Updates

- **Orchestrator**: **Inngest** (Transitioned from proposal of Redis/BullMQ to leverage serverless reliability).
- **Primary AI Model**: **Inception Labs (Mercury-2)** (Optimized for long-context summarization and analytical reasoning).
- **Taxonomy Engine**: **PostgreSQL Supabase (RLS Enabled)**. The "Taste Graph" is currently structured as a relational adjacency between Hubs, Tags, and Publications.
- **Frontend Architecture**: **Next.js 15+ (App Router)** with a custom CSS Design System focused on "Rich Aesthetics" and dark-mode by default.

---

## 6. Next Steps & Implications

1. Implication: Taxonomy Management UI: We need a first-class "Taxonomy Studio" in the dashboard where custodians can confirm, merge, or delete AI-suggested flavors.
2. Implication: Multi-Model Fallbacks: As we scale, the pipeline should support fallback models (Gemini Flash / GPT-4o) if Inception Labs reaches rate limits.
3. Implication: Vector Memory: While currently relational, the "Taste Graph" will eventually require a Vector sidecar (pgvector) to handle semantic similarity between suggested and confirmed tags.
4. Implication: Privacy-First Feedback: Implementation of an anonymization layer to protect consumer identities while providing curators with meaningful engagement sentiment and stats.
5. Implication: Identity Linking Service: Developing a lightweight mapping service to link Telegram/WhatsApp IDs to PWA accounts without introducing authentication friction.
6. Implication: Path-Agnostic Client Architecture: Ensuring the PWA template supports relative assets and dynamic `basePath` configuration for deployment flexibility.
7. Implication: Hub Setup Protocol (Handshake): Implementation of a secure handshake between the Curation Dashboard (Key Generation) and the PWA Client (Key Verification + Curator Auth).
8. Implication: Discoverable API Documentation: Providing a Swagger/OpenAPI specification for the Headless Hub API to simplify third-party developer onboarding.
9. Implication: Hub-Level Engagement Customisation: The platform maintains a base set of reaction signals (emoji + label + key). Hub owners select a subset via the Curation Dashboard, controlling which reactions appear on distributed messages and which response types are tracked. This keeps feedback vocabulary meaningful and purposeful per Hub without requiring schema changes for new reaction types.

## 7. Revised Roadmap
- [x] Phase 1: Core Hub & Source Management
- [x] Phase 2: Agentic Pipeline (Discovery -> Summary -> Taste)
- [x] Phase 3: Taxonomy Confirmation Workflow (Human-in-the-loop)
- [x] Phase 4: Hub RBAC & Team Management (Editors/Maintainers)
- [x] Phase 5: Publication History & Manual Republication System
- [x] Phase 6: Minimal Consumer PWA (API Validation & Product Discovery Shell)
- [x] Phase 7: Consumer Identity & Linking (PWA <-> Messengers)
- [x] Phase 8: Selective Push Implementation (WhatsApp/Telegram Webhooks)
- [x] Phase 9: Engagement Feedback Engine (Reactions & Responses)
- [ ] Phase 10: Xentara Client PWA Template (Dev-First Model + Feed Rhythms)
- [ ] Phase 11: Xentara Article Reader (Standalone Widget & Integrated)
- [ ] Phase 12: Global Subscription Client (Meta-Hub Discovery)
- [ ] Phase 13: White-label Domain Routing (Vercel Edge)
