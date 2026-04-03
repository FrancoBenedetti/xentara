# Xentara V2: The Intelligence & Publication Ecosystem

Based on the refined architecture in `suggestions/architecture_v2.md`, **Xentara is a Headless Intelligence & Publication Platform (HIPP)**. It has evolved from a simple content aggregator into a multi-layered ecosystem that bridges the gap between raw data curation and highly personalized, multichannel delivery.

Here is the updated breakdown of the Xentara V2 framework:

---

### 1. The Hub-Centric "Lensing" Logic
Xentara V2 is built around the concept of a **Hub Intelligence Persona**. Each Hub is defined not just by its sources, but by its **Semantic Lenses (Flavors)**.

*   **Custom Taxonomy (Flavors)**: A self-evolving index of analytical lenses (e.g., #MarketDynamics, #TechnicalDeepDive). Curators maintain a "Human-in-the-loop" workflow by confirming AI-suggested flavors.
*   **The Strictness Engine**: A core architectural toggle that dictates whether the Hub's intelligence is **Exploratory** (expanding the taxonomy) or **Strict** (filtering strictly through confirmed lenses).

---

### 2. The 9-Agent "Intelligence OS"
The original 7-agent pipeline has been expanded into a complete **Intelligence Operating System** orchestrated via **Inngest**.

*   **Discovery & Ingestion**: Scans Youtube and RSS for raw signal.
*   **Creative Summarization**: Distills content via **Inception Labs (Mercury-2)**.
*   **Taste Prediction**: Matches content against the Hub's specific lenses.
*   **Format Orchestrator (New)**: An AI assistant that reformats publication cards for specific mediums (e.g., plain-text for Telegram or visual grid-walls for the PWA).
*   **Engagement & Feedback (New)**: Listens to reactions and responses from messengers to create a continuous **Intelligence Feedback Loop**.

---

### 3. Differentiated Consumption Layer (Modes A-E)
Xentara V2 provides a "Choose Your Experience" model for consumers, ranging from low-friction streams to deep-reading integrations.

*   **Mode A: The Stream (Telegram/WhatsApp)**: High-signal, AI-reformatted posts for instant consumption in messaging apps.
*   **Mode B: The Experience (Xentara PWA Client)**: A developer-customizable frontend with **Feed Rhythms** (e.g., 2 Detailed Articles / 8 Visual Cards) and personalized interests.
*   **Mode C: The Integration (Third-party REST)**: A fully headless API for developers to build Xentara intelligence into their own existing applications.
*   **Mode D: The Xentara Reader**: A dedicated "Read Later" service and standalone widget for long-form consumption across Hubs.
*   **Mode E: The Global Subscription Client**: A central discovery point where users can manage multiple Hub subscriptions from a single meta-interface.

---

### 4. Unified Identity & Curator RBAC
*   **Shadow Profiling**: Seamless consumer onboarding. Users can react in messengers (Anonymous/Shadow) and later "hydrate" their account into a full PWA profile without losing history.
*   **Role-Based Stewardship (RBAC)**: Supports multi-user curator teams (Owners, Editors, Viewers) to manage a Hub's lifecycle.
*   **Publication History & Logs**: A professional record of all publishing events across all mediums with manual republication support.

---

### Summary
Xentara V2 is more than a tool; it is a **Mission-Led Intelligence Filter**. It allows curators to transform "chaotic social media noise" into **structured, high-signal intelligence** that can be delivered exactly where their audience lives—whether that's a WhatsApp group, a custom dashboard, or a specialized PWA client.

It is a **Scalable, White-label Platform** designed for communities that value precision, high-quality aesthetics, and human-verified AI intelligence.
