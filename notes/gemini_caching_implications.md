# Gemini Architecture: Single-Pass & Context Caching

## Executive Summary
This document outlines the optimal architecture for Xentara's AI ingestion pipeline using Gemini 2.5 Flash. It proposes moving from a two-step AI process to a **"Single-Pass Intelligence"** approach, and introduces **Context Caching** for Hub Taxonomies. 

However, Context Caching introduces hourly storage costs that alter the break-even math. **Caching is only financially viable when a Hub has a large taxonomy AND a high volume of articles to process in a given session.** Below that threshold, standard API calls are cheaper.

---

## 1. The "Single-Pass Intelligence" Architecture

### Current Flow (2 Requests)
Currently, processing an article requires two sequential network roundtrips:
1.  **`summarizeWithAI`**: Sends Transcript ➔ Returns Summary.
2.  **`predictTaste`**: Sends Summary + Hub Taxonomy ➔ Returns Byline, Synopsis, Tags, Sentiment, Refined Title.

### Optimal Flow: Single-Pass (1 Request)
Gemini 2.5 Flash's massive context window and strong "Structured Outputs" capability allow you to combine everything.
*   **Action**: Send the Raw Transcript + Hub Taxonomy in **one** prompt.
*   **Output Format**: Require the model to return a single JSON object containing all fields:
    ```json
    {
      "summary": "...",
      "refined_title": "...",
      "synopsis": "...",
      "byline": "...",
      "sentiment": 0.8,
      "tags": ["..."],
      "new_suggestions": []
    }
    ```

### Why Single-Pass is Superior:
1.  **Token Conservation**: You no longer pay to send system instructions, metadata, and the article title to the API twice.
2.  **Latency**: Cuts network overhead in half per article.
3.  **Accuracy**: The Taste Predictor evaluates the *raw transcript* rather than just a summary, ensuring no nuance is lost when determining flavours and sentiment.

---

## 2. Context Caching: Feasibility & The Break-Even Math

With the Single-Pass approach, the Hub Taxonomy (Flavours) is sent with every article. For Hubs with massive taxonomies, we can use Gemini Context Caching to load the taxonomy once per session. 

**However, caching is NOT free.** While it heavily discounts the "Input Token" rate, it introduces a "Storage" rate. 

### The Pricing Math (Gemini Flash estimates)
*   **Standard Input:** ~$0.075 per 1M tokens.
*   **Cache Creation:** ~$0.075 per 1M tokens (Paid once).
*   **Cached Input Usage:** ~$0.01875 per 1M tokens (75% discount).
*   **Cache Storage:** ~$1.00 per 1M tokens per hour.

**Scenario: A Hub with 100,000 tokens of Taxonomy & Instructions**
*   **Standard approach for 10 articles:** 
    *   10 requests * $0.0075 = **$0.075**
*   **Cached approach for 10 articles (1 hour TTL):** 
    *   Creation ($0.0075) + Usage ($0.0018 * 10) + Storage ($0.10) = **$0.125**
    *   *Result: Caching is MORE expensive.*

**The Break-Even Point:**
Because storage costs are relatively high compared to Flash's incredibly cheap standard input tokens, you need to process **approximately 20 articles per hour** (against the exact same taxonomy) to break even on the storage cost. 

### The Decision Rule for Caching
Your pipeline should dynamically decide whether to cache based on two factors:
1.  **Token Volume:** The taxonomy/instructions must exceed Gemini's minimum requirement (2,048 tokens).
2.  **Batch Size:** The number of articles pending ingestion for that Hub must exceed ~20 items.

If an ad-hoc ingestion runs for just 1 or 2 articles, **do not cache**. Just send the taxonomy via standard input.

---

## 3. Implementation Plan

If/when authorized, here is the technical plan to implement this within the Xentara pipeline:

### Phase 1: Engine Updates (`engine.ts`)
1.  **Create `processSinglePassIntelligence`**: Write a new function that takes the `transcript`, `title`, and `hubId`.
2.  **Structured JSON Schema**: Implement the rigorous JSON schema instruction so Gemini returns the combined `[summary, synopsis, byline, tags, etc]` object.

### Phase 2: Dynamic Cache Router (Inngest)
1.  **Evaluate Batch Size**: At the start of the `xentara-intelligence-pipeline` batch (or discovery run), count how many articles are queued for the specific Hub.
2.  **Route**:
    *   *If Pending < 20 or Taxonomy < 2048 tokens*: Use Standard Single-Pass.
    *   *If Pending >= 20 and Taxonomy >= 2048 tokens*: Initialize a `CachedContent` object with a 1-hour TTL.

### Phase 3: Article Processing Loop
1.  Process the batch of articles using the Single-Pass request.
2.  If caching was used, pass the `cachedContent.name` in the request parameters alongside the raw transcript.

### Phase 4: Teardown & Cleanup
1.  **Explicit Deletion:** If a cache was created, once the batch completes, call the Gemini API to delete the `CachedContent` object explicitly to immediately stop the hourly billing.
2.  **`finally` Block:** Ensure deletion is handled inside a `try...finally` block to guarantee cleanup even if the pipeline crashes.
