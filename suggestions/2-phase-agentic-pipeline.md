Viewed user-requirement.pdf.md:11700-11750
Viewed user-requirement.pdf.md:11751-11850

Based on the project requirements and our progress, **Phase 2: The Agentic Pipeline** (also known as the "Xentara Core Layer") is where the platform's "intelligence" is built.

This phase focuses on transforming raw internet noise into structured community intelligence through a sequence of **7 Specialized AI Agents**.

### The 7-Agent Intelligence Pipeline

The pipeline operates as an autonomous, asynchronous "assembly line" for content:

1. **Sourcing Agent (Detection)**:
    * **Role**: Monitors "Whitelisted Sources" (YouTube, RSS, Rumble, etc.) configured by the Hub Custodian.
    * **Action**: Detects a new entry and extracts the raw metadata and media URL.

2. **Transcriber Agent (Transcription)**:
    * **Role**: Handles multi-modal entry.
    * **Action**: Uses **OpenAI Whisper** to convert audio/video tracks into raw text transcripts.

3. **Translator Agent (Localization)**:
    * **Role**: Ensures community accessibility.
    * **Action**: Detects the source language and translates the transcript into the Hub's primary language.

4. **Creative Agent (Summarization)**:
    * **Role**: Standardizes the presentation.
    * **Action**: Writes a compelling headline, a 150-character byline, and a detailed **Markdown summary** of the content.

5. **Taste Predictor Agent (Pre-Scoring)**:
    * **Role**: Solves the "Cold Start" problem.
    * **Action**: Scans the summary to assign initial sentiment and **Topic Tags (Taste Vectors)** before any user has even seen it.

6. **Routing Agent (Routing)**:
    * **Role**: Determines the destination.
    * *Action**: Maps the processed "Card" to the correct **Board Archetype** (e.g., News, Market, or Calendar) based on the Custodian's routing rules.

7. **Rating Profiler Agent (Personalization)**:
    * **Role**: Maintains the "Collective Intelligence."
    * **Action**: Dynamically reorders the board's presentation for each user, prioritizing content based on their "Taste Graph" and credibility ratings.

---

### Technical Implementation Strategy

To make this operational, we will need to implement:

* **Background Worker System**: A reliable way to run these agents without blocking the web UI (e.g., using **Inngest**, **Upstash**, or a custom Postgres-based queue).
* **Vector Database**: A partitioned space (per Hub) to store the **Taste Vectors** for fast similarity matching and personalization.
* **The Ingestion Schema**: New tables for `sources`, `publications`, and `pipeline_tasks` to track a piece of content's journey from "Raw" to "Intelligent."

### Current Recommendation

Since we have the **Admin Dashboard** and **Auth** working, the most logical next step for Phase 2 is to build the **Source Management UI**. This will allow you to:

1. Register a "Monitored Source" (like a YouTube channel).
2. Trigger the "Sourcing Agent" to fetch its first piece of content.

**Would you like me to start by designing the Database Schema for these Ingestion Sources and the Pipeline Tasks?**
